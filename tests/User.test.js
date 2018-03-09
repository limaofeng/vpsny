import React from 'react';
import { shallow } from 'enzyme';

import { configureStore, configureAppNavigator } from 'react-native-kharak';
import User from '../src/modules/user';

describe('User Enzyme Shallow', () => {
  const LoginScreen = User.routes.Login.screen;
  const appNavigator = configureAppNavigator(User.routes, { initialRouteName: 'Login' });
  const store = configureStore({ ...User.reducers, ...appNavigator.createReducer() });
  const navigation = { dispatch: store.dispatch };
  it('tests on login components', () => {
    const wrapper = shallow(<LoginScreen navigation={navigation} />);
    expect(store.getState().auth.isLoggedIn).toBe(false);
    wrapper.find('Button').simulate('press'); // ?
    expect(store.getState().auth.isLoggedIn).toBe(true);
  });
});
