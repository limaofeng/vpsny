import React from 'react';
import { TouchableOpacity, View, Text, ActionSheetIOS, StyleProp, ViewStyle } from 'react-native';

import { connect } from 'react-redux';
import Theme, { withTheme } from '../../../components/Theme';
import { Instance } from '../../cloud/Provider';
import Confirm, { OperationConfirm } from '../../../components/OperationConfirm';
import { Dispatch } from 'redux';
import { Account } from '../../cloud/type';
import { SSHClient } from '../../ssh';
import { Service, generateCommand } from '..';
import CommandUtils from '../../ssh/CommandUtils';

export type Operate = 'start' | 'stop' | 'reboot' | 'delete' | 'reinstall';
export type OperateStatus = 'start' | 'end';

interface PodActionsProps {
  node: Instance;
  app: Service;
  style: StyleProp<ViewStyle>;
  exec: (command: string) => void;
}

class PodActions extends React.Component<PodActionsProps> {
  client?: SSHClient;
  handleActions = async () => {
    const { node, app, exec } = this.props;
    const { docker } = CommandUtils;
    const options = ['Logs', 'Install', 'Start', 'Stop', 'Restart', 'Update Config', 'Uninstall'];
    const index: number = await new Promise<number>(resolve => {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Actions',
          message: `data.name`,
          options: ['Cancel', ...options],
          destructiveButtonIndex: 5,
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
    const actionName = options[index - 1];
    const client = this.client as SSHClient;
    switch (actionName) {
      case 'Logs': // Shell
        break;
      case 'Install': // Restart
        exec(
          docker.run(app.name, app.image, app.configs.ports, app.configs.envs, app.configs.links, app.configs.volumes)
        );
        // await client.execute(`docker restart ${data.name}`);
        break;
      case 'Start': // Stop
        // await client.execute(`docker stop ${data.name}`);
        break;
      case 'Stop': // Pull Image
        // await client.execute(`docker pull \`docker inspect -f '{{.Config.Image}}' ${data.name}\``);
        break;
      case 'Restart': // Delete
        // await client.execute(`docker rm -f -v ${data.name}`);
        break;
      case 'Update Config': // Delete
        // await client.execute(`docker rm -f -v ${data.name}`);
        break;
      case 'Uninstall': // Delete
        // await client.execute(`docker rm -f -v ${data.name}`);
        break;
      default:
    }
  };

  render() {
    const { children, style } = this.props;
    return (
      <TouchableOpacity
        onPress={this.handleActions}
        style={[{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', flex: 1 }, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = ({ cloud: { instances, accounts } }: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch
});

const mergeProps = ({ account, ...stateProps }: any, { dispatch, ...dispatchProps }: any, ownProps: any) => {
  const { instance } = stateProps;
  const { node } = ownProps;
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    async exec(command: string) {
      dispatch({ type: 'ssh/exec', payload: { node: node.id, command } });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(withTheme(PodActions, false));
