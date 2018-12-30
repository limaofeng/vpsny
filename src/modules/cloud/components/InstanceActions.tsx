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
    const confirm = this.confirm.current!;
    if (!index) {
      return;
    }
    const actionName = options[index - 1];

    const action = actions.find(action => action.name === actionName)!;
    try {
      if (action.dialog!) {
        const { type, title, message, ...options } = action.dialog!();
        await confirm.open(type, title, message, {
          ...options,
          onSave: async () => {
            onExecute(actionName, 'Pending', data);
            await action.execute();
            onExecute(actionName, 'Complete', data);
          }
        });
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
    // try {
    //   console.log(actionName);
    //   switch (actionName) {
    //     case 'Stop':
    //       {
    //         await confirm.info('Stop your instance?', 'Do you want to stop your instance?', {
    //           additions,
    //           okText: 'Stop Instance',
    //           loadingText: 'Stoping',
    //           onSave: async () => {
    //             onExecute('stop', 'start', data);
    //             await this.stop(data.id);
    //             onExecute('stop', 'end', data);
    //           }
    //         });
    //       }
    //       break;
    //     case 'Reboot':
    //       {
    //         await confirm.info('Reboot your instance?', 'Do you want to reboot your instance?', {
    //           additions,
    //           okText: 'Reboot',
    //           loadingText: 'Rebooting',
    //           onSave: async () => {
    //             onExecute('reboot', 'start', data);
    //             await this.restart(data.id);
    //             onExecute('reboot', 'end', data);
    //           }
    //         });
    //       }
    //       break;
    //     case 'Start':
    //       onExecute('start', 'start', data);
    //       await this.start(data.id);
    //       onExecute('start', 'end', data);
    //       break;
    //     case 'Reinstall':
    //       {
    //         await confirm.warn(
    //           'Reinstall this instance?',
    //           'Are you sure you want to reinstall your instance? Any data on your instance will be permanently lost!',
    //           {
    //             additions,
    //             okText: 'Reinstall Instance',
    //             loadingText: 'Reinstalling',
    //             onSave: async () => {
    //               onExecute('reinstall', 'start', data);
    //               await this.reinstall(data.id);
    //               onExecute('reinstall', 'end', data);
    //             }
    //           }
    //         );
    //       }
    //       break;
    //     case 'Delete':
    //       {
    //         await confirm.warn('Destroy this instance?', 'This process will completely remove this instance.', {
    //           additions,
    //           okText: 'Destroy Instance',
    //           loadingText: 'Destroying',
    //           onSave: async () => {
    //             onExecute('delete', 'start', data);
    //             await this.destroy(data.id);
    //             onExecute('delete', 'end', data);
    //           }
    //         });
    //       }
    //       break;
    //   }
    // } catch (e) {
    //   const { response } = e;
    //   if (response && response.status === 412) {
    //     Alert.alert(
    //       'Error',
    //       response.data,
    //       [
    //         {
    //           text: 'OK',
    //           onPress: () => {
    //             confirm.close();
    //           }
    //         }
    //       ],
    //       {
    //         cancelable: false
    //       }
    //     );
    //   }
    // }
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
