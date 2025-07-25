import { StyleSheet, View, TouchableOpacity, Dimensions, Text } from 'react-native'
import useColors from '../Utils/Colors'
import { useNavigation } from '@react-navigation/native'
import { Entypo, Fontisto, FontAwesome } from '@expo/vector-icons'
import { createContext, useContext, useState } from 'react'
import { AppContext } from '../AppContext'

const { width, height } = Dimensions.get('window')

export const NavigationContext = createContext()

const NavBar = ({ children }) => {

  const {user, firtsTime} = useContext(AppContext)

  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)

  const [route, setRoute] = useState(user ? "Mapa" : firtsTime ? "OnboardingPage1" : "Login") // default route, adjust as needed

  

  if (route !== 'Home' && route !== 'Mapa')  {
    return children
  }

  return (
    <NavigationContext.Provider value={{ setRoute }}>
      {children}
      <View style={styles.navbar}>
        <TouchableOpacity>
          <View style={[styles.iconContainer, {backgroundColor:route == 'Spotz' ? Colors.mainGreen:'transparent'}]}>
            <Fontisto name="world-o" size={40} color={Colors.text} />
          </View>
          <Text style={styles.iconText}>Spotz</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <View style={[styles.iconContainer, {backgroundColor:route == 'Mapa' ? Colors.mainGreen:'transparent'}]}>
            <Entypo name="location-pin" size={45} color={Colors.text} />
          </View>
          <Text style={styles.iconText}>Mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity>
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
      borderRadius:15
    },
    navbar: {
      height: height * 0.125,
      width,
      zIndex:10,
      backgroundColor: Colors.background,
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
