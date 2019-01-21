import { Dimensions, Platform, StyleSheet, PixelRatio } from 'react-native';
import { isEqual as _isEqual, clone, uniq, zipObject } from 'lodash'; // isEqual as _isEqual,
import axios, { AxiosInstance } from 'axios';
import forge from 'node-forge';
import firebase, { RNFirebase } from 'react-native-firebase';
import * as formatUtil from './format';

export const format = formatUtil;

export * from './fonts';

export const metric = (request: AxiosInstance) => {
  request.interceptors.request.use(
    async config => {
      const metric = firebase
        .perf()
        .newHttpMetric(config.baseURL + config.url!, config.method!.toUpperCase() as RNFirebase.perf.HttpMethod);
      await metric.start();
      const store = config as any;
      store.metric = metric;
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
  request.interceptors.response.use(
    async response => {
      const store = response.config as any;
      const metric: RNFirebase.perf.HttpMetric = store.metric;
      await metric.setHttpResponseCode(response.status);
      await metric.setResponseContentType(response.headers['content-type']);
      await metric.stop();
      return response;
    },
    error => {
      return Promise.reject(error);
    }
  );
};

export const diff = (lvalue: any, rvalue: any) => {
  if (_isEqual(lvalue, rvalue)) {
    return {};
  }
  const keys = uniq(Object.keys(lvalue).concat(Object.keys(rvalue))).filter(key => !_isEqual(lvalue[key], rvalue[key]));
  const values = keys.map(key => rvalue[key]);
  return zipObject(keys, values);
};

export const debounce = (
  ovalue: any,
  { isEqual = _isEqual, onlyDiff = false, wait = 1500, callback = (data: any) => {} }
) => {
  let lvalue = clone(ovalue);
  let timer: any;
  return (value: any) => {
    clearTimeout(timer);
    if (isEqual(lvalue, value)) {
      return;
    }
    timer = setTimeout(() => {
      console.log(lvalue, value);
      const retVal = onlyDiff ? diff(lvalue, value) : value;
      console.log(`执行更新 ${JSON.stringify(retVal)}`);
      callback(retVal);
      lvalue = clone(value);
    }, wait);
  };
};

export const template = (template: string, values: { [key: string]: string }) =>
  template.replace(/\{([^\\}]+)\}/, (substring, name) => values[name]);

export const sleep = (time: number) =>
  new Promise(resolve => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      resolve();
    }, time);
  });

export function isIphoneX() {
  const dimen = Dimensions.get('window');
  return Platform.OS === 'ios' && (dimen.height === 812 || dimen.width === 812);
}

export const SafeArea = (() => {
  const data = {
    top: 0,
    bottom: 0
  };
  const dimen = Dimensions.get('window');
  const height = Math.max(dimen.width, dimen.height);
  switch (height) {
    case 812: // iPhone X or iPhone XS
      data.top = 44;
      data.bottom = 34;
      break;
    case 896: // iPhone XR or iPhone XS Max
      data.top = 44;
      data.bottom = 34;
      break;
    default:
  }
  return data;
})();

let instance: any = undefined;

export function md5(name: string, delimiter: string = ':') {
  const md5 = forge.md.md5.create();
  md5.update(name);
  return md5
    .digest()
    .toHex()
    .split('')
    .map((char, i) => ((i + 1) % 2 === 0 ? char + delimiter : char))
    .join('')
    .replace(RegExp(`${delimiter}$`), '');
}

export function getPublicKeyFingerprint(sshkey: string): string {
  const BigInteger = (forge as any).jsbn.BigInteger;
  const [type, code, comment] = sshkey.split(' ');
  const buffer = forge.util.createBuffer(forge.util.decode64(code), 'utf-8');
  // 忽略第一段 ssh-rsa
  buffer.getBytes(buffer.getInt32());
  // 还原 publicKey
  const publicKey = { e: '', n: '' };
  publicKey.e = new BigInteger(forge.util.bytesToHex(buffer.getBytes(buffer.getInt32())), 16);
  publicKey.n = new BigInteger(forge.util.bytesToHex(buffer.getBytes(buffer.getInt32())), 16);
  return forge.ssh.getPublicKeyFingerprint(publicKey, { encoding: 'hex', delimiter: ':' }) as string;
}

export function decode64(str: string) {
  return new String(forge.util.decode64(str));
}

export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const setApiKey = (apiKey: string) => {
  instance = axios.create({
    baseURL: 'https://api.vultr.com',
    headers: { 'API-Key': apiKey }
  });
};

export function throttle(func: (...args: any[]) => void, delay: number) {
  let previous = Date.now();
  return function(...args: any[]) {
    const now = Date.now();
    let timer;
    if (now - previous > delay) {
      timer = setTimeout(() => {
        func(...args);
      }, delay);
      previous = now;
    } else {
      timer && clearTimeout(timer);
    }
  };
}

export const request = {
  get(...args: any[]) {
    return instance.get(...args);
  },

  post(...args: any[]) {
    return instance.post(...args);
  }
};

export const GlobalStyle = {
  splitColor: '#e7e7e7',
  splitWidth: StyleSheet.hairlineWidth,

  deviceWidth: Dimensions.get('window').width,
  deviceHeight: Platform.OS === 'ios' ? Dimensions.get('window').height : Dimensions.get('window').height - 20,

  headerBarHeight: Platform.OS === 'ios' ? 64 : 56,
  headerBarPaddingTop: Platform.OS === 'ios' ? 20 : 0,
  padding: 14,

  textLightColor: '#999',
  textMiddleColor: '#666',
  textColor: '#333',
  primary: '#7FAAFF',

  backgroundColor: '#F7F7FA',

  // 导航栏背景色
  headerBackground: '#7faaff',
  headerBackgroundDark: '#f7f7fa',
  // button 背景色
  buttonrBackgroundColor: '#7faaff',
  // 像素密度
  pixelRatio: PixelRatio.get()
};
