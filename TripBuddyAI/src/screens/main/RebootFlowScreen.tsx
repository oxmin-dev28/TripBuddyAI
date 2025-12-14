import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, ProgressBar, SelectableChip } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { RootStackParamList } from '../../types';

const intentOptions = [
  'Перезагрузка на 4 дня',
  'Тёплое и медленное',
  'Дёшево и сердито',
  'Вау-впечатления',
  'Еда и бары',
  'Природа и тишина',
  'Романтика',
  'Спонтанный уикенд',
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
    setFocus(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev.slice(0, 1), value]
    );
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
          <View style={styles.cardsGrid}>
            {intentOptions.map(option => (
              <Card
                key={option}
                variant={selectedIntent === option ? 'elevated' : 'outlined'}
                style={
                  selectedIntent === option
                    ? [styles.intentCard, styles.selectedCard]
                    : styles.intentCard
                }
              >
                <Text
                  style={[
                    styles.cardTitle,
                    selectedIntent === option && styles.cardTitleSelected,
                  ]}
                >
                  {option}
                </Text>
                <Button
                  title={selectedIntent === option ? 'Выбрано' : 'Выбрать'}
                  size="sm"
                  onPress={() => setSelectedIntent(option)}
                  variant={selectedIntent === option ? 'accent' : 'outline'}
                />
              </Card>
            ))}
          </View>
        );
      case 2:
        return (
          <View style={styles.stepSection}>
            <Text style={styles.sectionLabel}>Откуда летишь?</Text>
            <View style={styles.inlineChips}>
              {['Москва', 'Стамбул', 'Варшава', 'Берлин'].map(city => (
                <SelectableChip
                  key={city}
                  label={city}
                  selected={departureCity === city}
                  onPress={() => setDepartureCity(city)}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Когда?</Text>
            <View style={styles.inlineChips}>
              {timingOptions.map(option => (
                <SelectableChip
                  key={option}
                  label={option}
                  selected={timing === option}
                  onPress={() => setTiming(option)}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Длительность</Text>
            <View style={styles.inlineChips}>
              {durationOptions.map(option => (
                <SelectableChip
                  key={option}
                  label={option}
                  selected={duration === option}
                  onPress={() => setDuration(option)}
                />
              ))}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepSection}>
            <Text style={styles.sectionLabel}>Темп</Text>
            <View style={styles.inlineChips}>
              {paceOptions.map(option => (
                <SelectableChip
                  key={option}
                  label={option}
                  selected={pace === option}
                  onPress={() => setPace(option)}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Настроение (1–2 клика)</Text>
            <View style={styles.inlineChips}>
              {focusOptions.map(option => (
                <SelectableChip
                  key={option}
                  label={option}
                  selected={focus.includes(option)}
                  onPress={() => toggleFocus(option)}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>Климат / Бюджет</Text>
            <View style={styles.inlineChips}>
              {climateOptions.map(option => (
                <SelectableChip
                  key={option}
                  label={option}
                  selected={climate === option}
                  onPress={() => setClimate(option)}
                />
              ))}
            </View>
            <View style={[styles.inlineChips, styles.topSpacing]}>
              {budgetOptions.map(option => (
                <SelectableChip
                  key={option}
                  label={option}
                  selected={budget === option}
                  onPress={() => setBudget(option)}
                />
              ))}
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.resultContainer}>
            <Text style={styles.callout}>
              {selectedIntent} • {departureCity} → старт через {timing.toLowerCase()}
            </Text>
            {variants.map(variant => (
              <Card key={variant.id} style={styles.variantCard} variant="elevated">
                <View style={styles.variantHeader}>
                  <View>
                    <Text style={styles.variantLabel}>Вариант {variant.id}</Text>
                    <Text style={styles.variantCity}>{variant.city}</Text>
                    <Text style={styles.variantTagline}>{variant.tagline}</Text>
                  </View>
                  <Button title="Билеты" size="sm" onPress={() => setStep(5)} />
                </View>

                <Text style={styles.subheading}>Почему тебе зайдёт</Text>
                {variant.why.map(point => (
                  <Text key={point} style={styles.bullet}>• {point}</Text>
                ))}

                <Text style={styles.subheading}>Скелет 4 дней</Text>
                {variant.skeleton.map(line => (
                  <Text key={line} style={styles.bullet}>• {line}</Text>
                ))}

                <Text style={styles.subheading}>Районы без лишних решений</Text>
                <View style={styles.inlineChips}>
                  {variant.areas.map(area => (
                    <SelectableChip key={area} label={area} selected onPress={() => {}} />
                  ))}
                </View>
              </Card>
            ))}
          </View>
        );
      default:
        return (
          <View style={styles.ticketsContainer}>
            <Text style={styles.callout}>Даты подставлены: {timing.toLowerCase()}</Text>
            <Card style={styles.ticketCard} variant="elevated">
              <Text style={styles.ticketTitle}>Лучшие окна</Text>
              <Text style={styles.ticketDetail}>Вылет: {departureCity} → {variants[0].city} / {variants[1].city}</Text>
              <Text style={styles.ticketDetail}>Длительность: {duration}</Text>
              <Text style={styles.ticketDetail}>Бюджет: {budget} • Климат: {climate}</Text>
              <Text style={styles.ticketFootnote}>⚡ Нажми "Купить билет" — дальше предложим жильё или сохраним PDF.</Text>
              <View style={styles.ticketButtons}>
                <Button title="Купить билет" size="lg" style={styles.primaryTicketButton} />
                <Button title="Сохранить план" variant="outline" size="lg" />
              </View>
            </Card>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Button title="Назад" variant="secondary" onPress={handleBack} size="sm" />
          <ProgressBar current={step} total={totalSteps} />
          <Text style={styles.stepLabel}>Шаг {step} из {totalSteps}</Text>
        </View>

        <Text style={styles.title}>{stepTitle}</Text>
        <Text style={styles.subtitle}>{renderStepDescription()}</Text>

        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <Button title="Назад" onPress={handleBack} variant="outline" size="lg" style={styles.backButton} />
          <Button
            title={isLastStep ? 'Готово' : 'Дальше'}
            onPress={handleNext}
            variant="accent"
            size="lg"
            style={styles.nextButton}
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
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  header: {
    gap: Spacing.sm,
  },
  stepLabel: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  intentCard: {
    width: '47%',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardTitleSelected: {
    color: Colors.textOnPrimary,
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primaryLight,
  },
  stepSection: {
    gap: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  inlineChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  topSpacing: {
    marginTop: Spacing.sm,
  },
  resultContainer: {
    gap: Spacing.md,
  },
  callout: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  variantCard: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  variantCity: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  variantTagline: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  subheading: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginTop: Spacing.sm,
    color: Colors.textPrimary,
  },
  bullet: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ticketsContainer: {
    gap: Spacing.md,
  },
  ticketCard: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  ticketTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  ticketDetail: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  ticketFootnote: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  ticketButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  primaryTicketButton: {
    flex: 1,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  footerButtons: {
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

