import { FontAwesome } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { AppContext } from '../../AppContext'
import useColors from '../../Utils/Colors'
import { NavigationContext } from '../../Utils/NavBar'
import { useAndroidBackHandler } from '../../Utils/useAndroidCustomBackHandler'

const {width, height} = Dimensions.get("window")

const P = () => {

  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)
  const {setRoute} = useContext(NavigationContext)
  const {spotz, fetchAndOrganizeSpotz} = useContext(AppContext)

  const [searching, setSearching] = useState(false)
  const [filteredSpotz, setFilteredSpotz] = useState(spotz)
  const [searchQuery, setSearchQuery] = useState("")

  // Función para formatear distancia
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    } else {
      return `${distance.toFixed(1)}km`
    }
  }

  useEffect(() => {
    if (spotz) {
      fetchAndOrganizeSpotz()
    }
  }, [])

  useEffect(() => {
    if (!searching) {
      setFilteredSpotz(spotz)
      setSearchQuery("")
    }
    if (searchQuery.length > 0) {
      setFilteredSpotz(spotz.filter((spot) => spot.name.toLowerCase().includes(searchQuery.toLowerCase())))
    } else {
      setFilteredSpotz(spotz)
    }
  }, [searchQuery, spotz, searching])

  useAndroidBackHandler(() => {
    if (navigation.canGoBack()) {
      const routes = navigation.getState().routes;
      const prev = routes[routes.length - 2]?.name;
      setRoute(prev)
      navigation.goBack();
    }
    return true;
  });

  return (
    <ScrollView>
      <View style={{backgroundColor:Colors.background, height, paddingHorizontal:15, paddingVertical:25, alignItems:"center"}}>
          {searching ? (
            <View style={{ width:"100%", flexDirection:'row', justifyContent:"space-between", padding:10, alignItems:"center"}}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar spotz"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity onPress={() => setSearching(false)}>
                  <Text style={styles.x}>X</Text>
              </TouchableOpacity>
            </View>
          ) : (
          <View style={{ width:"100%", flexDirection:'row', justifyContent:"space-between", padding:10, alignItems:"center"}}>
              <Text style={styles.title}>Explorar Spotz</Text>
              <TouchableOpacity style={styles.searchButton} onPress={() => setSearching(true)}>
                  <FontAwesome name="search" size={24}  color="black" />
              </TouchableOpacity>
          </View>
          )}
          <View style={{ width:"100%", height:'100%' }}>
              {spotz.length === 0 ? (
                  <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={Colors.mainGreen} />
                      <Text style={styles.loadingText}>Cargando spotz...</Text>
                  </View>
              ) : filteredSpotz && filteredSpotz.length > 0 ? (
                  filteredSpotz.map((spot) => (
                      <TouchableOpacity onPress={() => navigation.navigate('SpotDetails', {spot})} key={spot.id} style={styles.spotCard}>
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
                      <Text style={styles.emptyText}>No hay spots disponibles</Text>
                      <Text style={styles.emptySubtext}>Los spots aparecerán aquí cuando estén disponibles</Text>
                  </View>
              )}
          </View>
      </View>
    </ScrollView>
  )
}

export default P

const DynamicStyles = (Colors) => StyleSheet.create({

  title: {
      color:Colors.text,
      fontFamily:"Rajdhani-Bold",
      fontSize:29
  },

  searchButton: {
    backgroundColor:Colors.mainGreen,
    padding:10,
    borderRadius:10,
    width:45,
    height:45,
    alignItems:"center",
    justifyContent:"center"
  },

  x: {
    color:Colors.text,
    fontFamily:"Rajdhani-Bold",
    fontSize:29,
    backgroundColor:Colors.background,
    borderRadius:10,
    padding:4,
    right: 13,
  },

  searchInput: {
    width:width * 0.843,
    height:height * 0.06455,
    borderRadius:10,
    borderWidth:2.5,
    borderColor:Colors.mainGreen,
    paddingHorizontal:10,
    fontFamily:"Rajdhani-Bold",
    fontSize:20,
    color:Colors.text
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
    color: Colors.ligthText,
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