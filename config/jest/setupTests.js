/* eslint-env jest */
import 'react-native';
import React from 'react';
import ReactEnzymeAdapter from 'enzyme-adapter-react-16';
import Enzyme from 'enzyme';

import AsyncStorage from './AsyncStorage';

jest.mock('NativeModules', () => ({
  RNVectorIconsManager: {
    getImageForFont: jest.fn(),
    setupFontAwesome5: jest.fn(),
    loadFontWithFileName: jest.fn()
  },
  RNVectorIconsModule: {
    getImageForFont: jest.fn(),
    loadFontWithFileName: jest.fn()
  },
  SMXCrashlytics: {
    crash: jest.fn(),
    throwException: jest.fn()
  },
  RNSSH: {},
  RNAudio: {},
  RNSound: {
    IsAndroid: false,
    IsWindows: false,
    setCategory: jest.fn(),
    prepare: jest.fn()
  },
  SourceCode: {
    scriptURL: null
  },
  KeyboardObserver: {
    addListener: jest.fn(),
    removeListeners: jest.fn()
  }
}));

global.window = {};
const storage = new AsyncStorage();
jest.doMock('AsyncStorage', () => storage);

jest.mock('Linking', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  getInitialURL: jest.fn().mockImplementation((value: string) => Promise.resolve(value))
}));

jest.mock('ScrollView', () => {
  const RealComponent = require.requireActual('ScrollView');
  class ScrollView extends RealComponent {
    scrollTo = () => {};
  }
  return ScrollView;
});

const { setState } = React.Component.prototype;
Object.defineProperty(React.Component.prototype, 'setState', {
  value() {
    setImmediate((...args) => {
      setState.apply(this, args);
    });
  }
});

Enzyme.configure({ adapter: new ReactEnzymeAdapter() });
