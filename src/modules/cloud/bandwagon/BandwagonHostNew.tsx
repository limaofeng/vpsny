import { Input, Item, Label, List, Select, Theme, withTheme, Icon } from '@components';
import { AppState } from '@modules';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { APIKey } from '../Agent';
import { BandwagonHostAPIKey, BandwagonHostRestAPI } from '../agents/BandwagonHostAgent';
import { Account } from '../type';

interface BandwagonHostNewProps {
  theme?: Theme;
  accounts: Account[];
  onChangeAPIKey: (apiKey?: APIKey, options?: any) => void;
}

interface BandwagonHostNewState {
  mode: 'select' | 'input';
  account?: string;
  title: string;
  name: string;
  veid?: string;
  token?: string;
}

class BandwagonHostNew extends React.Component<BandwagonHostNewProps, BandwagonHostNewState> {
  constructor(props: BandwagonHostNewProps) {
    super(props);
    this.state = {
      mode: 'select',
      veid: '1175697',
      title: 'BandwagonHost',
      name: 'Default',
      token: 'private_LlPrdGOkfgRIvNJ3cPeolqbu'
    };
  }

  toggleMode = () => {
    const { mode } = this.state;
    this.setState({ mode: mode === 'select' ? 'input' : 'select' });
  };

  handleVeid = (veid: string) => {
    this.setState({ veid });
    this.handleChangeAPIKey(this.state.account!, { veid, token: this.state.token! });
  };

  handleToken = (token: string) => {
    this.setState({ token });
    this.handleChangeAPIKey(this.state.account!, { veid: this.state.veid!, token });
  };

  handleAccount = (account?: string) => {
    this.setState({ account });
  };

  handleChangeAPIKey = (id: string, restapi: BandwagonHostRestAPI) => {
    const { onChangeAPIKey } = this.props;
    const { title, name } = this.state;
    if (restapi.veid && restapi.token) {
      const apikey: BandwagonHostAPIKey = { id, vpses: [restapi] };
      onChangeAPIKey(apikey, {
        account: {
          id,
          title,
          name
        }
      });
    } else {
      onChangeAPIKey(undefined);
    }
  };

  render() {
    const { accounts } = this.props;
    const { token, veid, account, mode, title, name } = this.state;
    const { colors } = this.props.theme!;
    const accountItems = accounts.map(data => ({
      label: data.name,
      value: data.id
    }));
    return (
      <>
        <List visible={!!accountItems.length} title="Added to the virtual account">
          <Item visible={mode === 'select'}>
            <Select
              defaultValue={accountItems.find(r => r.value === account)}
              required
              hideClearButton
              hideIcon
              onValueChange={this.handleAccount}
              items={[{ label: 'Default', value: 'default' }]}
            />
          </Item>
          <Item visible={mode === 'input'}>
            <Label>Title</Label>
            <Input placeholder="BandwagonHost" defaultValue={title} />
          </Item>
          <Item visible={mode === 'input'}>
            <Label>Name</Label>
            <Input placeholder="Name" defaultValue={name} />
          </Item>
          <Item onClick={this.toggleMode}>
            <Label style={{ color: colors.primary }}>
              {mode === 'input' ? 'Select from existing accounts' : 'Create a new account'}
            </Label>
          </Item>
        </List>
        <List title="KiwiVM REST API">
          <Item>
            <Input placeholder="VEID" testID="bandwagonhost-veid" onValueChange={this.handleVeid} defaultValue={veid} />
          </Item>
          <Item>
            <Input
              placeholder="API Key"
              testID="bandwagonhost-apikey"
              onValueChange={this.handleToken}
              defaultValue={token}
            />
          </Item>
        </List>
      </>
    );
  }
}

const mapStateToProps = ({ cloud: { accounts } }: AppState) => {
  return {
    accounts: accounts.filter(data => data.provider === 'bandwagonhost')
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(BandwagonHostNew, false));
