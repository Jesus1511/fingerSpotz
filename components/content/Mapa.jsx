import { useEffect, useState, useRef } from 'react'
import { StyleSheet, View, Platform, Dimensions } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import useColors from '../../Utils/Colors'
import { useNavigation } from '@react-navigation/native'

const {width, height} = Dimensions.get('window')

const Mapa = () => {

  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)

  const [region, setRegion] = useState(null)
  const [marker, setMarker] = useState(null)
  const mapRef = useRef(null)
  const filterRef = useRef()

  useEffect(() => {
    filterRef.current?.setAddressText('Some Text');
  }, []);


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.warn('Permisos de ubicación no concedidos')
        return
      }

      try {
        let location = await Location.getCurrentPositionAsync({})
        const { latitude, longitude } = location.coords

        const initialRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }

        setRegion(initialRegion)
        setMarker({ latitude, longitude })
      } catch (error) {
        console.warn('Error al obtener ubicación:', error)
      }
    })()
  }, [])

  console.log(region)
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {region && (
        <MapView
          ref={mapRef}
          //provider={PROVIDER_GOOGLE}
          style={{width, height}}
          initialRegion={region}
        >
          {marker && <Marker coordinate={marker} />}
        </MapView>
      )}

    </View>
  )
}

export default Mapa

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
