import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

interface ProgressBarProps {
  current: number;
  total: number;
  height?: number;
}

export function ProgressBar({ current, total, height = 4 }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.fill, { width: `${progress}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
  },
});

