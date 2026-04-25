import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface StreakRiskGaugeProps {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  habitName: string;
}

export function StreakRiskGauge({
  riskScore,
  riskLevel,
  habitName,
}: StreakRiskGaugeProps) {
  const colors = useColors();

  const getRiskColor = () => {
    if (riskLevel === 'low') return colors.success;
    if (riskLevel === 'medium') return colors.warning;
    return colors.error;
  };

  const getRiskLabel = () => {
    if (riskLevel === 'low') return 'Low Risk';
    if (riskLevel === 'medium') return 'Medium Risk';
    return 'High Risk';
  };

  const riskColor = getRiskColor();
  const gaugeWidth = (riskScore / 100) * 100;

  return (
    <View className="bg-surface rounded-lg p-4 mb-3">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold text-foreground">
          {habitName}
        </Text>
        <View
          className="px-2 py-1 rounded-full"
          style={{ backgroundColor: riskColor + '30' }}
        >
          <Text className="text-xs font-semibold" style={{ color: riskColor }}>
            {getRiskLabel()}
          </Text>
        </View>
      </View>

      {/* Gauge Bar */}
      <View
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: colors.border }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: `${gaugeWidth}%`,
            backgroundColor: riskColor,
          }}
        />
      </View>

      {/* Score */}
      <Text className="text-xs text-muted mt-2">
        Risk Score: {riskScore}/100
      </Text>
    </View>
  );
}
