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
    const analytics = firebase.analytics();
    await firebase.auth().signInAnonymously();
    const user = firebase.auth().currentUser;
    await user!.updateProfile({
      displayName: DeviceInfo.getDeviceName()
    });
    analytics.setUserId(user!.uid);
    SplashScreen.hide();
  }
});
