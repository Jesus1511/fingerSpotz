import { StyleSheet, View, Image} from 'react-native'
import { createContext, useState, useEffect } from 'react'

import icon from './assets/images/icon.png'

export const AppContext = createContext();

const ApppContext = ({children}) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const initizalizeApp = async () => {
            try {
                console.log("Initializing app context...");
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

    return (
      <AppContext.Provider value={{user, setUser}}>
        {children}
      </AppContext.Provider>
    )
}

export default ApppContext

const styles = StyleSheet.create({})