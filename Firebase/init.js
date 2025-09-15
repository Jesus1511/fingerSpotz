import analytics from '@react-native-firebase/analytics';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// React Native Firebase doesn't need explicit initialization with config
// It automatically uses the google-services.json (Android) and GoogleService-Info.plist (iOS) files

// Habilitar Analytics
analytics().setAnalyticsCollectionEnabled(true);

// Verificar que Analytics esté funcionando
analytics().setUserId('test_user');
console.log('🔥 Firebase Analytics inicializado correctamente');

export { analytics, auth, firestore as db, storage };

