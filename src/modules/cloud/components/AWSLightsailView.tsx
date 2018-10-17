import { Item, Label, List, Note, Select, Theme, withTheme } from '@components';
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { APIKey } from '../Agent';
import { AWSAPIKey, AWSRegions } from '../AWSProvider';
import { Account } from '../type';
import { UpdateAccount } from '../views/AccountView';

interface AWSLightsailViewProps {
  theme?: Theme;
  navigation: NavigationScreenProp<any>;
  account: Account;
  update: UpdateAccount;
  onChangeAPIKey?: (apiKey?: APIKey, options?: any) => void;
}

interface AWSLightsailViewState {
  accessKey: string;
  secretKey: string;
  defaultRegion: string;
}

class AWSLightsailView extends React.Component<AWSLightsailViewProps, AWSLightsailViewState> {
  constructor(props: AWSLightsailViewProps) {
    super(props);
    this.state = {
      accessKey: '',
      secretKey: '',
      defaultRegion: ''
    };
  }
  handleAccessKey = (accessKey: string) => {
    this.setState({ accessKey });
    this.handleAPIKey(accessKey, this.state.secretKey);
  };
  handleSecretKey = (secretKey: string) => {
    this.setState({ secretKey });
    this.handleAPIKey(this.state.accessKey, secretKey);
  };
  handleDefaultRegion = (defaultRegion: string) => {
    this.props.update('defaultRegion', defaultRegion);
  };
  handleAPIKey(accessKeyId?: string, secretAccessKey?: string) {
    const { defaultRegion } = this.state;
    const { onChangeAPIKey } = this.props;
    if (accessKeyId && secretAccessKey) {
      const apiKey: AWSAPIKey = { accessKeyId, secretAccessKey };
      onChangeAPIKey && onChangeAPIKey(apiKey, { defaultRegion });
    } else {
      onChangeAPIKey && onChangeAPIKey(undefined);
    }
  }
  handleJumpToRegions = () => {
    const { navigation } = this.props;
    navigation.navigate('AWSRegions', {});
  };
  render() {
    const { account } = this.props;
    const { accessKeyId, secretAccessKey } = account.apiKey as AWSAPIKey;
    const regions = Object.keys(AWSRegions).map(key => ({
      label: AWSRegions[key].name,
      value: key
    }));
    return (
      <>
        <List title="Access Key">
          <Item>
            <Note>
              {accessKeyId
                .split('')
                .map((v, i) => (i < accessKeyId.length - 5 ? '*' : v))
                .join('')}
            </Note>
          </Item>
        </List>
        <List title="Secret Key">
          <Item>
            <Note>
              {secretAccessKey
                .split('')
                .map((v, i) => (i < secretAccessKey.length - 8 ? '*' : v))
                .join('')}
            </Note>
          </Item>
        </List>
        <List title="Default Region">
          <Item>
            <Select
              defaultValue={regions.find(r => r.value === account.settings!.defaultRegion)}
              required
              hideClearButton
              onValueChange={this.handleDefaultRegion}
              items={regions}
            />
          </Item>
        </List>
        <List visible={false} title="Configuration Region">
          <Item onClick={this.handleJumpToRegions} push>
            <Note />
          </Item>
        </List>
        <List title="Info">
          <Item>
            <Label>Name</Label>
            <Note>{account.name}</Note>
          </Item>
        </List>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default withTheme(AWSLightsailView);
