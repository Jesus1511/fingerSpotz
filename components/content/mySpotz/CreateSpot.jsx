import { AntDesign } from '@expo/vector-icons'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import storage from '@react-native-firebase/storage'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import Toast from 'react-native-toast-message'
import useColors from '../../../Utils/Colors'
import getGeocoding from '../../../Utils/getGeocoding'
import { NavigationContext } from '../../../Utils/NavBar'
import { useAndroidBackHandler } from '../../../Utils/useAndroidCustomBackHandler'

import { AppContext } from '../../../AppContext'
import addImage from '../../../assets/images/addImage.png'

const { width, height } = Dimensions.get('window')

const CreateSpot = ({ route }) => {
  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)
  const { setRoute } = useContext(NavigationContext)
  const { fetchAndOrganizeSpotz, setMySpotz, userLocation } = useContext(AppContext)
  
  // Obtener la pantalla de origen desde los parámetros de navegación
  const fromScreen = route?.params?.from || 'MySpotz'

  const [icon, setIcon] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState(null)
  const [images, setImages] = useState([])
  const [isCreating, setIsCreating] = useState(false)

  const navigateBack = () => {
    fetchAndOrganizeSpotz()
    navigation.navigate(fromScreen)
    setRoute(fromScreen)
    return true
  }

  useAndroidBackHandler(navigateBack)

  const handleCreateSpot = async () => {
    if (!icon) {
      Toast.show({ type: 'error', text1: 'Por favor selecciona un icono para el spot' });
      return;
    }
  
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Por favor ingresa un nombre para el spot' });
      return;
    }
  
    if (!description.trim()) {
      Toast.show({ type: 'error', text1: 'Por favor ingresa una descripción para el spot' });
      return;
    }
  
    if (!location) {
      Toast.show({ type: 'error', text1: 'Por favor selecciona una ubicación en el mapa' });
      return;
    }
  
    if (!images || images.length < 1) {
      Toast.show({ type: 'error', text1: 'Por favor selecciona al menos una imagen' });
      return;
    }
  
    if (!auth().currentUser) {
      Toast.show({ type: 'error', text1: 'Tu sesión ha expirado. Por favor vuelve a iniciar sesión.' });
      return;
    }
  
    setIsCreating(true);
  
    try {
      const userId = auth().currentUser.uid;
  
      // 1. Crear el documento de spot sin imágenes ni icono
      const tempSpot = {
        name: name.trim(),
        description: description.trim(),
        icon: '', // Se actualizará después de subir
        images: [],
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          name: await getGeocoding(location.latitude, location.longitude)
        },
        userId,
        createdAt: new Date(),
        likes: []
      };
  
      const docRef = await firestore().collection('spotz').add(tempSpot);
      const spotId = docRef.id;
  
      // 2. Subir el icono al Storage
      let iconUrl = '';
      let imageUrls = [];

      // Subir icono e imágenes al mismo tiempo usando Promise.all
      try {
        const uploadIconPromise = (async () => {
          try {
            const response = await fetch(icon);
            const blob = await response.blob();
            const iconRef = storage().ref(`users/${userId}/spots/${spotId}/icon.jpg`);
            await iconRef.put(blob);
            return await iconRef.getDownloadURL();
          } catch (iconError) {
            console.warn('Error subiendo el icono:', iconError);
            return '';
          }
        })();

        const uploadImagesPromise = Promise.all(
          images.map(async (image, index) => {
            try {
              const response = await fetch(image);
              const blob = await response.blob();
              const imageRef = storage().ref(`users/${userId}/spots/${spotId}/image_${index}.jpg`);
              await imageRef.put(blob);
              return await imageRef.getDownloadURL();
            } catch (imgError) {
              console.warn(`Error subiendo la imagen ${index}:`, imgError);
              return null;
            }
          })
        );

        const [iconResult, imagesResult] = await Promise.all([uploadIconPromise, uploadImagesPromise]);
        iconUrl = iconResult;
        imageUrls = imagesResult.filter(Boolean); // Filtra nulos si alguna imagen falló
      } catch (error) {
        console.warn('Error subiendo icono o imágenes:', error);
      }
  
      // 4. Actualizar el documento con las URLs del icono y las imágenes

      await docRef.update({ 
        icon: iconUrl,
        images: imageUrls 
      });
      console.log("tempSpot", tempSpot)
      console.log("imageUrls", imageUrls)
      setMySpotz(prev => [...prev, { ...tempSpot, id: spotId, icon: iconUrl, images: imageUrls }])
  

  
      Toast.show({
        text1: "Spot creado con éxito",
        type: "success"
      });
  
      navigateBack();
    } catch (error) {
      console.error('Error creating spot:', error);
      Alert.alert('Error', 'No se pudo crear el spot. Inténtalo de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };
  
  
  const handleSelectIcon = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })

      if (!result.canceled) {
        setIcon(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error selecting icon:', error);
    }
  }

  const handleAddImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // includes images & videos
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };  

  const handleMapPress = (e) => {
    setLocation(e.nativeEvent.coordinate)
  }

  useEffect(() => {
    // Usar la ubicación de AppContext si está disponible
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      setLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      })
    } else {
      // Fallback a ubicación por defecto si no hay ubicación del usuario
      setLocation({
        latitude: 37.78825,
        longitude: -122.4324
      })
    }
  }, [userLocation])



  return (
    <ScrollView>
      <View style={{ backgroundColor: Colors.background, minHeight: height, paddingHorizontal: 15, paddingVertical: 25, alignItems: "center" }}>
        <View style={{ marginBottom: 15, width: "100%", flexDirection: 'row', }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <AntDesign name="arrowleft" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Crear Spot</Text>
        </View>

        <View style={{ width: "100%", alignItems: 'center', marginTop: 20 }}>
          <TouchableOpacity onPress={handleSelectIcon} style={styles.addIcon}>
            <Image style={{ width: icon ? "100%" : 56, height: icon ? "100%" : 56, borderRadius: icon ? 100 : 0, marginLeft: icon ? 0 : 5 }} source={icon ? { uri: icon } : addImage} />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder='Nombre del Spot...'
              value={name}
              onChangeText={setName}
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { width: 120 }]}>Descripción</Text>
            <TextInput
              style={[styles.input, { height: 135, textAlignVertical: 'top' }]}
              placeholder='Descripción Breve del Spot...'
              multiline={true}
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={Colors.placeholder}
            />
          </View>

          <View style={{ width: "100%", marginTop: 15 }}>
            <Text style={styles.label2}>Seleccionar Ubicación</Text>
            <View style={{ height: 319, width: '100%', borderRadius: 10, overflow: 'hidden', marginTop: 10 }}>
              {!location ? (
                <View style={styles.loadingMap}>
                  <ActivityIndicator size="large" color={Colors.mainGreen} />
                </View>
              ) : (
                <MapView
                  style={{ flex: 1, height: 319 }}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  onPress={handleMapPress}
                  loadingIndicatorColor={Colors.mainGreen}
                  loadingBackgroundColor={Colors.background}
                >
                  <Marker coordinate={location} />
                </MapView>
              )}
            </View>
          </View>

          <View style={{ width:'100%', marginTop: 20 }}>
            <Text style={styles.label2}>Añadir Imágenes</Text>
            <ScrollView
            horizontal={true}  
            style={{marginTop:10}}
            >
              <View style={{minWidth:width, flexDirection:"row"}}>
                {images.map((img, index) => (
                    <View key={index} style={{flexDirection:'row'}}>
                        <TouchableOpacity style={{position:"absolute", top:10, zIndex:10, right: 15,}} onPress={() => {
                            setImages((prev) => prev.filter((_, i) => i !== index));
                        }}>
                            <Text style={{fontWeight:900, color:"#fff", fontSize:20}}>X</Text>
                        </TouchableOpacity>
                        <Image source={{uri: img}} style={{width:280, height:240, borderRadius:10, marginHorizontal:5}}/>
                    </View>
                )) }
                <TouchableOpacity onPress={handleAddImage} style={{width:280, height:240, borderRadius:10, backgroundColor:Colors.gray, justifyContent:"center", alignItems:'center', marginHorizontal:5}}>
                    <Image source={addImage} style={{width:85, height:85, marginLeft:10}}/>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          <TouchableOpacity 
            style={[styles.createButtonContainer, isCreating && styles.createButtonDisabled]} 
            onPress={handleCreateSpot}
            disabled={isCreating}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0)']}
              style={styles.createButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.createButtonText}>Crear Spot</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

