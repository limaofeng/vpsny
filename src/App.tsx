import SplashScreen from 'react-native-splash-screen';
import walkuere from 'walkuere-rn';

import modules from './modules';
import AppNavigator from './navigators/AppNavigator';
import { sleep } from './utils';

console.disableYellowBox = true;

export default walkuere({
  modules,
  navigator: AppNavigator,
  onLoad: async () => {
    await sleep(200);
    SplashScreen.hide();
  }
});
