"""Add remaining missing home and journal i18n keys to all 3 translation files."""
import json, os

BASE = "/home/ubuntu/risegrind/lib/i18n"

ADDITIONS = {
    "en": {
        "home": {
            "ghostModeBody": "You're building in silence. Every habit completed, every entry written, every day won — it compounds. Stay invisible. Stay dangerous.",
            "recentEntries": "Recent Entries",
            "mentalState": "Mental State",
            "keepGoing": "Keep going",
        }
    },
    "fr": {
        "home": {
            "ghostModeBody": "Tu construis en silence. Chaque habitude, chaque entrée, chaque jour gagné — ça s'accumule. Reste invisible. Reste dangereux.",
            "recentEntries": "Entrées récentes",
            "mentalState": "État mental",
            "keepGoing": "Continue",
        }
    },
    "pt": {
        "home": {
            "ghostModeBody": "Você está construindo em silêncio. Cada hábito, cada entrada, cada dia ganho — acumula. Fique invisível. Fique perigoso.",
            "recentEntries": "Entradas recentes",
            "mentalState": "Estado mental",
            "keepGoing": "Continue",
        }
    }
}

def deep_merge(base, additions):
    for key, val in additions.items():
        if key in base and isinstance(base[key], dict) and isinstance(val, dict):
            deep_merge(base[key], val)
        else:
            base[key] = val

for lang, additions in ADDITIONS.items():
    path = os.path.join(BASE, f"{lang}.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    deep_merge(data, additions)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ Updated {lang}.json")

print("Done!")
