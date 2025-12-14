import React, { useMemo } from 'react';
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
import { CUISINES } from '../../constants/data';
import { useApp } from '../../store/AppContext';
import { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingCuisine'>;
};

export function OnboardingCuisine({ navigation }: Props) {
  const { state, updatePreferences } = useApp();
  const selectedCuisines = state.preferences.cuisines;
  const selectedCountries = state.preferences.countries;

  // Sort cuisines: matched countries first, then alphabetically
  const sortedCuisines = useMemo(() => {
    return [...CUISINES].sort((a, b) => {
      const aMatches = a.countries.some(c => selectedCountries.includes(c));
      const bMatches = b.countries.some(c => selectedCountries.includes(c));
      
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return a.label.localeCompare(b.label);
    });
  }, [selectedCountries]);

  const toggleCuisine = (cuisineId: string) => {
    const newCuisines = selectedCuisines.includes(cuisineId)
      ? selectedCuisines.filter(c => c !== cuisineId)
      : [...selectedCuisines, cuisineId];
    updatePreferences({ cuisines: newCuisines });
  };

  const handleNext = () => {
    navigation.navigate('OnboardingActivity');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ProgressBar current={2} total={5} />
        <Text style={styles.step}>Шаг 2 из 5</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>🍽️</Text>
        <Text style={styles.title}>Любимая кухня?</Text>
        <Text style={styles.subtitle}>
          Мы подберём лучшие рестораны для тебя
        </Text>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.chipsContainer}
          showsVerticalScrollIndicator={false}
        >
          {sortedCuisines.map(cuisine => {
            const isRecommended = cuisine.countries.some(c => 
              selectedCountries.includes(c)
            );
            return (
              <SelectableChip
                key={cuisine.id}
                label={isRecommended ? `⭐ ${cuisine.label}` : cuisine.label}
                selected={selectedCuisines.includes(cuisine.id)}
                onPress={() => toggleCuisine(cuisine.id)}
                size="md"
                style={styles.chip}
              />
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          Выбрано: {selectedCuisines.length}
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
            title="Далее"
            onPress={handleNext}
            variant="accent"
            size="lg"
            style={styles.nextButton}
            disabled={selectedCuisines.length === 0}
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

