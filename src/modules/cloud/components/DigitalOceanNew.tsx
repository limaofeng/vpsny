import React from 'react';
import { StyleSheet } from 'react-native';

import { Input, Item, List, Label, Note } from '../../../components';
import Theme, { withTheme } from '../../../components/Theme';
import { APIKey, User, Bill } from '../Agent';
import { DigitalOceanAPIKey } from '../agents/DigitalOceanAgent';
import { format } from '../../../utils/index';

interface DigitalOceanNewProps {
  theme?: Theme;
  user?: User;
  bill?: Bill;
  onChangeAPIKey: (apiKey?: APIKey) => void;
}

interface DigitalOceanNewState {
  token?: string;
}

class DigitalOceanNew extends React.Component<DigitalOceanNewProps, DigitalOceanNewState> {
  constructor(props: DigitalOceanNewProps) {
    super(props);
    this.state = {
      token: ''
    };
  }
  handleAPIKey = (token?: string) => {
    const { onChangeAPIKey } = this.props;
    this.setState({ token });
    if (token) {
      const vapikey: DigitalOceanAPIKey = { token };
      onChangeAPIKey(vapikey);
    } else {
      onChangeAPIKey(undefined);
    }
  };
  render() {
    const { token } = this.state;
    const { user, bill } = this.props;
    return (
      <>
        <List title="Personal access token">
          <Item>
            <Input onValueChange={this.handleAPIKey} defaultValue={token} />
          </Item>
        </List>
        {!!user && (
          <List title="Info">
            <Item>
              <Label>E-Mail</Label>
              <Note>{user!.email}</Note>
            </Item>
          </List>
        )}
        {!!bill && (
          <List title="Billing">
            <Item>
              <Label>Balance</Label>
              <Note>${format.number(bill!.balance, '0.00')}</Note>
            </Item>
            <Item>
              <Label>Charges</Label>
              <Note>${format.number(bill!.pendingCharges, '0.00')}</Note>
            </Item>
            <Item>
              <Label>Remaining</Label>
              <Note>${format.number(bill!.balance - bill!.pendingCharges, '0.00')}</Note>
            </Item>
          </List>
        )}
        {/* sshkeys || instances
        <List visible={false} title="Manage">
          <Item visible={!!sshkeys} onClick={this.handleJumpToSSHKeys} push>
            <Note style={{ flex: 1 }}>SSH Keys</Note>
            <Label style={{ flex: 0, width: 44, textAlign: 'center' }}>{sshkeys && sshkeys.length}</Label>
          </Item>
          <Item visible={!!instances} onClick={this.handleJumpToInstances} push>
            <Note style={{ flex: 1 }}>Instances</Note>
            <Label style={{ flex: 0, width: 44, textAlign: 'center' }}>{instances && instances.length}</Label>
          </Item>
        </List>
        */}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default withTheme(DigitalOceanNew);
