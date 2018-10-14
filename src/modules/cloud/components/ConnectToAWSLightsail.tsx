import React from 'react';
import { StyleSheet } from 'react-native';

import { Input, Item, List, Select } from '../../../components';
import Theme, { withTheme } from '../../../components/Theme';
import { APIKey } from '../Agent';
import { AWSAPIKey, AWSRegions } from '../AWSProvider';

interface ConnectToAWSLightsailProps {
  theme?: Theme;
  onChangeAPIKey: (apiKey?: APIKey) => void;
}

interface ConnectToAWSLightsailState {
  accessKey?: string;
  secretKey?: string;
}

class ConnectToAWSLightsail extends React.Component<ConnectToAWSLightsailProps, ConnectToAWSLightsailState> {
  constructor(props: ConnectToAWSLightsailProps) {
    super(props);
    this.state = {
      accessKey: '',
      secretKey: ''
    };
  }
  componentDidMount() {
    setTimeout(() => {
      this.handleAPIKey(this.state.accessKey, this.state.secretKey);
    }, 1000);
  }
  handleAccessKey = (accessKey: string) => {
    this.setState({ accessKey });
    this.handleAPIKey(accessKey, this.state.secretKey);
  };
  handleSecretKey = (secretKey: string) => {
    this.setState({ secretKey });
    this.handleAPIKey(this.state.accessKey, secretKey);
  };
  handleAPIKey(accessKeyId?: string, secretAccessKey?: string) {
    const { onChangeAPIKey } = this.props;
    if (accessKeyId && secretAccessKey) {
      const apiKey: AWSAPIKey = { accessKeyId, secretAccessKey };
      onChangeAPIKey(apiKey);
    } else {
      onChangeAPIKey(undefined);
    }
  }
  render() {
    const { accessKey, secretKey } = this.state;
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
              defaultValue={regions[0]}
              required
              hideClearButton
              onValueChange={() => {}}
              items={regions}
            />
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

export default withTheme(ConnectToAWSLightsail);
