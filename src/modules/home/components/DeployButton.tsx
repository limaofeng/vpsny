import React from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, TouchableHighlight } from 'react-native';
import { NavigationActions } from 'react-navigation';

import { Icon } from '../../../utils/fonts';

class DeployButton extends React.Component<DeployButtonProps> {
  state = { waiting: false };
  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  handlePress = () => {
    const { deploy } = this.props;
    this.setState({ waiting: true });
    this.timer = setTimeout(() => {
      this.setState({ waiting: false });
    }, 1000);
    deploy();
  };
  render() {
    const { waiting } = this.state;
    return (
      <TouchableHighlight onPress={this.handlePress} disabled={waiting}>
        <View style={styles.container}>
          <View style={styles.background} />
          <Icon name="deploy" size={44} color={colors.primary} />
        </View>
      </TouchableHighlight>
    );
  }
}

interface DeployButtonProps {
  deploy: () => void;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 6,
    right: 16,
    shadowColor: '#9b9b9b',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 5,
    shadowOpacity: 1
  },
  background: {
    top: 9,
    left: 9,
    backgroundColor: colors.backgroundColor,
    position: 'absolute',
    width: 25,
    height: 25
  }
});

const mapStateToProps = state => ({
  isLoggedIn: state.auth.isLoggedIn
});

const mapDispatchToProps = dispatch => ({
  deploy: () => {
    dispatch(NavigationActions.navigate({ routeName: 'Deploy' }));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(DeployButton);
