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
import { SSHClient } from '../../ssh';
import { Container } from '../type';

interface DockerProps {
  client?: SSHClient;
  theme?: Theme;
}

interface DockerState {
  containers: Container[];
}

export class Docker extends React.Component<DockerProps, DockerState> {
  client?: SSHClient;
  constructor(props: DockerProps) {
    super(props);
    this.state = { containers: [] };
  }
  refresh = async (client: SSHClient) => {
    const stats =
      'docker stats --all --no-stream --format "table {{.Container}}|{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}|{{.NetIO}}"';
    const result = await client.execute(stats);
    const lines = result.split('\n');
    const containers: Container[] = lines.filter((v, index) => index !== 0 && index !== lines.length - 1).map(line => {
      const [id, name, cpu, memusage, netio] = line.split('|');
      return {
        id,
        name,
        cpu,
        mem: memusage && memusage.split('/')[0].trim(),
        net: netio && netio.split('/')[0].trim()
      };
    });
    this.setState({ containers });
    this.client = client;
  };

  handleActions = async (data: Container) => {
    const { theme } = this.props;
    // const { instantState } = this.state;
    const options = ['Shell', 'Restart', 'Stop', 'Pull Image', 'Delete'];
    const index: number = await new Promise<number>(resolve => {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Actions',
          message: data.name,
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
      case 1: // Shell
        break;
      case 2: // Restart
        await client.execute(`docker restart ${data.name}`);
        break;
      case 3: // Stop
        await client.execute(`docker stop ${data.name}`);
        break;
      case 4: // Pull Image
        await client.execute(`docker pull \`docker inspect -f '{{.Config.Image}}' ${data.name}\``);
        break;
      case 5: // Delete
        await client.execute(`docker rm -f -v ${data.name}`);
        break;
      default:
    }
  };

  render() {
    const { colors, fonts } = this.props.theme as Theme;
    const { containers } = this.state;
    return (
      <>
        <List>
          <Item>
            <Note style={{ flex: 3 }}>Docker</Note>
            <Note style={{ flex: 1 }}>CPU</Note>
            <Note style={{ flex: 1 }}>Memory</Note>
            <Note style={{ flex: 1 }}>Network</Note>
          </Item>
          {containers.map(item => (
            <Item key={item.id} value={item} bodyStyle={{ borderBottomWidth: 0 }} onClick={this.handleActions}>
              <Note style={[{ flex: 3, color: colors.secondary }, fonts.footnote]}>{item.name}</Note>
              <Note style={[{ flex: 1, color: colors.secondary }, fonts.footnote]}>{item.cpu}</Note>
              <Note style={[{ flex: 1, color: colors.secondary }, fonts.footnote]}>{item.mem}</Note>
              <Note style={[{ flex: 1, color: colors.secondary }, fonts.footnote]}>{item.net}</Note>
            </Item>
          ))}
        </List>
      </>
    );
  }
}

export default withTheme(Docker);
