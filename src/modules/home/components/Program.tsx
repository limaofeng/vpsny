import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Animated,
  ActionSheetIOS
} from 'react-native';
import { List, Item, Note, ItemStart, ItemBody, Svg, Icon, Label } from '../../../components';

import Theme, { withTheme } from '../../../components/Theme';
import { Container, Process } from '../type';
import { format } from '../../../utils';
import { SSHClient } from '../../ssh/SSHClient';

interface ProgramProps {
  client?: SSHClient;
  theme?: Theme;
}

interface ProgramState {
  processes: any[];
}

export class Program extends React.Component<ProgramProps, ProgramState> {
  client?: SSHClient;
  constructor(props: ProgramProps) {
    super(props);
    this.state = { processes: [] };
  }
  refresh = async (client: SSHClient) => {
    const command = 'ps aux';
    const result = await client.execute(command);
    const lines = result.split('\n');
    const processes: Process[] = lines.filter((v, index) => index !== 0 && index !== lines.length - 1).map(line => {
      const [user, id, cpu, mem, vsz, rss, tty, stat, start, time, ...command] = line
        .split(' ')
        .filter(item => !!item.trim());
      return {
        user,
        id,
        cpu,
        mem,
        vsz: parseInt(vsz),
        rss: parseInt(rss),
        tty,
        stat,
        start,
        time,
        command: command.join(' ')
      };
    });
    // const containers: Container[] = lines.filter((v, index) => index !== 0 && index !== lines.length - 1).map(line => {
    //   const [id, name, cpu, memusage, netio] = line.split('|');
    //   return {
    //     id,
    //     name,
    //     cpu,
    //     mem: memusage && memusage.split('/')[0].trim(),
    //     net: netio && netio.split('/')[0].trim()
    //   };
    // });
    this.setState({
      processes: processes
        .filter(item => item.command != command && item.vsz && item.rss)
        .sort((l, r) => (l.rss < r.rss ? 1 : -1))
    });
    this.client = client;
  };

  handleActions = async (data: Process) => {
    const { theme } = this.props;
    // const { instantState } = this.state;
    const options = ['Quit', 'Force Quit', 'SIGHUP'];
    const index: number = await new Promise<number>(resolve => {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Process Actions',
          message: `PID ${data.command}`,
          options: ['Cancel', ...options],
          destructiveButtonIndex: 5,
          cancelButtonIndex: 0
        },
        buttonIndex => {
          resolve(buttonIndex);
        }
      );
    });
    const client = this.client as SSHClient;
    switch (index) {
      case 1: // Quit
        await client.execute(`kill -15 ${data.id}`);
        break;
      case 2: // Force Quit
        await client.execute(`kill -9 ${data.id}`);
        break;
      case 3: // SIGHUP
        await client.execute(`Program -HUP ${data.id}`);
        break;
      default:
    }
    this.refresh(this.client as SSHClient);
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { processes } = this.state;
    return (
      <>
        <List>
          <Item>
            <Note style={{ flex: 3 }}>Process</Note>
            <Note style={{ flex: 1 }}>CPU</Note>
            <Note style={{ flex: 1 }}>Memory</Note>
          </Item>
          {processes.map(item => (
            <Item key={`pid-${item.id}`} value={item} bodyStyle={{ borderBottomWidth: 0 }} onClick={this.handleActions}>
              <Note style={[{ flex: 3, color: colors.secondary }, fonts.footnote]} numberOfLines={1}>
                {item.command}
              </Note>
              <Note style={[{ flex: 1, color: colors.secondary }, fonts.footnote]}>{item.cpu}%</Note>
              <Note style={[{ flex: 1, color: colors.secondary }, fonts.footnote]}>
                {format.fileSize(item.rss, 'KB')}
              </Note>
            </Item>
          ))}
        </List>
      </>
    );
  }
}

export default withTheme(Program);
