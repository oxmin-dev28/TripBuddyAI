import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  Share,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { useApp } from '../../store/AppContext';
import { RootStackParamList } from '../../types';
import { COUNTRIES, CUISINES, INTERESTS } from '../../constants/data';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const AVATARS = ['👤', '🧑‍💼', '👨‍🎨', '👩‍🚀', '🧑‍🍳', '🦸', '🧙', '🥷', '👨‍✈️', '🧑‍🎤', '🦊', '🐼', '🦁', '🐯', '🦋'];

// Achievements data
const ACHIEVEMENTS = [
  { id: 'newbie', emoji: '🌟', label: 'Новичок', desc: 'Создай первый маршрут', requirement: 1, type: 'trips' },
  { id: 'explorer', emoji: '🗺️', label: 'Исследователь', desc: '5 маршрутов', requirement: 5, type: 'trips' },
  { id: 'traveler', emoji: '✈️', label: 'Путешественник', desc: '10 маршрутов', requirement: 10, type: 'trips' },
  { id: 'pro', emoji: '🏆', label: 'Про', desc: '25 маршрутов', requirement: 25, type: 'trips' },
  { id: 'globetrotter', emoji: '🌍', label: 'Глобтроттер', desc: '5 стран', requirement: 5, type: 'countries' },
  { id: 'foodie', emoji: '🍽️', label: 'Гурман', desc: '5 типов кухонь', requirement: 5, type: 'cuisines' },
  { id: 'adventurer', emoji: '⚡', label: 'Авантюрист', desc: '50 активностей', requirement: 50, type: 'activities' },
  { id: 'collector', emoji: '📍', label: 'Коллекционер', desc: '100 мест', requirement: 100, type: 'places' },
];

