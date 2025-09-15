import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import * as Location from 'expo-location';
import { createContext, useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import loadFonts from './Utils/Fonts';

import { useNavigation } from '@react-navigation/native';
import icon from './assets/images/icon.png';

export const AppContext = createContext();

const ApppContext = ({children}) => {

    const [user, setUser] = useState(null);
    const [firtsTime, setFirtsTime] = useState(true);
    const [loading, setLoading] = useState(true);
    const [mySpotz, setMySpotz] = useState(null)
    const [spotz, setSpotz] = useState([])
    const [userLocation, setUserLocation] = useState(null)
    const [currentRoute, setCurrentRoute] = useState('AppContext')

    const navigation = useNavigation()
    
    // Función para calcular distancia entre dos puntos
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371 // Radio de la Tierra en kilómetros
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const distance = R * c
        return distance
    }

    // Obtener ubicación actual del usuario
    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') {
                console.log('Permiso de ubicación denegado')
                return null
            }

            const location = await Location.getCurrentPositionAsync({})
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            })
            
            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }
        } catch (error) {
            console.log('Error obteniendo ubicación:', error)
            return null
        }
    }

    // Función para obtener y organizar spotz
    const fetchAndOrganizeSpotz = async () => {
        try {
            // Obtener ubicación actual
            const location = await getUserLocation()
            setUserLocation(location)

            const spotzSnapshot = await firestore().collection("spotz").get()
            const spotzData = []
            
            spotzSnapshot.forEach((doc) => {
                const spotData = doc.data()
                let distance = null
                
                // Calcular distancia si tenemos ubicación del usuario
                if (location && spotData.location) {
                    distance = calculateDistance(
                        location.latitude,
                        location.longitude,
                        spotData.location.latitude,
                        spotData.location.longitude
                    )
                }
                
                spotzData.push({
                    id: doc.id,
                    ...spotData,
                    distance
                })
            })
            
            // Ordenar por distancia (más cercanos primero)
            spotzData.sort((a, b) => {
                if (a.distance === null && b.distance === null) return 0
                if (a.distance === null) return 1
                if (b.distance === null) return -1
                return a.distance - b.distance
            })
            
            setSpotz(spotzData)
            
        } catch (error) {
            console.error('Error cargando spots:', error)
        }
    }

    const initializeFonts = async () => {
        try {
            await loadFonts();
        } catch (error) {
            console.error("Error loading fonts: ", error);
        }
    }

    const checkFirstTime = async () => {
        try {
            const value = await AsyncStorage.getItem('firstTime');
            if (value === null) {
                setFirtsTime(true);
                await AsyncStorage.setItem('firstTime', 'false');
            } else {
                setFirtsTime(false);
            }
        } catch (error) {
            console.error("Error checking first time: ", error);
        }
    };  

    // Función para actualizar la ruta actual
    const updateCurrentRoute = (newRoute) => {
        setCurrentRoute(newRoute);
    };

    const getCurrentUser = () => {
        return new Promise((resolve) => {
          const unsubscribe = auth().onAuthStateChanged((user) => {
            unsubscribe(); // importante: desuscribirse para no duplicar listeners
            resolve(user);
          });
        });
      };
      

    useEffect(() => {
        const initializeApp = async () => {
          try {
            const user = await getCurrentUser();
      
            if (user) {
              const cleanUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
              };
      
              setUser(cleanUser);
              await fetchAndOrganizeSpotz();
            } else {
              setUser(null);
              setSpotz([]);
            }
      
            await initializeFonts();
            await checkFirstTime();
      
          } catch (error) {
            console.error("Error initializing Firebase: ", error);
          } finally {
            setLoading(false); // aquí ya puedes decidir Home o Login
          }
        };
      
        initializeApp();
      }, []);
      
      

    if (loading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Image style={{width: 80, height:80, borderRadius:30}} source={icon}/>
            </View>
        );
    }

    const initialRoute = user ? "Mapa" : firtsTime ? "OnboardingPage1" : "Login";

    return (
      <View style={{flex: 1}}>
        <AppContext.Provider value={{
          user, 
          setUser, 
          firtsTime, 
          setFirtsTime, 
          initialRoute, 
          mySpotz, 
          setMySpotz, 
          spotz, 
          setSpotz,
          userLocation,
          getUserLocation,
          fetchAndOrganizeSpotz,
          calculateDistance,
          currentRoute,
          updateCurrentRoute,
        }}>
          {children}
        </AppContext.Provider>
      </View>
    )
}

export default ApppContext

const styles = StyleSheet.create({})