import * as Font from 'expo-font';

const loadFonts = async () => {
  await Font.loadAsync({
    'BebasNeue': require('../assets/fonts/BebasNeue-Regular.ttf'),
    'Rajdhani-Bold': require('../assets/fonts/Rajdhani-Bold.ttf'),
    'Rajdhani-Regular': require('../assets/fonts/Rajdhani-Regular.ttf'),
    'Rajdhani-Medium': require('../assets/fonts/Rajdhani-Medium.ttf'),
    'Rajdhani-SemiBold': require('../assets/fonts/Rajdhani-SemiBold.ttf'),
    'Rajdhani-Light': require('../assets/fonts/Rajdhani-Light.ttf'),

    'Inter-Black': require('../assets/fonts/Inter-Black.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-ExtraBold': require('../assets/fonts/Inter-ExtraBold.ttf'),
    'Inter-ExtraLight': require('../assets/fonts/Inter-ExtraLight.ttf'),
    'Inter-Light': require('../assets/fonts/Inter-Light.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Thin': require('../assets/fonts/Inter-Thin.ttf'),
  });
  return;
};

export default loadFonts;
