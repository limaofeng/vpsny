import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Dimensions, Text, Image, Animated, ScrollView } from 'react-native';
import { TabViewAnimated, SceneMap } from 'react-native-tab-view';

import TabBar from './TabBar';

const initialLayout = {
  height: 0,
  width: Dimensions.get('window').width
};

export default class TabView extends React.Component {
  static propTypes = {
    navigationState: PropTypes.object.isRequired,
    renderScene: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    const { navigationState } = props;
    this.state = navigationState;
  }

  _handleIndexChange = index => this.setState({ index });

  _renderHeader = props => (
    <TabBar
      {...props}
      scrollEnabled
      style={{
        backgroundColor: '#fff',
        height: 40,
        padding: 0,
        margin: 0
      }}
      getLabelText={({ route: { title } }) => title}
      tabStyle={{
        width: 80,
        padding: 0,
        margin: 0
      }}
      labelStyle={{
        fontFamily: 'Raleway',
        fontSize: 12,
        color: '#616366',
        marginVertical: 8
      }}
      activeLabelStyle={{
        color: colors.primary
      }}
      indicatorStyle={{
        backgroundColor: colors.primary
      }}
    />
  );

  render() {
    const { renderScene } = this.props;
    return (
      <TabViewAnimated
        style={styles.container}
        navigationState={this.state}
        renderScene={renderScene}
        renderHeader={this._renderHeader}
        onIndexChange={this._handleIndexChange}
        initialLayout={initialLayout}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
