import { StyleSheet, View, Image} from 'react-native'
import { createContext, useState, useEffect } from 'react'
import { auth } from './Firebase/init';
import { onAuthStateChanged } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import loadFonts from './Utils/Fonts';

import icon from './assets/images/icon.png'
import { useNavigation } from '@react-navigation/native';

export const AppContext = createContext();

const ApppContext = ({children}) => {

    const [user, setUser] = useState(null);
    const [firtsTime, setFirtsTime] = useState(true);
    const [loading, setLoading] = useState(true);
    const [mySpotz, setMySpotz] = useState(null)

    const navigation = useNavigation()

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

    useEffect(() => {
        const initizalizeApp = async () => {
            try {
                await onAuthStateChanged(auth, (user) => {
                    if (user) {
                        setUser(user);
                    } else {
                        setUser(null);
                    }
                });

                await initializeFonts();
                await checkFirstTime();

            } catch (error) {
                console.error("Error initializing Firebase: ", error);
            } finally {
                setLoading(false);
            }
        }; initizalizeApp()
    }, []);


    if (loading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Image style={{width: 80, height:80, borderRadius:30}} source={icon}/>
            </View>
        );
    }

    console.log(user)
    const initialRoute = user ? "Mapa" : firtsTime ? "OnboardingPage1" : "Login";

    return (
      <AppContext.Provider value={{user, setUser, firtsTime, setFirtsTime, initialRoute, mySpotz, setMySpotz}}>
        {children}
      </AppContext.Provider>
    )
}

export default ApppContext

const styles = StyleSheet.create({})