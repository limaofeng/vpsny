import { Input, Item, Label, List, Note, Theme, withTheme } from '@components';
import { Account } from '@modules/cloud/type';
import React from 'react';
import { format } from '@utils';
import { DigitalOceanAPIKey } from '@modules/cloud/providers/digitalocean/DigitalOceanAgent';

interface DigitalOceanViewProps {
  theme?: Theme;
  account: Account;
}

interface DigitalOceanViewState {
  apiKey?: string;
}

class DigitalOceanView extends React.Component<DigitalOceanViewProps, DigitalOceanViewState> {
  constructor(props: DigitalOceanViewProps) {
    super(props);
    this.state = {
      apiKey: ''
    };
  }
  render() {
    const { account } = this.props;
    const { token } = account.apiKey as DigitalOceanAPIKey;
    return (
        <>
        <List title="Personal access token">
          <Item>
            <Note>
              {token}
            </Note>
          </Item>
        </List>
        <List title="Info">
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

export default withTheme(DigitalOceanView);
