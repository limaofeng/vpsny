import firebase from 'react-native-firebase';
import SplashScreen from 'react-native-splash-screen';
import walkuere from 'walkuere-rn';
import DeviceInfo from 'react-native-device-info';

import modules from './modules';
import AppNavigator from './navigators/AppNavigator';

console.disableYellowBox = true;

export default walkuere({
  modules,
  navigator: AppNavigator,
  onLoad: async () => {
    SplashScreen.hide();
  }
});
