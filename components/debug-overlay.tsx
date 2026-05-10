import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from "react-native";
import { useColors } from "@/hooks/use-colors";

const MAX_LOGS = 50;
let globalLogs: string[] = [];

// Intercept console.log
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args: any[]) => {
  originalLog(...args);
  const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ");
  globalLogs.push(`[LOG] ${message}`);
  if (globalLogs.length > MAX_LOGS) globalLogs.shift();
};

console.error = (...args: any[]) => {
  originalError(...args);
  const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ");
  globalLogs.push(`[ERROR] ${message}`);
  if (globalLogs.length > MAX_LOGS) globalLogs.shift();
};

console.warn = (...args: any[]) => {
  originalWarn(...args);
  const message = args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" ");
  globalLogs.push(`[WARN] ${message}`);
  if (globalLogs.length > MAX_LOGS) globalLogs.shift();
};

export function DebugOverlay() {
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const colors = useColors();

  // Update logs every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...globalLogs]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hidden gesture detector - long press anywhere to show debug overlay */}
      <Pressable
        onLongPress={() => setVisible(true)}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 100, zIndex: 1 }}
      />

      <Modal visible={visible} transparent animationType="slide">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.foreground }]}>Debug Logs (Last {logs.length})</Text>
            <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.primary }]}>Close</Text>
            </Pressable>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.logContainer}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {logs.map((log, idx) => (
              <Text
                key={idx}
                style={[
                  styles.logLine,
                  {
                    color: log.includes("[ERROR]")
                      ? colors.error
                      : log.includes("[WARN]")
                        ? colors.warning
                        : log.includes("[LOGOUT]")
                          ? colors.primary
                          : colors.muted,
                  },
                ]}
              >
                {log}
              </Text>
            ))}
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <Pressable
              onPress={() => {
                globalLogs = [];
                setLogs([]);
              }}
              style={[styles.button, { backgroundColor: colors.error }]}
            >
              <Text style={{ color: colors.background, fontWeight: "600" }}>Clear Logs</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  logContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logLine: {
    fontSize: 11,
    fontFamily: "monospace",
    marginVertical: 2,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
});
