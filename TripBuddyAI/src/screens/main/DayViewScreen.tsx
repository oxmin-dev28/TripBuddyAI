import React, { useState } from 'react';
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
import { VotingCard } from '../../components/VotingCard';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { RootStackParamList, TimeSlot } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DayView'>;
  route: RouteProp<RootStackParamList, 'DayView'>;
};

const SLOT_ICONS: Record<string, string> = {
  breakfast: '🥐',
  lunch: '🍽️',
  dinner: '🍷',
  snack: '☕',
  museum: '🏛️',
  attraction: '🎯',
  walk: '🚶',
  activity: '⚡',
  nightlife: '🎉',
  shopping: '🛍️',
};

export function DayViewScreen({ navigation, route }: Props) {
  const { dayIndex, plan } = route.params;
  const [currentDayIndex, setCurrentDayIndex] = useState(dayIndex);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  
  const currentDay = plan.days[currentDayIndex];
  const totalDays = plan.days.length;

  const handleSelectOption = (slotIndex: number, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [slotIndex]: prev[slotIndex] === optionId ? '' : optionId,
    }));
  };

  const handlePreviousDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
      setSelectedOptions({});
    }
  };

  const handleNextDay = () => {
    if (currentDayIndex < totalDays - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
      setSelectedOptions({});
    }
  };

  const handleOpenMap = (slot: TimeSlot) => {
    // Pass destination city from the plan so Map shows places in that city, not current GPS location
    navigation.navigate('Map', { 
      places: slot.options,
      destination: plan.destinationCity,
      mode: 'route',
    });
  };

  const handleConfirmSelections = () => {
    // In production, this would submit votes and regenerate the plan
    console.log('Confirmed selections:', selectedOptions);
    // For now, just go back
    navigation.goBack();
  };

  const getSelectedCount = () => {
    return Object.values(selectedOptions).filter(v => v).length;
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
        <Text style={styles.headerTitle}>{plan.destination}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Day Navigation */}
      <View style={styles.dayNav}>
        <TouchableOpacity 
          onPress={handlePreviousDay}
          disabled={currentDayIndex === 0}
          style={[styles.dayNavButton, currentDayIndex === 0 && styles.disabledButton]}
        >
          <Text style={[styles.dayNavText, currentDayIndex === 0 && styles.disabledText]}>
            ←
          </Text>
        </TouchableOpacity>
        
        <View style={styles.dayInfo}>
          <Text style={styles.dayNumber}>День {currentDay.dayNumber}</Text>
          <Text style={styles.dayDate}>{currentDay.date}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={handleNextDay}
          disabled={currentDayIndex === totalDays - 1}
          style={[styles.dayNavButton, currentDayIndex === totalDays - 1 && styles.disabledButton]}
        >
          <Text style={[styles.dayNavText, currentDayIndex === totalDays - 1 && styles.disabledText]}>
            →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day dots */}
      <View style={styles.dotsContainer}>
        {plan.days.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setCurrentDayIndex(index);
              setSelectedOptions({});
            }}
          >
            <View style={[
              styles.dot,
              index === currentDayIndex && styles.activeDot,
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Timeline */}
      <ScrollView 
        style={styles.timeline}
        contentContainerStyle={styles.timelineContent}
        showsVerticalScrollIndicator={false}
      >
        {currentDay.slots.map((slot, slotIndex) => (
          <View key={slotIndex} style={styles.slotContainer}>
            {/* Time marker */}
            <View style={styles.timeColumn}>
              <Text style={styles.timeText}>{slot.time}</Text>
              <View style={styles.timeLine} />
            </View>

            {/* Slot content */}
            <View style={styles.slotContent}>
              <View style={styles.slotHeader}>
                <Text style={styles.slotIcon}>{SLOT_ICONS[slot.type] || '📍'}</Text>
                <Text style={styles.slotTitle} numberOfLines={1} ellipsizeMode="tail">
                  {slot.title}
                </Text>
                <TouchableOpacity 
                  onPress={() => handleOpenMap(slot)}
                  style={styles.mapButton}
                >
                  <Text style={styles.mapButtonText}>🗺️</Text>
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {slot.options.map((option) => (
                  <VotingCard
                    key={option.id}
                    option={option}
                    isSelected={selectedOptions[slotIndex] === option.id}
                    onSelect={() => handleSelectOption(slotIndex, option.id)}
                    showVotes={false}
                  />
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.selectionCount}>
          Выбрано: {getSelectedCount()} из {currentDay.slots.length}
        </Text>
        <Button
          title="Подтвердить выбор ✓"
          onPress={handleConfirmSelections}
          variant="accent"
          size="lg"
          fullWidth
          disabled={getSelectedCount() < currentDay.slots.length}
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
  dayNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  dayNavButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabledButton: {
    opacity: 0.5,
  },
  dayNavText: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  disabledText: {
    color: Colors.textMuted,
  },
  dayInfo: {
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dayDate: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
  },
  activeDot: {
    backgroundColor: Colors.accent,
    width: 24,
  },
  timeline: {
    flex: 1,
  },
  timelineContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  slotContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  timeLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: Spacing.xs,
  },
  slotContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  slotIcon: {
    fontSize: 24,
  },
  slotTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  mapButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapButtonText: {
    fontSize: 18,
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  selectionCount: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

