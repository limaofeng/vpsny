import { Theme, withTheme, List, Item, Note, HeaderRight } from '@components';
import { getApi } from '@modules/cloud';
import { Instance } from '@modules/cloud/Provider';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Alert } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ReduxState } from '@modules';
import BandwagonHostAgent from '@modules/cloud/agents/BandwagonHostAgent';
import Message from '../../../../../utils/Message';

interface ReinstallProps {
  navigation: NavigationScreenProp<any>;
  refresh: () => Promise<any>;
  reinstall: (os: string) => Promise<any>;
  instance: Instance;
  theme: Theme;
}

interface ReinstallState {
  refreshing: boolean;
  value: string;
  initialValue: string;
  images: any[];
}

class Reinstall extends React.Component<ReinstallProps, ReinstallState> {
  static headerRight = React.createRef<any>();
  static handleClickHeaderRight: any;
  static navigationOptions: NavigationScreenOptions = {
    title: 'Install new OS',
    tabBarLabel: 'Reinstall',
    headerBackTitle: ' ',
    headerRight: (
      <HeaderRight
        onClick={() => {
          Reinstall.handleClickHeaderRight();
        }}
        visible={false}
        title="Switch"
        ref={Reinstall.headerRight}
      />
    )
  };
  analytics?: RNFirebase.Analytics;
  constructor(props: ReinstallProps) {
    super(props);
    this.state = {
      refreshing: false,
      value: '',
      initialValue: '',
      images: []
    };
    Reinstall.handleClickHeaderRight = this.handleReinstall;
  }

  componentDidMount() {
    this.handleRefresh();
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('BWG/Reinstall', 'BWG/Reinstall.tsx');
  }

  handleRefresh = async () => {
    const { refresh } = this.props;
    try {
      this.setState({ refreshing: true });
      const { value, images } = await refresh();
      this.setState({ images, value: value.name, initialValue: value.name, refreshing: false });
    } catch (e) {
      this.setState({ refreshing: false });
    }
  };

  handleReinstall = async () => {
    const { reinstall } = this.props;
    const { value } = this.state;
    Alert.alert(
      'Install new OS ?',
      `all existing data on VPS will be lost.`,
      [
        { text: 'Cancel' },
        {
          text: 'I agree',
          onPress: async () => {
            const email = await await reinstall(value);
            Message.info(
              `Install new OS in progress`,
              `Once completed, an email notification will be sent to the following address: ${email}.`
            );
          }
        }
      ],
      {
        cancelable: false
      }
    );
  };

  handleChange = async (value: any) => {
    const { initialValue } = this.state;
    this.setState({ value });
    if (initialValue === value) {
      Reinstall.headerRight.current!.hide();
    } else {
      Reinstall.headerRight.current!.show();
    }
  };

  render() {
    const { colors } = this.props.theme as Theme;
    const { refreshing, images, value } = this.state;
    return (
      <SafeAreaView style={styles.container} forceInset={{ bottom: 'never' }}>
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={this.handleRefresh} tintColor={colors.minor} />
          }
        >
          <List type="radio-group" value={value} isEqual={(l, r) => l === r} onChange={this.handleChange}>
            {images.map(image => (
              <Item key={image.name} value={image.name}>
                <Note>{image.name}</Note>
              </Item>
            ))}
          </List>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F1F2'
  }
});

const mapStateToProps = (state: ReduxState, { navigation }: ReinstallProps) => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch, { navigation }: ReinstallProps) => {
  const value = navigation.getParam('value') as Instance;
  const api = getApi(value.account) as BandwagonHostAgent;
  return {
    async refresh() {
      const data = await api.instance.getAvailableOS(value.id);
      const images = data.templates.map((name: string) => ({ name }));
      return { images, value: images.find((image: any) => image.name === data.installed) };
    },
    async reinstall(os: string) {
      await api.instance.reinstall(value.id, os);
    },
    instance: value
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Reinstall, false));
