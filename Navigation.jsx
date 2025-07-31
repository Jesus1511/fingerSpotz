import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AppContext } from './AppContext'
import { useContext } from 'react';
import NavBar from './Utils/NavBar';

import Mapa from './components/content/Mapa'
import Perfil from './components/content/Perfil';
import Spotz from './components/content/Spotz'
import MySpotz from './components/content/mySpotz/MySpotz'
import CreateSpot from './components/content/mySpotz/CreateSpot'
import EditSpot from './components/content/mySpotz/EditSpot';

import Login from './components/start/Login';
import CreateAccount from './components/start/CreateAccount';

import Page1 from './components/start/onboarding/Page1';
import Page2 from './components/start/onboarding/Page2';
import Page3 from './components/start/onboarding/Page3';

const Stack = createNativeStackNavigator();

const Navigation = () => {

  const {firtsTime, initialRoute} = useContext(AppContext);

  return (
    <NavigationIndependentTree>
      <NavigationContainer independent={true}>
          <NavBar>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={initialRoute}
              >

              <Stack.Screen name="Mapa" component={Mapa} />
              <Stack.Screen name="Perfil" component={Perfil} />
              <Stack.Screen name="Spotz" component={Spotz} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="CreateAccount" component={CreateAccount} />

              <Stack.Screen name="MySpotz" component={MySpotz} />
              <Stack.Screen name="CreateSpot" component={CreateSpot} />
              <Stack.Screen name="EditSpot" component={EditSpot} />

              {firtsTime && (
                <>  
                  <Stack.Screen
                    name="OnboardingPage1"
                    component={Page1}
                    options={{
                      animation:'slide_from_right'
                    }}
                  />
                  <Stack.Screen
                    name="OnboardingPage2"
                    component={Page2}
                    options={{
                      animation:'slide_from_right'
                    }}
                  />
                  <Stack.Screen
                    name="OnboardingPage3"
                    component={Page3}
                    options={{
                      animation:'slide_from_right'
                    }}
                  />
                </>
              )}

            </Stack.Navigator>
          </NavBar>
      </NavigationContainer>
    </NavigationIndependentTree>
  )
}

export default Navigation
