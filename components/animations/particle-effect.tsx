'use client';
import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface Particle {
  id: string;
  x: number;
  y: number;
  angle: number;
  distance: number;
  opacity: any;
  scale: any;
}

interface ParticleEffectProps {
  trigger: boolean;
  particleCount?: number;
  color?: string;
  duration?: number;
  onComplete?: () => void;
}

export function ParticleEffect({
  trigger,
  particleCount = 12,
  color = '#10B981',
  duration = 800,
  onComplete,
}: ParticleEffectProps) {
  const [particles, setParticles] = React.useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x: 0,
      y: 0,
      angle: (i / particleCount) * Math.PI * 2,
      distance: 60 + Math.random() * 40,
      opacity: useSharedValue(1),
      scale: useSharedValue(1),
    }));

    setParticles(newParticles);

    newParticles.forEach((p) => {
      p.opacity.value = withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
      p.scale.value = withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    });

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <View style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
      {particles.map((p) => (
        <ParticleItem key={p.id} particle={p} color={color} />
      ))}
    </View>
  );
}

function ParticleItem({ particle, color }: { particle: Particle; color: string }) {
  const x = Math.cos(particle.angle) * particle.distance;
  const y = Math.sin(particle.angle) * particle.distance;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: particle.opacity.value,
    transform: [
      { translateX: x },
      { translateY: y },
      { scale: particle.scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          marginLeft: -4,
          marginTop: -4,
        },
        animatedStyle,
      ]}
    />
  );
}
