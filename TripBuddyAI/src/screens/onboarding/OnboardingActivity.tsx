import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, ProgressBar, Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { ACTIVITY_TYPES } from '../../constants/data';
import { useApp } from '../../store/AppContext';
import { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingActivity'>;
};

export function OnboardingActivity({ navigation }: Props) {
  const { state, updatePreferences } = useApp();
  const selectedActivity = state.preferences.activityType;

  const selectActivity = (activityId: 'active' | 'passive' | 'mixed') => {
    updatePreferences({ activityType: activityId });
  };

  const handleNext = () => {
    navigation.navigate('OnboardingDays');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ProgressBar current={3} total={5} />
        <Text style={styles.step}>Шаг 3 из 5</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>Какой отдых?</Text>
        <Text style={styles.subtitle}>
          Выбери свой стиль путешествия
        </Text>

        <View style={styles.optionsContainer}>
          {ACTIVITY_TYPES.map(activity => (
            <TouchableOpacity
              key={activity.id}
              onPress={() => selectActivity(activity.id as 'active' | 'passive' | 'mixed')}
              activeOpacity={0.8}
            >
              <Card
                variant={selectedActivity === activity.id ? 'elevated' : 'outlined'}
                style={
                  selectedActivity === activity.id 
                    ? [styles.optionCard, styles.selectedCard] 
                    : styles.optionCard
                }
              >
                <Text style={styles.optionEmoji}>{activity.emoji}</Text>
                <Text style={[
                  styles.optionLabel,
                  selectedActivity === activity.id && styles.selectedLabel,
                ]}>
                  {activity.label}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  selectedActivity === activity.id && styles.selectedDescription,
                ]}>
                  {activity.description}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.buttons}>
          <Button
            title="Назад"
            onPress={handleBack}
            variant="outline"
            size="lg"
            style={styles.backButton}
          />
          <Button
            title="Далее"
            onPress={handleNext}
            variant="accent"
            size="lg"
            style={styles.nextButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  step: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  selectedCard: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  optionEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  optionLabel: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  selectedLabel: {
    color: Colors.textOnPrimary,
  },
  optionDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  selectedDescription: {
    color: Colors.textOnPrimary,
    opacity: 0.9,
  },
  footer: {
    padding: Spacing.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});

