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
import { BUDGET_LEVELS, DAY_OPTIONS } from '../../constants/data';
import { useApp } from '../../store/AppContext';
import { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingDays'>;
};

export function OnboardingDays({ navigation }: Props) {
  const { state, updatePreferences } = useApp();
  const selectedDays = state.preferences.days;
  const selectedBudget = state.preferences.budget;

  const handleNext = () => {
    navigation.navigate('OnboardingInterests');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ProgressBar current={4} total={5} />
        <Text style={styles.step}>Шаг 4 из 5</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>📅</Text>
        <Text style={styles.title}>Детали поездки</Text>
        
        {/* Days selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сколько дней?</Text>
          <View style={styles.daysContainer}>
            {DAY_OPTIONS.map(day => (
              <TouchableOpacity
                key={day}
                onPress={() => updatePreferences({ days: day })}
                style={[
                  styles.dayButton,
                  selectedDays === day && styles.dayButtonSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayText,
                  selectedDays === day && styles.dayTextSelected,
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.daysLabel}>
            {selectedDays} {selectedDays === 1 ? 'день' : selectedDays < 5 ? 'дня' : 'дней'}
          </Text>
        </View>

        {/* Budget selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Бюджет</Text>
          <View style={styles.budgetContainer}>
            {BUDGET_LEVELS.map(budget => (
              <TouchableOpacity
                key={budget.id}
                onPress={() => updatePreferences({ budget: budget.id as 'low' | 'medium' | 'high' })}
                activeOpacity={0.8}
                style={styles.budgetTouchable}
              >
                <Card
                  variant={selectedBudget === budget.id ? 'elevated' : 'outlined'}
                  style={
                    selectedBudget === budget.id 
                      ? [styles.budgetCard, styles.budgetCardSelected] 
                      : styles.budgetCard
                  }
                >
                  <Text style={styles.budgetEmoji}>{budget.emoji}</Text>
                  <Text style={[
                    styles.budgetLabel,
                    selectedBudget === budget.id && styles.budgetLabelSelected,
                  ]}>
                    {budget.label}
                  </Text>
                  <Text style={[
                    styles.budgetDescription,
                    selectedBudget === budget.id && styles.budgetDescriptionSelected,
                  ]}>
                    {budget.description}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
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
    fontSize: 48,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accentDark,
  },
  dayText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dayTextSelected: {
    color: Colors.textOnAccent,
  },
  daysLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  budgetContainer: {
    gap: Spacing.sm,
  },
  budgetTouchable: {
    width: '100%',
  },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  budgetCardSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  budgetEmoji: {
    fontSize: 32,
  },
  budgetLabel: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  budgetLabelSelected: {
    color: Colors.textOnPrimary,
  },
  budgetDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  budgetDescriptionSelected: {
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

