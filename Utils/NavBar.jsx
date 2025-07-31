import { Entypo, FontAwesome, Fontisto } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { createContext, useContext, useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { AppContext } from '../AppContext'
import useColors from '../Utils/Colors'

const { width, height } = Dimensions.get('window')

export const NavigationContext = createContext()

const NavBar = ({ children }) => {

  const {user, firtsTime} = useContext(AppContext)

  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)

  const [route, setRoute] = useState() // default route, adjust as needed

  useEffect(() => {
    setRoute(user ? "Mapa" : firtsTime ? "OnboardingPage1" : "Login");
  }, [])

  if (route !== 'Home' && route !== 'Mapa' && route !== 'Perfil' && route !== 'Spotz')  {
    return (
      <NavigationContext.Provider value={{setRoute}}>
        {children}
      </NavigationContext.Provider>
    )
  }

  return (
    <NavigationContext.Provider value={{ setRoute }}>
      {children}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => { setRoute('Spotz'); navigation.navigate("Spotz")}}>
          <View style={[styles.iconContainer, {backgroundColor:route == 'Spotz' ? Colors.mainGreen:'transparent'}]}>
            <Fontisto name="world-o" size={40} color={Colors.text} />
          </View>
          <Text style={styles.iconText}>Spotz</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setRoute('Mapa'); navigation.navigate("Mapa") }}>
          <View style={[styles.iconContainer, {backgroundColor:route == 'Mapa' ? Colors.mainGreen:'transparent'}]}>
            <Entypo name="location-pin" size={45} color={Colors.text} />
          </View>
          <Text style={styles.iconText}>Mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setRoute('Perfil'); navigation.navigate("Perfil") }}>
          <View style={[styles.iconContainer, {backgroundColor:route == 'Perfil' ? Colors.mainGreen:'transparent'}]}>
            <FontAwesome name="user-circle-o" size={40} color={Colors.text} />
          </View>
          <Text style={styles.iconText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </NavigationContext.Provider>
  )
}

export default NavBar

const DynamicStyles = (Colors) =>
  StyleSheet.create({
    iconContainer: {
      width:60,
      height:60,
      justifyContent:'center',
      alignItems:"center",
      marginBottom:5,
      borderRadius:15,
      overflow: 'hidden',
    },
    navbar: {
      height: height * 0.125,
      width,
      zIndex:10,
      backgroundColor: Colors.background,
      paddingBottom:10,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection:"row",
      justifyContent:"space-evenly"
    },
    iconText: {
      fontSize:12,
      textAlign:"center",
      fontWeight:'medium',
      color:Colors.text
    }
  })
