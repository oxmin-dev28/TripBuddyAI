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
import { COUNTRIES } from '../../constants/data';
import { useApp } from '../../store/AppContext';
import { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OnboardingCountry'>;
};

export function OnboardingCountry({ navigation }: Props) {
  const { state, updatePreferences } = useApp();
  const selectedCountries = state.preferences.countries;

  const toggleCountry = (countryId: string) => {
    const newCountries = selectedCountries.includes(countryId)
      ? selectedCountries.filter(c => c !== countryId)
      : [...selectedCountries, countryId];
    updatePreferences({ countries: newCountries });
  };

  const handleNext = () => {
    navigation.navigate('OnboardingCuisine');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ProgressBar current={1} total={5} />
        <Text style={styles.step}>Шаг 1 из 5</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>🌍</Text>
        <Text style={styles.title}>Привет! Куда едем?</Text>
        <Text style={styles.subtitle}>
          Выбери страны, которые тебя интересуют
        </Text>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.chipsContainer}
          showsVerticalScrollIndicator={false}
        >
          {COUNTRIES.map(country => (
            <SelectableChip
              key={country.id}
              label={country.label}
              selected={selectedCountries.includes(country.id)}
              onPress={() => toggleCountry(country.id)}
              size="lg"
              style={styles.chip}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          Выбрано: {selectedCountries.length}
        </Text>
        <Button
          title="Далее"
          onPress={handleNext}
          variant="accent"
          size="lg"
          fullWidth
          disabled={selectedCountries.length === 0}
        />
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
});

