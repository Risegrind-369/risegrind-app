#!/usr/bin/env python3
import json, os

base = "/home/ubuntu/risegrind/lib/i18n"

new_keys = {
    "en": {
        "journal": {
            "title": "Ghost Journal",
            "entriesCount": "entries",
            "tagline": "Build in silence",
            "newEntry": "+ New",
            "emptyTitle": "Go Ghost. Start Writing.",
            "emptySubtitle": "Your journal is your private space to build in silence. No audience. Just you and your growth.",
            "firstEntry": "Write First Entry",
            "ghostJournal": "Ghost Journal",
            "ghostPrompt": "Ghost Prompt",
            "newPrompt": "New",
            "placeholder": "Start writing or use voice above...",
            "recording": "Recording... tap to stop",
            "speakToAI": "Speak to AI",
            "transcribing": "Transcribing...",
            "transcribeFailed": "Transcription failed",
            "transcribeError": "Could not transcribe audio. Please try again.",
            "permissionTitle": "Permission needed",
            "permissionBody": "Microphone access is required for voice journaling.",
            "aiMentor": "Ghost Mode AI Mentor",
            "analyzing": "Analyzing your entry...",
            "hearMotivation": "Hear Motivation",
            "speaking": "Speaking...",
            "aiUnavailable": "AI mentor unavailable. Your entry has been saved.",
            "deleteTitle": "Delete Entry",
            "deleteConfirm": "Are you sure you want to delete this journal entry?",
            "prompts": [
                "What did you do today that your future self will thank you for?",
                "What noise are you blocking out right now?",
                "Describe the version of yourself you're building in silence.",
                "What's one thing you did today that required discipline?",
                "What would you do differently if no one was watching?",
                "What's the hardest thing you're working through right now?",
                "What's one habit that's quietly changing your life?",
                "What are you grateful for that you never talk about?"
            ]
        },
        "common": {
            "cancel": "Cancel",
            "save": "Save",
            "delete": "Delete",
            "close": "Close",
            "confirm": "Confirm",
            "loading": "Loading...",
            "error": "Something went wrong. Please try again.",
            "ok": "OK"
        }
    },
    "fr": {
        "journal": {
            "title": "Journal Ghost",
            "entriesCount": "entrées",
            "tagline": "Construis en silence",
            "newEntry": "+ Nouveau",
            "emptyTitle": "Va Ghost. Commence à écrire.",
            "emptySubtitle": "Ton journal est ton espace privé pour construire en silence. Pas de public. Juste toi et ta croissance.",
            "firstEntry": "Écrire ma première entrée",
            "ghostJournal": "Journal Ghost",
            "ghostPrompt": "Prompt Ghost",
            "newPrompt": "Nouveau",
            "placeholder": "Commence à écrire ou utilise la voix ci-dessus...",
            "recording": "Enregistrement... appuie pour arrêter",
            "speakToAI": "Parler à l'IA",
            "transcribing": "Transcription en cours...",
            "transcribeFailed": "Transcription échouée",
            "transcribeError": "Impossible de transcrire l'audio. Réessaie.",
            "permissionTitle": "Permission requise",
            "permissionBody": "L'accès au microphone est nécessaire pour le journal vocal.",
            "aiMentor": "Mentor IA Ghost Mode",
            "analyzing": "Analyse de ton entrée...",
            "hearMotivation": "Écouter la motivation",
            "speaking": "Lecture en cours...",
            "aiUnavailable": "Mentor IA indisponible. Ton entrée a été sauvegardée.",
            "deleteTitle": "Supprimer l'entrée",
            "deleteConfirm": "Es-tu sûr de vouloir supprimer cette entrée de journal ?",
            "prompts": [
                "Qu'as-tu fait aujourd'hui dont ton futur toi te remerciera ?",
                "Quel bruit bloques-tu en ce moment ?",
                "Décris la version de toi-même que tu construis en silence.",
                "Quelle est la chose que tu as faite aujourd'hui qui a demandé de la discipline ?",
                "Que ferais-tu différemment si personne ne regardait ?",
                "Quelle est la chose la plus difficile que tu traverses en ce moment ?",
                "Quelle habitude change silencieusement ta vie ?",
                "Pour quoi es-tu reconnaissant mais n'en parles jamais ?"
            ]
        },
        "common": {
            "cancel": "Annuler",
            "save": "Sauvegarder",
            "delete": "Supprimer",
            "close": "Fermer",
            "confirm": "Confirmer",
            "loading": "Chargement...",
            "error": "Une erreur s'est produite. Réessaie.",
            "ok": "OK"
        }
    },
    "pt": {
        "journal": {
            "title": "Diário Ghost",
            "entriesCount": "entradas",
            "tagline": "Construa em silêncio",
            "newEntry": "+ Novo",
            "emptyTitle": "Vá Ghost. Comece a Escrever.",
            "emptySubtitle": "Seu diário é seu espaço privado para construir em silêncio. Sem audiência. Só você e seu crescimento.",
            "firstEntry": "Escrever Primeira Entrada",
            "ghostJournal": "Diário Ghost",
            "ghostPrompt": "Prompt Ghost",
            "newPrompt": "Novo",
            "placeholder": "Comece a escrever ou use a voz acima...",
            "recording": "Gravando... toque para parar",
            "speakToAI": "Falar com a IA",
            "transcribing": "Transcrevendo...",
            "transcribeFailed": "Transcrição falhou",
            "transcribeError": "Não foi possível transcrever o áudio. Tente novamente.",
            "permissionTitle": "Permissão necessária",
            "permissionBody": "O acesso ao microfone é necessário para o diário por voz.",
            "aiMentor": "Mentor IA Ghost Mode",
            "analyzing": "Analisando sua entrada...",
            "hearMotivation": "Ouvir Motivação",
            "speaking": "Reproduzindo...",
            "aiUnavailable": "Mentor IA indisponível. Sua entrada foi salva.",
            "deleteTitle": "Excluir Entrada",
            "deleteConfirm": "Tem certeza que deseja excluir esta entrada do diário?",
            "prompts": [
                "O que você fez hoje pelo qual seu eu futuro vai te agradecer?",
                "Qual ruído você está bloqueando agora?",
                "Descreva a versão de si mesmo que você está construindo em silêncio.",
                "Qual foi uma coisa que você fez hoje que exigiu disciplina?",
                "O que você faria diferente se ninguém estivesse olhando?",
                "Qual é a coisa mais difícil que você está enfrentando agora?",
                "Qual hábito está mudando silenciosamente sua vida?",
                "Pelo que você é grato mas nunca fala?"
            ]
        },
        "common": {
            "cancel": "Cancelar",
            "save": "Salvar",
            "delete": "Excluir",
            "close": "Fechar",
            "confirm": "Confirmar",
            "loading": "Carregando...",
            "error": "Algo deu errado. Tente novamente.",
            "ok": "OK"
        }
    }
}

for lang, sections in new_keys.items():
    path = os.path.join(base, f"{lang}.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    for section, keys in sections.items():
        if section not in data:
            data[section] = {}
        for k, v in keys.items():
            data[section][k] = v  # always overwrite to ensure latest translations
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {lang}.json")

print("Done.")
