import React from 'react';
import { StyleSheet } from 'react-native';

import { APIKey, User } from '../Agent';
import { AWSAPIKey, AWSRegions, AWSOptions } from '../AWSProvider';
import { Theme, List, Item, Input, Select, Label, Note, withTheme } from '@components';

interface AWSLightsailNewProps {
  theme?: Theme;
  user?: User;
  onChangeAPIKey: (apiKey?: APIKey, options?: AWSOptions) => void;
}

interface AWSLightsailNewState {
  accessKey: string;
  secretKey: string;
  defaultRegion: string;
}

class AWSLightsailNew extends React.Component<AWSLightsailNewProps, AWSLightsailNewState> {
  constructor(props: AWSLightsailNewProps) {
    super(props);
    this.state = {
      accessKey: '',
      secretKey: '',
      defaultRegion: 'us-east-1'
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
    this.setState({ defaultRegion });
  };
  handleAPIKey(accessKeyId?: string, secretAccessKey?: string) {
    const { defaultRegion } = this.state;
    const { onChangeAPIKey } = this.props;
    if (accessKeyId && secretAccessKey) {
      const apiKey: AWSAPIKey = { accessKeyId, secretAccessKey };
      onChangeAPIKey(apiKey, { defaultRegion, regions: [] });
    } else {
      onChangeAPIKey(undefined);
    }
  }
  render() {
    const { user } = this.props;
    const { accessKey, secretKey, defaultRegion } = this.state;
    const regions = Object.keys(AWSRegions).map(key => ({
      label: AWSRegions[key].name,
      value: key
    }));
    return (
      <>
        <List title="Access Key">
          <Item>
            <Input onValueChange={this.handleAccessKey} defaultValue={accessKey} />
          </Item>
        </List>
        <List title="Secret Key">
          <Item>
            <Input onValueChange={this.handleSecretKey} defaultValue={secretKey} />
          </Item>
        </List>
        <List title="Default Region">
          <Item>
            <Select
              defaultValue={regions.find(r => r.value === defaultRegion)}
              required
              hideClearButton
              onValueChange={this.handleDefaultRegion}
              items={regions}
            />
          </Item>
        </List>
        {!!user && (
          <List title="Info">
            <Item>
              <Label>Name</Label>
              <Note>{user!.name}</Note>
            </Item>
          </List>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default withTheme(AWSLightsailNew);
