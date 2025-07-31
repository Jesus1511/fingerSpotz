import { StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import useColors from '../../Utils/Colors'
import { useNavigation } from '@react-navigation/native'
import { useAndroidBackHandler } from '../../Utils/useAndroidCustomBackHandler'
import { useContext } from 'react'
import { NavigationContext } from '../../Utils/NavBar'
import { FontAwesome } from '@expo/vector-icons'

const P = () => {

  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)
  const {setRoute} = useContext(NavigationContext)

  useAndroidBackHandler(() => {
    if (navigation.canGoBack()) {
      const routes = navigation.getState().routes;
      const prev = routes[routes.length - 2]?.name;
      setRoute(prev)
      navigation.goBack();
    }
    return true;
  });

  return (
    <View style={{backgroundColor:Colors.background, flex:1, paddingHorizontal:15, paddingVertical:25, alignItems:"center"}}>
        <View style={{ width:"100%", flexDirection:'row', justifyContent:"space-between"}}>
            <Text style={styles.title}>Explorar Spotz</Text>
            <TouchableOpacity style={styles.searchButton}>
                <FontAwesome name="search" size={24} color="black" />
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default P

const DynamicStyles = (Colors) => StyleSheet.create({

  text: {
      color:Colors.text,
      fontFamily:"Lato-Regular"
  }

})