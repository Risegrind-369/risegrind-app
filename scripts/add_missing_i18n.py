"""
Add missing i18n keys for full coverage:
- home.* (greetings, slogans, quick action subtitles, mood labels)
- journal.* (header, editor, voice, alerts)
- common.* (today, yesterday, delete, cancel, save)
"""
import json, os

BASE = "/home/ubuntu/risegrind/lib/i18n"

ADDITIONS = {
    "en": {
        "home": {
            "greeting_morning": "Good morning, {{name}} ☀️",
            "greeting_afternoon": "Good afternoon, {{name}} 👋",
            "greeting_evening": "Good evening, {{name}} 🌙",
            "ghostModeActive": "Ghost Mode Active",
            "selfAwareness": "Self-awareness is discipline too",
            "mentalStateLogged": "Mental state logged",
            "trackGrowth": "Track your growth",
            "done": "done",
            "entries": "entries",
            "logState": "Log State",
            "moodCheck": "How are you feeling today?",
            "checkIn": "Check In",
            "streak": "Day Streak",
            "rank": "Rank",
            "progress": "Progress",
            "todayMission": "Today's Mission",
            "quickActions": "Quick Actions",
            "startRoutine": "Start Routine",
            "openJournal": "Open Journal",
            "viewIntel": "View Intel"
        },
        "journal": {
            "title": "Ghost Journal",
            "subtitle": "{{count}} entries · Build in silence",
            "newBtn": "+ New",
            "emptyTitle": "Go Ghost. Start Writing.",
            "emptySubtitle": "Your journal is your private space to build in silence. No audience. Just you and your growth.",
            "writeFirst": "Write First Entry",
            "promptLabel": "👻 Ghost Prompt",
            "refreshPrompt": "↻ New",
            "voiceRecord": "🎤 Tap to record voice note",
            "voiceRecording": "🔴 Recording... tap to stop",
            "voiceTranscribing": "Transcribing...",
            "voiceHearMotivation": "🔊 Hear Motivation",
            "voiceStopSpeaking": "⏹ Stop",
            "aiResponse": "AI Response",
            "aiThinking": "Your mentor is thinking...",
            "textPlaceholder": "Start writing or use voice above...",
            "today": "Today",
            "yesterday": "Yesterday",
            "deleteTitle": "Delete Entry",
            "deleteMsg": "Are you sure you want to delete this journal entry?",
            "deleteConfirm": "Delete",
            "transcriptionFailed": "Transcription Failed",
            "transcriptionFailedMsg": "Could not transcribe audio. Please try again.",
            "micPermission": "Permission Needed",
            "micPermissionMsg": "Microphone access is required for voice journaling.",
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
        }
    },
    "fr": {
        "home": {
            "greeting_morning": "Bonjour, {{name}} ☀️",
            "greeting_afternoon": "Bon après-midi, {{name}} 👋",
            "greeting_evening": "Bonsoir, {{name}} 🌙",
            "ghostModeActive": "Ghost Mode Actif",
            "selfAwareness": "La conscience de soi est aussi de la discipline",
            "mentalStateLogged": "État mental enregistré",
            "trackGrowth": "Suis ta croissance",
            "done": "faites",
            "entries": "entrées",
            "logState": "Enregistrer",
            "moodCheck": "Comment te sens-tu aujourd'hui ?",
            "checkIn": "Enregistrer",
            "streak": "Jours de Série",
            "rank": "Rang",
            "progress": "Progression",
            "todayMission": "Mission du Jour",
            "quickActions": "Actions Rapides",
            "startRoutine": "Démarrer la Routine",
            "openJournal": "Ouvrir le Journal",
            "viewIntel": "Voir les Analyses"
        },
        "journal": {
            "title": "Journal Fantôme",
            "subtitle": "{{count}} entrées · Construis en silence",
            "newBtn": "+ Nouveau",
            "emptyTitle": "Deviens Fantôme. Commence à Écrire.",
            "emptySubtitle": "Ton journal est ton espace privé pour te construire en silence. Pas d'audience. Juste toi et ta croissance.",
            "writeFirst": "Première Entrée",
            "promptLabel": "👻 Invite Fantôme",
            "refreshPrompt": "↻ Nouveau",
            "voiceRecord": "🎤 Appuie pour enregistrer",
            "voiceRecording": "🔴 Enregistrement... appuie pour arrêter",
            "voiceTranscribing": "Transcription...",
            "voiceHearMotivation": "🔊 Écouter la Motivation",
            "voiceStopSpeaking": "⏹ Arrêter",
            "aiResponse": "Réponse IA",
            "aiThinking": "Ton mentor réfléchit...",
            "textPlaceholder": "Commence à écrire ou utilise la voix ci-dessus...",
            "today": "Aujourd'hui",
            "yesterday": "Hier",
            "deleteTitle": "Supprimer l'Entrée",
            "deleteMsg": "Es-tu sûr de vouloir supprimer cette entrée de journal ?",
            "deleteConfirm": "Supprimer",
            "transcriptionFailed": "Transcription Échouée",
            "transcriptionFailedMsg": "Impossible de transcrire l'audio. Réessaie.",
            "micPermission": "Permission Requise",
            "micPermissionMsg": "L'accès au microphone est requis pour le journal vocal.",
            "prompts": [
                "Qu'as-tu fait aujourd'hui dont ton futur toi te remerciera ?",
                "Quel bruit bloques-tu en ce moment ?",
                "Décris la version de toi-même que tu construis en silence.",
                "Quelle est une chose que tu as faite aujourd'hui qui a nécessité de la discipline ?",
                "Que ferais-tu différemment si personne ne regardait ?",
                "Quelle est la chose la plus difficile sur laquelle tu travailles en ce moment ?",
                "Quelle est une habitude qui change silencieusement ta vie ?",
                "Pour quoi es-tu reconnaissant que tu ne parles jamais ?"
            ]
        }
    },
    "pt": {
        "home": {
            "greeting_morning": "Bom dia, {{name}} ☀️",
            "greeting_afternoon": "Boa tarde, {{name}} 👋",
            "greeting_evening": "Boa noite, {{name}} 🌙",
            "ghostModeActive": "Ghost Mode Ativo",
            "selfAwareness": "Autoconsciência também é disciplina",
            "mentalStateLogged": "Estado mental registrado",
            "trackGrowth": "Acompanhe seu crescimento",
            "done": "feitos",
            "entries": "entradas",
            "logState": "Registrar",
            "moodCheck": "Como você está se sentindo hoje?",
            "checkIn": "Registrar",
            "streak": "Dias de Sequência",
            "rank": "Rank",
            "progress": "Progresso",
            "todayMission": "Missão de Hoje",
            "quickActions": "Ações Rápidas",
            "startRoutine": "Iniciar Rotina",
            "openJournal": "Abrir Diário",
            "viewIntel": "Ver Análises"
        },
        "journal": {
            "title": "Diário Fantasma",
            "subtitle": "{{count}} entradas · Construa em silêncio",
            "newBtn": "+ Novo",
            "emptyTitle": "Vire Fantasma. Comece a Escrever.",
            "emptySubtitle": "Seu diário é seu espaço privado para se construir em silêncio. Sem audiência. Só você e seu crescimento.",
            "writeFirst": "Primeira Entrada",
            "promptLabel": "👻 Prompt Fantasma",
            "refreshPrompt": "↻ Novo",
            "voiceRecord": "🎤 Toque para gravar",
            "voiceRecording": "🔴 Gravando... toque para parar",
            "voiceTranscribing": "Transcrevendo...",
            "voiceHearMotivation": "🔊 Ouvir Motivação",
            "voiceStopSpeaking": "⏹ Parar",
            "aiResponse": "Resposta da IA",
            "aiThinking": "Seu mentor está pensando...",
            "textPlaceholder": "Comece a escrever ou use a voz acima...",
            "today": "Hoje",
            "yesterday": "Ontem",
            "deleteTitle": "Excluir Entrada",
            "deleteMsg": "Tem certeza que deseja excluir esta entrada do diário?",
            "deleteConfirm": "Excluir",
            "transcriptionFailed": "Transcrição Falhou",
            "transcriptionFailedMsg": "Não foi possível transcrever o áudio. Tente novamente.",
            "micPermission": "Permissão Necessária",
            "micPermissionMsg": "O acesso ao microfone é necessário para o diário de voz.",
            "prompts": [
                "O que você fez hoje que seu eu futuro vai agradecer?",
                "Qual ruído você está bloqueando agora?",
                "Descreva a versão de si mesmo que você está construindo em silêncio.",
                "Qual é uma coisa que você fez hoje que exigiu disciplina?",
                "O que você faria diferente se ninguém estivesse olhando?",
                "Qual é a coisa mais difícil com que você está lidando agora?",
                "Qual é um hábito que está mudando silenciosamente sua vida?",
                "Pelo que você é grato que nunca fala?"
            ]
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
