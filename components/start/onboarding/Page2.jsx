import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');

import page1Image from '../../../assets/images/page2.png';
import useColors from '../../../Utils/Colors';

const Page2 = () => {

    const navigation = useNavigation();
    const Colors = useColors();
    const styles = DynamicStyles(Colors)

  return (
    <View>
      <View style={styles.imageContainer}>
        <Image source={page1Image} style={styles.image}/>
        <LinearGradient
          colors={[Colors.mainGreen + "60", 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.imageGradient}
        />
      </View>
      <View style={{alignItems:"center", backgroundColor:Colors.background, height}}>
        <View style={styles.container}>
            <Text style={{fontSize:24, marginBottom:20, maxWidth:330, textAlign:"center", fontFamily:"BebasNeue", color:Colors.text}}>Navega un mapa con <Text style={{color:Colors.mainGreen}}>lugares reales</Text> para practicar, subidos por otros </Text>
            <Text style={{fontSize:50, fontFamily:"BebasNeue", color:Colors.mainGreen}}>fingerboarders.</Text>
        </View>


        <TouchableOpacity onPress={() => {
            navigation.navigate("OnboardingPage3");
        }} style={styles.button}>
            <LinearGradient
              colors={["#ffffff60", "transparent"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>SIGUIENTE</Text>
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Page2

const DynamicStyles = (Colors) => StyleSheet.create({
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: height * 0.48,
    },
    image: {
        height: '100%',
        width: '100%',
    },
    imageGradient: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '100%',
        borderRadius: 0,
    },
    container: {
        marginTop: height * 0.1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: height * 0.1,
    },
    button: {
        backgroundColor: Colors.mainGreen,
        width: width * 0.795,
        height: height * 0.0895,
        borderRadius: 25,
        elevation: 10,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
    },
    gradient: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: "#000",
        fontFamily: 'BebasNeue',
        fontSize: 36,
    }
})