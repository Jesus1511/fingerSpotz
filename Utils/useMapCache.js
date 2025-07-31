import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import { useCallback, useEffect, useState } from 'react'
import { MAP_CONFIG, getLocationAccuracy } from './mapConfig'

export const useMapCache = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [cachedState, setCachedState] = useState(null)

  // Cargar estado del mapa desde cache
  const loadMapState = useCallback(async () => {
    try {
      const cachedState = await AsyncStorage.getItem(MAP_CONFIG.MAP_STATE_CACHE_KEY)
      if (cachedState) {
        const parsedState = JSON.parse(cachedState)
        const now = Date.now()
        
        if (now - parsedState.timestamp < MAP_CONFIG.CACHE_DURATION) {
          return parsedState.data
        }
      }
      return null
    } catch (error) {
      console.warn('Error loading map state from cache:', error)
      return null
    }
  }, [])

  // Guardar estado del mapa en cache
  const saveMapState = useCallback(async (state) => {
    try {
      const cacheData = {
        data: state,
        timestamp: Date.now()
      }
      await AsyncStorage.setItem(MAP_CONFIG.MAP_STATE_CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Error saving map state to cache:', error)
    }
  }, [])

  // Cargar ubicación desde cache
  const loadCachedLocation = useCallback(async () => {
    try {
      const cachedLocation = await AsyncStorage.getItem(MAP_CONFIG.LOCATION_CACHE_KEY)
      if (cachedLocation) {
        const parsedLocation = JSON.parse(cachedLocation)
        const now = Date.now()
        
        if (now - parsedLocation.timestamp < MAP_CONFIG.CACHE_DURATION) {
          return parsedLocation.data
        }
      }
      return null
    } catch (error) {
      console.warn('Error loading cached location:', error)
      return null
    }
  }, [])

  // Guardar ubicación en cache
  const saveLocationToCache = useCallback(async (locationData) => {
    try {
      const cacheData = {
        data: locationData,
        timestamp: Date.now()
      }
      await AsyncStorage.setItem(MAP_CONFIG.LOCATION_CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Error saving location to cache:', error)
    }
  }, [])

  // Obtener ubicación actual con cache
  const getCurrentLocation = useCallback(async () => {
    try {
      // Primero intentar cargar desde cache
      let locationData = await loadCachedLocation()
      
      if (!locationData) {
        // Si no hay cache, obtener nueva ubicación
        let { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          console.warn('Permisos de ubicación no concedidos')
          return null
        }

        // Usar configuración de precisión
        const accuracy = getLocationAccuracy(MAP_CONFIG.LOCATION_OPTIONS.accuracy)
        
        const location = await Location.getCurrentPositionAsync({
          accuracy,
          timeout: MAP_CONFIG.LOCATION_OPTIONS.timeout,
          maximumAge: MAP_CONFIG.LOCATION_OPTIONS.maximumAge
        })

        locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }

        // Guardar en cache
        await saveLocationToCache(locationData)
      }

      return locationData
    } catch (error) {
      console.warn('Error al obtener ubicación:', error)
      return null
    }
  }, [loadCachedLocation, saveLocationToCache])

  // Limpiar cache
  const clearCache = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        MAP_CONFIG.MAP_STATE_CACHE_KEY, 
        MAP_CONFIG.LOCATION_CACHE_KEY
      ])
      setIsInitialized(false)
      setCachedState(null)
    } catch (error) {
      console.warn('Error clearing cache:', error)
    }
  }, [])

  // Verificar si el cache está expirado
  const isCacheExpired = useCallback(async () => {
    try {
      const cachedState = await AsyncStorage.getItem(MAP_CONFIG.MAP_STATE_CACHE_KEY)
      if (cachedState) {
        const parsedState = JSON.parse(cachedState)
        const now = Date.now()
        return now - parsedState.timestamp >= MAP_CONFIG.CACHE_DURATION
      }
      return true
    } catch (error) {
      console.warn('Error checking cache expiration:', error)
      return true
    }
  }, [])

  // Inicializar cache
  useEffect(() => {
    const initializeCache = async () => {
      if (!isInitialized) {
        const state = await loadMapState()
        if (state) {
          setCachedState(state)
        }
        setIsInitialized(true)
      }
    }

    initializeCache()
  }, [isInitialized, loadMapState])

  return {
    isInitialized,
    cachedState,
    loadMapState,
    saveMapState,
    loadCachedLocation,
    saveLocationToCache,
    getCurrentLocation,
    clearCache,
    isCacheExpired
  }
} 