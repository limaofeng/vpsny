import React from 'react';
import { ActionSheetIOS, Alert, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { getApi } from '..';
import { AppState } from '../..';
import { Icon } from '../../../components';
import Confirm, { OperationConfirm } from '../../../components/OperationConfirm';
import Theme, { withTheme } from '../../../components/Theme';
import { Instance } from '../Provider';
import { Agent } from '../Agent';

export type Operate = 'start' | 'stop' | 'reboot' | 'delete' | 'reinstall';
export type OperateStatus = 'start' | 'end';

interface InstanceActionsProps {
  data: Instance;
  theme?: Theme;
  onExecute: (operate: Operate, status: OperateStatus, data: Instance) => void;
}

class InstanceActions extends React.Component<InstanceActionsProps> {
  confirm = React.createRef<OperationConfirm>();
  api(): Agent {
    return getApi(this.props.data.account);
  }
  async get(id: string) {
    return await this.api().instance.get(id);
  }
  async start(id: string) {
    await this.api().instance.start(id);
  }
  async stop(id: string) {
    await this.api().instance.stop(id);
  }
  async restart(id: string) {
    await this.api().instance.start(id);
  }
  async destroy(id: string) {
    await this.api().instance.destroy(id);
  }
  async reinstall(id: string) {
    await this.api().instance.reinstall(id);
  }
  handleMoreActions = async () => {
    const { data, onExecute } = this.props;
    const { colors, fonts } = this.props.theme as Theme;
    const options = ['Stop', data.status === 'Running' ? 'Reboot' : 'Start'];
    if (data.provider === 'vultr') {
      options.push('Reinstall', 'Delete');
    } else if (data.provider === 'lightsail') {
      options.push('Delete');
    }
    const index: number = await new Promise<number>(resolve => {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Instance actions',
          message: 'Actions will affect. Some are irreversible.',
          options: ['Cancel', ...options],
          destructiveButtonIndex: 4,
          cancelButtonIndex: 0
        },
        buttonIndex => {
          resolve(buttonIndex);
        }
      );
    });
    const confirm = this.confirm.current as OperationConfirm;
    const additions = (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[{ color: colors.minor }, fonts.headline]}>Instance:</Text>
        <Text style={[{ color: colors.secondary, fontWeight: 'bold', marginLeft: 4 }, fonts.footnote]}>
          {data.hostname}
        </Text>
      </View>
    );
    if (!index) {
      return;
    }
    const actionName = options[index - 1];
    try {
      console.log(actionName);
      switch (actionName) {
        case 'Stop':
          {
            await confirm.info('Stop your instance?', 'Do you want to stop your instance?', {
              additions,
              okText: 'Stop Instance',
              loadingText: 'Stoping',
              onSave: async () => {
                onExecute('stop', 'start', data);
                await this.stop(data.id);
                onExecute('stop', 'end', data);
              }
            });
          }
          break;
        case 'Reboot':
          {
            await confirm.info('Reboot your instance?', 'Do you want to reboot your instance?', {
              additions,
              okText: 'Reboot',
              loadingText: 'Rebooting',
              onSave: async () => {
                onExecute('reboot', 'start', data);
                await this.restart(data.id);
                onExecute('reboot', 'end', data);
              }
            });
          }
          break;
        case 'Start':
          onExecute('start', 'start', data);
          await this.start(data.id);
          onExecute('start', 'end', data);
          break;
        case 'Reinstall':
          {
            await confirm.warn(
              'Reinstall this instance?',
              'Are you sure you want to reinstall your instance? Any data on your instance will be permanently lost!',
              {
                additions,
                okText: 'Reinstall Instance',
                loadingText: 'Reinstalling',
                onSave: async () => {
                  onExecute('reinstall', 'start', data);
                  await this.reinstall(data.id);
                  onExecute('reinstall', 'end', data);
                }
              }
            );
          }
          break;
        case 'Delete':
          {
            await confirm.warn('Destroy this instance?', 'This process will completely remove this instance.', {
              additions,
              okText: 'Destroy Instance',
              loadingText: 'Destroying',
              onSave: async () => {
                onExecute('delete', 'start', data);
                await this.destroy(data.id);
                onExecute('delete', 'end', data);
              }
            });
          }
          break;
      }
    } catch (e) {
      const { response } = e;
      if (response && response.status === 412) {
        Alert.alert(
          'Error',
          response.data,
          [
            {
              text: 'OK',
              onPress: () => {
                confirm.close();
              }
            }
          ],
          {
            cancelable: false
          }
        );
      }
    }
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;
    return (
      <>
        <Confirm ref={this.confirm} />
        <TouchableOpacity
          onPress={this.handleMoreActions}
          style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon type="Ionicons" name="md-more" color={colors.primary} size={24} />
        </TouchableOpacity>
      </>
    );
  }
}

export default withTheme(InstanceActions, false);
