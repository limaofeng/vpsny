import walkuere from 'walkuere-rn';
import SplashScreen from 'react-native-splash-screen';
import { YellowBox } from 'react-native';

import modules from './modules';

import AppNavigator from './navigators/AppNavigator';
import { sleep } from './utils';

YellowBox.ignoreWarnings(['RCTBridge', 'Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);

console.ignoredYellowBox = [
  'Warning: BackAndroid is deprecated. Please use BackHandler instead.',
  'source.uri should not be an empty string',
  'Invalid props.style key'
];

export default walkuere({
  modules,
  navigator: AppNavigator,
  onLoad: async () => {
    await sleep(200);
    SplashScreen.hide();
  }
});
