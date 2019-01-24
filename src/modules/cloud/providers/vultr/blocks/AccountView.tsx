import { Input, Item, Label, List, Note, Theme, withTheme } from '@components';
import { Account } from '@modules/cloud/type';
import React from 'react';
import { VultrAPIKey } from '@modules/cloud/providers/vultr/VultrAgent';
import { format } from '@utils';

interface VultrViewProps {
  theme?: Theme;
  account: Account;
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
  render() {
    const { account } = this.props;
    const { apiKey } = account.apiKey as VultrAPIKey;
    return (
        <>
        <List title="API-Key">
          <Item>
            <Note>
              {apiKey}
            </Note>
          </Item>
        </List>
        <List title="Info">
          <Item>
            <Label>Name</Label>
            <Note>{account.name}</Note>
          </Item>
          <Item>
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
      </>
    );
  }
}

export default withTheme(VultrView);
