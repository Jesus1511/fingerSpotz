import { StyleSheet, View, TouchableOpacity, Text, Image, Dimensions, ScrollView, Animated, Modal, Pressable, TextInput, Alert, ToastAndroid } from 'react-native'
import useColors from '../../Utils/Colors'
import { useNavigation } from '@react-navigation/native'
import { Feather, MaterialIcons, Entypo } from '@expo/vector-icons'
import { signOut, updateProfile, deleteUser } from 'firebase/auth'
import { useContext, useRef, useState } from 'react'
import { NavigationContext } from '../../Utils/NavBar'
import { auth } from '../../Firebase/init'
import { useAndroidBackHandler } from '../../Utils/useAndroidCustomBackHandler'
import Toast from 'react-native-toast-message'

import addImage from '../../assets/images/addImage.png'
import { AppContext } from '../../AppContext'

const { width, height } = Dimensions.get('window')

const Perfil = () => {
  const { setRoute } = useContext(NavigationContext)
  const { user, setUser } = useContext(AppContext)

  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)

  const [modalVisible, setModalVisible] = useState(false)
  const [modalContent, setModalContent] = useState("")
  const [newName, setNewName] = useState(user?.displayName)
  const [savingChanges, setSavingChanges] = useState(false)
  const [emailConfirmation, setEmailConfirmation] = useState("")
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(200)).current

  useAndroidBackHandler(() => {
    if (navigation.canGoBack()) {
      const routes = navigation.getState().routes;
      const prev = routes[routes.length - 2]?.name;
      setRoute(prev)
      navigation.goBack();
    }
    return true;
  });
  
  const openModal = (content) => {
    setModalContent(content)
    setModalVisible(true)
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start()
  }

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 200,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      setModalVisible(false)
      setNewName("")
      setEmailConfirmation("")
    })
  }

  const logOut = async () => {
    try {
      await signOut(auth)
      navigation.navigate('Login')
      setRoute("Login")
    } catch (err) {
      console.log("ERROR AL CERRAR SESIÓN", err)
    }
  }

  const saveChanges = async () => {
    if (newName == "") {
      Alert.alert('Error editando usuario','Rellene el campo con el nuevo nombre');
      return;
    }
  
    try {
      setSavingChanges(true)
  
      await updateProfile(user, {
        displayName: newName,
      });
  
      setUser({ ...user, displayName: newName });
  
      closeModal();
    } catch (error) {
      console.error("Error al actualizar el nombre:", error);
    } finally {
      saveChanges(false)
    }
  };
  

  const deleteAccount = async () => {
    if (emailConfirmation === user.email) {
      try {
        await deleteUser(auth.currentUser);
        navigation.navigate("Login")
        setRoute("Login")
        Toast.show({ 
          text1:"Cuenta eliminada exitosamente",
          type:'info'
      })
        closeModal();
      } catch (error) {
        Alert.alert("Error al eliminar la cuenta", error.message)
      }
    } else {
      Alert.alert('Error borrando la cuenta','Los correos no coinciden');
    }
  };
  const renderModalContent = () => {
    if (modalContent === 'Configurar Perfil') {
      return (
        <>
          <Text style={styles.modalLabel}>Editar nombre</Text>
          <TextInput
            style={styles.input}
            placeholderTextColo={Colors.placeholder}
            placeholder="Nuevo nombre"
            value={newName}
            onChangeText={setNewName}
          />
          <TouchableOpacity onPress={saveChanges} opacity={0.5} style={[styles.modalButton, {backgroundColor:!savingChanges?Colors.mainGreen:"#d4d4d4"}]}>
            <Text style={styles.modalButtonText}>Aceptar cambios</Text>
          </TouchableOpacity>
        </>
      )
    }

    if (modalContent === 'Borrar Cuenta') {
      return (
        <>
          <Text style={[styles.modalLabel, { marginBottom: 15 }]}>¿Estás seguro de que deseas eliminar tu cuenta?</Text>
          <Text style={[styles.modalLabel, { fontSize: 16, marginBottom: 10 }]}>
            Escribe tu correo electrónico asociado para confirmar:
          </Text>
          <TextInput
            style={styles.input}
            placeholder="tuemail@ejemplo.com"
            placeholderTextColor={Colors.placeholder}
            value={emailConfirmation}
            onChangeText={setEmailConfirmation}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={deleteAccount} style={[styles.modalButton, { backgroundColor: 'red' }]}>
            <Text style={styles.modalButtonText}>Eliminar cuenta</Text>
          </TouchableOpacity>
        </>
      )
    }

    return null
  }

  return (
    <ScrollView>
      <View style={{ backgroundColor: Colors.background, height, paddingVertical: 25, alignItems: "center" }}>
        <View style={{ width: "100%", height: 100 }}>
          <Text style={styles.title}>Tu Perfil</Text>
        </View>

        <View style={styles.userData}>
          <TouchableOpacity style={styles.image}>
            <Image source={user?.image ? { uri: user?.image } : addImage} style={{ height: 56, width: 56, marginLeft: 5 }} />
          </TouchableOpacity>
          <Text style={styles.name}>{user?.displayName}</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button}>
            <View style={styles.nameContainer}>
              <Feather name="heart" size={35} color={Colors.text} />
              <Text style={styles.buttonText}>Favoritos</Text>
            </View>
            <Entypo name="chevron-down" size={24} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {navigation.navigate('MySpotz'); setRoute('MySpotz')}}
            style={styles.button}
          >
            <View style={styles.nameContainer}>
              <Entypo name="location-pin" size={35} color={Colors.text} />
              <Text style={styles.buttonText}>Tus Spotz</Text>
            </View>
            <Entypo name="chevron-down" size={24} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => openModal('Configurar Perfil')}>
            <View style={styles.nameContainer}>
              <Feather name="settings" size={35} color={Colors.text} />
              <Text style={styles.buttonText}>Configurar Perfil</Text>
            </View>
            <Entypo name="chevron-down" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={{ backgroundColor: Colors.darker, width: width - 25, alignItems: "center", borderRadius: 20 }}>
            <TouchableOpacity style={styles.button} onPress={logOut}>
              <View style={styles.nameContainer}>
                <MaterialIcons name="logout" size={35} color={Colors.text} />
                <Text style={styles.buttonText}>Cerrar Sesión</Text>
              </View>
              <Entypo name="chevron-down" size={24} color={Colors.text} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => openModal('Borrar Cuenta')}>
              <View style={styles.nameContainer}>
                <Feather name="trash-2" size={35} color={'red'} />
                <Text style={[styles.buttonText, { color: 'red' }]}>Borrar Cuenta</Text>
              </View>
              <Entypo name="chevron-down" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="none">
        <Animated.View style={{ backgroundColor: 'rgba(0,0,0,0.6)', opacity, zIndex:0, height, width }}>
          <Pressable style={{ flex: 1 }} onPress={closeModal} />
        </Animated.View>
        <Animated.View style={{
          position: 'absolute',
          bottom: 0,
          zIndex:100,
          width,
          backgroundColor: Colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          transform: [{ translateY }]
        }}>
          <Text style={[styles.title, { marginBottom: 20 }]}>{modalContent}</Text>
          {renderModalContent()}
        </Animated.View>
      </Modal>
    </ScrollView>
  )
}

export default Perfil

const DynamicStyles = (Colors) => StyleSheet.create({
  title: {
    color: Colors.text,
    fontFamily: "Rajdhani-Bold",
    fontSize: 29,
    marginLeft: 20,
    marginTop: 20
  },
  name: {
    color: Colors.text,
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 28,
    width: "100%",
    textAlign: "center",
    marginTop: 17
  },
  userData: {
    width,
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: Colors.gray,
    justifyContent: "center",
    borderRadius: 60,
    alignItems: "center"
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: "center",
    gap: 20
  },
  buttonText: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 22
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 30,
    width,
    paddingHorizontal: 30,
    justifyContent: 'space-between'
  },
  buttons: {
    alignItems: "center"
  },
  input: {
    backgroundColor: Colors.input,
    color: Colors.text,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16
  },
  modalLabel: {
    fontSize: 18,
    color: Colors.text,
    fontFamily: "Inter-SemiBold",
    marginBottom: 5
  },
  modalButton: {
    padding: 15,
    backgroundColor: Colors.mainGreen,
    borderRadius: 10,
    marginTop: 10
  },
  modalButtonText: {
    color: 'black',
    fontSize: 20,
    fontFamily:"Rajdhani-Bold",
    textAlign: "center"
  }
})
