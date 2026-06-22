import { router } from 'expo-router';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    router.replace('/(tabs)' as never);
  }, []);

  return null;
}
