import { Theme } from '@components';
import { getApi } from '@modules/cloud';
import { Instance } from '@modules/cloud/Provider';
import { NavigationScreenProp } from 'react-navigation';
import { Dispatch } from 'redux';

import { Provider } from '../';
import { getTip } from '../utils';
import AccountNew from './blocks/AccountNew';
import AccountView from './blocks/AccountView';
import ServerView from './blocks/ServerView';
import Snapshots from './pages/Snapshots';
import History from './pages/History';

class Lightsail implements Provider {
  id = 'lightsail';
  name = 'Lightsail';
  logo = require('./assets/lightsail.png');
  description = 'Now available worldwide';
  routes(): any {
    return {
      Lightsail_Snapshots: Snapshots,
      Lightsail_History: History
    };
  }
  actions(data: Instance, theme: Theme, dispatch: Dispatch, navigation: NavigationScreenProp<any>): ServerAction[] {
    const additions = getTip(data, theme);
    const api = getApi(data.account);
    return [
      {
        name: 'Start',
        execute: async () => {
          await api.instance.start(data.id);
        }
      },
      {
        name: 'Stop',
        execute: async () => {
          await api.instance.stop(data.id);
        },
        dialog: () => {
          return {
            title: 'Stop your instance?',
            message: 'Do you want to stop your instance?',
            additions,
            type: 'info',
            okText: 'Stop Instance',
            loadingText: 'Stoping'
          };
        }
      },
      {
        name: 'Restart',
        execute: async () => {
          await api.instance.restart(data.id);
        },
        dialog: () => ({
          title: 'Reboot your instance?',
          message: 'Do you want to reboot your instance?',
          additions,
          type: 'info',
          okText: 'Reboot',
          loadingText: 'Rebooting'
        })
      },
      {
        name: 'Delete',
        execute: async () => {
          await api.instance.destroy(data.id);
        },
        dialog: () => ({
          title: 'Destroy this instance?',
          message: 'This process will completely remove this instance.',
          additions,
          type: 'warn',
          okText: 'Destroy Instance',
          loadingText: 'Destroying'
        })
      }
    ];
  }
  viewComponents(): string[] {
    return [''];
  }
  getComponent(name: string) {
    switch (name) {
      case 'AccountNew':
        return AccountNew;
      case 'AccountView':
        return AccountView;
      case 'ServerView':
        return ServerView;
      default:
        throw new Error('Method not implemented.');
    }
  }
}

export default new Lightsail();
