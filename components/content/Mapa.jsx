import { Entypo } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useContext, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { AppContext } from '../../AppContext'
import useColors from '../../Utils/Colors'
import { useAndroidBackHandler } from '../../Utils/useAndroidCustomBackHandler'

const {width, height} = Dimensions.get('window')

const Mapa = () => {

  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)
  const { spotz, userLocation, getUserLocation } = useContext(AppContext)

  const [region, setRegion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const mapRef = useRef(null)

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setError(null)
        await getUserLocation()
      } catch (err) {
        console.error('Error initializing location:', err)
        setError('No se pudo obtener tu ubicación')
        setIsLoading(false)
      }
    }
    
    initializeLocation()
  }, [])

  useEffect(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      setRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })
      setIsLoading(false)
    }
  }, [userLocation])



  useAndroidBackHandler(() => {
    return true
  }, [])

  const handleMarkerPress = (spot) => {
    try {
      navigation.navigate('SpotDetails', { spot })
    } catch (err) {
      console.error('Error navigating to SpotDetails:', err)
      Alert.alert('Error', 'No se pudo abrir el detalle del spot')
    }
  }

  // Crear los markers de los spotz con validación mejorada
  const spotzMarkers = spotz && Array.isArray(spotz) && spotz.length > 0 ? spotz
    .filter(spot => {
      return spot && 
             spot.id && 
             spot.location && 
             typeof spot.location.latitude === 'number' && 
             typeof spot.location.longitude === 'number' &&
             !isNaN(spot.location.latitude) && 
             !isNaN(spot.location.longitude) &&
             spot.location.latitude !== 0 && 
             spot.location.longitude !== 0
    })
    .map((spot) => (
      <Marker
        key={spot.id}
        coordinate={{
          latitude: spot.location.latitude,
          longitude: spot.location.longitude
        }}
        onPress={() => handleMarkerPress(spot)}
      >
        <View style={styles.markerContainer}>
          {/* Halo/glow effect */}
          <View style={styles.markerHalo} />
          {/* Main marker */}
          <Image
            source={{ uri: spot.icon }} 
            style={styles.markerImage}
            resizeMode="cover"
            onError={() => {
              console.log('Error loading marker image for spot:', spot.id)
            }}
          />
        </View>
      </Marker>
    )) : []

  // Componente del mapa con validación mejorada
  const mapComponent = region && region.latitude && region.longitude ? (
    <MapView
      ref={mapRef}
      style={{width, height}}
      initialRegion={region}
      loadingIndicatorColor={Colors.mainGreen}
      loadingBackgroundColor={Colors.background}
      onError={(error) => {
        console.error('Map error:', error)
        setError('Error al cargar el mapa')
      }}
      onRegionChangeComplete={(newRegion) => {
      }}
    >
      {spotzMarkers}
    </MapView>
  ) : null

  // Loading component
  const loadingComponent = (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.mainGreen} />
    </View>
  )

  // Error component
  const errorComponent = (
    <View style={styles.errorContainer}>
      <ActivityIndicator size="large" color={Colors.mainGreen} />
      {error && (
        <View style={styles.errorTextContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      {isLoading ? loadingComponent : 
       error ? errorComponent : 
       mapComponent}
      {!isLoading && !error && (
        <TouchableOpacity 
          onPress={() => navigation.navigate('CreateSpot', { from: 'Mapa' })} 
          style={styles.addButton}
        >
          <Entypo name="plus" size={30} color="black" />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default Mapa

const DynamicStyles = (Colors) =>
  StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: "#dfdfdfff"
    },
    searchContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      left: 15,
      right: 15,
      zIndex: 2,
    },
    markerContainer: {
      width: 39,
      height: 39,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    markerHalo: {
      position: 'absolute',
      width: 39,
      height: 39,
      borderRadius: 25,
      backgroundColor: Colors.mainGreen + '20',
      zIndex: 999,
    },
    markerImage: {
      width: 39,
      height: 39,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: Colors.mainGreen,
      backgroundColor: 'white',
    },
    loadingContainer: {
      flex: 1, 
      justifyContent: "center", 
      alignItems: 'center'
    },
    errorContainer: {
      flex: 1, 
      justifyContent: "center", 
      alignItems: 'center'
    },
    errorTextContainer: {
      marginTop: 20,
      paddingHorizontal: 20,
    },
    errorText: {
      color: 'red',
      textAlign: 'center',
      fontSize: 16,
    },
    addButton: {
      backgroundColor: Colors.mainGreen,
      padding: 15,
      borderRadius: 15,
      position: "absolute",
      bottom: height * 0.05,
      right: 20,
    },
  })
