import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AppContext } from './AppContext'
import { useContext } from 'react';
import NavBar from './Utils/NavBar';

import Mapa from './components/content/Mapa'

import Login from './components/start/Login';
import CreateAccount from './components/start/CreateAccount';

import Page1 from './components/start/onboarding/Page1';
import Page2 from './components/start/onboarding/Page2';
import Page3 from './components/start/onboarding/Page3';

const Stack = createNativeStackNavigator();

const Navigation = () => {

  const {user, firtsTime} = useContext(AppContext);

  const initialRoute = user ? "Mapa" : firtsTime ? "OnboardingPage1" : "Login";

  return (
    <NavigationIndependentTree>
      <NavigationContainer independent={true}>
          <NavBar>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={initialRoute}
              >
              {user ? (
                <>
                  <Stack.Screen name="Mapa" component={Mapa} />
                </>
              ): (
                <>
                  <Stack.Screen name="Login" component={Login} />
                  <Stack.Screen name="CreateAccount" component={CreateAccount} />

                </>
              )}
          

              {firtsTime && (
                <>  
                  <Stack.Screen name="OnboardingPage1" component={Page1} />
                  <Stack.Screen name="OnboardingPage2" component={Page2} />
                  <Stack.Screen name="OnboardingPage3" component={Page3} />
                </>
              )}

            </Stack.Navigator>
          </NavBar>
      </NavigationContainer>
    </NavigationIndependentTree>
  )
}

export default Navigation
