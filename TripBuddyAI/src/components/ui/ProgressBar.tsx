import React, { useMemo } from 'react';
import { View } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
  height?: number;
}

export function ProgressBar({ current, total, height = 6 }: ProgressBarProps) {
  const progress = useMemo(() => Math.min(Math.max(current / total, 0), 1) * 100, [current, total]);

  return (
    <View className="w-full rounded-full bg-primary/10 overflow-hidden" style={{ height }}>
      <View
        className="h-full rounded-full bg-primary"
        style={{ width: `${progress}%` }}
      />
    </View>
  );
}
