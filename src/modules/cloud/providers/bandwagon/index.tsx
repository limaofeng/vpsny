import { Theme } from '@components';
import { getApi } from '@modules/cloud';
import BandwagonHostAgent from '@modules/cloud/agents/BandwagonHostAgent';
import { Instance } from '@modules/cloud/Provider';
import { ProviderType } from '@modules/cloud/type';
import { sleep } from '@utils';
import React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { Dispatch } from 'redux';

import { ComponentName, Provider, ServerAction } from '../';
import { getTip } from '../utils';
import AccountNew from './blocks/AccountNew';
import AccountView from './blocks/AccountView';
import ServerView from './blocks/ServerView';
import Backup from './pages/Backup';
import Migration from './pages/Migration';
import Reinstall from './pages/Reinstall';
import Snapshot from './pages/Snapshot';

class BandwagonHost implements Provider {
  id: ProviderType = 'bandwagonhost';
  name = 'BandwagonHost';
  logo = require('./assets/bandwagonhost.png');
  description = 'Self-Managed SSD VPS';
  features = {
    deploy: false
  };
  routes(): any {
    return {
      BWG_Reinstall: Reinstall,
      BWG_Migration: Migration,
      BWG_Snapshot: Snapshot,
      BWG_Backup: Backup
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
        name: 'Kill',
        execute: async () => {
          await api.instance.stop(data.id, true);
        },
        dialog: () => ({
          title: 'Kill your instance?',
          message: 'Do you want to Kill your instance?',
          additions,
          type: 'info',
          okText: 'Kill',
          loadingText: 'killing'
        })
      },
      {
        name: 'Delete',
        execute: async () => {
          const bwgapi = api as BandwagonHostAgent;
          bwgapi.deleteVPS(data.id.toString());
          bwgapi.apiKey;
          dispatch({
            type: 'cloud/updateAccount',
            payload: {
              id: data.id,
              apiKey: bwgapi.apiKey
            }
          });
          await sleep(200);
          navigation.goBack();
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

export default new BandwagonHost();
