import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, SelectableChip, Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { COUNTRIES, CUISINES, ACTIVITY_TYPES, BUDGET_LEVELS, INTERESTS, DAY_OPTIONS } from '../../constants/data';
import { useApp } from '../../store/AppContext';
import { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditPreferences'>;
};

export function EditPreferencesScreen({ navigation }: Props) {
  const { state, updatePreferences } = useApp();
  const { preferences } = state;

  const toggleCountry = (countryId: string) => {
    const newCountries = preferences.countries.includes(countryId)
      ? preferences.countries.filter(c => c !== countryId)
      : [...preferences.countries, countryId];
    updatePreferences({ countries: newCountries });
  };

  const toggleCuisine = (cuisineId: string) => {
    const newCuisines = preferences.cuisines.includes(cuisineId)
      ? preferences.cuisines.filter(c => c !== cuisineId)
      : [...preferences.cuisines, cuisineId];
    updatePreferences({ cuisines: newCuisines });
  };

  const toggleInterest = (interestId: string) => {
    const newInterests = preferences.interests.includes(interestId)
      ? preferences.interests.filter(i => i !== interestId)
      : [...preferences.interests, interestId];
    updatePreferences({ interests: newInterests });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Предпочтения</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Countries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌍 Страны</Text>
          <View style={styles.chipsContainer}>
            {COUNTRIES.map(country => (
              <SelectableChip
                key={country.id}
                label={country.label}
                selected={preferences.countries.includes(country.id)}
                onPress={() => toggleCountry(country.id)}
              />
            ))}
          </View>
        </View>

        {/* Cuisines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ Кухни</Text>
          <View style={styles.chipsContainer}>
            {CUISINES.map(cuisine => (
              <SelectableChip
                key={cuisine.id}
                label={cuisine.label}
                selected={preferences.cuisines.includes(cuisine.id)}
                onPress={() => toggleCuisine(cuisine.id)}
              />
            ))}
          </View>
        </View>

        {/* Activity Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Стиль отдыха</Text>
          <View style={styles.activityContainer}>
            {ACTIVITY_TYPES.map(activity => (
              <TouchableOpacity
                key={activity.id}
                onPress={() => updatePreferences({ 
                  activityType: activity.id as 'active' | 'passive' | 'mixed' 
                })}
                activeOpacity={0.8}
              >
                <Card
                  variant={preferences.activityType === activity.id ? 'elevated' : 'outlined'}
                  style={
                    preferences.activityType === activity.id 
                      ? [styles.activityCard, styles.selectedActivityCard] 
                      : styles.activityCard
                  }
                >
                  <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                  <Text style={[
                    styles.activityLabel,
                    preferences.activityType === activity.id && styles.selectedActivityLabel,
                  ]}>
                    {activity.label}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Days */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Количество дней: {preferences.days}</Text>
          <View style={styles.daysContainer}>
            {DAY_OPTIONS.map(day => (
              <TouchableOpacity
                key={day}
                onPress={() => updatePreferences({ days: day })}
                style={[
                  styles.dayButton,
                  preferences.days === day && styles.dayButtonSelected,
                ]}
              >
                <Text style={[
                  styles.dayText,
                  preferences.days === day && styles.dayTextSelected,
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Бюджет</Text>
          <View style={styles.budgetContainer}>
            {BUDGET_LEVELS.map(budget => (
              <TouchableOpacity
                key={budget.id}
                onPress={() => updatePreferences({ 
                  budget: budget.id as 'low' | 'medium' | 'high' 
                })}
                style={[
                  styles.budgetButton,
                  preferences.budget === budget.id && styles.budgetButtonSelected,
                ]}
              >
                <Text style={styles.budgetEmoji}>{budget.emoji}</Text>
                <Text style={[
                  styles.budgetLabel,
                  preferences.budget === budget.id && styles.budgetLabelSelected,
                ]}>
                  {budget.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Интересы</Text>
          <View style={styles.chipsContainer}>
            {INTERESTS.map(interest => (
              <SelectableChip
                key={interest.id}
                label={interest.label}
                emoji={interest.emoji}
                selected={preferences.interests.includes(interest.id)}
                onPress={() => toggleInterest(interest.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Сохранить"
          onPress={() => navigation.goBack()}
          variant="accent"
          size="lg"
          fullWidth
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  activityContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  activityCard: {
    alignItems: 'center',
    padding: Spacing.md,
    minWidth: 100,
  },
  selectedActivityCard: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  activityEmoji: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  activityLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  selectedActivityLabel: {
    color: Colors.textOnPrimary,
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
  budgetContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  budgetButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  budgetButtonSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  budgetEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  budgetLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  budgetLabelSelected: {
    color: Colors.textOnPrimary,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
});

