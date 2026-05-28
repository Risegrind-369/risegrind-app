/**
 * Export all MySQL data to JSON files for migration to PostgreSQL
 * Run: npx tsx scripts/export-mysql-data.ts
 */
import "./load-env.js";
import * as mysql from "mysql2/promise";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "migration-data");

async function exportAllTables() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  // Parse mysql URL: mysql://user:pass@host:port/db?ssl=...
  const url = new URL(dbUrl);
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port || "3306"),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: true },
  });

  console.log("✅ Connected to MySQL");

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("🔍 Fetching table list...");
  const [tables] = await conn.query<mysql.RowDataPacket[]>(
    `SELECT TABLE_NAME FROM information_schema.TABLES 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME != '__drizzle_migrations'
     ORDER BY TABLE_NAME`
  );

  const tableNames = tables.map((row) => row.TABLE_NAME as string);
  console.log(`📋 Found ${tableNames.length} tables: ${tableNames.join(", ")}`);

  const exportSummary: Record<string, number> = {};

  for (const tableName of tableNames) {
    console.log(`\n📤 Exporting: ${tableName}`);
    try {
      const [rows] = await conn.query<mysql.RowDataPacket[]>(`SELECT * FROM \`${tableName}\``);
      exportSummary[tableName] = rows.length;
      const outputFile = path.join(OUTPUT_DIR, `${tableName}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(rows, null, 2));
      console.log(`   ✅ ${rows.length} rows → ${outputFile}`);
    } catch (err) {
      console.error(`   ❌ Failed: ${tableName}:`, err);
      exportSummary[tableName] = -1;
    }
  }

  // Also get table CREATE statements for schema reference
  console.log("\n📋 Exporting CREATE TABLE statements...");
  const schemaStatements: Record<string, string> = {};
  for (const tableName of tableNames) {
    try {
      const [result] = await conn.query<mysql.RowDataPacket[]>(`SHOW CREATE TABLE \`${tableName}\``);
      schemaStatements[tableName] = (result[0] as any)["Create Table"];
    } catch (err) {
      console.error(`   ❌ Could not get CREATE for ${tableName}`);
    }
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "_schema.json"),
    JSON.stringify(schemaStatements, null, 2)
  );

  // Write summary
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "_summary.json"),
    JSON.stringify({
      exportedAt: new Date().toISOString(),
      tables: exportSummary,
      totalTables: tableNames.length,
      totalRows: Object.values(exportSummary).filter((v) => v >= 0).reduce((a, b) => a + b, 0),
    }, null, 2)
  );

  await conn.end();
  console.log("\n\n✅ EXPORT COMPLETE");
  console.log("Summary:", exportSummary);
}

exportAllTables().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
