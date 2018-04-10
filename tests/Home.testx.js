import React from 'react';
import { shallow } from 'enzyme';

import { configureStore } from 'react-native-kharak';
import Home from '../src/modules/home';

describe('Home Enzyme Shallow', () => {
  it(' tests on counter components', () => {
    const CounterScreen = Home.routes.Counter.screen;
    const store = configureStore(Home.reducers);
    store.dispatch({ type: 'count/add' }); // ?
    const wrapper = shallow(<CounterScreen />, { context: { store } });
    expect(wrapper.dive().find('View')).toHaveLength(1);
    expect(wrapper.dive().find('Text')).toHaveLength(3);
    const board = wrapper
      .dive()
      .find('Text')
      .at(0)
      .dive();
    const buttons = wrapper.dive().find('TouchableHighlight');
    expect(board.text()).toEqual('Count: 1');
    buttons.at(0).simulate('press');
    expect(store.getState().count).toEqual(2);
    buttons.at(1).simulate('press');
  });
});
