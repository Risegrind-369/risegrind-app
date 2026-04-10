"""
Add missing i18n keys to all 3 translation files:
- onboarding.chart.*
- onboarding.trust.*
- tabs.aiMentor
- paywall.save (update to "Save 50%")
- paywall.perYear / perMonth (update labels)
"""
import json
import os

BASE = "/home/ubuntu/risegrind/lib/i18n"

ADDITIONS = {
    "en": {
        "onboarding": {
            "chart": {
                "day0": "Day 0",
                "day30": "Day 30",
                "day60": "Day 60",
                "day90": "Day 90",
                "annotation": "30% → 95% discipline in 90 days"
            },
            "trust": {
                "encrypted": "Encrypted",
                "private": "Journal Private",
                "mentor": "AI Mentor"
            }
        },
        "tabs": {
            "aiMentor": "AI"
        },
        "paywall": {
            "save": "Save 50%",
            "perYear": "/year",
            "perMonth": "/month",
            "purchaseFailed": "Purchase Failed",
            "purchaseError": "Something went wrong. Please try again.",
            "restoreSuccess": "Restored!",
            "restoreSuccessMsg": "Your purchases have been restored.",
            "restoreFailed": "Restore Failed",
            "restoreFailedMsg": "No purchases found to restore."
        }
    },
    "fr": {
        "onboarding": {
            "chart": {
                "day0": "Jour 0",
                "day30": "Jour 30",
                "day60": "Jour 60",
                "day90": "Jour 90",
                "annotation": "30% → 95% de discipline en 90 jours"
            },
            "trust": {
                "encrypted": "Chiffré",
                "private": "Journal Privé",
                "mentor": "Mentor IA"
            }
        },
        "tabs": {
            "aiMentor": "IA"
        },
        "paywall": {
            "save": "Économisez 50%",
            "perYear": "/an",
            "perMonth": "/mois",
            "purchaseFailed": "Achat Échoué",
            "purchaseError": "Quelque chose s'est mal passé. Réessayez.",
            "restoreSuccess": "Restauré !",
            "restoreSuccessMsg": "Vos achats ont été restaurés.",
            "restoreFailed": "Restauration Échouée",
            "restoreFailedMsg": "Aucun achat trouvé à restaurer."
        }
    },
    "pt": {
        "onboarding": {
            "chart": {
                "day0": "Dia 0",
                "day30": "Dia 30",
                "day60": "Dia 60",
                "day90": "Dia 90",
                "annotation": "30% → 95% de disciplina em 90 dias"
            },
            "trust": {
                "encrypted": "Criptografado",
                "private": "Diário Privado",
                "mentor": "Mentor IA"
            }
        },
        "tabs": {
            "aiMentor": "IA"
        },
        "paywall": {
            "save": "Economize 50%",
            "perYear": "/ano",
            "perMonth": "/mês",
            "purchaseFailed": "Compra Falhou",
            "purchaseError": "Algo deu errado. Tente novamente.",
            "restoreSuccess": "Restaurado!",
            "restoreSuccessMsg": "Suas compras foram restauradas.",
            "restoreFailed": "Restauração Falhou",
            "restoreFailedMsg": "Nenhuma compra encontrada para restaurar."
        }
    }
}

def deep_merge(base, additions):
    """Recursively merge additions into base."""
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
