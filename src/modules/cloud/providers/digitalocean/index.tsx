import { Theme } from '@components';
import { getApi } from '@modules/cloud';
import { Instance, ProviderType } from '@modules/cloud/type';
import { NavigationScreenProp } from 'react-navigation';
import { Dispatch } from 'redux';

import { ComponentName, Provider } from '../';
import { getTip } from '../utils';
import AccountNew from './blocks/AccountNew';
import AccountView from './blocks/AccountView';
import ServerView from './blocks/ServerView';

class DigitalOcean implements Provider {
  id: ProviderType = 'digitalocean';
  name = 'DigitalOcean';
  logo = require('./assets/digitalocean.png');
  description = 'The simplest cloud platform for developers & teams';
  features = {
    deploy: false
  };
  routes(): any {
    return {
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
        name: 'Reinstall',
        execute: async () => {
          await api.instance.stop(data.id, true);
        },
        dialog: () => ({
          title: 'Reinstall this instance?',
          message:
            'Are you sure you want to reinstall your instance? Any data on your instance will be permanently lost!',
          additions,
          type: 'warn',
          okText: 'Reinstall Instance',
          loadingText: 'Reinstalling'
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
  getComponent(name: ComponentName) {
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

export default new DigitalOcean();
