import { Input, Item, Label, List, Note, Theme, withTheme } from '@components';
import { ReduxState } from '@modules';
import React from 'react';
import { Alert, Dimensions, View } from 'react-native';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { setApi } from '../../..';
import SubmitButtonWrapper, { SubmitButton } from '../../../../../components/SubmitButton';
import { User, Bill } from '../../../Agent';
import { Account } from '../../../type';
import { VultrAPIKey, VultrAgent } from '@modules/cloud/providers/vultr/VultrAgent';
import { format } from '@utils';

interface VultrNewProps {
  theme?: Theme;
  user?: User;
  back: () => void;
  save: (account: Account) => void;
  find: (apiKey: string) => Account | undefined;
  dispatch: Dispatch;
}

interface VultrNewState {
  mode: 'select' | 'input';
  title: string;
  name: string;
  apiKey?: string;
  user?: User;
  bill?: Bill;
  status: 'initialize' | 'success';
}

class VultrNew extends React.Component<VultrNewProps, VultrNewState> {
  constructor(props: VultrNewProps) {
    super(props);
    this.state = {
      mode: 'select',
      title: 'Vultr',
      name: 'Default',
      status: 'initialize'
    };
  }
  submit = React.createRef<SubmitButton>();
  toggleMode = () => {
    const { mode } = this.state;
    this.setState({ mode: mode === 'select' ? 'input' : 'select' });
  };

  componentDidMount() {
    this.submit.current!.disable();
  }

  handleAPIKey = (apiKey: string) => {
    this.setState({ apiKey });
    this.handleButState(apiKey);
  };

  handleButState = (apiKey: string) => {
    if (apiKey) {
      this.submit.current!.enable();
    } else {
      this.submit.current!.disable();
    }
  };

  apiKey = (): VultrAPIKey | undefined => {
    const { apiKey } = this.state;
    if (apiKey) {
      return { apiKey };
    }
  };

  handleSave = async () => {
    const { find, back, save, dispatch } = this.props;
    if (this.state.status === 'success') {
      back();
      return;
    }
    const account = find(this.state.apiKey!);
    if (account) {
      Alert.alert('Duplicated', `This is already added as ${account.name}`);
      return;
    }
    const submit = this.submit.current!;
    try {
      submit.submittingText('Verifying API-Key');
      const apiKey = this.apiKey()!;
      const api = new VultrAgent(apiKey!);
      const user = await api.user();
      save({
        id: user.id,
        title: 'Vultr',
        apiKey: user.apiKey,
        name: user.name,
        email: user.email,
        provider: 'vultr',
        sshkeys: []
      });
      setApi(api.id, api);
      this.setState({ user });
      submit.submittingText('Pulling Bill');
      const bill = await api.bill();
      await dispatch({ type: 'cloud/bill', payload: { id: user.id, bill } });
      this.setState({ bill });
      submit.submittingText('Pulling SSH Keys');
      const sshkeys = await api.sshkeys();
      await dispatch({ type: 'cloud/sshkeys', payload: { id: user.id, sshkeys } });
      submit.submittingText('Pulling Instances');
      const instances = await api.instance.list();
      await dispatch({ type: 'cloud/instances', payload: { uid: user.id, instances } });
      this.setState({ status: 'success' });
    } catch (error) {
      this.setState({ status: 'initialize' });
      const { response } = error;
      if (response && response.status === 403) {
        throw new Error('Please enter the correct API-Key');
      } else {
        throw error;
      }
    }
  };

  render() {
    const { apiKey, user, bill } = this.state;
    return (
      <>
        <List title="API-Key">
          <Item>
            <Input testID="vultr-apikey" onValueChange={this.handleAPIKey} defaultValue={apiKey} />
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
        <View style={{ flex: 1, alignItems: 'center', marginTop: 20 }}>
          <SubmitButtonWrapper
            testID="newaccount-save"
            style={{ width: Dimensions.get('window').width - 40 }}
            ref={this.submit}
            reentrant
            onSubmit={this.handleSave}
            title="Save"
          />
        </View>
      </>
    );
  }
}

const mapStateToProps = ({ cloud: { accounts: allAccount } }: ReduxState) => {
  const accounts = allAccount.filter(data => data.provider === 'vultr');
  return {
    find: (apiKey: string) => {
      return accounts.find(account => (account.apiKey as VultrAPIKey).apiKey === apiKey);
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return { dispatch };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(VultrNew, false));
