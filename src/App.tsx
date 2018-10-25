import SplashScreen from 'react-native-splash-screen';
import walkuere from 'walkuere-rn';
import firebase from 'react-native-firebase';
import DeviceInfo from 'react-native-device-info';

import modules from './modules';
import AppNavigator from './navigators/AppNavigator';
import { sleep } from './utils';

console.disableYellowBox = true;

export default walkuere({
  modules,
  navigator: AppNavigator,
  onLoad: async () => {
    const analytics = firebase.analytics();
    analytics.setUserId(DeviceInfo.getDeviceId());
    analytics.setUserProperty('name', DeviceInfo.getDeviceName());
    await sleep(200);
    SplashScreen.hide();
  }
});
