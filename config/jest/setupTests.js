/* eslint-env jest */
import 'react-native';
import React from 'react';
import ReactEnzymeAdapter from 'enzyme-adapter-react-16';
import Enzyme from 'enzyme';

import AsyncStorage from './AsyncStorage';

jest.mock('NativeModules', () => ({
  RNVectorIconsManager: {
    getImageForFont: jest.fn(),
    loadFontWithFileName: jest.fn()
  },
  RNVectorIconsModule: {
    getImageForFont: jest.fn(),
    loadFontWithFileName: jest.fn()
  },
  SourceCode: {
    scriptURL: null
  },
  KeyboardObserver: {
    addListener: jest.fn(),
    removeListeners: jest.fn()
  }
}));

const storage = new AsyncStorage();
jest.doMock('AsyncStorage', () => storage);

jest.mock('Linking', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  getInitialURL: jest.fn().mockImplementation(value => Promise.resolve(value))
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

Date.now = jest.fn(() => 0);

Enzyme.configure({ adapter: new ReactEnzymeAdapter() });

// Mocking the global.fetch included in React Native
global.fetch = jest.fn();

fetch.mockResponseSuccess = body => {
  fetch.mockImplementationOnce(() => Promise.resolve({ json: () => Promise.resolve(JSON.parse(body)) }));
};

fetch.mockResponseFailure = error => {
  fetch.mockImplementationOnce(() => Promise.reject(error));
};
