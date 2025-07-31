import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { StyleSheet, View, Platform, Dimensions, ActivityIndicator } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { useAndroidBackHandler } from '../../Utils/useAndroidCustomBackHandler'
import useColors from '../../Utils/Colors'
import { useNavigation } from '@react-navigation/native'
import { useMapCache } from '../../Utils/useMapCache'
import { withMapOptimization } from '../../Utils/withMapOptimization'
import { MAP_CONFIG, getPlatformSpecificConfig } from '../../Utils/mapConfig'

const {width, height} = Dimensions.get('window')

const Mapa = () => {

  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)

  const [region, setRegion] = useState(null)
  const [marker, setMarker] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const mapRef = useRef(null)
  const filterRef = useRef()

  useAndroidBackHandler(() => {
    return true
  })

  // Obtener configuración específica de la plataforma
  const platformConfig = useMemo(() => 
    getPlatformSpecificConfig(Platform.OS), 
    []
  )

  // Usar el hook personalizado para cache
  const {
    isInitialized: cacheInitialized,
    cachedState,
    saveMapState,
    getCurrentLocation
  } = useMapCache()

  // Función para inicializar el mapa
  const initializeMap = useCallback(async () => {
    if (hasInitialized) return

    setIsLoading(true)
    
    try {
      // Si hay estado cacheado, usarlo
      if (cachedState && cacheInitialized) {
        setRegion(cachedState.region)
        setMarker(cachedState.marker)
        setIsLoading(false)
        setHasInitialized(true)
        return
      }

      // Obtener ubicación actual
      const locationData = await getCurrentLocation()

      if (locationData) {
        const initialRegion = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }

        const newMarker = { 
          latitude: locationData.latitude, 
          longitude: locationData.longitude 
        }

        setRegion(initialRegion)
        setMarker(newMarker)

        // Guardar estado en cache
        await saveMapState({
          region: initialRegion,
          marker: newMarker
        })
      } else {
        // Usar ubicación por defecto de la configuración
        const defaultRegion = MAP_CONFIG.DEFAULT_LOCATION
        const defaultMarker = { 
          latitude: defaultRegion.latitude, 
          longitude: defaultRegion.longitude 
        }

        setRegion(defaultRegion)
        setMarker(defaultMarker)

        // Guardar estado por defecto en cache
        await saveMapState({
          region: defaultRegion,
          marker: defaultMarker
        })
      }
    } catch (error) {
      console.warn('Error initializing map:', error)
      // Usar ubicación por defecto de la configuración en caso de error
      const defaultRegion = MAP_CONFIG.DEFAULT_LOCATION
      const defaultMarker = { 
        latitude: defaultRegion.latitude, 
        longitude: defaultRegion.longitude 
      }

      setRegion(defaultRegion)
      setMarker(defaultMarker)

      // Guardar estado por defecto en cache
      await saveMapState({
        region: defaultRegion,
        marker: defaultMarker
      })
    } finally {
      setIsLoading(false)
      setHasInitialized(true)
    }
  }, [hasInitialized, cachedState, cacheInitialized, getCurrentLocation, saveMapState])

  // useEffect optimizado - solo se ejecuta cuando el cache está listo
  useEffect(() => {
    if (cacheInitialized) {
      initializeMap()
    }
  }, [cacheInitialized, initializeMap])

  useEffect(() => {
    filterRef.current?.setAddressText('Some Text');
  }, []);

  // Memoizar el componente del mapa para evitar re-renders
  const mapComponent = useMemo(() => {
    if (!region) return null

    return (
      <MapView
        ref={mapRef}
        //provider={PROVIDER_GOOGLE}
        style={{width, height}}
        initialRegion={region}
        loadingIndicatorColor={Colors.mainGreen}
        loadingBackgroundColor={Colors.background}
        // Usar configuración centralizada
        {...platformConfig.MAP_OPTIONS}
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>
    )
  }, [region, marker, Colors.mainGreen, Colors.background, platformConfig.MAP_OPTIONS])

  // Memoizar el loading component
  const loadingComponent = useMemo(() => (
    <View style={{flex:1, justifyContent:"center", alignItems:'center'}}>
      <ActivityIndicator size="large" color={Colors.mainGreen} />
    </View>
  ), [Colors.mainGreen])

  return (
    <View style={{ flex: 1, backgroundColor: "#dfdfdfff" }}>
      {isLoading ? loadingComponent : mapComponent}
    </View>
  )
}

// Aplicar el HOC de optimización
export default withMapOptimization(Mapa)

const DynamicStyles = (Colors) =>
  StyleSheet.create({
    searchContainer: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      left: 15,
      right: 15,
      zIndex: 2,
    },
  })
