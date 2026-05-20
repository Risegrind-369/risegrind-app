import { View, Text, Pressable, ScrollView } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';

interface MentorStyle {
  name: string;
  description: string;
  icon: string;
  unlockedAtLevel: number;
}

interface MentorStyleSelectorProps {
  styles: MentorStyle[];
  activeMentorStyle: string;
  currentLevel: number;
  onSelectStyle: (style: string) => void;
  className?: string;
}

export function MentorStyleSelector({
  styles,
  activeMentorStyle,
  currentLevel,
  onSelectStyle,
  className,
}: MentorStyleSelectorProps) {
  const colors = useColors();

  const handleSelectStyle = (style: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectStyle(style);
  };

  return (
    <View className={cn('gap-4', className)}>
      <Text className="text-lg font-bold text-foreground">Mentor Style</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 0 }}
      >
        {styles.map((style) => {
          const isUnlocked = currentLevel >= style.unlockedAtLevel;
          const isActive = activeMentorStyle === style.name;

          return (
            <Pressable
              key={style.name}
              onPress={() => isUnlocked && handleSelectStyle(style.name)}
              disabled={!isUnlocked}
              style={({ pressed }) => [
                {
                  opacity: pressed && isUnlocked ? 0.7 : 1,
                  transform: [{ scale: pressed && isUnlocked ? 0.95 : 1 }],
                },
              ]}
            >
              <View
                className={cn(
                  'w-32 p-4 rounded-2xl border-2 gap-2',
                  isActive
                    ? 'border-primary bg-primary/10'
                    : isUnlocked
                      ? 'border-border bg-surface'
                      : 'border-border/50 bg-surface/50 opacity-50'
                )}
                style={{
                  borderColor: isActive ? colors.primary : colors.border,
                  backgroundColor: isActive ? `${colors.primary}10` : colors.surface,
                }}
              >
                <Text className="text-3xl">{style.icon}</Text>
                <Text className="text-sm font-semibold text-foreground">{style.name}</Text>
                <Text className="text-xs text-muted">{style.description}</Text>
                {!isUnlocked && (
                  <Text className="text-xs text-warning font-semibold">
                    Unlock at Level {style.unlockedAtLevel}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
