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
import { RouteProp } from '@react-navigation/native';
import { Button, Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { useApp } from '../../store/AppContext';
import { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlanDetails'>;
  route: RouteProp<RootStackParamList, 'PlanDetails'>;
};

export function PlanDetailsScreen({ navigation, route }: Props) {
  const { planId } = route.params;
  const { state, setActivePlan } = useApp();
  
  const plan = state.tripHistory.find(p => p.id === planId) || state.activePlan;
  
  if (!plan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>Маршрут не найден</Text>
          <Button
            title="Назад"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleOpenDay = (dayIndex: number) => {
    navigation.navigate('DayView', { dayIndex, plan });
  };

  const handleStartTrip = () => {
    setActivePlan(plan);
    navigation.navigate('DayView', { dayIndex: 0, plan });
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
        <Text style={styles.headerTitle}>Детали маршрута</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.destination}>{plan.destination}</Text>
          <Text style={styles.title}>{plan.title}</Text>
          <View style={styles.heroInfo}>
            <Text style={styles.heroInfoItem}>📅 {plan.days.length} дней</Text>
            <Text style={styles.heroInfoItem}>🗓️ {plan.startDate} — {plan.endDate}</Text>
          </View>
        </View>

        {/* Days overview */}
        <Text style={styles.sectionTitle}>План по дням</Text>
        {plan.days.map((day, index) => (
          <TouchableOpacity
            key={day.dayNumber}
            onPress={() => handleOpenDay(index)}
            activeOpacity={0.8}
          >
            <Card style={styles.dayCard} variant="default">
              <View style={styles.dayHeader}>
                <View style={styles.dayNumber}>
                  <Text style={styles.dayNumberText}>{day.dayNumber}</Text>
                </View>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayTitle}>День {day.dayNumber}</Text>
                  <Text style={styles.dayDate}>{day.date}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </View>
              <View style={styles.slotsPreview}>
                {day.slots.slice(0, 4).map((slot, slotIndex) => (
                  <View key={slotIndex} style={styles.slotPreviewItem}>
                    <Text style={styles.slotTime}>{slot.time}</Text>
                    <Text style={styles.slotTitle} numberOfLines={1}>
                      {slot.title}
                    </Text>
                  </View>
                ))}
                {day.slots.length > 4 && (
                  <Text style={styles.moreSlots}>
                    + ещё {day.slots.length - 4}
                  </Text>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Статистика</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {plan.days.reduce((acc, day) => acc + day.slots.length, 0)}
              </Text>
              <Text style={styles.statLabel}>Активностей</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {plan.days.reduce((acc, day) => 
                  acc + day.slots.reduce((a, s) => a + s.options.length, 0), 0
                )}
              </Text>
              <Text style={styles.statLabel}>Мест</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{plan.days.length}</Text>
              <Text style={styles.statLabel}>Дней</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Начать путешествие 🚀"
          onPress={handleStartTrip}
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
  hero: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  destination: {
    fontSize: FontSize.display,
    fontWeight: '700',
    color: Colors.textOnPrimary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    color: Colors.textOnPrimary,
    opacity: 0.9,
    marginBottom: Spacing.md,
  },
  heroInfo: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  heroInfoItem: {
    fontSize: FontSize.md,
    color: Colors.textOnPrimary,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  dayCard: {
    marginBottom: Spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dayNumber: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dayNumberText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  dayInfo: {
    flex: 1,
  },
  dayTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dayDate: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  arrow: {
    fontSize: FontSize.xl,
    color: Colors.textMuted,
  },
  slotsPreview: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  slotPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  slotTime: {
    width: 50,
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  slotTitle: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  moreSlots: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  statsCard: {
    marginTop: Spacing.md,
  },
  statsTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  errorEmoji: {
    fontSize: 64,
  },
  errorText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
  },
});

