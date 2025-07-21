import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AppContext } from './AppContext'
import { useContext } from 'react';

import Home from './components/content/Home';
import Login from './components/start/Login';

const Stack = createNativeStackNavigator();

const Navigation = () => {

  const {user} = useContext(AppContext);

  const initialRoute = user ? "Home" : "Login";

  return (
    <NavigationIndependentTree>
      <NavigationContainer independent={true}>
          <Stack.Navigator
              screenOptions={{ headerShown: false }}
              initialRouteName={initialRoute}
            >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Home" component={Home} />
          </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  )
}

export default Navigation
