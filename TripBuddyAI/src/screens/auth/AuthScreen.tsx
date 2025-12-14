import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/ui';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';
import { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

export function AuthScreen({ navigation }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggleMode = () => {
    setError('');
    Animated.timing(slideAnim, {
      toValue: isLogin ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsLogin(!isLogin);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }

    if (!isLogin && !name) {
      setError('Укажите ваше имя');
      setLoading(false);
      return;
    }

    try {
      // TODO: Call backend API
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to main app (onboarding if first time)
      navigation.replace('OnboardingCountry');
    } catch (err) {
      setError('Произошла ошибка. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Continue as guest
    navigation.replace('OnboardingCountry');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo/Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>✈️</Text>
            <Text style={styles.title}>TripBuddy AI</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Рады тебя видеть снова!' : 'Начни своё приключение'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Имя</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Твоё имя"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="example@mail.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Пароль</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <Button
              title={isLogin ? 'Войти' : 'Создать аккаунт'}
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              style={styles.submitButton}
            />

            {/* Toggle Mode */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
              </Text>
              <TouchableOpacity onPress={toggleMode} activeOpacity={0.7}>
                <Text style={styles.toggleButton}>
                  {isLogin ? 'Зарегистрироваться' : 'Войти'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Forgot Password (only in login mode) */}
            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Skip/Guest Option */}
          <View style={styles.skipContainer}>
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipText}>Продолжить как гость →</Text>
            </TouchableOpacity>
          </View>

          {/* Social Login (placeholder for future) */}
          <View style={styles.socialContainer}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>или</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <Text style={styles.socialIcon}>🍎</Text>
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  errorContainer: {
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  toggleText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  toggleButton: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  forgotPasswordText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  skipContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  skipText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  socialContainer: {
    marginTop: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginHorizontal: Spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  socialIcon: {
    fontSize: 20,
  },
  socialText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

