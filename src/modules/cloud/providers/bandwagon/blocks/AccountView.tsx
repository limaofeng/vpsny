import { Item, ItemDivider, Label, List, Note, Theme, withTheme } from '@components';
import { BandwagonHostAPIKey } from '@modules/cloud/agents/BandwagonHostAgent';
import { Account } from '@modules/cloud/type';
import React from 'react';

interface BandwagonHostViewProps {
  theme?: Theme;
  account: Account;
}

interface BandwagonHostViewState {
  apiKey?: string;
}

class BandwagonHostView extends React.Component<BandwagonHostViewProps, BandwagonHostViewState> {
  constructor(props: BandwagonHostViewProps) {
    super(props);
    this.state = {
      apiKey: ''
    };
  }
  render() {
    const { account } = this.props;
    const apiKey = account.apiKey as BandwagonHostAPIKey;
    return (
      <>
        <List title="Info">
          <Item>
            <Label>E-Mail</Label>
            <Note>{account.email}</Note>
          </Item>
        </List>
        <ItemDivider title="API-Key"/>
        {apiKey.vpses.map(data => (
          <List>
            <Item>
              <Label>VEID</Label>
              <Note>{data.veid}</Note>
            </Item>
            <Item>
              <Label>Key</Label>
              <Note>{data.token}</Note>
            </Item>
          </List>
        ))}
      </>
    );
  }
}

export default withTheme(BandwagonHostView);
