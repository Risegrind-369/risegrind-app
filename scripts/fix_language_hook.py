"""
Fix all files that use i18n.language directly to use useLanguage() hook instead.
This ensures the language is always read from the LanguageContext (which is the source of truth)
rather than the i18next instance which can lag behind.
"""
import re

files_to_fix = [
    "/home/ubuntu/risegrind/app/(tabs)/journal.tsx",
    "/home/ubuntu/risegrind/app/(tabs)/index.tsx",
    "/home/ubuntu/risegrind/app/(tabs)/profile.tsx",
    "/home/ubuntu/risegrind/app/(tabs)/routine.tsx",
    "/home/ubuntu/risegrind/app/(tabs)/quests.tsx",
    "/home/ubuntu/risegrind/app/onboarding/step4b-routine.tsx",
    "/home/ubuntu/risegrind/components/weekly-summary-modal.tsx",
]

for filepath in files_to_fix:
    try:
        with open(filepath, "r") as f:
            content = f.read()
        
        original = content
        
        # Check if useLanguage is already imported
        has_language_import = "useLanguage" in content
        has_language_context_import = "language-context" in content
        
        # Add useLanguage import if missing
        if not has_language_context_import:
            # Add after the last import line
            content = re.sub(
                r'(import \{[^}]+\} from "react-i18next";)',
                r'\1\nimport { useLanguage } from "@/lib/language-context";',
                content,
                count=1
            )
        elif not has_language_import:
            # Add useLanguage to existing language-context import
            content = re.sub(
                r'import \{([^}]+)\} from "@/lib/language-context"',
                lambda m: f'import {{{m.group(1).rstrip()}, useLanguage}} from "@/lib/language-context"',
                content,
                count=1
            )
        
        # Fix journal.tsx: const locale = i18n.language || "en"
        if "journal.tsx" in filepath:
            # Add useLanguage hook call after existing hooks
            if "const { language } = useLanguage();" not in content:
                content = re.sub(
                    r'(const \{ t, i18n \} = useTranslation\(\);)',
                    r'\1\n  const { language: userLanguage } = useLanguage();\n  // Use userLanguage from context (source of truth) instead of i18n.language which can lag',
                    content,
                    count=1
                )
            # Replace the locale line
            content = content.replace(
                "const locale = i18n.language || \"en\";",
                "const locale = (userLanguage || i18n.language || \"en\") as \"en\" | \"fr\" | \"pt\";"
            )
        
        # Fix index.tsx: const lang = i18n.language || "en"
        if "index.tsx" in filepath and "(tabs)" in filepath:
            if "const { language: userLanguage } = useLanguage();" not in content and "const { language } = useLanguage();" not in content:
                content = re.sub(
                    r'(const \{ t, i18n \} = useTranslation\(\);)',
                    r'\1\n  const { language: userLanguage } = useLanguage();',
                    content,
                    count=1
                )
            content = content.replace(
                "const lang = i18n.language || \"en\";",
                "const lang = (userLanguage || i18n.language || \"en\") as \"en\" | \"fr\" | \"pt\";"
            )
        
        # Fix profile.tsx: const lang = i18n.language || "en"
        if "profile.tsx" in filepath:
            if "const { language: userLanguage } = useLanguage();" not in content and "const { language } = useLanguage();" not in content:
                content = re.sub(
                    r'(const \{ t, i18n \} = useTranslation\(\);)',
                    r'\1\n  const { language: userLanguage } = useLanguage();',
                    content,
                    count=1
                )
            content = content.replace(
                "const lang = i18n.language || \"en\";",
                "const lang = (userLanguage || i18n.language || \"en\") as \"en\" | \"fr\" | \"pt\";"
            )
        
        # Fix routine.tsx
        if "routine.tsx" in filepath:
            if "const { language: userLanguage } = useLanguage();" not in content and "const { language } = useLanguage();" not in content:
                content = re.sub(
                    r'(const \{ t, i18n \} = useTranslation\(\);)',
                    r'\1\n  const { language: userLanguage } = useLanguage();',
                    content,
                    count=1
                )
            content = content.replace(
                "const lang = i18n.language || \"en\";",
                "const lang = (userLanguage || i18n.language || \"en\") as \"en\" | \"fr\" | \"pt\";"
            )
        
        # Fix quests.tsx
        if "quests.tsx" in filepath:
            if "const { language: userLanguage } = useLanguage();" not in content and "const { language } = useLanguage();" not in content:
                content = re.sub(
                    r'(const \{ t, i18n \} = useTranslation\(\);)',
                    r'\1\n  const { language: userLanguage } = useLanguage();',
                    content,
                    count=1
                )
            content = content.replace(
                "const lang = i18n.language || \"en\";",
                "const lang = (userLanguage || i18n.language || \"en\") as \"en\" | \"fr\" | \"pt\";"
            )
        
        # Fix step4b-routine.tsx
        if "step4b-routine.tsx" in filepath:
            if "const { language: userLanguage } = useLanguage();" not in content and "const { language } = useLanguage();" not in content:
                # Add useLanguage import and hook
                content = re.sub(
                    r'(import \{[^}]+\} from "react-i18next";)',
                    r'\1\nimport { useLanguage } from "@/lib/language-context";',
                    content,
                    count=1
                )
                # Add hook in component
                content = re.sub(
                    r'(const \{ t \} = useTranslation\(\);)',
                    r'\1\n  const { language: userLanguage } = useLanguage();',
                    content,
                    count=1
                )
            content = content.replace(
                "language: (i18n.language?.slice(0, 2) as \"en\" | \"fr\" | \"pt\") || \"en\"",
                "language: (userLanguage || i18n.language?.slice(0, 2) as \"en\" | \"fr\" | \"pt\" || \"en\")"
            )
        
        # Fix weekly-summary-modal.tsx
        if "weekly-summary-modal.tsx" in filepath:
            if "const { language: userLanguage } = useLanguage();" not in content and "const { language } = useLanguage();" not in content:
                content = re.sub(
                    r'(const \{ t \} = useTranslation\(\);)',
                    r'\1\n  const { language: userLanguage } = useLanguage();',
                    content,
                    count=1
                )
            content = content.replace(
                "const lang = i18n.language;",
                "const lang = (userLanguage || i18n.language || \"en\") as \"en\" | \"fr\" | \"pt\";"
            )
        
        if content != original:
            with open(filepath, "w") as f:
                f.write(content)
            print(f"Fixed: {filepath}")
        else:
            print(f"No change needed: {filepath}")
    
    except FileNotFoundError:
        print(f"File not found: {filepath}")
    except Exception as e:
        print(f"Error in {filepath}: {e}")

print("Done.")
