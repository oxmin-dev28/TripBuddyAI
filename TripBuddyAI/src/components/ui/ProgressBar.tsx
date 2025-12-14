import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

interface ProgressBarProps {
  current: number;
  total: number;
  height?: number;
}

export function ProgressBar({ current, total, height = 6 }: ProgressBarProps) {
  const progress = useMemo(() => Math.min(Math.max(current / total, 0), 1) * 100, [current, total]);

  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${progress}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.primary}20`,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
});
