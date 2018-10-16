import { Input, Item, Label, List, Note, Theme, withTheme, Password } from '@components';
import { format } from '@utils';
import React from 'react';
import { StyleSheet } from 'react-native';

import { APIKey } from '../Agent';
import { Account } from '../type';
import { VultrAPIKey } from '../VultrProvider';

interface VultrViewProps {
  theme?: Theme;
  account: Account;
  onChangeAPIKey?: (apiKey?: APIKey) => void;
}

interface VultrViewState {
  apiKey?: string;
}

class VultrView extends React.Component<VultrViewProps, VultrViewState> {
  constructor(props: VultrViewProps) {
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
      onChangeAPIKey && onChangeAPIKey(vapikey);
    } else {
      onChangeAPIKey && onChangeAPIKey(undefined);
    }
  };
  render() {
    const { account } = this.props;
    const { apiKey } = account.apiKey as VultrAPIKey;
    return (
      <>
        <List title="API-Key">
          <Item>
            <Note>
              {apiKey
                .split('')
                .map((v, i) => (i < apiKey.length - 5 ? '*' : v))
                .join('')}
            </Note>
          </Item>
        </List>
        <List title="Info">
          <Item>
            <Label>Name</Label>
            <Note>{account.name}</Note>
          </Item>
          <Item visible={account.provider === 'vultr'}>
            <Label>E-Mail</Label>
            <Note>{account.email}</Note>
          </Item>
        </List>
        <List title="Billing">
          <Item>
            <Label>Balance</Label>
            <Note>${format.number(account.bill!.balance, '0.00')}</Note>
          </Item>
          <Item>
            <Label>This Month</Label>
            <Note>${format.number(account.bill!.pendingCharges, '0.00')}</Note>
          </Item>
          <Item>
            <Label>Remaining</Label>
            <Note>${format.number(account.bill!.balance - account.bill!.pendingCharges, '0.00')}</Note>
          </Item>
        </List>
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

export default withTheme(VultrView);
