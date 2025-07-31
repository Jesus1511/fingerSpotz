import React, { memo } from 'react'
import { AppState } from 'react-native'

// HOC para optimizar el componente Mapa
export const withMapOptimization = (WrappedComponent) => {
  const OptimizedMap = memo(WrappedComponent, (prevProps, nextProps) => {
    // Solo re-renderizar si las props realmente cambian
    // En este caso, como el mapa no tiene props dinámicas, siempre retornamos true
    // para evitar re-renders innecesarios
    return true
  })

  OptimizedMap.displayName = `withMapOptimization(${WrappedComponent.displayName || WrappedComponent.name})`

  return OptimizedMap
}

// Hook para detectar si el componente está en foco
export const useIsFocused = () => {
  const [isFocused, setIsFocused] = React.useState(true)

  React.useEffect(() => {
    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => setIsFocused(false)

    // En React Native, podemos usar AppState para detectar cambios de foco
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setIsFocused(nextAppState === 'active')
    })

    return () => {
      subscription?.remove()
    }
  }, [])

  return isFocused
} 