// Configuración para optimización del mapa
export const MAP_CONFIG = {
  // Configuración de cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  LOCATION_CACHE_KEY: 'map_location_cache',
  MAP_STATE_CACHE_KEY: 'map_state_cache',
  
  // Configuración de ubicación
  DEFAULT_LOCATION: {
    latitude: -33.4489, // Santiago de Chile
    longitude: -70.6693,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  // Configuración de precisión de ubicación
  LOCATION_OPTIONS: {
    accuracy: 'balanced', // 'lowest', 'low', 'balanced', 'high', 'highest'
    timeout: 10000, // 10 segundos
    maximumAge: 300000, // 5 minutos
  },
  
  // Configuración del mapa
  MAP_OPTIONS: {
    showsUserLocation: true,
    showsMyLocationButton: true,
    loadingEnabled: true,
    moveOnMarkerPress: false,
    toolbarEnabled: false,
    zoomEnabled: true,
    scrollEnabled: true,
    rotateEnabled: false,
    pitchEnabled: false,
    mapType: 'standard', // 'standard', 'satellite', 'hybrid', 'terrain'
  },
  
  // Configuración de performance
  PERFORMANCE: {
    enableMapOptimization: true,
    enableCache: true,
    enableMemoization: true,
    maxCacheAge: 5 * 60 * 1000, // 5 minutos
  }
}

// Función para obtener configuración específica de la plataforma
export const getPlatformSpecificConfig = (platform) => {
  const baseConfig = { ...MAP_CONFIG }
  
  if (platform === 'ios') {
    return {
      ...baseConfig,
      MAP_OPTIONS: {
        ...baseConfig.MAP_OPTIONS,
        // Configuraciones específicas para iOS
        showsCompass: true,
        showsScale: true,
      }
    }
  } else if (platform === 'android') {
    return {
      ...baseConfig,
      MAP_OPTIONS: {
        ...baseConfig.MAP_OPTIONS,
        // Configuraciones específicas para Android
        showsCompass: false,
        showsScale: false,
      }
    }
  }
  
  return baseConfig
}

// Función para limpiar cache
export const clearMapCache = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default
    await AsyncStorage.multiRemove([
      MAP_CONFIG.LOCATION_CACHE_KEY,
      MAP_CONFIG.MAP_STATE_CACHE_KEY
    ])
    console.log('Map cache cleared successfully')
  } catch (error) {
    console.warn('Error clearing map cache:', error)
  }
}

// Función para obtener configuración de ubicación según la precisión
export const getLocationAccuracy = (accuracyLevel = 'balanced') => {
  const accuracyLevels = {
    lowest: 1000, // 1km
    low: 500,     // 500m
    balanced: 100, // 100m
    high: 10,     // 10m
    highest: 1    // 1m
  }
  
  return accuracyLevels[accuracyLevel] || accuracyLevels.balanced
} 