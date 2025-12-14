import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Button } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { useApp } from '../../store/AppContext';
import { RootStackParamList, TripPlan } from '../../types';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TripHistory'>;
};

type SortOption = 'newest' | 'oldest' | 'name' | 'duration';
type FilterStatus = 'all' | 'draft' | 'active' | 'completed';

const SORT_OPTIONS: { id: SortOption; label: string; emoji: string }[] = [
  { id: 'newest', label: 'Новые', emoji: '🆕' },
  { id: 'oldest', label: 'Старые', emoji: '📜' },
  { id: 'name', label: 'Имя', emoji: '🔤' },
  { id: 'duration', label: 'Длина', emoji: '📏' },
];

const STATUS_FILTERS: { id: FilterStatus; label: string; emoji: string }[] = [
  { id: 'all', label: 'Все', emoji: '📋' },
  { id: 'active', label: 'Активные', emoji: '🟢' },
  { id: 'draft', label: 'Черновики', emoji: '📝' },
  { id: 'completed', label: 'Завершённые', emoji: '✅' },
];

export function TripHistoryScreen({ navigation }: Props) {
  const { state, deleteTrip, duplicateTrip, updateTrip } = useApp();
  const { tripHistory } = state;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripPlan | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Filter and sort trips
  const filteredTrips = useMemo(() => {
    let result = [...tripHistory];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trip =>
        trip.destination.toLowerCase().includes(query) ||
        trip.title.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(trip => trip.status === filterStatus);
    }
    
    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.destination.localeCompare(b.destination));
        break;
      case 'duration':
        result.sort((a, b) => b.days.length - a.days.length);
        break;
    }
    
    return result;
  }, [tripHistory, searchQuery, sortBy, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const totalTrips = tripHistory.length;
    const totalDays = tripHistory.reduce((acc, trip) => acc + trip.days.length, 0);
    const totalActivities = tripHistory.reduce((acc, trip) => 
      acc + trip.days.reduce((a, day) => a + day.slots.length, 0), 0
    );
    const totalPlaces = tripHistory.reduce((acc, trip) => 
      acc + trip.days.reduce((a, day) => 
        a + day.slots.reduce((s, slot) => s + slot.options.length, 0), 0
      ), 0
    );
    const countries = [...new Set(tripHistory.map(t => t.destinationCity?.country || t.destination))];
    const activeTrips = tripHistory.filter(t => t.status === 'active').length;
    const completedTrips = tripHistory.filter(t => t.status === 'completed').length;
    
    return {
      totalTrips,
      totalDays,
      totalActivities,
      totalPlaces,
      countries: countries.length,
      activeTrips,
      completedTrips,
      avgDaysPerTrip: totalTrips > 0 ? (totalDays / totalTrips).toFixed(1) : '0',
    };
  }, [tripHistory]);

  const handleDeleteTrip = (trip: TripPlan) => {
    Alert.alert(
      'Удалить маршрут?',
      `Вы уверены, что хотите удалить "${trip.title}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            deleteTrip(trip.id);
            setShowActionsModal(false);
            setSelectedTrip(null);
          },
        },
      ]
    );
  };

  const handleDuplicateTrip = (trip: TripPlan) => {
    duplicateTrip(trip);
    setShowActionsModal(false);
    setSelectedTrip(null);
    Alert.alert('Готово!', 'Маршрут скопирован');
  };

  const handleChangeStatus = (trip: TripPlan, newStatus: 'draft' | 'active' | 'completed') => {
    updateTrip({ ...trip, status: newStatus });
    setShowActionsModal(false);
    setSelectedTrip(null);
  };

  const openActions = (trip: TripPlan) => {
    setSelectedTrip(trip);
    setShowActionsModal(true);
  };

  const statusConfig = {
    draft: { emoji: '📝', label: 'Черновик', color: Colors.textMuted },
    active: { emoji: '🟢', label: 'Активный', color: Colors.success },
    completed: { emoji: '✅', label: 'Завершён', color: Colors.primary },
  };

  const renderTrip = ({ item, index }: { item: TripPlan; index: number }) => {
    const status = statusConfig[item.status];

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('PlanDetails', { planId: item.id })}
        onLongPress={() => openActions(item)}
        activeOpacity={0.8}
        delayLongPress={300}
      >
        <Card style={styles.tripCard} variant="elevated">
          {/* Trip number badge */}
          <View style={styles.tripNumberBadge}>
            <Text style={styles.tripNumberText}>#{tripHistory.length - index}</Text>
          </View>
          
          <View style={styles.tripHeader}>
            <View style={styles.tripTitleContainer}>
              <Text style={styles.tripDestination} numberOfLines={1} ellipsizeMode="tail">
                {item.destination}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                <Text>{status.emoji}</Text>
                <Text style={[styles.statusText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => openActions(item)}
              style={styles.moreButton}
            >
              <Text style={styles.moreButtonText}>⋮</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.tripTitle} numberOfLines={2} ellipsizeMode="tail">
            {item.title}
          </Text>
          
          <View style={styles.tripMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaEmoji}>📅</Text>
              <Text style={styles.metaText}>{item.days.length} дней</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaEmoji}>📍</Text>
              <Text style={styles.metaText}>
                {item.days.reduce((acc, day) => acc + day.slots.length, 0)} мест
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaEmoji}>🗓️</Text>
              <Text style={styles.metaText}>{item.startDate}</Text>
            </View>
          </View>
          
          {/* Quick actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('DayView', { dayIndex: 0, plan: item })}
            >
              <Text style={styles.quickActionText}>👁️ Открыть</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleDuplicateTrip(item)}
            >
              <Text style={styles.quickActionText}>📋 Копия</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickAction, styles.deleteAction]}
              onPress={() => handleDeleteTrip(item)}
            >
              <Text style={styles.deleteActionText}>🗑️</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.createdAt}>
            Создан: {new Date(item.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🗺️</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery || filterStatus !== 'all' 
          ? 'Ничего не найдено' 
          : 'Пока нет поездок'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || filterStatus !== 'all'
          ? 'Попробуйте изменить фильтры'
          : 'Создай свой первый маршрут'}
      </Text>
      {!searchQuery && filterStatus === 'all' && (
        <Button
          title="Создать маршрут 🚀"
          onPress={() => navigation.navigate('GeneratePlan')}
          variant="accent"
          style={styles.createButton}
        />
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Stats summary */}
      <TouchableOpacity 
        style={styles.statsSummary}
        onPress={() => setShowStatsModal(true)}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statMini}>
            <Text style={styles.statMiniValue}>{stats.totalTrips}</Text>
            <Text style={styles.statMiniLabel}>поездок</Text>
          </View>
          <View style={styles.statMini}>
            <Text style={styles.statMiniValue}>{stats.totalDays}</Text>
            <Text style={styles.statMiniLabel}>дней</Text>
          </View>
          <View style={styles.statMini}>
            <Text style={styles.statMiniValue}>{stats.countries}</Text>
            <Text style={styles.statMiniLabel}>стран</Text>
          </View>
          <View style={styles.statMini}>
            <Text style={styles.statMiniValue}>{stats.totalPlaces}</Text>
            <Text style={styles.statMiniLabel}>мест</Text>
          </View>
        </View>
        <Text style={styles.statsHint}>Нажми для подробностей →</Text>
      </TouchableOpacity>

      {/* Filters row */}
      <View style={styles.filtersRow}>
        {STATUS_FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              filterStatus === filter.id && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus(filter.id)}
          >
            <Text style={styles.filterEmoji}>{filter.emoji}</Text>
            <Text style={[
              styles.filterLabel,
              filterStatus === filter.id && styles.filterLabelActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>
          {filteredTrips.length} из {tripHistory.length} маршрутов
        </Text>
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearch}>Очистить поиск</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Мои маршруты</Text>
        <TouchableOpacity 
          onPress={() => setShowSortModal(true)}
          style={styles.sortButton}
        >
          <Text style={styles.sortButtonText}>⇅</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по городу или названию..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredTrips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredTrips.length === 0 && styles.emptyContent,
        ]}
        ListHeaderComponent={tripHistory.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB - Create new trip */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('GeneratePlan')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Сортировка</Text>
            {SORT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.modalOption,
                  sortBy === option.id && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setSortBy(option.id);
                  setShowSortModal(false);
                }}
              >
                <Text style={styles.modalOptionEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.modalOptionText,
                  sortBy === option.id && styles.modalOptionTextActive,
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Actions Modal */}
      <Modal
        visible={showActionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionsModal(false)}
        >
          <View style={styles.actionsSheet}>
            <View style={styles.sheetHandle} />
            {selectedTrip && (
              <>
                <Text style={styles.sheetTitle}>{selectedTrip.destination}</Text>
                <Text style={styles.sheetSubtitle}>{selectedTrip.title}</Text>
                
                <View style={styles.actionsList}>
                  <TouchableOpacity 
                    style={styles.actionItem}
                    onPress={() => {
                      setShowActionsModal(false);
                      navigation.navigate('PlanDetails', { planId: selectedTrip.id });
                    }}
                  >
                    <Text style={styles.actionIcon}>👁️</Text>
                    <Text style={styles.actionText}>Посмотреть</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionItem}
                    onPress={() => {
                      setShowActionsModal(false);
                      navigation.navigate('DayView', { dayIndex: 0, plan: selectedTrip });
                    }}
                  >
                    <Text style={styles.actionIcon}>🚀</Text>
                    <Text style={styles.actionText}>Начать поездку</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionItem}
                    onPress={() => handleDuplicateTrip(selectedTrip)}
                  >
                    <Text style={styles.actionIcon}>📋</Text>
                    <Text style={styles.actionText}>Дублировать</Text>
                  </TouchableOpacity>

                  <View style={styles.actionDivider} />
                  
                  <Text style={styles.statusLabel}>Изменить статус:</Text>
                  <View style={styles.statusButtons}>
                    {(['draft', 'active', 'completed'] as const).map(status => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusButton,
                          selectedTrip.status === status && styles.statusButtonActive,
                        ]}
                        onPress={() => handleChangeStatus(selectedTrip, status)}
                      >
                        <Text>{statusConfig[status].emoji}</Text>
                        <Text style={styles.statusButtonText}>
                          {statusConfig[status].label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.actionDivider} />
                  
                  <TouchableOpacity 
                    style={[styles.actionItem, styles.deleteItem]}
                    onPress={() => handleDeleteTrip(selectedTrip)}
                  >
                    <Text style={styles.actionIcon}>🗑️</Text>
                    <Text style={[styles.actionText, styles.deleteText]}>Удалить</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Stats Modal */}
      <Modal
        visible={showStatsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatsModal(false)}
        >
          <View style={styles.statsModalContent}>
            <Text style={styles.statsModalTitle}>📊 Статистика путешествий</Text>
            
            <View style={styles.statsDetailGrid}>
              <View style={styles.statDetail}>
                <Text style={styles.statDetailEmoji}>🗺️</Text>
                <Text style={styles.statDetailValue}>{stats.totalTrips}</Text>
                <Text style={styles.statDetailLabel}>Всего поездок</Text>
              </View>
              <View style={styles.statDetail}>
                <Text style={styles.statDetailEmoji}>📅</Text>
                <Text style={styles.statDetailValue}>{stats.totalDays}</Text>
                <Text style={styles.statDetailLabel}>Дней в путешествиях</Text>
              </View>
              <View style={styles.statDetail}>
                <Text style={styles.statDetailEmoji}>🌍</Text>
                <Text style={styles.statDetailValue}>{stats.countries}</Text>
                <Text style={styles.statDetailLabel}>Стран</Text>
              </View>
              <View style={styles.statDetail}>
                <Text style={styles.statDetailEmoji}>📍</Text>
                <Text style={styles.statDetailValue}>{stats.totalPlaces}</Text>
                <Text style={styles.statDetailLabel}>Мест для посещения</Text>
              </View>
              <View style={styles.statDetail}>
                <Text style={styles.statDetailEmoji}>⚡</Text>
                <Text style={styles.statDetailValue}>{stats.totalActivities}</Text>
                <Text style={styles.statDetailLabel}>Активностей</Text>
              </View>
              <View style={styles.statDetail}>
                <Text style={styles.statDetailEmoji}>📏</Text>
                <Text style={styles.statDetailValue}>{stats.avgDaysPerTrip}</Text>
                <Text style={styles.statDetailLabel}>Средняя длина поездки</Text>
              </View>
            </View>

            <View style={styles.statsProgress}>
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>🟢 Активные</Text>
                  <Text style={styles.progressValue}>{stats.activeTrips}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill, 
                    { width: `${(stats.activeTrips / Math.max(stats.totalTrips, 1)) * 100}%` },
                    { backgroundColor: Colors.success }
                  ]} />
                </View>
              </View>
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>✅ Завершённые</Text>
                  <Text style={styles.progressValue}>{stats.completedTrips}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill, 
                    { width: `${(stats.completedTrips / Math.max(stats.totalTrips, 1)) * 100}%` },
                    { backgroundColor: Colors.primary }
                  ]} />
                </View>
              </View>
            </View>

            <Button
              title="Закрыть"
              onPress={() => setShowStatsModal(false)}
              variant="outline"
              fullWidth
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButtonText: {
    fontSize: 20,
    color: Colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  clearIcon: {
    fontSize: 16,
    color: Colors.textMuted,
    padding: Spacing.xs,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listHeader: {
    marginBottom: Spacing.md,
  },
  statsSummary: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statMini: {
    alignItems: 'center',
  },
  statMiniValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  statMiniLabel: {
    fontSize: FontSize.xs,
    color: Colors.textOnPrimary,
    opacity: 0.8,
  },
  statsHint: {
    fontSize: FontSize.xs,
    color: Colors.textOnPrimary,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterEmoji: {
    fontSize: 12,
  },
  filterLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterLabelActive: {
    color: Colors.textOnPrimary,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  clearSearch: {
    fontSize: FontSize.sm,
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  tripCard: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  tripNumberBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    zIndex: 1,
  },
  tripNumberText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  tripTitleContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  tripDestination: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  moreButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonText: {
    fontSize: 24,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  tripTitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    flexShrink: 1,
  },
  tripMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaEmoji: {
    fontSize: 14,
  },
  metaText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  deleteAction: {
    flex: 0,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.error + '15',
  },
  deleteActionText: {
    fontSize: 14,
  },
  createdAt: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  createButton: {
    marginTop: Spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  fabIcon: {
    fontSize: 32,
    color: Colors.textOnPrimary,
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  modalOptionActive: {
    backgroundColor: Colors.primaryLight + '20',
  },
  modalOptionEmoji: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  modalOptionText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  modalOptionTextActive: {
    fontWeight: '600',
    color: Colors.primary,
  },
  checkmark: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: '700',
  },
  actionsSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  actionsList: {
    gap: Spacing.xs,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  actionText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  actionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  statusLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '20',
  },
  statusButtonText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  deleteItem: {
    backgroundColor: Colors.error + '15',
  },
  deleteText: {
    color: Colors.error,
  },
  statsModalContent: {
    width: width * 0.9,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  statsModalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  statsDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
  },
  statDetail: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statDetailEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  statDetailValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
  },
  statDetailLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  statsProgress: {
    marginBottom: Spacing.lg,
  },
  progressItem: {
    marginBottom: Spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  progressValue: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
