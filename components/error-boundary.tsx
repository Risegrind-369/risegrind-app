import React, { ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackScreen
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackScreenProps {
  error: Error | null;
  errorInfo: { componentStack: string } | null;
  onReset: () => void;
}

function ErrorFallbackScreen({ error, errorInfo, onReset }: ErrorFallbackScreenProps) {
  const colors = useColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', gap: 16 }}>
          {/* Error Icon */}
          <Text style={{ fontSize: 64 }}>⚠️</Text>

          {/* Error Title */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: colors.foreground,
              textAlign: 'center',
            }}
          >
            Something Went Wrong
          </Text>

          {/* Error Message */}
          <Text
            style={{
              fontSize: 14,
              color: colors.muted,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            We encountered an unexpected error. Please try again or restart the app.
          </Text>

          {/* Error Details (Development Only) */}
          {error && __DEV__ && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                marginTop: 12,
                maxHeight: 200,
                width: '100%',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.foreground,
                  fontFamily: 'monospace',
                }}
              >
                {error.message}
              </Text>
              {errorInfo && (
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.muted,
                    fontFamily: 'monospace',
                    marginTop: 8,
                  }}
                >
                  {errorInfo.componentStack}
                </Text>
              )}
            </View>
          )}

          {/* Reset Button */}
          <Pressable
            onPress={onReset}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                marginTop: 16,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={{
                color: colors.background,
                fontWeight: 'bold',
                fontSize: 16,
                textAlign: 'center',
              }}
            >
              Try Again
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
