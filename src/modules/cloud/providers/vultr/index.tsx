import { Theme } from '@components';
import { getApi } from '@modules/cloud';
import { Instance } from '@modules/cloud/Provider';
import { ProviderType } from '@modules/cloud/type';
import { NavigationScreenProp } from 'react-navigation';
import { Dispatch } from 'redux';

import { ComponentName, Provider, ServerAction } from '../';
import { getTip, getObjectInformation } from '../utils';
import AccountNew from './blocks/AccountNew';
import AccountView from './blocks/AccountView';
import ServerView from './blocks/ServerView';
import Snapshot from './pages/Snapshot';
import Backup from './pages/Backup';

class VultrHost implements Provider {
  id: ProviderType = 'vultr';
  name = 'Vultr';
  logo = require('./assets/vultr.png');
  description = 'Global Cloud Hosting';
  features = {
    deploy: true
  };
  routes(): any {
    return {
      VULTR_Snapshot: Snapshot,
      VULTR_Backup: Backup
    };
  }
  actions(data: Instance, theme: Theme, dispatch: Dispatch, navigation: NavigationScreenProp<any>): ServerAction[] {
    const additions = getObjectInformation('Server', data.IPv4!.ip, theme);
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
            title: 'Stop Server?',
            message: 'Are you sure you want to stop your server? This will hard power off the server. You will need to start the server again via the restart button.',
            additions,
            type: 'info',
            okText: 'Stop Server',
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
          title: 'Restart Server?',
          message: 'Are you sure you want to restart your server? This is a hard restart.',
          additions,
          type: 'info',
          okText: 'Restart Server',
          loadingText: 'Rebooting'
        })
      },
      {
        name: 'Reinstall',
        execute: async () => {
          await api.instance.stop(data.id, true);
        },
        dialog: () => ({
          title: 'Reinstall Server?',
          message:
            'Are you sure you want to reinstall your server? Any data on your server will be permanently lost!',
          additions,
          doubleConfirmText: 'Yes, reinstall this server.',
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
          title: 'Destroy Server?',
          message: 'Are you sure you want to destroy this server? Any data on your server will be permanently lost!',
          additions,
          doubleConfirmText: 'Yes, destroy this server.',
          type: 'warn',
          okText: 'Destroy Server',
          loadingText: 'Destroying'
        })
      }
    ];
  }
  viewComponents(): string[] {
    return [''];
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

export default new VultrHost();
