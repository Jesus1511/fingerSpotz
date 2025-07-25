import * as Font from 'expo-font';

export default loadFonts = async () => {
  await Font.loadAsync({
    'BebasNeue': require('../assets/fonts/BebasNeue-Regular.ttf'),
    'Rajdhani-Bold': require('../assets/fonts/Rajdhani-Bold.ttf'),
    'Rajdhani-Regular': require('../assets/fonts/Rajdhani-Regular.ttf'),
    'Rajdhani-Medium': require('../assets/fonts/Rajdhani-Medium.ttf'),
    'Rajdhani-SemiBold': require('../assets/fonts/Rajdhani-SemiBold.ttf'),
    'Rajdhani-Light': require('../assets/fonts/Rajdhani-Light.ttf'),
    
  });
  return
};
