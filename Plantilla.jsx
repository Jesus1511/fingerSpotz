import { StyleSheet, View, TouchableOpacity } from 'react-native'
import useColors from '../../Utils/Colors'
import { useNavigation } from '@react-navigation/native'
import { AntDesign } from '@expo/vector-icons'
import { useAndroidBackHandler } from '../../Utils/useAndroidCustomBackHandler'
import { useContext } from 'react'
import { NavigationContext } from '../../Utils/NavBar'

const P = () => {

  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)
  const {setRoute} = useContext(NavigationContext)

  useAndroidBackHandler(() => {
    navigation.navigate('Mapa')
    setRoute('Mapa')
    return true
  })

  return (
    <View style={{backgroundColor:Colors.background, flex:1, paddingHorizontal:15, paddingVertical:25, alignItems:"center"}}>
        <View style={{ marginBottom: 15, width:"100%" }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={28} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={{ width:"100%", height:100 }}>

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