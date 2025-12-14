import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlaceOption } from '../types';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface VotingCardProps {
  option: PlaceOption;
  isSelected: boolean;
  onSelect: () => void;
  showVotes?: boolean;
  totalVotes?: number;
}

export function VotingCard({ 
  option, 
  isSelected, 
  onSelect,
  showVotes = false,
  totalVotes = 0,
}: VotingCardProps) {
  const votePercentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0;

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.85}
      style={styles.container}
    >
      <LinearGradient
        colors={isSelected 
          ? [Colors.primaryLight, Colors.primary] 
          : [Colors.surface, Colors.surfaceAlt]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, isSelected && styles.selectedCard]}
      >
        {/* Header with name and rating */}
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text style={[styles.name, isSelected && styles.selectedText]} numberOfLines={1}>
              {option.name}
            </Text>
            {option.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{option.discount}</Text>
              </View>
            )}
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.star}>⭐</Text>
            <Text style={[styles.rating, isSelected && styles.selectedText]}>
              {option.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        {/* Info row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoIcon, isSelected && styles.selectedIcon]}>📍</Text>
            <Text style={[styles.infoText, isSelected && styles.selectedSubtext]}>
              {option.distance}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoIcon, isSelected && styles.selectedIcon]}>🚶</Text>
            <Text style={[styles.infoText, isSelected && styles.selectedSubtext]}>
              {option.duration}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoIcon, isSelected && styles.selectedIcon]}>💰</Text>
            <Text style={[styles.infoText, isSelected && styles.selectedSubtext]}>
              {option.priceLevel}
            </Text>
          </View>
          {option.isOpen !== undefined && (
            <View style={styles.infoItem}>
              <Text style={styles.statusDot}>
                {option.isOpen ? '🟢' : '🔴'}
              </Text>
              <Text style={[styles.infoText, isSelected && styles.selectedSubtext]}>
                {option.isOpen ? 'Открыто' : 'Закрыто'}
              </Text>
            </View>
          )}
        </View>

        {/* Address */}
        <Text style={[styles.address, isSelected && styles.selectedSubtext]} numberOfLines={1}>
          {option.address}
        </Text>

        {/* Vote bar (if showing votes) */}
        {showVotes && (
          <View style={styles.voteContainer}>
            <View style={styles.voteBar}>
              <View 
                style={[
                  styles.voteFill, 
                  { width: `${votePercentage}%` },
                  isSelected && styles.voteFillSelected,
                ]} 
              />
            </View>
            <Text style={[styles.voteCount, isSelected && styles.selectedSubtext]}>
              {option.votes || 0} голосов
            </Text>
          </View>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  selectedText: {
    color: Colors.textOnPrimary,
  },
  discountBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  star: {
    fontSize: 14,
  },
  rating: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoIcon: {
    fontSize: 14,
  },
  selectedIcon: {
    opacity: 0.9,
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  selectedSubtext: {
    color: Colors.textOnPrimary,
    opacity: 0.9,
  },
  statusDot: {
    fontSize: 10,
  },
  address: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  voteContainer: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  voteBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  voteFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
  },
  voteFillSelected: {
    backgroundColor: Colors.textOnPrimary,
  },
  voteCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    color: Colors.textOnPrimary,
    fontWeight: '700',
  },
});

