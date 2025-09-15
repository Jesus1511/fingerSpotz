import { AntDesign, Entypo, Feather } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useContext, useEffect, useState } from 'react';
import { Dimensions, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, View, TextInput, Alert } from 'react-native';
import { AppContext } from '../../AppContext';
import Toast from 'react-native-toast-message';

import useColors from '../../Utils/Colors';
import { NavigationContext } from '../../Utils/NavBar';
import { useAndroidBackHandler } from '../../Utils/useAndroidCustomBackHandler';
import googleMapsIcon from '../../assets/images/google-maps.png';

const { height, width } = Dimensions.get('window')

const SpotDetails = ({route}) => {

  const navigation = useNavigation()
  const Colors = useColors()
  const styles = DynamicStyles(Colors)
  const {setRoute} = useContext(NavigationContext)
  const { user, setSpotz } = useContext(AppContext)
  const { spot } = route.params || {}

  const [liked, setLiked] = useState(spot.likes.includes(user?.uid))
  const [slider, setSlider] = useState(0)
  const [likesCount, setLikesCount] = useState(spot?.likes?.length || 0)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [rating, setRating] = useState(null)
  const [comment, setComment] = useState(null)

  const handleAddComment = async () => {
    if (!user?.uid || !spot?.id) return
    if (!comment) {
      Toast.show({
        text1: 'Por favor ingresa un comentario',
        type: 'error'
      })
      return
    }
  
    try {

      function toFirestoreTimestamp(date = new Date()) {
        const seconds = Math.floor(date.getTime() / 1000);
        const nanoseconds = (date.getTime() % 1000) * 1e6;
        return { seconds, nanoseconds };
      }
      const commentData = {
        text: comment,
        rating: rating,
        userName: user.displayName,
        userId: user.uid,
        spotId: spot.id,
        createdAt: toFirestoreTimestamp()
      }
      console.log(commentData.createdAt)
  
      // Guardar comentario en la subcolección del spot
      await firestore()
        .collection('spotz')
        .doc(spot.id)
        .collection('comments')
        .add(commentData)
  
      setComments(prev => [commentData, ...prev])
  
      Toast.show({
        text1: 'Comentario agregado',
        type: 'success'
      })
      setComment(null)
      setRating(null)
    } catch (error) {
      console.error('Error agregando comentario:', error)
      Toast.show({
        text1: 'Error agregando comentario',
        type: 'error'
      })
      setComment(null)
      setRating(null)
    }
  }
  
  useEffect(() => {
    if (spot?.likes && user?.uid) {
      const userLiked = spot.likes.includes(user.uid)
      setLiked(userLiked)
    }
  }, [spot, user])

  useEffect(() => {
    const fetchComments = async () => {
      if (!spot?.id) return
      setLoadingComments(true)
      try {
        const commentsRef = firestore()
          .collection('spotz')
          .doc(spot.id)
          .collection('comments')
  
        const snapshot = await commentsRef
          .orderBy('createdAt', 'desc') // 🔥 ya no necesitas el where
          .get()
  
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        setComments(commentsData)
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoadingComments(false)
      }
    }
    
    fetchComments()
  }, [spot])  

  // Función para manejar el scroll y actualizar el slider
  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x
    const imageIndex = Math.round(contentOffset / width)
    setSlider(imageIndex)
  }

  // Función para manejar el like
  const handleLike = async () => {
    console.log('handleLike', user, spot?.id)
    if (!user?.uid || !spot?.id) return

    try {
      const newLiked = !liked
      setLiked(newLiked) // Actualizar estado inmediatamente para UI responsiva

      const spotRef = firestore().collection("spotz").doc(spot.id)
      if (newLiked) {
        // Agregar like
        await spotRef.update({
          likes: firestore.FieldValue.arrayUnion(user.uid)
        })
        setLikesCount(prev => prev + 1)
        setSpotz(prev => prev.map(s => s.id === spot.id ? {...s, likes: [...s.likes, user.uid]} : s))
      } else {
        // Remover like
        await spotRef.update({
          likes: firestore.FieldValue.arrayRemove(user.uid)
        })
        setLikesCount(prev => prev - 1)
        setSpotz(prev => prev.map(s => s.id === spot.id ? {...s, likes: spot.likes.filter(like => like !== user.uid)} : s))
      }
    } catch (error) {
      console.error("Error actualizando like:", error)
      // Revertir el estado si hay error
      setLiked(!liked)
    }
  }

  // Función para abrir Google Maps con la ubicación del spot
  const openGoogleMaps = async () => {
    if (spot.location && spot.location.latitude && spot.location.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${spot.location.latitude},${spot.location.longitude}`
      try {
        const supported = await Linking.canOpenURL(url)
        if (supported) {
          await Linking.openURL(url)
        } else {
          console.log("No se puede abrir Google Maps")
        }
      } catch (error) {
        console.error("Error abriendo Google Maps:", error)
      }
    }
  }

  useAndroidBackHandler(() => {
    if (navigation.canGoBack()) {
      const routes = navigation.getState().routes;
      const prev = routes[routes.length - 2]?.name;
      setRoute(prev)
      navigation.goBack();
    }
    return true;
  });

  const handleDeleteComment = (commentId) => {
    if (!spot?.id || !commentId) return
  
    // Mostrar alerta de confirmación
    Alert.alert(
      'Eliminar comentario',
      '¿Estás seguro de que deseas eliminar este comentario?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Eliminar el comentario de la subcolección
              await firestore()
                .collection('spotz')
                .doc(spot.id)
                .collection('comments')
                .doc(commentId)
                .delete()
  
              // Opcional: actualizar el estado local
              setComments(prev => prev.filter(c => c.id !== commentId))
  
            } catch (error) {
              console.error('Error eliminando comentario:', error)
              Toast.show({
                text1: 'Error eliminando comentario',
                type: 'error'
              })
            }
          }
        }
      ],
      { cancelable: true }
    )
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <View style={{backgroundColor:Colors.background, flex: 1, minHeight:height, width, alignItems:"center"}}>
        <View style={{flexDirection:"column", justifyContent:"space-between", height:height*0.369, paddingHorizontal:20, paddingTop:30, width:width, alignItems:"center"}}>
            <View style={{ marginBottom: 15, width:"100%", flexDirection:"row", justifyContent:"space-between", alignItems:"center", zIndex:2 }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <AntDesign name="arrowleft" size={30} color={"white"} />
              </TouchableOpacity>

              <View style={{flexDirection:"row", gap:15, alignItems:"center"}}>
                {spot.images.map((_, index) => (
                  <View 
                    key={index}
                    style={{
                      width: 10, 
                      height: 10, 
                      backgroundColor: slider === index ? Colors.mainGreen : "white",
                      borderRadius: 5
                    }} 
                  />
                ))}
              </View>
            
              <View style={{flexDirection:'column', gap:5, alignItems:"center"}}>
                <TouchableOpacity onPress={handleLike}>
                  <AntDesign name={!liked?"hearto":"heart"} size={35} color={'white'} />
                </TouchableOpacity>

              </View>
            </View>
            
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={true}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.imageScrollView}
            >
              {spot.images.map((imageUri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{uri: imageUri}} style={styles.image} />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.gradient}
                  />
                </View>
              ))}
            </ScrollView>
            
            <Image source={{uri:spot.icon}} style={styles.icon} />
        </View>

        <View style={{ width, alignItems:"center", marginTop:20, marginBottom:20 }}>
          <Text style={styles.title}>{spot.name}</Text>
          <Text style={styles.description}>{spot.description}</Text>

          <TouchableOpacity style={styles.button} onPress={openGoogleMaps}>
            <View style={{flexDirection:"row", alignItems:"center", gap:0}}>
                <Entypo name="location-pin" size={50} color={Colors.text} />
                <Text numberOfLines={2} style={[styles.buttonText, {fontSize:17, width:130}]}>{spot.location.name}</Text>
            </View>
            <View style={{flexDirection:"row", alignItems:"center", gap:15, justifyContent:"flex-end"}}>
                <Text style={styles.buttonText2}>Ver en Google Maps</Text>
                <Image source={googleMapsIcon} style={styles.googleMaps} />
            </View>
          </TouchableOpacity>

          <View style={styles.button}>
            <View style={{flexDirection:"row", alignItems:"center", gap:15}}>
                <Feather name="users" size={40} color={Colors.text} />
                <Text style={styles.buttonText}>Visitantes        Recurrentes</Text>
            </View>
            <View>
                <Text style={styles.likesCount}>{likesCount}</Text>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.title}>Comentarios</Text>
          <View style={styles.commentsContainer}>
            {comments.length === 0 ? 
              loadingComments ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.mainGreen} />
                  <Text style={styles.loadingText}>Cargando comentarios...</Text>
                </View>
              ) : (
              <Text style={styles.noCommentsText}>No hay comentarios aún</Text>
              ) : (
              comments.sort((a, b) => b.createdAt - a.createdAt).map((comment) => (
                <View key={comment.id} style={styles.comment}>
                  <View style={styles.commentHeader}>
                    <View style={{flexDirection:"row", alignItems:"center", gap:10}}>
                      <Text style={styles.commentAuthor}>{comment.userName || 'Usuario'}</Text>
                      <View style={{flexDirection:"row", gap:5}}>
                        {Array.from({length: 5}, (_, i) => ( 
                          <AntDesign name={i < comment.rating ? "star" : "staro"} size={20} color={Colors.mainGreen} />
                        ))}
                      </View>

                    </View>
                    <View style={{flexDirection:"row", alignItems:"center", gap:5}}>
                      <Text style={styles.commentDate}>
                          {new Date(comment.createdAt.seconds * 1000 + comment.createdAt.nanoseconds / 1e6).toLocaleDateString('es-ES')}
                      </Text>
                      {comment.userId === user?.uid && (
                        <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                          <AntDesign name="delete" size={20} color={Colors.mainGreen} />
                        </TouchableOpacity>
                      )}
                    </View>

                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))
            )}
          </View>
          <View>
            <Text style={styles.secondaryTitle}>Califica este spot</Text>
            <View style={{flexDirection:"row", gap:30, justifyContent:"center"}}>
              <TouchableOpacity onPress={() => setRating(1)}>
                <AntDesign name={rating >= 1 ? "star" : "staro"} size={35} color={Colors.mainGreen} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRating(2)}>
                <AntDesign name={rating >= 2 ? "star" : "staro"} size={35} color={Colors.mainGreen} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRating(3)}>
                <AntDesign name={rating >= 3 ? "star" : "staro"} size={35} color={Colors.mainGreen} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRating(4)}>
                <AntDesign name={rating >= 4 ? "star" : "staro"} size={35} color={Colors.mainGreen} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRating(5)}>
                <AntDesign name={rating >= 5 ? "star" : "staro"} size={35} color={Colors.mainGreen} />
              </TouchableOpacity>
            </View>

            {rating && (
              <View>
                <TextInput 
                  style={styles.ratingInput}
                  placeholder='Comentario'
                  value={comment}
                  multiline={true}
                  onChangeText={setComment}
                  placeholderTextColor={Colors.placeholder}
                 />
                 <TouchableOpacity style={styles.ratingButton} onPress={handleAddComment}>
                  <Text style={styles.ratingButtonText}>Agregar Comentario</Text>
                 </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <View style={{height:100}} />

    </View>
    </ScrollView>

  )
}

export default SpotDetails

const DynamicStyles = (Colors) => StyleSheet.create({

  secondaryTitle: {
      color:Colors.text,
      fontFamily:"Rajdhani-Bold",
      fontSize:24,
      marginTop:20,
      textAlign:"center",
      marginBottom:10,
  },

  imageScrollView: {
    width: width,
    height: height * 0.369,
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 0,
  },

  imageContainer: {
    width: width,
    height: height * 0.369,
  },

  image: {
    width: width, 
    height: height * 0.369, 
    resizeMode: "cover",
    backgroundColor: Colors.gray
  },

  icon: {
    width:100,
    height:100,
    borderRadius:100,
    top:40,
    elevation:10
  },

  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.369,
    zIndex: 1
  },

  ratingInput: {
    color: Colors.text,
    fontFamily: "Inter-Regular",
    fontSize: 16,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 30,
    maxWidth: width * 0.89,
    borderColor: Colors.mainGreen,
  },

  title: {
    color:Colors.text,
    fontFamily:"BebasNeue",
    fontSize:32,
    marginTop:40,
    textAlign:"center"
  },

  description: {
    color:Colors.text,
    fontFamily:"Inter-Regular",
    fontSize:16,
    width:width*0.742,
    textAlign:"left",
    marginVertical:15,
  },

  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.input,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginVertical: 10,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    height: height*0.101,
    shadowRadius: 3.84,
    elevation: 5,
  },

  ratingButton: {
    marginTop: 8,
    backgroundColor: Colors.mainGreen,
    padding: 10,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  ratingButtonText: {
    color: '#000',
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 20,
  },

  buttonText: {
    color: Colors.text,
    fontFamily: "Rajdhani-SemiBold",
    fontSize: 22,
    marginTop: 5,
    width: 115,
  },

  buttonText2: {
    color: Colors.text,
    fontFamily: "Inter-Medium",
    fontSize: 14,
    width: 90,
    marginBottom: 5,
    textAlign:"right",
  },

  googleMaps: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },

  likesCount: {
    color: Colors.text,
    fontFamily: "Inter-Bold",
    fontSize: 22,
    backgroundColor: Colors.mainGreen + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },

  commentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
    width: width * 0.9,
  },
  comment: {
    backgroundColor: Colors.input,
    padding: 10,
    borderRadius: 10,
    width: width * 0.9,
    height: height * 0.1,
  },
  commentText: {
    color: Colors.text,
    fontFamily: "Inter-Regular",
    fontSize: 16,
    marginTop: 8,
  },
  
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  
  commentAuthor: {
    color: Colors.mainGreen,
    fontFamily: "Inter-Bold",
    fontSize: 14,
  },
  
  commentDate: {
    color: Colors.ligthText,
    fontFamily: "Inter-Regular",
    fontSize: 12,
  },
  
  noCommentsText: {
    color: Colors.ligthText,
    fontFamily: "Inter-Regular",
    fontSize: 16,
    marginVertical: 25,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
})