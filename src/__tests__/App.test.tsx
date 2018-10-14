import 'react-native';
import React from 'react';

import renderer from 'react-test-renderer';

import App from '../App';

it('renders without crashing', () => {
  const rendered = renderer.create(<App />);
  expect(rendered).not.toBeNull();
  rendered.unmount();
});