export function ProfileScreen({ navigation }: Props) {
  const { state, dispatch, setOnboarded, updateTrip } = useApp();
  const { preferences, tripHistory } = state;
  
  // User profile state
  const [userName, setUserName] = useState('Путешественник');
  const [userEmail, setUserEmail] = useState('user@tripbuddy.ai');
  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [offlineMaps, setOfflineMaps] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  
  // Modals
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const trips = tripHistory.length;
    const countries = new Set(tripHistory.map(t => t.destinationCity?.country || t.destination)).size;
    const totalDays = tripHistory.reduce((acc, t) => acc + t.days.length, 0);
    const totalActivities = tripHistory.reduce((acc, t) => 
      acc + t.days.reduce((a, d) => a + d.slots.length, 0), 0
    );
    const totalPlaces = tripHistory.reduce((acc, t) => 
      acc + t.days.reduce((a, d) => a + d.slots.reduce((s, slot) => s + slot.options.length, 0), 0), 0
    );
    const completedTrips = tripHistory.filter(t => t.status === 'completed').length;
    
    // Calculate level based on trips
    const level = Math.floor(trips / 3) + 1;
    const xp = (trips % 3) * 33;
    
    return { 
      trips, 
      countries, 
      totalDays, 
      totalActivities, 
      totalPlaces,
      completedTrips,
      cuisines: preferences.cuisines.length,
      level,
      xp,
    };
  }, [tripHistory, preferences]);

  // Calculate unlocked achievements
  const achievements = useMemo(() => {
    return ACHIEVEMENTS.map(a => {
      let current = 0;
      switch (a.type) {
        case 'trips': current = stats.trips; break;
        case 'countries': current = stats.countries; break;
        case 'cuisines': current = stats.cuisines; break;
        case 'activities': current = stats.totalActivities; break;
        case 'places': current = stats.totalPlaces; break;
      }
      return {
        ...a,
        current,
        unlocked: current >= a.requirement,
        progress: Math.min(current / a.requirement, 1),
      };
    });
  }, [stats]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const getCountryLabels = () => {
    return preferences.countries
      .map(id => COUNTRIES.find(c => c.id === id)?.label || id)
      .slice(0, 3)
      .join(', ') + (preferences.countries.length > 3 ? ` +${preferences.countries.length - 3}` : '');
  };

  const getCuisineLabels = () => {
    return preferences.cuisines
      .map(id => CUISINES.find(c => c.id === id)?.label || id)
      .slice(0, 3)
      .join(', ') + (preferences.cuisines.length > 3 ? ` +${preferences.cuisines.length - 3}` : '');
  };

  const handleEditPreferences = () => {
    navigation.navigate('EditPreferences');
  };

  const handleViewHistory = () => {
    navigation.navigate('TripHistory');
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Сбросить настройки?',
      'Вы пройдёте онбординг заново. Ваши маршруты сохранятся.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Сбросить', 
          style: 'destructive',
          onPress: () => {
            setOnboarded(false);
            navigation.reset({
              index: 0,
              routes: [{ name: 'OnboardingCountry' }],
            });
          }
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Выйти?',
      'Все данные будут удалены. Вы уверены?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'RESET' });
            navigation.reset({
              index: 0,
              routes: [{ name: 'OnboardingCountry' }],
            });
          }
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🌍 Я использую TripBuddy AI для планирования путешествий! Уже создал ${stats.trips} маршрутов. Попробуй и ты! 🚀`,
        title: 'TripBuddy AI',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSaveProfile = () => {
    setShowEditProfile(false);
    Alert.alert('Сохранено!', 'Профиль обновлён');
  };

  const handleExportData = () => {
    const data = {
      preferences,
      tripHistory,
      exportedAt: new Date().toISOString(),
    };
    Alert.alert(
      'Экспорт данных',
      `Экспортировано:\n• ${stats.trips} маршрутов\n• Настройки профиля`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAllTrips = () => {
    Alert.alert(
      'Удалить все маршруты?',
      'Это действие нельзя отменить!',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить всё', 
          style: 'destructive',
          onPress: () => {
            tripHistory.forEach(t => dispatch({ type: 'DELETE_TRIP', payload: t.id }));
          }
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Личный кабинет</Text>
        <TouchableOpacity 
          onPress={() => setShowSettings(true)}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard} variant="elevated">
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => setShowEditProfile(true)}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => setShowAvatarPicker(true)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{selectedAvatar}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>📷</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
          
          {/* Level bar */}
          <View style={styles.levelContainer}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelLabel}>Уровень {stats.level}</Text>
              <Text style={styles.levelXp}>{stats.xp}/100 XP</Text>
            </View>
            <View style={styles.levelBar}>
              <View style={[styles.levelFill, { width: `${stats.xp}%` }]} />
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🗺️</Text>
            <Text style={styles.statValue}>{stats.trips}</Text>
            <Text style={styles.statLabel}>Маршрутов</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🌍</Text>
            <Text style={styles.statValue}>{stats.countries}</Text>
            <Text style={styles.statLabel}>Стран</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={styles.statValue}>{stats.totalDays}</Text>
            <Text style={styles.statLabel}>Дней</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📍</Text>
            <Text style={styles.statValue}>{stats.totalPlaces}</Text>
            <Text style={styles.statLabel}>Мест</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <Card style={styles.quickStatsCard}>
          <View style={styles.quickStatRow}>
            <Text style={styles.quickStatLabel}>✅ Завершённых поездок</Text>
            <Text style={styles.quickStatValue}>{stats.completedTrips}</Text>
          </View>
          <View style={styles.quickStatRow}>
            <Text style={styles.quickStatLabel}>⚡ Активностей запланировано</Text>
            <Text style={styles.quickStatValue}>{stats.totalActivities}</Text>
          </View>
          <View style={styles.quickStatRow}>
            <Text style={styles.quickStatLabel}>🍽️ Любимых кухонь</Text>
            <Text style={styles.quickStatValue}>{stats.cuisines}</Text>
          </View>
        </Card>

        {/* Achievements preview */}
        <TouchableOpacity 
          style={styles.achievementsPreview}
          onPress={() => setShowAchievements(true)}
        >
          <View style={styles.achievementsHeader}>
            <Text style={styles.sectionTitle}>🏆 Достижения</Text>
            <Text style={styles.achievementsCount}>{unlockedCount}/{ACHIEVEMENTS.length}</Text>
          </View>
          <View style={styles.achievementsList}>
            {achievements.slice(0, 4).map(a => (
              <View 
                key={a.id} 
                style={[styles.achievementMini, !a.unlocked && styles.achievementLocked]}
              >
                <Text style={styles.achievementMiniEmoji}>{a.emoji}</Text>
              </View>
            ))}
            <View style={styles.achievementMore}>
              <Text style={styles.achievementMoreText}>+{ACHIEVEMENTS.length - 4}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Preferences Summary */}
        <Card style={styles.preferencesCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>⚙️ Предпочтения</Text>
            <TouchableOpacity onPress={handleEditPreferences}>
              <Text style={styles.editLink}>Изменить →</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.prefGrid}>
            <View style={styles.prefItem}>
              <Text style={styles.prefEmoji}>🌍</Text>
              <Text style={styles.prefLabel}>Страны</Text>
              <Text style={styles.prefValue} numberOfLines={1}>{getCountryLabels() || '—'}</Text>
            </View>
            <View style={styles.prefItem}>
              <Text style={styles.prefEmoji}>🍽️</Text>
              <Text style={styles.prefLabel}>Кухни</Text>
              <Text style={styles.prefValue} numberOfLines={1}>{getCuisineLabels() || '—'}</Text>
            </View>
            <View style={styles.prefItem}>
              <Text style={styles.prefEmoji}>⚡</Text>
              <Text style={styles.prefLabel}>Стиль</Text>
              <Text style={styles.prefValue}>
                {preferences.activityType === 'active' ? 'Активный' :
                 preferences.activityType === 'passive' ? 'Расслабленный' : 'Микс'}
              </Text>
            </View>
            <View style={styles.prefItem}>
              <Text style={styles.prefEmoji}>💰</Text>
              <Text style={styles.prefLabel}>Бюджет</Text>
              <Text style={styles.prefValue}>
                {preferences.budget === 'low' ? 'Эконом' :
                 preferences.budget === 'medium' ? 'Средний' : 'Премиум'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Actions Menu */}
        <View style={styles.actionsMenu}>
          <TouchableOpacity style={styles.actionItem} onPress={handleViewHistory}>
            <Text style={styles.actionIcon}>📜</Text>
            <Text style={styles.actionLabel}>Мои маршруты</Text>
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>{stats.trips}</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={styles.actionLabel}>Лидерборд</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionLabel}>Поделиться приложением</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleExportData}>
            <Text style={styles.actionIcon}>💾</Text>
            <Text style={styles.actionLabel}>Экспорт данных</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleResetOnboarding}>
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionLabel}>Пройти онбординг заново</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => setShowAbout(true)}>
            <Text style={styles.actionIcon}>ℹ️</Text>
            <Text style={styles.actionLabel}>О приложении</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Banner */}
        <TouchableOpacity style={styles.premiumBanner}>
          <View style={styles.premiumContent}>
            <Text style={styles.premiumEmoji}>👑</Text>
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>TripBuddy PRO</Text>
              <Text style={styles.premiumDesc}>Безлимитные маршруты + офлайн карты</Text>
            </View>
          </View>
          <Text style={styles.premiumPrice}>Скоро</Text>
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>⚠️ Опасная зона</Text>
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleDeleteAllTrips}
          >
            <Text style={styles.dangerButtonText}>🗑️ Удалить все маршруты</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dangerButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.dangerButtonText}>🚪 Выйти и удалить всё</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>TripBuddy AI v1.0.0 • Made with ❤️</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Редактировать профиль</Text>
            
            <TouchableOpacity 
              style={styles.avatarPicker}
              onPress={() => setShowAvatarPicker(true)}
            >
              <Text style={styles.avatarPickerEmoji}>{selectedAvatar}</Text>
              <Text style={styles.avatarPickerText}>Изменить аватар</Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Имя</Text>
              <TextInput
                style={styles.input}
                value={userName}
                onChangeText={setUserName}
                placeholder="Ваше имя"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={userEmail}
                onChangeText={setUserEmail}
                placeholder="email@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Отмена"
                onPress={() => setShowEditProfile(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Сохранить"
                onPress={handleSaveProfile}
                variant="accent"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Avatar Picker Modal */}
      <Modal
        visible={showAvatarPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAvatarPicker(false)}
        >
          <View style={styles.avatarModal}>
            <Text style={styles.modalTitle}>Выбери аватар</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatar && styles.avatarOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedAvatar(avatar);
                    setShowAvatarPicker(false);
                  }}
                >
                  <Text style={styles.avatarOptionEmoji}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>⚙️ Настройки</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🔔</Text>
                <Text style={styles.settingLabel}>Уведомления</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>🌙</Text>
                <Text style={styles.settingLabel}>Тёмная тема</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>📥</Text>
                <Text style={styles.settingLabel}>Офлайн карты</Text>
              </View>
              <Switch
                value={offlineMaps}
                onValueChange={setOfflineMaps}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingIcon}>☁️</Text>
                <Text style={styles.settingLabel}>Авто-бэкап</Text>
              </View>
              <Switch
                value={autoBackup}
                onValueChange={setAutoBackup}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <Button
              title="Закрыть"
              onPress={() => setShowSettings(false)}
              variant="outline"
              fullWidth
              style={{ marginTop: Spacing.lg }}
            />
          </View>
        </View>
      </Modal>

      {/* Achievements Modal */}
      <Modal
        visible={showAchievements}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAchievements(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '80%' }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🏆 Достижения</Text>
            <Text style={styles.achievementsProgress}>
              Получено: {unlockedCount} из {ACHIEVEMENTS.length}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {achievements.map(a => (
                <View 
                  key={a.id} 
                  style={[styles.achievementCard, !a.unlocked && styles.achievementCardLocked]}
                >
                  <View style={styles.achievementIcon}>
                    <Text style={styles.achievementEmoji}>{a.emoji}</Text>
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>{a.label}</Text>
                    <Text style={styles.achievementDesc}>{a.desc}</Text>
                    <View style={styles.achievementProgress}>
                      <View style={[styles.achievementBar, { width: `${a.progress * 100}%` }]} />
                    </View>
                    <Text style={styles.achievementStats}>
                      {a.current}/{a.requirement}
                    </Text>
                  </View>
                  {a.unlocked && <Text style={styles.achievementCheck}>✅</Text>}
                </View>
              ))}
            </ScrollView>

            <Button
              title="Закрыть"
              onPress={() => setShowAchievements(false)}
              variant="outline"
              fullWidth
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAbout}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAbout(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAbout(false)}
        >
          <View style={styles.aboutModal}>
            <Text style={styles.aboutLogo}>🌍</Text>
            <Text style={styles.aboutTitle}>TripBuddy AI</Text>
            <Text style={styles.aboutVersion}>Версия 1.0.0</Text>
            <Text style={styles.aboutDesc}>
              Твой персональный ИИ-помощник для планирования путешествий
            </Text>
            
            <View style={styles.aboutLinks}>
              <TouchableOpacity style={styles.aboutLink}>
                <Text>📜 Политика конфиденциальности</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aboutLink}>
                <Text>📋 Условия использования</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aboutLink}>
                <Text>⭐ Оценить приложение</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.aboutCopy}>© 2024 TripBuddy AI</Text>
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
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 22,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  editProfileButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
  editIcon: {
    fontSize: 18,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  avatarEmoji: {
    fontSize: 50,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  avatarBadgeText: {
    fontSize: 14,
  },
  userName: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  levelContainer: {
    width: '80%',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  levelLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  levelXp: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  levelBar: {
    height: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  quickStatsCard: {
    marginBottom: Spacing.md,
  },
  quickStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quickStatLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  quickStatValue: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  achievementsPreview: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  achievementsCount: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  achievementsList: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  achievementMini: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementLocked: {
    opacity: 0.4,
  },
  achievementMiniEmoji: {
    fontSize: 22,
  },
  achievementMore: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementMoreText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
  preferencesCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  editLink: {
    fontSize: FontSize.sm,
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  prefGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  prefItem: {
    width: '50%',
    paddingVertical: Spacing.sm,
  },
  prefEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  prefLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  prefValue: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  actionsMenu: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  actionLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  actionBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  actionBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  actionArrow: {
    fontSize: FontSize.lg,
    color: Colors.textMuted,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  premiumEmoji: {
    fontSize: 32,
  },
  premiumText: {},
  premiumTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  premiumDesc: {
    fontSize: FontSize.xs,
    color: Colors.textOnPrimary,
    opacity: 0.8,
  },
  premiumPrice: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.accent,
    backgroundColor: Colors.textOnPrimary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  dangerZone: {
    marginBottom: Spacing.lg,
  },
  dangerTitle: {
    fontSize: FontSize.sm,
    color: Colors.error,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  dangerButton: {
    backgroundColor: Colors.error + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logoutButton: {
    backgroundColor: Colors.error + '30',
  },
  dangerButtonText: {
    fontSize: FontSize.md,
    color: Colors.error,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  avatarPicker: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarPickerEmoji: {
    fontSize: 60,
    marginBottom: Spacing.sm,
  },
  avatarPickerText: {
    fontSize: FontSize.sm,
    color: Colors.primaryLight,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  avatarModal: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    margin: Spacing.lg,
    alignItems: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  avatarOption: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionSelected: {
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  avatarOptionEmoji: {
    fontSize: 28,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingIcon: {
    fontSize: 20,
  },
  settingLabel: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  achievementsProgress: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  achievementDesc: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  achievementProgress: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  achievementBar: {
    height: '100%',
    backgroundColor: Colors.success,
  },
  achievementStats: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  achievementCheck: {
    fontSize: 20,
    marginLeft: Spacing.sm,
  },
  aboutModal: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    margin: Spacing.lg,
    alignItems: 'center',
  },
  aboutLogo: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  aboutTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  aboutVersion: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  aboutDesc: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  aboutLinks: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  aboutLink: {
    padding: Spacing.sm,
    alignItems: 'center',
  },
  aboutCopy: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
