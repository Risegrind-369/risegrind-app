import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase/client";
import { storeAuthTokens } from "@/lib/supabase/auth";

export default function ClaimAccountScreen() {
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaimAccount = async () => {
    setError(null);

    // Validation
    if (!email.trim()) {
      setError("Email is required");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);

    try {
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      if (!data.user) {
        setError("Failed to create account");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      // Store tokens
      if (data.session) {
        await storeAuthTokens(data.session.access_token, data.session.refresh_token);
      }

      // Call backend to link Supabase user to existing Manus user
      const response = await fetch("/api/auth/claim-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUserId: data.user.id,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to claim account");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartFresh = () => {
    Alert.alert(
      "Start Fresh?",
      "This will delete all your existing data (habits, XP, streaks, journal entries). This cannot be undone.",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete and Continue",
          onPress: async () => {
            setLoading(true);
            try {
              // Call backend to delete old data and create fresh account
              const response = await fetch("/api/auth/start-fresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
              });

              if (!response.ok) {
                throw new Error("Failed to start fresh");
              }

              const { accessToken, refreshToken } = await response.json();
              await storeAuthTokens(accessToken, refreshToken);

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace("/(tabs)");
            } catch (err) {
              const message = err instanceof Error ? err.message : "An error occurred";
              setError(message);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <View className="flex-1 justify-center gap-6">
          {/* Header */}
          <View className="gap-2 mb-4">
            <Text className="text-3xl font-bold text-foreground">Claim Your Account</Text>
            <Text className="text-base text-muted">
              We've upgraded our authentication. Set an email and password to keep your data safe.
            </Text>
          </View>

          {/* Error message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-3">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {/* Email input */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Email</Text>
            <TextInput
              placeholder="your@email.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-surface border border-border rounded-lg p-4 text-foreground"
            />
          </View>

          {/* Password input */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Password</Text>
            <TextInput
              placeholder="At least 8 characters"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              secureTextEntry
              className="bg-surface border border-border rounded-lg p-4 text-foreground"
            />
          </View>

          {/* Confirm password input */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Confirm Password</Text>
            <TextInput
              placeholder="Confirm your password"
              placeholderTextColor={colors.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
              secureTextEntry
              className="bg-surface border border-border rounded-lg p-4 text-foreground"
            />
          </View>

          {/* Claim button */}
          <TouchableOpacity
            onPress={handleClaimAccount}
            disabled={loading}
            className={`bg-primary rounded-lg p-4 items-center ${loading ? "opacity-50" : ""}`}
          >
            <Text className="text-background font-semibold text-base">
              {loading ? "Claiming..." : "Claim Account"}
            </Text>
          </TouchableOpacity>

          {/* Start fresh link */}
          <TouchableOpacity onPress={handleStartFresh} disabled={loading}>
            <Text className="text-center text-sm text-muted underline">
              Start fresh (delete old data)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
