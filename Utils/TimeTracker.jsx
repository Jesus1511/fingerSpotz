import analytics from '@react-native-firebase/analytics'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../AppContext'
import { NavigationContext } from './NavBar'

const TimeTracker = ({ children }) => {
  const { route } = useContext(NavigationContext)
  const { user } = useContext(AppContext)

  const [currentRoute, setCurrentRoute] = useState(route)
  const [openTime, setOpenTime] = useState(Date.now())

  const trackScreenTime = (context) => {
    if (user && currentRoute) {
      const timeSpentSeconds = Math.floor((Date.now() - openTime) / 1000)
      const timeSpentMinutes = Math.floor(timeSpentSeconds / 60)
      
      // Solo trackear si el tiempo es mayor a 5 segundos para evitar eventos irrelevantes
      if (timeSpentSeconds >= 5) {
        console.log('🔄 Enviando evento a Firebase Analytics...', {
          screen: currentRoute,
          seconds: timeSpentSeconds,
          minutes: timeSpentMinutes,
          context
        })
        
        analytics().logEvent('screen_view_time', {
          screen_name: currentRoute,
          duration_seconds: timeSpentSeconds,
          duration_minutes: timeSpentMinutes,
          context: context,
        }).then(() => {
          console.log('✅ TIEMPO EN PANTALLA TRACKEADO:', {
            screen: currentRoute,
            seconds: timeSpentSeconds,
            minutes: timeSpentMinutes,
            context
          })
        }).catch((error) => {
          console.error('❌ Error trackeando tiempo en pantalla:', error)
        })
      } else {
        console.log('⏭️ Tiempo insuficiente para trackear:', {
          screen: currentRoute,
          seconds: timeSpentSeconds,
          context
        })
      }
    } else {
      console.log('⚠️ No se puede trackear - usuario o ruta no disponibles:', {
        hasUser: !!user,
        currentRoute,
        context
      })
    }
  }

  // Trackear tiempo al cambiar de pantalla
  useEffect(() => {
    if (currentRoute && currentRoute !== route) {
      trackScreenTime('screen_change')
    }

    setCurrentRoute(route)
    setOpenTime(Date.now())
  }, [route])


  return children
}

export default TimeTracker
