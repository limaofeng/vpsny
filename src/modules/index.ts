import { NavigationState } from 'react-navigation';
import { Feature } from 'walkuere-rn';

import apps from './apps';
import cloud, { CloudState } from './cloud';
import home from './home';
import settings from './settings';
import { SettingState } from './settings';
import ssh, { SSHState } from './ssh';

export type AppState = {
  cloud: CloudState;
  ssh: SSHState;
  settings: SettingState;
  nav: NavigationState;
};

export default new Feature(home, settings, ssh, apps, cloud);
