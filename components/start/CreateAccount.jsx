import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import useColors from '../../Utils/Colors'
import auth from '@react-native-firebase/auth';
import { useContext, useState } from 'react'

const { width, height } = Dimensions.get('window')

import image from '../../assets/images/createAccount.webp'
import Toast from 'react-native-toast-message'
import { NavigationContext } from '../../Utils/NavBar'

const CreateAccount = () => {

  const navigation = useNavigation();
  const Colors = useColors()
  const styles = DynamicStyles(Colors)

  const { setRoute } = useContext(NavigationContext)

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

const handleRegister = async () => {
  if (email === '' || password === '' || name === '') {
    Toast.show({
      visibilityTime: 2000,
      text1: "Rellena todos los campos",
      type: "error"
    });
    return; // No continúes si hay campos vacíos
  }

  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);

    // Actualiza el perfil con el nombre del usuario
    await userCredential.user.updateProfile({
      displayName: name,
    });

    Toast.show({
      text1: 'Cuenta creada',
      text2: `¡Bienvenido, ${name}!`,
      visibilityTime: 2000,
      type: "success"
    });

    setRoute('Mapa')
    navigation.navigate('Mapa');

  } catch (error) {
    console.error('Error al registrar:', error);
    Toast.show({
      text1: 'Error creando la cuenta:',
      text2: error.message,
      visibilityTime: 2000,
      type: "error"
    });
  }
};

  
  return (
    <View style={{backgroundColor:Colors.background, flex:1, paddingHorizontal:15, paddingVertical:25, alignItems:"center"}}>
        <View style={styles.imageContainer}>
            <Image source={image} style={styles.image}/>
            <LinearGradient
              colors={[Colors.mainGreen + "90", Colors.mainGreen + "50", 'transparent']}
              start={{ x: 1, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.imageGradient}
            />
            <Text style={styles.imageText}>BIENVENIDO A FINGERSPOTZ</Text>
        </View>
        <View style={{ width:"100%", height:100, alignItems:"center" }}>

          <View>
            <Text style={{color:Colors.text, backgroundColor:Colors.background, padding:5, position:"relative", top:15, fontSize:16, fontWeight:"medium", left:15, zIndex:10, width:80, textAlign:"center"}}>Usuario</Text>
            <TextInput
              placeholder='Nombre de usuario'
              style={styles.input}
              onChangeText={(text) => setName(text)}
              value={name}
              placeholderTextColor={Colors.placeholder}
              />
          </View>

          <View>
            <Text style={{color:Colors.text, backgroundColor:Colors.background, padding:5, position:"relative", top:15, fontSize:16, fontWeight:"medium", left:15, zIndex:10, width:60, textAlign:"center"}}>Correo</Text>
            <TextInput
              placeholder='usuario@gmail.com'
              style={styles.input}
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholderTextColor={Colors.placeholder}
              />  
          </View>

          <View>
            <Text style={{color:Colors.text, backgroundColor:Colors.background, padding:5, position:"relative", top:15, fontSize:16, fontWeight:"medium", left:15, zIndex:10, width:100, textAlign:"center"}}>Contraseña</Text>
            <TextInput
              keyboardType='default'
              secureTextEntry={true}
              placeholder='Contraseña'
              onChangeText={(text) => setPassword(text)}
              value={password}
              placeholderTextColor={Colors.placeholder}
              style={styles.input}
              />
          </View>


          <TouchableOpacity style={styles.buttom} onPress={() => {
            handleRegister()
          }}>
            <LinearGradient
              colors={["#ffffff60", "transparent"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.gradient}
            ></LinearGradient>
            <Text style={styles.buttonText}>Crear Cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            navigation.navigate("Login");
          }}>
            
            <Text style={styles.buttonCreateAccount}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
    </View>
  )
}

export default CreateAccount

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
      marginBottom: 10,
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
      marginTop:50,
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
      textAlign: 'center',
      fontWeight:'bold'
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
    borderColor:"white",
    borderWidth:2.5,
    borderColor:Colors.text,
    borderRadius:5,
    width: width*0.823,
    height: height*0.073,
    paddingHorizontal:20,
    color:Colors.text,
    fontSize:20
  }

})
