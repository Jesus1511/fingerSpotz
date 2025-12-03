import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Toast from 'react-native-toast-message';
import image from '../../assets/images/createAccount.webp';
import useColors from '../../Utils/Colors';
import { NavigationContext } from '../../Utils/NavBar';

const { width, height } = Dimensions.get('window')

const Login = () => {
  const navigation = useNavigation();
  const Colors = useColors()
  const styles = DynamicStyles(Colors)


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { user, setRoute } = useContext(NavigationContext)

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Toast.show({
        text1: "Completa todos los campos",
        type: "error",
        visibilityTime: 2000
      });
      return;
    }

    try {
      await auth().signInWithEmailAndPassword(email, password);

      navigation.navigate('Mapa');
      setRoute('Mapa')
    } catch (error) {
      console.error('Error al iniciar sesión:', error.message);
      
      Toast.show({
        text1: "Error de inicio de sesión",
        text2: error.message,
        type: "error",
        visibilityTime: 2000
      });
    }
  };

  const handleCreateAccount = () => {
    navigation.navigate("CreateAccount");
  };
  
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        navigation.navigate('Mapa');
        setRoute('Mapa')
      }
    })
    return () => unsubscribe()
  }, [])  

  return (
    <View style={{ backgroundColor: Colors.background, flex: 1, paddingHorizontal: 15, paddingVertical: 25, alignItems: "center" }}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
        <LinearGradient
          colors={[Colors.mainGreen + "90", Colors.mainGreen + "50", 'transparent']}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.imageGradient}
        />
        <Text style={styles.imageText}>BIENVENIDO               DE VUELTA</Text>
      </View>
      <View style={{ width: "100%", height: 100, alignItems: "center" }}>
        <View>
          <Text style={[styles.label, {width:70}]}>Email</Text>
          <TextInput
            placeholder='ejemplo@gmail.com'
            style={styles.input}
            keyboardType='email-address'
            placeholderTextColor={Colors.placeholder}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            secureTextEntry={true}
            placeholder='********'
            placeholderTextColor={Colors.placeholder}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.buttom} onPress={handleLogin}>
          <LinearGradient
            colors={["#ffffff60", "transparent"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gradient}
          ></LinearGradient>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCreateAccount}>
          <Text style={styles.buttonCreateAccount}>Crear una cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Login

const DynamicStyles = (Colors) => StyleSheet.create({

  text: {
      color:Colors.text,
      fontFamily:"Lato-Regular"
  },
  imageContainer: {
      width:width * 0.918,
      height:height * 0.391,
      borderRadius: 40,
      borderBottomRightRadius: 175,
      overflow: 'hidden',
      borderBottomLeftRadius:10,
      marginBottom: 20,
  },
  image: {
      width:width * 0.918,
      height:height * 0.391,
      borderRadius: 40,
      borderBottomRightRadius: 175,
      position:"absolute",
      top: 0,
      left: 0,
      borderBottomLeftRadius:10,
      zIndex: -1,
      marginTop: 20,
      marginBottom:20
  },
  imageGradient: {
    position: 'absolute',
    top: 20,
    right: 0,
    borderBottomLeftRadius:10,
    borderRadius:40,
    width:width * 0.918,
    height:height * 0.391,
  },
  imageText: {
      position: 'absolute',
      bottom: 20,
      color: "#000",
      fontFamily: "BebasNeue",
      fontSize: 48,
      maxWidth: '74%',
      textAlign: 'left',
      width: '100%',
      paddingHorizontal: 20,
      lineHeight:50
  },
  buttom: {
      backgroundColor: Colors.mainGreen,
      width: width * 0.795,
      height: height * 0.071,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginTop:120,
      marginBottom: 10,
  },
  buttonText: {
      color: '#000',
      fontFamily: "Rajdhani-Bold",
      fontSize: 28,
      textAlign: 'center',
  },
  buttonCreateAccount: {
    color: Colors.text,
    fontSize: 20,
    fontWeight:'bold',
    textAlign: 'center',
  },
  gradient: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
        alignItems: 'center',
        position: 'absolute',
        justifyContent: 'center',
        
  },

  input: {
    borderColor:Colors.text,
    borderWidth:2.5,
    borderRadius:5,
    width: width*0.823,
    height: height*0.073,
    paddingHorizontal:20,
    color:Colors.text,
    fontSize:20
  },
  label: {
    color: Colors.text, backgroundColor: Colors.background, padding: 5,
    position: "relative", top: 15, fontSize: 16, fontWeight: "medium",
    left: 15, zIndex: 10, width: 100, textAlign: "center"
  }

})