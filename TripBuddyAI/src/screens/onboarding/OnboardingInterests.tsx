import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, SelectableChip, ProgressBar } from '../../components/ui';
import { Colors, Spacing, FontSize } from '../../constants/theme';
import { INTERESTS } from '../../constants/data';
import { useApp } from '../../store/AppContext';
import { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingInterests'>;
};

export function OnboardingInterests({ navigation }: Props) {
  const { state, updatePreferences, setOnboarded } = useApp();
  const selectedInterests = state.preferences.interests;

  const toggleInterest = (interestId: string) => {
    const newInterests = selectedInterests.includes(interestId)
      ? selectedInterests.filter(i => i !== interestId)
      : [...selectedInterests, interestId];
    updatePreferences({ interests: newInterests });
  };

  const handleFinish = () => {
    setOnboarded(true);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ProgressBar current={5} total={5} />
        <Text style={styles.step}>Шаг 5 из 5</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>Твои интересы</Text>
        <Text style={styles.subtitle}>
          Последний шаг! Что тебе интересно?
        </Text>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.chipsContainer}
          showsVerticalScrollIndicator={false}
        >
          {INTERESTS.map(interest => (
            <SelectableChip
              key={interest.id}
              label={interest.label}
              emoji={interest.emoji}
              selected={selectedInterests.includes(interest.id)}
              onPress={() => toggleInterest(interest.id)}
              size="lg"
              style={styles.chip}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          Выбрано: {selectedInterests.length}
        </Text>
        <View style={styles.buttons}>
          <Button
            title="Назад"
            onPress={handleBack}
            variant="outline"
            size="lg"
            style={styles.backButton}
          />
          <Button
            title="Начать! 🚀"
            onPress={handleFinish}
            variant="accent"
            size="lg"
            style={styles.nextButton}
            disabled={selectedInterests.length === 0}
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
    marginBottom: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  chip: {
    marginBottom: Spacing.xs,
  },
  footer: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  selectedCount: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
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

