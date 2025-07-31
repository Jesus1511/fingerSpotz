import { AntDesign } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import { doc, updateDoc } from 'firebase/firestore'
import { useContext, useState } from 'react'
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { auth, db } from '../../../Firebase/init'
import useColors from '../../../Utils/Colors'
import { NavigationContext } from '../../../Utils/NavBar'
import { useAndroidBackHandler } from '../../../Utils/useAndroidCustomBackHandler'

import addImage from '../../../assets/images/addImage.png'

const { width, height } = Dimensions.get('window')

const EditSpot = ({route}) => {
  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)
  const { setRoute } = useContext(NavigationContext)

  const { spot } = route.params || {}

  const [icon, setIcon] = useState(spot.icon)
  const [name, setName] = useState(spot.name)
  const [description, setDescription] = useState(spot.description)
  const [location, setLocation] = useState(spot.location)
  const [images, setImages] = useState(spot.images)
  const [isUpdating, setIsUpdating] = useState(false)

  const navigateBack = () => {
    navigation.navigate('MySpotz')
    setRoute('MySpotz')
    return true
  }

  useAndroidBackHandler(navigateBack)

  const handleUpdateSpot = async () => {
    // Validar que los campos requeridos estén completos
    if (!icon) {
        Alert.alert('Error', 'Por favor selecciona un icono para el spot')
        return
    }
      
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el spot')
      return
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción para el spot')
      return
    }
    
    if (!location) {
        Alert.alert('Error', 'Por favor selecciona una ubicación en el mapa')
        return
    }

    if (images.length < 1) {
        Alert.alert('Error', 'Por favor selecciona al menos una imagen')
        return
    }

    if (!auth.currentUser) {
        Alert.alert('Error', 'Tu sesión ha expirado. Por favor vuelve a iniciar sesión.')
        return
    }

    setIsUpdating(true)

    try {
      const spotData = {
        name: name.trim(),
        description: description.trim(),
        icon: icon,
        images: images,
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        updatedAt: new Date(),
      }

      await updateDoc(doc(db, 'spotz', spot.id), spotData)
      Alert.alert('Éxito', 'Spot actualizado correctamente')
      navigateBack()
    } catch (error) {
      console.error('Error updating spot:', error)
      Alert.alert('Error', 'No se pudo actualizar el spot. Inténtalo de nuevo.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSelectIcon = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      setIcon(result.assets[0].uri)
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

  return (
    <ScrollView>
      <View style={{ backgroundColor: Colors.background, minHeight: height, paddingHorizontal: 15, paddingVertical: 25, alignItems: "center" }}>
        <View style={{ marginBottom: 15, width: "100%", flexDirection: 'row', }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <AntDesign name="arrowleft" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Spot</Text>
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
              {(!location) && (
                <View style={styles.loadingMap}>
                  <ActivityIndicator size="large" color={Colors.mainGreen} />
                </View>
              )}
              {location && (
                <MapView
                  style={{ flex: 1, height:319 }}
                  initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  onPress={handleMapPress}
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
            style={[styles.createButtonContainer, isUpdating && styles.createButtonDisabled]} 
            onPress={handleUpdateSpot}
            disabled={isUpdating}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0)']}
              style={styles.createButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.createButtonText}>Actualizar Spot</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

export default EditSpot

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
