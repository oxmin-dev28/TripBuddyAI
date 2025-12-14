import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, ProgressBar, SelectableChip } from '../../components/ui';
import { RootStackParamList } from '../../types';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/theme';

const intentOptions = [
  { label: 'Перезагрузка на 4 дня', icon: 'battery-heart' },
  { label: 'Тёплое и медленное', icon: 'white-balance-sunny' },
  { label: 'Дёшево и сердито', icon: 'piggy-bank-outline' },
  { label: 'Вау-впечатления', icon: 'sparkles' },
  { label: 'Еда и бары', icon: 'silverware-fork-knife' },
  { label: 'Природа и тишина', icon: 'pine-tree' },
  { label: 'Романтика', icon: 'heart-outline' },
  { label: 'Спонтанный уикенд', icon: 'airplane-takeoff' },
];

const timingOptions = ['Следующие выходные', 'Конкретные даты', 'В течение месяца'];
const durationOptions = ['3-4 дня', '5-7 дней'];
const paceOptions = ['Медленно', 'Средне', 'Насыщенно'];
const focusOptions = ['Еда', 'Природа', 'Город', 'Море'];
const climateOptions = ['Потеплее', 'Всё равно'];
const budgetOptions = ['Эконом', 'Средний'];

const variants = [
  {
    id: 'A',
    city: 'Лиссабон',
    tagline: 'Быстрая перезагрузка с океаном и пастел де ната',
    why: [
      'Прямые рейсы и короткий трансфер из центра Европы',
      'Ровный климат круглый год, лёгкие прогулки по набережной',
      'Много вкусной еды без сложного планирования',
    ],
    skeleton: [
      'День 1: прилёт, заселение в Байшe, вечерняя прогулка по Алфаме, ужин в Time Out Market',
      'День 2: смотровая Miradouro da Graça + свободное время у речной набережной',
      'День 3: лёгкая вылазка в Кашкайш/Синтру по желанию',
      'День 4: бранч в LX Factory + вылет',
    ],
    areas: ['Байша/Шиаду — пешком до всего', 'Принсипе Реал — тихо, кафе и парки', 'Алфама — атмосферно и виды'],
  },
  {
    id: 'B',
    city: 'Анталья',
    tagline: 'Поспокойнее и теплее: море, хаммам и простые решения',
    why: [
      'Тёплое море большую часть года и много прямых рейсов',
      'All-inclusive или апартаменты рядом с пляжем — минимум решений',
      'Горы и старый город в 15 минутах такси',
    ],
    skeleton: [
      'День 1: прилёт, заселение у Коньяалты/Лары, вечерний променад и ужин на море',
      'День 2: одна большая штука — хаммам + старый город Калечи',
      'День 3: лёгкая вылазка в каньон Гейнюк или канатка на Тюнектепе',
      'День 4: поздний бранч, пляж, вылет',
    ],
    areas: ['Лара — пляж и отели all-inclusive', 'Коньяалты — длинная набережная и кафе', 'Калечи — исторический центр'],
  },
];

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RebootFlow'>;
};

