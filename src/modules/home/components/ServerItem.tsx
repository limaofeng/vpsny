import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, Image, TouchableHighlight } from 'react-native';

import { Icon } from '../../../components';

export const ServerStatus = ({ status }) => {
  switch (status) {
    case 'running':
      return <Image style={styles.titleStatus} source={require('../assets/Runing.png')} />;
    case 'stopped':
      return <Image style={styles.titleStatus} source={require('../assets/Stopped.png')} />;
    default:
      return <Image style={styles.titleStatus} source={require('../assets/Stopped.png')} />;
  }
};

ServerStatus.propTypes = {
  status: PropTypes.string.isRequired
};

export class ServerItem extends React.Component {
  static propTypes = {
    data: PropTypes.any.isRequired,
    onPress: PropTypes.func.isRequired
  };
  state = { waiting: false };
  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  handlePress = () => {
    const { onPress, data: { id } } = this.props;
    this.setState({ waiting: true });
    this.timer = setTimeout(() => {
      this.setState({ waiting: false });
    }, 1000);
    onPress(id);
  };
  render() {
    const { title = '名称', ram = '256', ip = '1.1.1.1', location = 'shanghai', charges = 20, os, power_status: powerStatus } = this.props.data;
    const { waiting } = this.state;
    return (
      <TouchableHighlight onPress={this.handlePress} disabled={waiting}>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <ServerStatus status={powerStatus} />
            <Text style={styles.titleLabel}>{title}</Text>
            <Icon name={'coreos'} />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>
              {ram} Server - {ip} {location}
            </Text>
            <Text style={styles.amount}>${charges}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 76,
    borderBottomColor: '#c8c7cc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.backgroundColor
  },
  titleContainer: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingLeft: 1
  },
  titleStatus: {
    marginTop: 6
  },
  titleLabel: {
    marginTop: 4,
    height: 20,
    flex: 1,
    fontSize: 17
  },
  infoContainer: {
    flexDirection: 'row',
    paddingTop: 1,
    paddingLeft: 0
  },
  infoLabel: {
    marginTop: 1,
    flex: 1,
    fontFamily: 'Raleway',
    fontSize: 12,
    letterSpacing: 0,
    color: colors.slateGreyTwo
  },
  amount: {
    fontFamily: 'Raleway',
    fontSize: 13,
    color: colors.slateGreyTwo
  },
  separator: {
    height: 1,
    shadowColor: colors.silver,
    shadowOffset: {
      width: 0
    },
    shadowRadius: 0,
    shadowOpacity: 1
  }
});
