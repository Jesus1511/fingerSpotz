import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export function useAndroidBackHandler(customHandler) {
  useFocusEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      const shouldHandle = customHandler?.();
      return shouldHandle === true; // Devuelve true si quieres evitar el comportamiento por defecto
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  });
}
