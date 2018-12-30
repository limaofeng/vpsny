import { Item, Label, List, Note, Select, Theme, withTheme } from '@components';
import { AWSAPIKey, AWSRegions } from '@modules/cloud/providers/lightsail/AWSProvider';
import { Account } from '@modules/cloud/type';
import React from 'react';

interface LightsailViewProps {
  theme?: Theme;
  account: Account;
}

interface LightsailViewState {
  accessKey: string;
  secretKey: string;
  defaultRegion: string;
}

class LightsailView extends React.Component<LightsailViewProps, LightsailViewState> {
  constructor(props: LightsailViewProps) {
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
    // this.props.update('defaultRegion', defaultRegion);
  };
  handleAPIKey(accessKeyId?: string, secretAccessKey?: string) {
    const { defaultRegion } = this.state;
  }
  handleJumpToRegions = () => {
    // const { navigation } = this.props;
    // navigation.navigate('AWSRegions', {});
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
            {accessKeyId}
          </Note>
        </Item>
      </List>
      <List title="Secret Key">
        <Item>
          <Note>
            {secretAccessKey}
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

export default withTheme(LightsailView);
