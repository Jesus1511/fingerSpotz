import { Entypo, Feather, MaterialIcons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useContext, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { AppContext } from '../../AppContext';
import addImage from '../../assets/images/addImage.png';
import useColors from '../../Utils/Colors';
import { NavigationContext } from '../../Utils/NavBar';
import { useAndroidBackHandler } from '../../Utils/useAndroidCustomBackHandler';

const { width, height } = Dimensions.get('window')

const Perfil = () => {
  const { setRoute } = useContext(NavigationContext)
  const { user, setUser } = useContext(AppContext)

  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)

  const [modalVisible, setModalVisible] = useState(false)
  const [modalContent, setModalContent] = useState("")
  const [newName, setNewName] = useState("")
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
    if (content === 'Configurar Perfil') {
      setNewName(user?.displayName || "")
    }
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
      await auth().signOut()
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
  
      await auth().currentUser.updateProfile({
        displayName: newName,
      });
  
      // Actualizar el estado del usuario manteniendo todos los datos existentes
      setUser((prevUser) => ({ 
        ...prevUser, 
        displayName: newName,
        // Asegurar que el UID se mantiene
        uid: prevUser?.uid || auth().currentUser?.uid
      }));
  
      closeModal();
    } catch (error) {
      console.error("Error al actualizar el nombre:", error);
    } finally {
      setSavingChanges(false)
    }
  };


