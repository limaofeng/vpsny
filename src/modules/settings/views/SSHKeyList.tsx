import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';

import HeaderLeftClose from '../../../components/HeaderLeftClose';
import Theme, { withTheme } from '../../../components/Theme';
import { KeyPair } from '../../cloud/type';
import KeyPairNewBut from '../components/KeyPairNewBut';
import KeyPairs from '../components/KeyPairs';
import { ReduxState } from '@modules';

export type Mode = 'choose' | 'manage';

interface KeyPairListProps {
  navigation: NavigationScreenProp<any>;
  keyPairs: KeyPair[];
  theme?: Theme;
  mode: Mode;
  value: KeyPair;
  onChange: (value: KeyPair) => void;
}

interface KeyPairListState {
  value: KeyPair;
}

class KeyPairList extends React.Component<KeyPairListProps, KeyPairListState> {
  static navigationOptions = ({ navigation }: KeyPairListProps): NavigationScreenOptions => {
    const title = navigation.getParam('callback') ? 'Select key' : 'Key Pairs';
    const dangerous = navigation as any;
    const options: NavigationScreenOptions = {
      headerBackTitle: 'Back',
      headerTitle: title
    };
    if (dangerous.dangerouslyGetParent().state.routeName === 'KeyPairs') {
      options.headerLeft = (
        <HeaderLeftClose
          onPress={() => {
            navigation.pop();
          }}
        />
      );
    }
    return options;
  };

  analytics?: RNFirebase.Analytics;
  constructor(props: KeyPairListProps) {
    super(props);
    this.state = { value: props.value };
  }

  componentDidMount() {
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('KeyPairs', 'KeyPairs.tsx');
  }

  handleChange = (value: KeyPair) => {
    this.setState({ value });
    this.props.onChange(value);
  };

  handleJumpToKeyPair = ({ id }: KeyPair) => {
    const { navigation } = this.props;
    navigation.navigate('SSHKeyView', { id });
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { keyPairs, mode } = this.props;
    const { value } = this.state;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
        <ScrollView style={{ paddingTop: 13 }}>
          <KeyPairs
            mode={mode}
            value={value}
            title="Keys"
            keyPairs={keyPairs}
            onClick={this.handleJumpToKeyPair}
            onChange={this.handleChange}
          />
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={[{ color: colors.minor }, fonts.footnote]}>All keys are saved to your keychain securely.</Text>
          </View>
        </ScrollView>
        <KeyPairNewBut />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  spinner: {
    marginRight: 5
  }
});

const mapStateToProps = ({ settings: { keyPairs } }: ReduxState, { navigation }: KeyPairListProps) => {
  const choose = !!navigation.getParam('callback');
  const value: KeyPair = navigation.getParam('value');
  const mode: Mode = choose ? 'choose' : 'manage';
  return {
    keyPairs,
    value,
    mode,
    onChange: (value: KeyPair) => {
      if (!choose) {
        return;
      }
      navigation.getParam('callback')(value);
      navigation.goBack();
    }
  };
};

export default connect(mapStateToProps)(withTheme(KeyPairList, false));
