import { CloudManager } from '@modules/cloud/providers';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { Grid, LineChart, XAxis, YAxis } from 'react-native-svg-charts';
import { NavigationScreenProp } from 'react-navigation';

import { Item, List, Note } from '../../../components';
import Theme, { withTheme } from '../../../components/Theme';
import { Instance } from '../../cloud/type';

interface OverviewProps {
  tabLabel: string;
  navigation: NavigationScreenProp<any>;
  data: Instance;
  theme?: Theme;
}

class Overview extends React.Component<OverviewProps> {
  state = {
    visible: false
  };
  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { data, navigation } = this.props;

    const chartData = [50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80];

    const axesSvg = { fontSize: 10, fill: 'grey' };
    const verticalContentInset = { top: 10, bottom: 10 };
    const xAxisHeight = 30;

    // const data = [50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80];

    const Gradient = () => (
      <Defs key={'gradient'}>
        <LinearGradient id={'gradient'} x1={'0'} y={'0%'} x2={'100%'} y2={'0%'}>
          <Stop offset={'0%'} stopColor={'rgb(134, 65, 244)'} />
          <Stop offset={'100%'} stopColor={'rgb(66, 194, 244)'} />
        </LinearGradient>
      </Defs>
    );
    // onScroll={this.props.onScroll}
    const provider = CloudManager.getProvider(data.provider);

    const ServerView = provider.getComponent('ServerView');
    return (
      <>
        <Modal
          style={styles.layout}
          onBackdropPress={() => {
            this.setState({ visible: false });
          }}
          backdropOpacity={0.2}
          isVisible={false}
        >
          <View style={[styles.container, { backgroundColor: colors.backgroundColorDeeper }]}>
            <List>
              <Item size={200}>
                <View style={{ height: 200, width: 300, padding: 20, flexDirection: 'row' }}>
                  <YAxis
                    data={chartData}
                    style={{ marginBottom: xAxisHeight }}
                    contentInset={verticalContentInset}
                    svg={axesSvg}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <LineChart
                      style={{ height: 150 }}
                      animate
                      data={[50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80]}
                      contentInset={{ top: 20, bottom: 20 }}
                      // curve={ shape.curveNatural }
                      svg={{
                        strokeWidth: 2,
                        stroke: 'url(#gradient)'
                      }}
                    >
                      <Grid />
                      <Gradient />
                    </LineChart>
                    <XAxis
                      style={{ marginHorizontal: -10, height: xAxisHeight }}
                      data={chartData}
                      formatLabel={(value, index) => index}
                      contentInset={{ left: 10, right: 10 }}
                      svg={axesSvg}
                    />
                  </View>
                </View>
              </Item>
            </List>
          </View>
        </Modal>
        <View style={{ marginTop: 10 }} />
        <ServerView theme={this.props.theme} data={data} navigation={navigation} />
      </>
    );
  }
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 80
  },
  container: {
    width: 320,
    borderRadius: 10,
    padding: 10
  }
});

export default withTheme(Overview);
