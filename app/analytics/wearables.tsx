import { TouchableOpacity } from "react-native";
import { ScrollView, Text, View, Pressable } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface WearableConnection {
  id: string;
  deviceType: 'apple_watch' | 'oura_ring' | 'whoop';
  deviceName: string;
  isActive: boolean;
  lastSync: Date;
  expiresAt: Date;
  syncStatus: 'syncing' | 'synced' | 'error';
}

export default function WearablesScreen() {
  const colors = useColors();
  const [connections, setConnections] = useState<WearableConnection[]>([
    {
      id: 'conn-1',
      deviceType: 'apple_watch',
      deviceName: 'Apple Watch Series 8',
      isActive: true,
      lastSync: new Date(Date.now() - 3600000),
      expiresAt: new Date(Date.now() + 86400000 * 30),
      syncStatus: 'synced',
    },
  ]);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<'apple_watch' | 'oura_ring' | 'whoop' | null>(null);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'apple_watch':
        return '⌚';
      case 'oura_ring':
        return '💍';
      case 'whoop':
        return '📱';
      default:
        return '📱';
    }
  };

  const getDeviceLabel = (deviceType: string) => {
    switch (deviceType) {
      case 'apple_watch':
        return 'Apple Watch';
      case 'oura_ring':
        return 'Oura Ring';
      case 'whoop':
        return 'Whoop Band';
      default:
        return 'Unknown Device';
    }
  };

  const handleConnect = async (deviceType: 'apple_watch' | 'oura_ring' | 'whoop') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDevice(deviceType);

      // TODO: Implement OAuth flow
      // For now, just show the modal
      setShowConnectModal(true);
    } catch (error) {
      console.error('Error connecting device:', error);
    }
  };

  const handleManualSync = async (connectionId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Update sync status
      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === connectionId ? { ...conn, syncStatus: 'syncing' as const } : conn
        )
      );

      // TODO: Call /api/wearables/:id/sync endpoint
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === connectionId
            ? { ...conn, syncStatus: 'synced' as const, lastSync: new Date() }
            : conn
        )
      );
    } catch (error) {
      console.error('Error syncing device:', error);
      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === connectionId ? { ...conn, syncStatus: 'error' as const } : conn
        )
      );
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // TODO: Call /api/wearables/:id/disconnect endpoint
      setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  };

  const availableDevices: Array<'apple_watch' | 'oura_ring' | 'whoop'> = [
    'apple_watch',
    'oura_ring',
    'whoop',
  ];
  const connectedDeviceTypes = connections.map((c) => c.deviceType);
  const availableToConnect = availableDevices.filter((d) => !connectedDeviceTypes.includes(d));

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Wearables</Text>
            <Text className="text-sm text-muted mt-1">Connect your devices</Text>
          </View>
          <Text className="text-2xl">⌚</Text>
        </View>

        {/* Connected Devices */}
        {connections.length > 0 && (
          <>
            <Text className="text-base font-semibold text-foreground mb-3">Connected Devices</Text>
            {connections.map((connection) => (
              <View
                key={connection.id}
                className="rounded-lg p-4 mb-3"
                style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
              >
                {/* Device Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-2xl">{getDeviceIcon(connection.deviceType)}</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {connection.deviceName}
                      </Text>
                      <Text className="text-xs text-muted">
                        {getDeviceLabel(connection.deviceType)}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: colors.success + '30' }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: colors.success }}>
                      Active
                    </Text>
                  </View>
                </View>

                {/* Sync Status */}
                <View className="flex-row items-center justify-between mb-3 pb-3" style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
                  <View>
                    <Text className="text-xs text-muted">Last Sync</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {connection.lastSync.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-muted">Expires</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {connection.expiresAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleManualSync(connection.id)}
                    disabled={connection.syncStatus === 'syncing'}
                    activeOpacity={0.6}
                  >
                    <Text className="text-center text-white text-sm font-semibold">
                      {connection.syncStatus === 'syncing' ? '⏳ Syncing...' : '🔄 Sync Now'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDisconnect(connection.id)}
                    activeOpacity={0.6}
                  >
                    <Text className="text-center text-sm font-semibold" style={{ color: colors.error }}>
                      Disconnect
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Available Devices */}
        {availableToConnect.length > 0 && (
          <>
            <Text className="text-base font-semibold text-foreground mb-3 mt-4">
              Available Devices
            </Text>
            {availableToConnect.map((deviceType) => (
              <TouchableOpacity
                key={deviceType}
                onPress={() => handleConnect(deviceType)}
                activeOpacity={0.6}
              >
                <View
                  className="rounded-lg p-4"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <Text className="text-2xl">{getDeviceIcon(deviceType)}</Text>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {getDeviceLabel(deviceType)}
                        </Text>
                        <Text className="text-xs text-muted">Tap to connect</Text>
                      </View>
                    </View>
                    <Text className="text-xl">→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Benefits */}
        <View
          className="rounded-lg p-4 mt-6"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
        >
          <Text className="text-base font-semibold text-foreground mb-3">Benefits</Text>
          <View className="gap-2">
            <View className="flex-row gap-2">
              <Text className="text-lg">📊</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Automatic Health Sync</Text>
                <Text className="text-xs text-muted">Sleep, steps, heart rate synced daily</Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <Text className="text-lg">🧠</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">AI Insights</Text>
                <Text className="text-xs text-muted">Personalized recommendations based on data</Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <Text className="text-lg">🎯</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Better Predictions</Text>
                <Text className="text-xs text-muted">Streak break alerts with higher accuracy</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy Notice */}
        <View className="mt-4 p-3 rounded-lg" style={{ backgroundColor: colors.border + '30' }}>
          <Text className="text-xs text-muted">
            🔒 Your health data is encrypted and never shared with third parties. We only use it to generate personalized insights.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
