declare module 'react' {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => any;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useRef<T>(initial: T): { current: T };
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: any[]): T;
  const React: { createElement: any };
  export default React;
}

declare namespace React {
  type ReactNode = any;
}

declare module 'expo' {
  export const registerRootComponent: any;
}

declare module 'react-native' {
  export type ViewStyle = any;
  export type StyleProp<T> = any;
  export type PressableStateCallbackType = { pressed: boolean };
  export const Animated: any;
  export namespace Animated {
    type Value = any;
  }
  export const StyleSheet: any;
  export const View: any;
  export const Text: any;
  export const Pressable: any;
  export const ScrollView: any;
  export const ActivityIndicator: any;
}

declare module '@react-navigation/native' {
  export const NavigationContainer: any;
  export const useNavigation: any;
  export type ParamListBase = any;
}

declare module '@react-navigation/native-stack' {
  export function createNativeStackNavigator<T = any>(): any;
  export type NativeStackNavigationProp<T = any, R = any> = any;
}

declare module 'expo-status-bar' {
  export const StatusBar: any;
}

declare module 'react-native-gesture-handler' {
  export const GestureHandlerRootView: any;
}

declare module 'react-native-safe-area-context' {
  export const SafeAreaProvider: any;
  export const SafeAreaView: any;
}

declare module '@expo/vector-icons' {
  export const Feather: any;
  export const Ionicons: any;
  export const MaterialCommunityIcons: any;
}

declare module 'nativewind';
declare module 'nativewind/themes';
