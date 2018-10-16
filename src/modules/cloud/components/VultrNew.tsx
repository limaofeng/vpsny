import React from 'react';
import { StyleSheet } from 'react-native';

import { Input, Item, List, Label, Note } from '../../../components';
import Theme, { withTheme } from '../../../components/Theme';
import { APIKey, User, Bill } from '../Agent';
import { VultrAPIKey } from '../VultrProvider';
import { format } from '../../../utils/index';

interface VultrNewProps {
  theme?: Theme;
  user?: User;
  bill?: Bill;
  onChangeAPIKey: (apiKey?: APIKey) => void;
}

interface VultrNewState {
  apiKey?: string;
}

class VultrNew extends React.Component<VultrNewProps, VultrNewState> {
  constructor(props: VultrNewProps) {
    super(props);
    this.state = {
      apiKey: ''
    };
  }
  handleAPIKey = (apiKey?: string) => {
    const { onChangeAPIKey } = this.props;
    this.setState({ apiKey });
    if (apiKey) {
      const vapikey: VultrAPIKey = { apiKey };
      onChangeAPIKey(vapikey);
    } else {
      onChangeAPIKey(undefined);
    }
  }
  render() {
    const { apiKey } = this.state;
    const { user, bill } = this.props;
    return (
      <>
        <List title="API-Key">
          <Item>
            <Input onValueChange={this.handleAPIKey} defaultValue={apiKey} />
          </Item>
        </List>
        {!!user && (
          <List title="Info">
            <Item>
              <Label>Name</Label>
              <Note>{user!.name}</Note>
            </Item>
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

export default withTheme(VultrNew);
