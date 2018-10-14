import forge from 'node-forge';
import DeviceInfo from 'react-native-device-info';
import { AnyAction } from 'redux';
import { Feature } from 'walkuere-rn';

import { getPublicKeyFingerprint, sleep, uuid } from '../../utils';
import { KeyPair } from '../cloud/type';
import Settings from './views/Settings';
import Sidebar from './views/Sidebar';
import SSHKeyList from './views/SSHKeyList';
import SSHKeyView from './views/SSHKeyView';


const generateKeyPairName = (keyPairs: KeyPair[], prefix: 'vpsnyapp' | 'paste') => {
  const device = (/.*[\u4e00-\u9fa5]+.*$/.test(DeviceInfo.getDeviceName())
    ? DeviceInfo.getModel()
    : DeviceInfo.getDeviceName()
  ).replace(/[ ]/g, '');
  let name = `${prefix}@${device}`;
  let i = 1;
  while (keyPairs.some(k => k.name === name)) {
    name = `${prefix}${i}@${device}`;
    i++;
  }
  return name;
};

const getPublicKeyOpenSSHByPrivateKey = (keyPair: KeyPair) => {
  const privateKey = keyPair.privateKey as string;
  const forgePrivateKey = privateKey.includes('ENCRYPTED')
    ? forge.pki.decryptRsaPrivateKey(privateKey, keyPair.passphrase)
    : forge.pki.privateKeyFromPem(privateKey);
  const pki = forge.pki as any;
  const forgePublicKey = pki.setRsaPublicKey(forgePrivateKey.n, forgePrivateKey.e);
  return forge.ssh.publicKeyToOpenSSH(forgePublicKey);
};

export interface SettingState {
  keyPairs: KeyPair[];
}

export default new Feature({
  routes: { Sidebar, Settings, SSHKeyList, SSHKeyView },
  namespace: 'settings',
  state: {
    keyPairs: []
  },
  reducers: {
    setup(state: any, { payload }: AnyAction) {
      return { ...state, ...payload };
    },
    addKeyPair(state: SettingState, { payload }: AnyAction) {
      const { keyPairs } = state;
      return { ...state, keyPairs: [...keyPairs, payload] };
    },
    updateKeyPair(state: SettingState, { payload: { id, ...values } }: AnyAction) {
      const { keyPairs } = state;
      for (let i = 0; i < keyPairs.length; i++) {
        if (keyPairs[i].id === id) {
          keyPairs[i] = { ...keyPairs[i], ...values };
          break;
        }
      }
      return { ...state, keyPairs: [...keyPairs] };
    },
    deleteKeyPair(state: SettingState, { payload: { id } }: AnyAction) {
      const { keyPairs } = state;
      return { ...state, keyPairs: keyPairs.filter(k => k.id !== id) };
    }
  },
  effects: {
    *pasteKeyPai({ payload: { privateKey } }: any, { put, select }: any) {
      const keyPairs: KeyPair[] = yield select(({ settings: { keyPairs } }: any) => keyPairs);
      const id = uuid();
      const data: KeyPair = { id, privateKey, name: generateKeyPairName(keyPairs, 'paste') };
      yield put({ type: 'addKeyPair', payload: data });
      try {
        const publicKey = getPublicKeyOpenSSHByPrivateKey(data);
        const publicKeyFingerprint = getPublicKeyFingerprint(publicKey);
        yield put({ type: 'settings/updateKeyPair', payload: { id, privateKey, publicKey, publicKeyFingerprint } });
      } catch (err) {
        console.warn(err);
      }
    },
    *generateKeyPair(action: AnyAction, effects: any) {
      const { put, call, select } = effects;
      const keyPairs: KeyPair[] = yield select(({ settings: { keyPairs } }: any) => keyPairs);
      const id = uuid();
      yield put({ type: 'addKeyPair', payload: { id, name: generateKeyPairName(keyPairs, 'vpsnyapp') } });
      yield call(sleep, 150);
      const { privateKey, publicKey, publicKeyFingerprint } = yield call(
        () =>
          new Promise(resolve => {
            forge.pki.rsa.generateKeyPair({ bits: 1024, e: 0x10001, workers: -1 }, (err, keypair) => {
              const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
              const publicKey = forge.ssh.publicKeyToOpenSSH(keypair.publicKey);
              const publicKeyFingerprint = getPublicKeyFingerprint(publicKey);
              resolve({ privateKey, publicKey, publicKeyFingerprint });
            });
          })
      );
      yield put({ type: 'updateKeyPair', payload: { id, privateKey, publicKey, publicKeyFingerprint } });
    }
  },
  subscriptions: {}
});