export default CreateSpot

const DynamicStyles = (Colors) => StyleSheet.create({
  title: {
    color: Colors.text,
    fontFamily: "Rajdhani-Bold",
    fontSize: 28,
    marginLeft: 20,
  },
  addIcon: {
    backgroundColor: Colors.gray,
    width: 100,
    height: 100,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: "center",
    elevation: 5
  },
  input: {
    borderColor: Colors.mainGreen,
    borderWidth: 2.5,
    borderRadius: 10,
    width: width * 0.9,
    height: 61,
    paddingHorizontal: 20,
    color: Colors.text,
    fontSize: 20
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    color: Colors.text,
    backgroundColor: Colors.background,
    padding: 5,
    position: "relative",
    top: 15,
    fontSize: 16,
    fontWeight: "medium",
    left: 15,
    zIndex: 10,
    width: 100,
    textAlign: "center",
    fontFamily: 'Inter-Bold'
  },
  label2: {
    color: Colors.text,
    padding: 5,
    fontSize: 16,
    left: 15,
    zIndex: 10,
    fontFamily: 'Inter-Bold'
  },
  loadingMap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)'
  },
  createButtonContainer: {
    marginVertical: 60,
    width: 323,
    height: 60,
    borderRadius: 30,
    elevation: 10,
    overflow: 'hidden'
  },
  createButton: {
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: Colors.mainGreen
  },
  createButtonText: {
    color:"#000",
    fontSize:28,
    fontFamily:'Rajdhani-Bold',
    textAlign:"center"
  },
  createButtonDisabled: {
    opacity: 0.6
  }
})
