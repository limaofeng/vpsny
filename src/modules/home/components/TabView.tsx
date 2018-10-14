import React from 'react';
import PropTypes from 'prop-types';
import { View, ScrollView, Text, StyleSheet } from 'react-native';

export default class TabView extends React.Component {
  static propTypes = {
    routes: PropTypes.arrayOf(PropTypes.any).isRequired,
    index: PropTypes.number,
    children: PropTypes.any.isRequired,
    onChange: PropTypes.func
  };
  static defaultProps = {
    index: 0,
    onChange: () => {}
  };
  constructor(props) {
    super(props);
    const { routes, index } = props;
    this.state = { routes, index };
    this.tabs = [];
  }
  handleChange = index => () => {
    const { routes, onChange } = this.props;
    this.setState({ index });
    this.rootView.measure((...args) => {
      console.log('layout', args);
    });
    onChange(routes[index]);
  };

  render() {
    const { children } = this.props;
    const { routes, index } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: 40,
            borderBottomColor: '#c8c7cc',
            borderBottomWidth: StyleSheet.hairlineWidth
          }}
          ref={el => {
            this.rootView = el;
          }}
        >
          <ScrollView
            style={{ paddingLeft: 30, flexDirection: 'row' }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {routes.map(({ key, title }, i) => (
              <Text
                key={key}
                ref={tab => {
                  this.tabs[i] = tab;
                }}
                onPress={this.handleChange(i)}
                style={[
                  {
                    paddingRight: 8,
                    paddingVertical: 12.5,
                    fontFamily: 'Raleway',
                    color: colors.primary,
                    fontSize: 12
                  },
                  i !== index && {
                    color: '#616366'
                  }
                ]}
              >
                {title}
              </Text>
            ))}
            <View style={{ height: 1, width: 30 }} />
          </ScrollView>
        </View>
        {children}
      </View>
    );
  }
}
