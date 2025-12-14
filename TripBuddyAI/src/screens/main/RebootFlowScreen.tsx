import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, ProgressBar, SelectableChip } from '../../components/ui';
import { RootStackParamList } from '../../types';

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
          <View className="flex-row flex-wrap gap-3">
            {intentOptions.map(option => (
              <Card
                key={option.label}
                variant={selectedIntent === option.label ? 'elevated' : 'outlined'}
                className="basis-[48%] min-w-[48%] space-y-3"
              >
                <View className="flex-row items-center gap-2">
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={22}
                    color={selectedIntent === option.label ? '#F5F8FC' : '#1E2A44'}
                    style={{
                      backgroundColor:
                        selectedIntent === option.label ? '#1E2A44' : 'rgba(30, 42, 68, 0.08)',
                      borderRadius: 999,
                      padding: 8,
                    }}
                  />
                  <Text
                    className={`text-base font-semibold leading-5 ${
                      selectedIntent === option.label ? 'text-ink' : 'text-ink'
                    }`}
                  >
                    {option.label}
                  </Text>
                </View>
                <Button
                  title={selectedIntent === option.label ? 'Выбрано' : 'Выбрать вариант'}
                  size="sm"
                  onPress={() => setSelectedIntent(option.label)}
                  variant={selectedIntent === option.label ? 'accent' : 'outline'}
                  icon={<Feather name="check-circle" size={16} color={selectedIntent === option.label ? '#F5F8FC' : '#1E2A44'} />}
                />
              </Card>
            ))}
          </View>
        );
      case 2:
        return (
          <View className="space-y-4">
            <View className="space-y-2">
              <View className="flex-row items-center gap-2">
                <Feather name="map-pin" size={18} color="#1E2A44" />
                <Text className="text-lg font-bold text-ink">Откуда летишь?</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {['Москва', 'Стамбул', 'Варшава', 'Берлин'].map(city => (
                  <SelectableChip
                    key={city}
                    label={city}
                    selected={departureCity === city}
                    onPress={() => setDepartureCity(city)}
                  />
                ))}
              </View>
            </View>

            <View className="space-y-2">
              <View className="flex-row items-center gap-2">
                <Feather name="calendar" size={18} color="#1E2A44" />
                <Text className="text-lg font-bold text-ink">Когда?</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {timingOptions.map(option => (
                  <SelectableChip
                    key={option}
                    label={option}
                    selected={timing === option}
                    onPress={() => setTiming(option)}
                  />
                ))}
              </View>
            </View>

            <View className="space-y-2">
              <View className="flex-row items-center gap-2">
                <Feather name="clock" size={18} color="#1E2A44" />
                <Text className="text-lg font-bold text-ink">Длительность</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
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
          </View>
        );
      case 3:
        return (
          <View className="space-y-4">
            <View className="space-y-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="pulse-outline" size={18} color="#1E2A44" />
                <Text className="text-lg font-bold text-ink">Темп</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {paceOptions.map(option => (
                  <SelectableChip
                    key={option}
                    label={option}
                    selected={pace === option}
                    onPress={() => setPace(option)}
                  />
                ))}
              </View>
            </View>

            <View className="space-y-2">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons name="emoticon-happy-outline" size={18} color="#1E2A44" />
                <Text className="text-lg font-bold text-ink">Настроение (1–2 клика)</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {focusOptions.map(option => (
                  <SelectableChip
                    key={option}
                    label={option}
                    selected={focus.includes(option)}
                    onPress={() => toggleFocus(option)}
                  />
                ))}
              </View>
            </View>

            <View className="space-y-2">
              <View className="flex-row items-center gap-2">
                <Feather name="thermometer" size={18} color="#1E2A44" />
                <Text className="text-lg font-bold text-ink">Климат / Бюджет</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {climateOptions.map(option => (
                  <SelectableChip
                    key={option}
                    label={option}
                    selected={climate === option}
                    onPress={() => setClimate(option)}
                  />
                ))}
              </View>
              <View className="flex-row flex-wrap gap-2 pt-2">
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
          </View>
        );
      case 4:
        return (
          <View className="space-y-4">
            <Text className="text-sm text-ink/70">
              {selectedIntent} • {departureCity} → старт через {timing.toLowerCase()}
            </Text>
            {variants.map(variant => (
              <Card key={variant.id} variant="elevated" className="space-y-4">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 space-y-1">
                    <Text className="text-xs font-medium text-ink/60">Вариант {variant.id}</Text>
                    <Text className="text-2xl font-extrabold text-ink">{variant.city}</Text>
                    <Text className="text-base text-ink/70 leading-5" numberOfLines={2}>
                      {variant.tagline}
                    </Text>
                  </View>
                  <Button
                    title="Билеты"
                    size="sm"
                    onPress={() => setStep(5)}
                    icon={<Feather name="external-link" size={16} color="#F5F8FC" />}
                  />
                </View>

                <View className="space-y-2">
                  <View className="flex-row items-center gap-2">
                    <Feather name="thumbs-up" size={16} color="#1E2A44" />
                    <Text className="text-lg font-bold text-ink">Почему тебе зайдёт</Text>
                  </View>
                  {variant.why.map(point => (
                    <Text key={point} className="text-base leading-6 text-ink/80">
                      • {point}
                    </Text>
                  ))}
                </View>

                <View className="space-y-2">
                  <View className="flex-row items-center gap-2">
                    <Feather name="calendar" size={16} color="#1E2A44" />
                    <Text className="text-lg font-bold text-ink">Скелет 4 дней</Text>
                  </View>
                  {variant.skeleton.map(line => (
                    <Text key={line} className="text-base leading-6 text-ink/80">
                      • {line}
                    </Text>
                  ))}
                </View>

                <View className="space-y-2">
                  <View className="flex-row items-center gap-2">
                    <Feather name="home" size={16} color="#1E2A44" />
                    <Text className="text-lg font-bold text-ink">Районы без лишних решений</Text>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
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
          <View className="space-y-4">
            <Text className="text-sm text-ink/70">Даты подставлены: {timing.toLowerCase()}</Text>
            <Card variant="elevated" className="space-y-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-extrabold text-ink">Лучшие окна</Text>
                <Feather name="ticket" size={20} color="#1E2A44" />
              </View>
              <Text className="text-base text-ink/80">Вылет: {departureCity} → {variants[0].city} / {variants[1].city}</Text>
              <Text className="text-base text-ink/80">Длительность: {duration}</Text>
              <Text className="text-base text-ink/80">Бюджет: {budget} • Климат: {climate}</Text>
              <Text className="text-sm text-ink/60 leading-5">
                ⚡ Нажми "Купить билет" — дальше предложим жильё или сохраним PDF.
              </Text>
              <View className="flex-row gap-3 pt-1">
                <Button
                  title="Купить билет"
                  size="lg"
                  variant="primary"
                  fullWidth
                  icon={<Feather name="shopping-bag" size={18} color="#F5F8FC" />}
                />
                <Button
                  title="Сохранить план"
                  variant="outline"
                  size="lg"
                  fullWidth
                  icon={<Feather name="download" size={18} color="#1E2A44" />}
                />
              </View>
            </Card>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 110, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between gap-3">
          <Button
            title="Назад"
            variant="outline"
            size="sm"
            onPress={handleBack}
            icon={<Feather name="chevron-left" size={16} color="#1E2A44" />}
          />
          <View className="flex-1">
            <ProgressBar current={step} total={totalSteps} />
            <Text className="mt-2 text-center text-xs text-ink/70">Шаг {step} из {totalSteps}</Text>
          </View>
        </View>

        <Card variant="outlined" className="space-y-3 border-primary/20">
          <Text className="text-xl font-extrabold text-ink">{stepTitle}</Text>
          <Text className="text-base text-ink/70 leading-6">{renderStepDescription()}</Text>
          <View className="flex-row flex-wrap gap-2 pt-1">
            <SelectableChip label="PDF план" selected={false} onPress={() => {}} size="sm" />
            <SelectableChip label="Без решений" selected onPress={() => {}} size="sm" />
            <SelectableChip label="2 варианта" selected onPress={() => {}} size="sm" />
          </View>
        </Card>

        {renderStepContent()}
      </ScrollView>

      <View className="absolute left-0 right-0 bottom-0 bg-background border-t border-primary/15 px-6 py-4">
        <View className="flex-row items-center gap-3">
          <Button
            title="Назад"
            onPress={handleBack}
            variant="outline"
            size="lg"
            className="flex-1"
            icon={<Feather name="arrow-left" size={18} color="#1E2A44" />}
          />
          <Button
            title={isLastStep ? 'Готово' : 'Дальше'}
            onPress={handleNext}
            variant="accent"
            size="lg"
            className="flex-[1.6]"
            icon={<Feather name="arrow-right" size={18} color="#F5F8FC" />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
