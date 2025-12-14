import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Leaderboard'>;
};

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  tripsCount: number;
  countriesCount: number;
  citiesCount: number;
  totalDistance: number;
  points: number;
  achievements: string[];
}

type Period = 'week' | 'month' | 'allTime';

export function LeaderboardScreen({ navigation }: Props) {
  const [period, setPeriod] = useState<Period>('week');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // TODO: Call backend API
      // For now, generate mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(generateMockUsers());
      setCurrentUserRank(42); // Mock current user rank
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const generateMockUsers = (): LeaderboardUser[] => {
    const names = [
      'Александр', 'Мария', 'Дмитрий', 'Анна', 'Иван',
      'Елена', 'Сергей', 'Ольга', 'Андрей', 'Наталья',
      'Михаил', 'Татьяна', 'Алексей', 'Екатерина', 'Николай',
    ];

    const avatars = ['👨', '👩', '🧑', '👱', '👴', '👵', '🧔', '👨‍💼', '👩‍💼', '🧑‍🎓'];

    return names.map((name, index) => ({
      rank: index + 1,
      id: `user-${index}`,
      name,
      avatar: avatars[index % avatars.length],
      tripsCount: Math.floor(Math.random() * 50) + 5,
      countriesCount: Math.floor(Math.random() * 20) + 3,
      citiesCount: Math.floor(Math.random() * 40) + 5,
      totalDistance: Math.floor(Math.random() * 5000) + 500,
      points: Math.floor(Math.random() * 10000) + 1000,
      achievements: ['🏆', '⭐', '🎖️'].slice(0, Math.floor(Math.random() * 3) + 1),
    }));
  };

  const getRankEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return styles.rankNormal;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Лидерборд 🏆</Text>
          <Text style={styles.subtitle}>Топ путешественников</Text>
        </View>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodTab, period === 'week' && styles.periodTabActive]}
          onPress={() => setPeriod('week')}
          activeOpacity={0.7}
        >
          <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>
            Неделя
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodTab, period === 'month' && styles.periodTabActive]}
          onPress={() => setPeriod('month')}
          activeOpacity={0.7}
        >
          <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>
            Месяц
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodTab, period === 'allTime' && styles.periodTabActive]}
          onPress={() => setPeriod('allTime')}
          activeOpacity={0.7}
        >
          <Text style={[styles.periodText, period === 'allTime' && styles.periodTextActive]}>
            Все время
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current User Rank Badge */}
      {currentUserRank && (
        <View style={styles.currentUserBadge}>
          <Text style={styles.currentUserText}>
            Ваша позиция: #{currentUserRank}
          </Text>
        </View>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Загружаем рейтинг...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          {/* Top 3 Podium */}
          {users.length >= 3 && (
            <View style={styles.podium}>
              {/* 2nd place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumCard, styles.podiumSecond]}>
                  <Text style={styles.podiumAvatar}>{users[1].avatar}</Text>
                  <Text style={styles.podiumRank}>🥈</Text>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{users[1].name}</Text>
                <Text style={styles.podiumPoints}>{users[1].points} pts</Text>
              </View>

              {/* 1st place */}
              <View style={[styles.podiumItem, styles.podiumFirst]}>
                <View style={[styles.podiumCard, styles.podiumFirstCard]}>
                  <Text style={styles.podiumAvatarLarge}>{users[0].avatar}</Text>
                  <Text style={styles.podiumRankLarge}>🥇</Text>
                  <View style={styles.crown}>
                    <Text style={styles.crownEmoji}>👑</Text>
                  </View>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{users[0].name}</Text>
                <Text style={styles.podiumPoints}>{users[0].points} pts</Text>
              </View>

              {/* 3rd place */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumCard, styles.podiumThird]}>
                  <Text style={styles.podiumAvatar}>{users[2].avatar}</Text>
                  <Text style={styles.podiumRank}>🥉</Text>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{users[2].name}</Text>
                <Text style={styles.podiumPoints}>{users[2].points} pts</Text>
              </View>
            </View>
          )}

          {/* Rest of the list */}
          <View style={styles.listContainer}>
            {users.slice(3).map(user => (
              <Card key={user.id} style={styles.userCard} animated delay={user.rank * 30}>
                <View style={styles.userRow}>
                  <View style={styles.userLeft}>
                    <View style={[styles.rankBadge, getRankStyle(user.rank)]}>
                      <Text style={styles.rankText}>{user.rank}</Text>
                    </View>
                    <Text style={styles.userAvatar}>{user.avatar}</Text>
                    <View style={styles.userInfo}>
                      <View style={styles.userNameRow}>
                        <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                        {user.achievements.length > 0 && (
                          <View style={styles.achievements}>
                            {user.achievements.map((achievement, index) => (
                              <Text key={index} style={styles.achievementEmoji}>
                                {achievement}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                      <View style={styles.userStats}>
                        <Text style={styles.userStat}>
                          🗺️ {user.tripsCount}
                        </Text>
                        <Text style={styles.userStat}>
                          🌍 {user.countriesCount}
                        </Text>
                        <Text style={styles.userStat}>
                          🏙️ {user.citiesCount}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.userRight}>
                    <Text style={styles.userPoints}>{user.points}</Text>
                    <Text style={styles.userPointsLabel}>points</Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}
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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  periodTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  periodTabActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.textOnPrimary,
  },
  currentUserBadge: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  currentUserText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },
  podiumFirst: {
    marginBottom: Spacing.lg,
  },
  podiumCard: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    position: 'relative',
  },
  podiumFirstCard: {
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  podiumSecond: {
    borderWidth: 2,
    borderColor: '#C0C0C0',
  },
  podiumThird: {
    borderWidth: 2,
    borderColor: '#CD7F32',
  },
  podiumAvatar: {
    fontSize: 48,
    marginBottom: Spacing.xs,
  },
  podiumAvatarLarge: {
    fontSize: 56,
    marginBottom: Spacing.xs,
  },
  podiumRank: {
    fontSize: 32,
  },
  podiumRankLarge: {
    fontSize: 40,
  },
  crown: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  crownEmoji: {
    fontSize: 32,
  },
  podiumName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  podiumPoints: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
  },
  userCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginRight: Spacing.sm,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNormal: {
    backgroundColor: Colors.surfaceAlt,
  },
  rankGold: {
    backgroundColor: '#FFD700',
  },
  rankSilver: {
    backgroundColor: '#C0C0C0',
  },
  rankBronze: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userAvatar: {
    fontSize: 32,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  userName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  achievements: {
    flexDirection: 'row',
    gap: 2,
  },
  achievementEmoji: {
    fontSize: 14,
  },
  userStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  userStat: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  userRight: {
    alignItems: 'flex-end',
  },
  userPoints: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  userPointsLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});

