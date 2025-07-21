import { StyleSheet, Text, View } from 'react-native'
import Navigation from '../Navigation'
import AppContext from '../AppContext'
import Toast from 'react-native-toast-message'

const index = () => {
  return (
    <AppContext>
      <Navigation />
      <Toast />
    </AppContext>
  )
}

export default index

const styles = StyleSheet.create({})