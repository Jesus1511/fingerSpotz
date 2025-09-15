import { StyleSheet, Text, View, StatusBar } from 'react-native'
import Navigation from '../Navigation'
import AppContext from '../AppContext'
import Toast from 'react-native-toast-message'
import '@react-native-firebase/app'

const index = () => {
  return (
    <>
    <AppContext>
      <Navigation />
    </AppContext>
    <StatusBar
      translucent
      backgroundColor="transparent"
      barStyle="dark-content"
    />
    <Toast style={{ zIndex: 9999 }}/>
    </>


  )
}

export default index

const styles = StyleSheet.create({})