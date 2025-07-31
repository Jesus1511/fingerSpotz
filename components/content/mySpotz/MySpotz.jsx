import { AntDesign, Entypo } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import * as Location from 'expo-location'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { auth, db } from '../../../Firebase/init'
import useColors from '../../../Utils/Colors'
import { NavigationContext } from '../../../Utils/NavBar'
import { useAndroidBackHandler } from '../../../Utils/useAndroidCustomBackHandler'
import { AppContext } from '../../../AppContext'

const {width, height} = Dimensions.get("window")

const P = () => {

  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)
  const {setRoute} = useContext(NavigationContext)
  const {mySpotz: spotz, setMySpotz: setSpotz} = useContext(AppContext)

  const [userLocation, setUserLocation] = useState(null)

  const navigateBack = () => {
    navigation.navigate('Perfil')
    setRoute('Perfil')
    return true
  }

  useAndroidBackHandler(navigateBack)

  // Función para calcular distancia entre dos puntos
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return distance
  }

  // Función para formatear distancia
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    } else {
      return `${distance.toFixed(1)}km`
    }
  }

  // Obtener ubicación actual del usuario
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Permiso de ubicación denegado')
        return null
      }

      const location = await Location.getCurrentPositionAsync({})
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }
    } catch (error) {
      console.log('Error obteniendo ubicación:', error)
      return null
    }
  }

  // Cargar spots del usuario
  const loadUserSpotz = async () => {
    if (!auth.currentUser) {
      return
    }

    try {
      
      // Obtener ubicación actual
      const location = await getUserLocation()
      setUserLocation(location)

      // Consultar spots del usuario en Firebase
      const spotzRef = collection(db, 'spotz')
      const q = query(spotzRef, where('userId', '==', auth.currentUser.uid))
      const querySnapshot = await getDocs(q)
      
      const userSpotz = []
      querySnapshot.forEach((doc) => {
        const spotData = doc.data()
        let distance = null
        
        // Calcular distancia si tenemos ubicación del usuario
        if (location && spotData.location) {
          distance = calculateDistance(
            location.latitude,
            location.longitude,
            spotData.location.latitude,
            spotData.location.longitude
          )
        }
        
        userSpotz.push({
          id: doc.id,
          ...spotData,
          distance
        })
      })

      setSpotz(userSpotz)
    } catch (error) {
      console.error('Error cargando spots:', error)
    } finally {
    }
  }

  useEffect(() => {
    loadUserSpotz()
  }, [])

  return (
    <ScrollView>
    <View style={{backgroundColor:Colors.background, height, paddingHorizontal:15, paddingVertical:25, alignItems:"center"}}>
        <View style={{ marginBottom: 15, width:"100%" }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <AntDesign name="arrowleft" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Tus Spotz</Text>
        </View>
        <View style={{ width:"100%", height:'100%' }}>
            {!spotz ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.mainGreen} />
                    <Text style={styles.loadingText}>Cargando tus spots...</Text>
                </View>
            ) : spotz && spotz.length > 0 ? (
                spotz.map((spot) => (
                    <TouchableOpacity onPress={() => navigation.navigate('EditSpot', {spot})} key={spot.id} style={styles.spotCard}>
                        <View style={styles.spotHeader}>
                            <Image 
                                source={{ uri: spot.icon }} 
                                style={styles.spotIcon}
                                resizeMode="cover"
                            />
                            <View style={styles.spotInfo}>
                                <Text style={styles.spotName}>{spot.name}</Text>
                                {spot.distance !== null && (
                                    <Text style={styles.spotDistance}>
                                        a <Text style={{color:Colors.mainGreen}}>{formatDistance(spot.distance)}</Text> de ti
                                    </Text>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No has creado ningún spot aún</Text>
                    <Text style={styles.emptySubtext}>Crea tu primer spot tocando el botón +</Text>
                </View>
            )}
            <TouchableOpacity onPress={() => navigation.navigate('CreateSpot')} style={styles.addButton}>
                <Entypo name="plus" size={30} color="black" />
            </TouchableOpacity>
        </View>
    </View>
    </ScrollView>

  )
}

export default P

const DynamicStyles = (Colors) => StyleSheet.create({
  title: {
      color: Colors.text,
      fontFamily: "Rajdhani-Bold",
      fontSize: 29,
      marginLeft: 20,
      marginTop: 20
    },

  addButton: {
    backgroundColor:Colors.mainGreen,
    padding:15,
    borderRadius:15,
    position:"absolute",
    bottom:height*0.1,
    right: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50
  },

  loadingText: {
    color: Colors.text,
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Inter-Medium'
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50
  },

  emptyText: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center'
  },

  emptySubtext: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.7
  },

  spotCard: {
    borderBottomColor:Colors.superLigthText,
    borderBottomWidth:1,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },

  spotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },

  spotIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15
  },

  spotInfo: {
    flex: 1
  },

  spotName: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: 'Rajdhani-SemiBold',
    marginBottom: 2
  },

  spotDistance: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: 'Inter-Medium'
  },

  spotDescription: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    opacity: 0.8,
    lineHeight: 20
  }
})