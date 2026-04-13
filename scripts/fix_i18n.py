"""
Fix missing i18n keys in fr.json and pt.json:
- home.rankDescription (translated)
- home.yourRank
- home.recentEntries
- home.routine, home.journal, home.insights (Quick Actions labels)
"""
import json

# Keys to add
FR_ADDITIONS = {
    "home": {
        "rankDescription": "Tu construis en silence. Chaque habitude, chaque entrée, chaque jour s'accumule. Reste dangereux.",
        "yourRank": "Ton Rang",
        "recentEntries": "Entrées Récentes",
        "routine": "Routine",
        "journal": "Journal",
        "insights": "Analyses",
        "moodLogged": "État mental enregistré",
        "howAreYou": "Comment tu te sens aujourd'hui ?",
        "logMood": "Appuie pour enregistrer ton humeur",
        "howAreYouFeeling": "Comment tu te sens aujourd'hui ?",
        "logState": "Enregistrer l'état",
    }
}

PT_ADDITIONS = {
    "home": {
        "rankDescription": "Você está construindo em silêncio. Cada hábito, cada entrada, cada dia se acumula. Mantenha-se perigoso.",
        "yourRank": "Seu Rank",
        "recentEntries": "Entradas Recentes",
        "routine": "Rotina",
        "journal": "Diário",
        "insights": "Análises",
        "moodLogged": "Estado mental registrado",
        "howAreYou": "Como você está se sentindo hoje?",
        "logMood": "Toque para registrar seu humor",
        "howAreYouFeeling": "Como você está se sentindo hoje?",
        "logState": "Registrar estado",
    }
}

for lang, additions in [("fr", FR_ADDITIONS), ("pt", PT_ADDITIONS)]:
    path = f"/home/ubuntu/risegrind/lib/i18n/{lang}.json"
    with open(path) as f:
        data = json.load(f)
    
    for section, keys in additions.items():
        if section not in data:
            data[section] = {}
        for key, value in keys.items():
            if key not in data[section]:
                data[section][key] = value
    
    with open(path, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {lang}.json")

print("Done.")
