import React from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { NavigationScreenOptions, NavigationScreenProp, SafeAreaView } from 'react-navigation';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { getApi } from '..';
import { Item, List, Note } from '../../../components';
import HeaderRight from '../../../components/HeaderRight';
import { ItemDivider, ItemGroup } from '../../../components/List';
import Theme, { withTheme } from '../../../components/Theme';
import { ImageVersion, SystemImage } from '../Provider';
import firebase, { RNFirebase } from 'react-native-firebase';
import { AppState } from '@modules';
import { IBlueprint } from '@modules/database/type';

type Mode = 'choose' | 'manage';

interface IBlueprintGroup {
  id: string;
  name: string;
  images: IBlueprint[];
}

interface ImagesProps {
  navigation: NavigationScreenProp<any>;
  images: IBlueprintGroup[];
  theme: Theme;
  mode: Mode;
  value: IBlueprint;
  refresh: () => void;
  onChange: (value: IBlueprint) => void;
}

interface ImagesState {
  value: IBlueprint;
  refreshing: boolean;
}
class Images extends React.Component<ImagesProps, ImagesState> {
  static headerRight = React.createRef<any>();
  static handleClickHeaderRight: any;
  static navigationOptions: ({ navigation }: ImagesProps) => NavigationScreenOptions = ({
    navigation
  }: ImagesProps) => {
    const title = navigation.getParam('callback') ? 'Choose an image' : 'Instance images';
    return {
      headerTitle: title,
      headerBackTitle: ' ',
      headerRight: (
        <HeaderRight
          onClick={() => {
            Images.handleClickHeaderRight();
          }}
          visible={false}
          ref={Images.headerRight}
          title="Done"
        />
      )
    };
  };
  analytics?: RNFirebase.Analytics;

  constructor(props: ImagesProps) {
    super(props);
    this.state = { value: props.value, refreshing: false };
    Images.handleClickHeaderRight = this.handleDone;
  }

  componentDidMount() {
    this.analytics = firebase.analytics();
    this.analytics.setCurrentScreen('Images', 'Images.tsx');
  }

  handleChange = (value: IBlueprint) => {
    this.setState({ value });
    if (this.props.value.id !== value.id) {
      this.handleDone(value);
    }
  };
  handleRefresh = async () => {
    const { refresh } = this.props;
    this.setState({ refreshing: true });
    await refresh();
    this.setState({ refreshing: false });
  };

  handleDone = (value?: IBlueprint) => {
    const { onChange } = this.props;
    onChange(value || this.state.value);
  };
  render() {
    const {
      images,
      theme: { colors }
    } = this.props;
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.backgroundColor }]}
        forceInset={{ bottom: 'never' }}
      >
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              tintColor={colors.minor}
            />
          }
        >
          <List type="radio-group" value={this.state.value} valueKey="id" onChange={this.handleChange}>
            {images.map(group => (
              <ItemGroup key={`image-group-${group.id}`}>
                <ItemDivider>{group.name}</ItemDivider>
                {group.images.map(image => (
                  <Item key={`image-version-${image.id}`} value={image}>
                    <Note>{image.name.replace(group.name, '')}</Note>
                  </Item>
                ))}
              </ItemGroup>
            ))}
          </List>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollAscension: {
    width: 1,
    height: 54
  }
});

const mapStateToProps = ({ database: { blueprints } }: AppState, { navigation }: any) => {
  const onChange = navigation.getParam('callback');
  const value = navigation.getParam('value');
  if (value) {
    value.key = `${value.id}-${value.version.id}`;
  }
  const mode: Mode = !!onChange ? 'choose' : 'manage';
  const images = blueprints.filter(
    blueprint => blueprint.provider === 'vultr' && blueprint.type === 'os'
  ); /** && blueprint.platform === 'LINUX_UNIX' */
  const data: IBlueprintGroup[] = [];
  images.forEach(image => {
    let group = data.find(({ id }) => id === image.family);
    if (!group) {
      group = {
        id: image.family,
        name: image.name.split(' ')[0],
        images: []
      };
      data.push(group);
    }
    group.images.push(image);
  });

  return {
    images: data,
    mode,
    value,
    onChange: (value: SystemImage) => {
      if (!onChange) {
        return;
      }
      onChange(value);
      navigation.goBack();
    }
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  const api = getApi('vultr');
  return {
    async refresh() {
      const images = await api.images();
      dispatch({ type: 'cloud/images', payload: { pid: 'vultr', images } });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(Images, false));
