import { Icon, OperationConfirm, OperationConfirmType, Theme, withTheme } from '@components';
import React from 'react';
import { ActionSheetIOS, Alert, TouchableOpacity } from 'react-native';

import { Instance } from '../Provider';
import { CloudManager } from '../providers';
import { Dispatch } from 'redux';
import { NavigationScreenProp } from 'react-navigation';

export type OperateStatus = 'Pending' | 'Complete';

interface InstanceActionsProps {
  data: Instance;
  theme: Theme;
  dispatch: Dispatch;
  navigation: NavigationScreenProp<any>;
  onExecute: (operate: string, status: OperateStatus, data: Instance) => void;
}

class InstanceActions extends React.Component<InstanceActionsProps> {
  confirm = React.createRef<OperationConfirmType>();
  handleMoreActions = async () => {
    const { data, onExecute, theme, dispatch, navigation } = this.props;
    const provider = CloudManager.getProvider(data.provider);
    const actions = provider.actions(data, theme, dispatch, navigation);
    const options = actions.map(account => account.name);
    const index: number = await new Promise<number>(resolve => {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Instance actions',
          message: 'Actions will affect. Some are irreversible.',
          options: ['Cancel', ...options],
          destructiveButtonIndex: options.length,
          cancelButtonIndex: 0
        },
        buttonIndex => {
          resolve(buttonIndex);
        }
      );
    });
    if (!index) {
      return;
    }
    const confirm = this.confirm.current!;
    const actionName = options[index - 1];

    const action = actions.find(action => action.name === actionName)!;
    try {
      if (action.dialog) {
        const { type, title, message, ...options } = action.dialog!();
        await confirm.open(type, title, message, {
          ...options,
          onSave: async () => {
            onExecute(actionName, 'Pending', data);
            await action.execute();
            onExecute(actionName, 'Complete', data);
          }
        });
      } else {
        onExecute(actionName, 'Pending', data);
        await action.execute();
        onExecute(actionName, 'Complete', data);
      }
    } catch (e) {
      console.warn(e);
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
        <OperationConfirm ref={this.confirm} />
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

export default InstanceActions;