// Si el test anterior funciona, prueba con imagen usando base64
const selectProfileImageBase64 = async () => {
  try {
    if (!auth().currentUser) {
      Toast.show({ text1: "No autenticado", type: "error" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.3,
      allowsEditing: true,
      aspect: [1, 1],
      // No usar base64, usar URI directamente
    });

    if (result.canceled) return;

    const image = result.assets[0];
    console.log("URI de imagen:", image.uri);

    // Crear FormData para subir archivo
    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      type: 'image/jpeg',
      name: `profile_${Date.now()}.jpg`
    });

    // Leer archivo como blob usando fetch
    const response = await fetch(image.uri);
    const blob = await response.blob();

    console.log("Blob creado desde URI:", blob.size, blob.type);

    const uid = auth().currentUser.uid;
    const fileName = `profile_${Date.now()}.jpg`;
    const storageRef = storage().ref(`users/${uid}/${fileName}`);

    // Subir blob
    await storageRef.put(blob);
    const downloadURL = await storageRef.getDownloadURL();

    await auth().currentUser.updateProfile({ photoURL: downloadURL });
    
    // Actualizar el estado del usuario manteniendo todos los datos existentes
    setUser(prevUser => ({ 
      ...prevUser, 
      photoURL: downloadURL,
      // Asegurar que el UID y displayName se mantienen
      uid: prevUser?.uid || auth().currentUser?.uid,
      displayName: prevUser?.displayName || auth().currentUser?.displayName
    }));

    Toast.show({
      text1: "¡Imagen subida!",
      text2: "Perfil actualizado",
      type: "success"
    });

  } catch (error) {
    console.error("Error:", error);
    Toast.show({
      text1: "Error al subir imagen",
      text2: error.message,
      type: "error"
    });
  }
};

  const deleteAccount = async () => {
    if (emailConfirmation === user.email) {
      try {
        const uid = auth().currentUser.uid;
        
        // 1. Eliminar todos los spots del usuario de Firestore
        const userSpotsQuery = await firestore()
          .collection('spotz')
          .where('userId', '==', uid)
          .get();
        
        const deletePromises = [];
        
        // Eliminar documentos de spots
        userSpotsQuery.forEach((doc) => {
          deletePromises.push(doc.ref.delete());
        });
        
        // 2. Eliminar toda la carpeta del usuario del Storage
        const userFolderRef = storage().ref(`users/${uid}`);
        
        // Listar todos los archivos en la carpeta del usuario
        const listResult = await userFolderRef.listAll();
        
        // Eliminar todos los archivos encontrados
        const fileDeletePromises = listResult.items.map(fileRef => 
          fileRef.delete().catch((error) => {
            if (error.code !== 'storage/object-not-found') {
              console.warn(`Error eliminando archivo ${fileRef.fullPath}:`, error);
            }
          })
        );
        
        // Eliminar todas las subcarpetas recursivamente
        const folderDeletePromises = listResult.prefixes.map(folderRef => 
          deleteFolderRecursively(folderRef)
        );
        
        // 3. Ejecutar todas las eliminaciones en paralelo
        await Promise.allSettled([
          ...deletePromises,
          ...fileDeletePromises,
          ...folderDeletePromises
        ]);
        
        // 4. Eliminar usuario
        await auth().currentUser.delete();
  
        navigation.navigate("Login");
        setRoute("Login");
        Toast.show({ 
          text1: "Cuenta eliminada exitosamente",
          type: 'info'
        });
  
        closeModal();
      } catch (error) {
        console.log("Error eliminando cuenta:", error);
        Alert.alert("Error al eliminar la cuenta", error.message);
      }
    } else {
      Alert.alert('Error borrando la cuenta', 'Los correos no coinciden');
    }
  };

  // Función auxiliar para eliminar carpetas recursivamente
  const deleteFolderRecursively = async (folderRef) => {
    try {
      const listResult = await folderRef.listAll();
      
      // Eliminar todos los archivos en esta carpeta
      const fileDeletePromises = listResult.items.map(fileRef => 
        fileRef.delete().catch((error) => {
          if (error.code !== 'storage/object-not-found') {
            console.warn(`Error eliminando archivo ${fileRef.fullPath}:`, error);
          }
        })
      );
      
      // Eliminar todas las subcarpetas recursivamente
      const folderDeletePromises = listResult.prefixes.map(subFolderRef => 
        deleteFolderRecursively(subFolderRef)
      );
      
      await Promise.allSettled([...fileDeletePromises, ...folderDeletePromises]);
    } catch (error) {
      console.warn(`Error eliminando carpeta ${folderRef.fullPath}:`, error);
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
          <TouchableOpacity onPress={selectProfileImageBase64} style={styles.image}>
            <Image source={user?.photoURL ? { uri: user?.photoURL } : addImage} style={{ height: user?.photoURL ? 100 : 56, width: user?.photoURL ? 100 : 56, marginLeft: 5 }} />
          </TouchableOpacity>
          <Text style={styles.name}>{user?.displayName}</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity 
            onPress={() => {navigation.navigate('Favorites'); setRoute('Favorites')}}
            style={styles.button}
          >
            <View style={styles.nameContainer}>
              <Feather name="heart" size={28} color={Colors.text} />
              <Text style={styles.buttonText}>Favoritos</Text>
            </View>
            <Entypo name="chevron-down" size={20} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {navigation.navigate('MySpotz'); setRoute('MySpotz')}}
            style={styles.button}
          >
            <View style={styles.nameContainer}>
              <Entypo name="location-pin" size={28} color={Colors.text} />
              <Text style={styles.buttonText}>Tus Spotz</Text>
            </View>
            <Entypo name="chevron-down" size={20} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => openModal('Configurar Perfil')}>
            <View style={styles.nameContainer}>
              <Feather name="settings" size={28} color={Colors.text} />
              <Text style={styles.buttonText}>Configurar Perfil</Text>
            </View>
            <Entypo name="chevron-down" size={20} color={Colors.text} />
          </TouchableOpacity>

          <View style={{ backgroundColor: Colors.darker, width: width - 25, alignItems: "center", borderRadius: 20 }}>
            <TouchableOpacity style={styles.button} onPress={logOut}>
              <View style={styles.nameContainer}>
                <MaterialIcons name="logout" size={28} color={Colors.text} />
                <Text style={styles.buttonText}>Cerrar Sesión</Text>
              </View>
              <Entypo name="chevron-down" size={20} color={Colors.text} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => openModal('Borrar Cuenta')}>
              <View style={styles.nameContainer}>
                <Feather name="trash-2" size={28} color={'red'} />
                <Text style={[styles.buttonText, { color: 'red' }]}>Borrar Cuenta</Text>
              </View>
              <Entypo name="chevron-down" size={20} color={Colors.text} />
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
    fontSize: 24,
    marginLeft: 20,
    marginTop: 15
  },
  name: {
    color: Colors.text,
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 22,
    width: "100%",
    textAlign: "center",
    marginTop: 12
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
    overflow: "hidden",
    borderRadius: 60,
    alignItems: "center"
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: "center",
    gap: 15
  },
  buttonText: {
    color: Colors.text,
    fontFamily: 'Inter-SemiBold',
    fontSize: 18
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 25,
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
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14
  },
  modalLabel: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: "Inter-SemiBold",
    marginBottom: 5
  },
  modalButton: {
    padding: 12,
    backgroundColor: Colors.mainGreen,
    borderRadius: 10,
    marginTop: 8
  },
  modalButtonText: {
    color: 'black',
    fontSize: 18,
    fontFamily:"Rajdhani-Bold",
    textAlign: "center"
  }
})