export function RebootFlowScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [selectedIntent, setSelectedIntent] = useState('Перезагрузка на 4 дня');
  const [departureCity, setDepartureCity] = useState('Москва');
  const [timing, setTiming] = useState('Следующие выходные');
  const [duration, setDuration] = useState('3-4 дня');
  const [pace, setPace] = useState('Медленно');
  const [focus, setFocus] = useState<string[]>(['Еда', 'Природа']);
  const [climate, setClimate] = useState('Потеплее');
  const [budget, setBudget] = useState('Средний');

  const totalSteps = 5;

  const toggleFocus = (value: string) => {
    setFocus(prev => (prev.includes(value) ? prev.filter(item => item !== value) : [...prev.slice(0, 1), value]));
  };

  const isLastStep = step === totalSteps;

  const handleNext = () => {
    if (!isLastStep) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
      return;
    }
    setStep(prev => Math.max(prev - 1, 1));
  };

  const stepTitle = useMemo(() => {
    switch (step) {
      case 1:
        return 'Какая поездка тебе нужна?';
      case 2:
        return 'Уточним ограничения';
      case 3:
        return 'Выбери темп и настроение';
      case 4:
        return 'Твой план перезагрузки';
      default:
        return 'Билеты под твои даты';
    }
  }, [step]);

  const renderStepDescription = () => {
    switch (step) {
      case 1:
        return 'Соберём быстрый сценарий под твой запрос.';
      case 2:
        return 'Минимум ввода — город вылета, окно и длительность.';
      case 3:
        return 'Оставим только один-два клика вкуса, без сложных фильтров.';
      case 4:
        return 'Два готовых варианта без страха ошибиться: выбери по одному отличию.';
      default:
        return 'Подставили даты и ловим лучшие билеты — дальше можно добавить жильё или сохранить план.';
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.intentGrid}>
            {intentOptions.map(option => {
              const selected = selectedIntent === option.label;
              return (
                <Card
                  key={option.label}
                  variant={selected ? 'elevated' : 'outlined'}
                  style={[styles.intentCard, selected && styles.intentCardSelected]}
                >
                  <View style={styles.intentHeader}>
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={22}
                      color={selected ? Colors.textOnPrimary : Colors.primary}
                      style={[
                        styles.intentIcon,
                        { backgroundColor: selected ? Colors.primary : `${Colors.primary}14` },
                      ]}
                    />
                    <Text style={styles.intentTitle}>{option.label}</Text>
                  </View>
                  <Button
                    title={selected ? 'Выбрано' : 'Выбрать вариант'}
                    size="sm"
                    onPress={() => setSelectedIntent(option.label)}
                    variant={selected ? 'accent' : 'outline'}
                    icon={<Feather name="check-circle" size={16} color={selected ? Colors.textOnPrimary : Colors.primary} />}
                  />
                </Card>
              );
            })}
          </View>
        );
      case 2:
        return (
          <View style={styles.sectionStack}>
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Feather name="map-pin" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Откуда летишь?</Text>
              </View>
              <View style={styles.chipRow}>
                {['Москва', 'Стамбул', 'Варшава', 'Берлин'].map(city => (
                  <SelectableChip key={city} label={city} selected={departureCity === city} onPress={() => setDepartureCity(city)} />
                ))}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Feather name="calendar" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Когда?</Text>
              </View>
              <View style={styles.chipRow}>
                {timingOptions.map(option => (
                  <SelectableChip key={option} label={option} selected={timing === option} onPress={() => setTiming(option)} />
                ))}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Feather name="clock" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Длительность</Text>
              </View>
              <View style={styles.chipRow}>
                {durationOptions.map(option => (
                  <SelectableChip key={option} label={option} selected={duration === option} onPress={() => setDuration(option)} />
                ))}
              </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.sectionStack}>
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Ionicons name="pulse-outline" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Темп</Text>
              </View>
              <View style={styles.chipRow}>
                {paceOptions.map(option => (
                  <SelectableChip key={option} label={option} selected={pace === option} onPress={() => setPace(option)} />
                ))}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="emoticon-happy-outline" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Настроение (1–2 клика)</Text>
              </View>
              <View style={styles.chipRow}>
                {focusOptions.map(option => (
                  <SelectableChip key={option} label={option} selected={focus.includes(option)} onPress={() => toggleFocus(option)} />
                ))}
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Feather name="thermometer" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Климат / Бюджет</Text>
              </View>
              <View style={styles.chipRow}>
                {climateOptions.map(option => (
                  <SelectableChip key={option} label={option} selected={climate === option} onPress={() => setClimate(option)} />
                ))}
              </View>
              <View style={[styles.chipRow, styles.topPadding]}>
                {budgetOptions.map(option => (
                  <SelectableChip key={option} label={option} selected={budget === option} onPress={() => setBudget(option)} />
                ))}
              </View>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.sectionStack}>
            <Text style={styles.metaText}>
              {selectedIntent} • {departureCity} → старт через {timing.toLowerCase()}
            </Text>
            {variants.map(variant => (
              <Card key={variant.id} variant="elevated" style={styles.planCard}>
                <View style={styles.planHeader}>
                  <View style={styles.planTitleBlock}>
                    <Text style={styles.planBadge}>Вариант {variant.id}</Text>
                    <Text style={styles.planCity}>{variant.city}</Text>
                    <Text style={styles.planTagline} numberOfLines={2}>
                      {variant.tagline}
                    </Text>
                  </View>
                  <Button
                    title="Билеты"
                    size="sm"
                    onPress={() => setStep(5)}
                    icon={<Feather name="external-link" size={16} color={Colors.textOnPrimary} />}
                  />
                </View>

                <View style={styles.planSection}>
                  <View style={styles.sectionHeader}>
                    <Feather name="thumbs-up" size={16} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Почему тебе зайдёт</Text>
                  </View>
                  {variant.why.map(point => (
                    <Text key={point} style={styles.planBullet}>
                      • {point}
                    </Text>
                  ))}
                </View>

                <View style={styles.planSection}>
                  <View style={styles.sectionHeader}>
                    <Feather name="calendar" size={16} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Скелет 4 дней</Text>
                  </View>
                  {variant.skeleton.map(line => (
                    <Text key={line} style={styles.planBullet}>
                      • {line}
                    </Text>
                  ))}
                </View>

                <View style={styles.planSection}>
                  <View style={styles.sectionHeader}>
                    <Feather name="home" size={16} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Районы без лишних решений</Text>
                  </View>
                  <View style={styles.chipRow}>
                    {variant.areas.map(area => (
                      <SelectableChip key={area} label={area} selected onPress={() => {}} size="sm" />
                    ))}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        );
      default:
        return (
          <View style={styles.sectionStack}>
            <Text style={styles.metaText}>Даты подставлены: {timing.toLowerCase()}</Text>
            <Card variant="elevated" style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle}>Лучшие окна</Text>
                <Feather name="credit-card" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.ticketText}>Вылет: {departureCity} → {variants[0].city} / {variants[1].city}</Text>
              <Text style={styles.ticketText}>Длительность: {duration}</Text>
              <Text style={styles.ticketText}>Бюджет: {budget} • Климат: {climate}</Text>
              <Text style={styles.ticketNote}>⚡ Нажми "Купить билет" — дальше предложим жильё или сохраним PDF.</Text>
              <View style={styles.actionRow}>
                <Button
                  title="Купить билет"
                  size="lg"
                  variant="primary"
                  fullWidth
                  onPress={() => {}}
                  icon={<Feather name="shopping-bag" size={18} color={Colors.textOnPrimary} />}
                />
                <Button
                  title="Сохранить план"
                  variant="outline"
                  size="lg"
                  fullWidth
                  onPress={() => {}}
                  icon={<Feather name="download" size={18} color={Colors.primary} />}
                />
              </View>
            </Card>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Button
            title="Назад"
            variant="outline"
            size="sm"
            onPress={handleBack}
            icon={<Feather name="chevron-left" size={16} color={Colors.primary} />}
          />
          <View style={styles.progressBlock}>
            <ProgressBar current={step} total={totalSteps} />
            <Text style={styles.progressLabel}>Шаг {step} из {totalSteps}</Text>
          </View>
        </View>

        <Card variant="outlined" style={styles.infoCard}>
          <Text style={styles.infoTitle}>{stepTitle}</Text>
          <Text style={styles.infoBody}>{renderStepDescription()}</Text>
          <View style={styles.chipRow}>
            <SelectableChip label="PDF план" selected={false} onPress={() => {}} size="sm" />
            <SelectableChip label="Без решений" selected onPress={() => {}} size="sm" />
            <SelectableChip label="2 варианта" selected onPress={() => {}} size="sm" />
          </View>
        </Card>

        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.actionRow}>
          <Button
            title="Назад"
            onPress={handleBack}
            variant="outline"
            size="lg"
            fullWidth
            icon={<Feather name="arrow-left" size={18} color={Colors.primary} />}
          />
          <Button
            title={isLastStep ? 'Готово' : 'Дальше'}
            onPress={handleNext}
            variant="accent"
            size="lg"
            fullWidth
            icon={<Feather name="arrow-right" size={18} color={Colors.textOnPrimary} />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg + 8,
    paddingBottom: 110,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  progressBlock: {
    flex: 1,
    gap: Spacing.xs,
  },
  progressLabel: {
    marginTop: Spacing.xs,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  infoCard: {
    borderColor: `${Colors.primary}33`,
    gap: Spacing.sm,
  },
  infoTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
  },
  infoBody: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sectionStack: {
    gap: Spacing.lg,
  },
  sectionBlock: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
  },
  topPadding: {
    paddingTop: Spacing.xs,
  },
  intentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  intentCard: {
    flexBasis: '48%',
    minWidth: '48%',
    gap: Spacing.sm,
  },
  intentCardSelected: {
    borderColor: Colors.primary,
  },
  intentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  intentIcon: {
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  intentTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold as any,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  planCard: {
    gap: Spacing.md,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  planTitleBlock: {
    flex: 1,
    gap: 4,
  },
  planBadge: {
    fontSize: FontSize.xs,
    color: `${Colors.textSecondary}B3`,
    fontWeight: FontWeight.medium as any,
  },
  planCity: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
  },
  planTagline: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  planSection: {
    gap: Spacing.xs,
  },
  planBullet: {
    fontSize: FontSize.md,
    color: `${Colors.textSecondary}`,
    lineHeight: 22,
  },
  ticketCard: {
    gap: Spacing.sm,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold as any,
    color: Colors.textPrimary,
  },
  ticketText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  ticketNote: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: `${Colors.primary}26`,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
