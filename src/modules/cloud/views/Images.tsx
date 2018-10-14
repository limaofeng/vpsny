import React from 'react';
import { SafeAreaView, NavigationScreenProp, NavigationScreenOptions } from 'react-navigation';
import { StyleSheet, Text, View, ScrollView, SectionList, TouchableHighlight, RefreshControl } from 'react-native';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Region, SystemImage, ImageVersion } from '../Provider';
import Country from '../components/Country';
import Theme, { withTheme } from '../../../components/Theme';

import { List, Item, Label, Input, Icon, Note } from '../../../components';
import { ItemStart, ItemBody } from '../../../components/Item';
import { ItemGroup, ItemDivider } from '../../../components/List';
import HeaderRight from '../../../components/HeaderRight';
import { getApi } from '..';

type Mode = 'choose' | 'manage';

interface ImagesProps {
  navigation: NavigationScreenProp<any>;
  images: SystemImage[];
  theme: Theme;
  mode: Mode;
  value: SystemImage;
  refresh: () => void;
  onChange: (value: SystemImage) => void;
}

interface ImagesState {
  value: SystemImage;
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

  constructor(props: ImagesProps) {
    super(props);
    this.state = { value: props.value, refreshing: false };
    Images.handleClickHeaderRight = this.handleDone;
  }

  handleChange = (value: SystemImage) => {
    this.setState({ value });
    if (
      !this.props.value ||
      `${this.props.value.id}-${(this.props.value.version as ImageVersion).id}` !==
        `${value.id}-${(value.version as ImageVersion).id}`
    ) {
      Images.headerRight.current.show();
      this.handleDone(value);
    } else {
      Images.headerRight.current.hide();
    }
  };
  handleRefresh = async () => {
    const { refresh } = this.props;
    this.setState({ refreshing: true });
    await refresh();
    this.setState({ refreshing: false });
  };

  handleDone = (value?: SystemImage) => {
    const { onChange } = this.props;
    onChange(value || this.state.value);
  };
  render() {
    const {
      images,
      theme: { colors, fonts }
    } = this.props;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              tintColor={colors.minor}
            />
          }
        >
          <List type="radio-group" value={this.state.value} valueKey="key" onChange={this.handleChange}>
            {images.map(image => (
              <ItemGroup key={`image-group-${image.name}`}>
                <ItemDivider>{image.name}</ItemDivider>
                {image.versions.map(version => (
                  <Item
                    key={`image-version-${image.name}-${version.id}`}
                    value={{ ...image, version, key: `${image.id}-${version.id}` }}
                  >
                    <Note>{version.name}</Note>
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

const mapStateToProps = ({ cloud: { providers } }: any, { navigation }: any) => {
  const onChange = navigation.getParam('callback');
  const value = navigation.getParam('value');
  if (value) {
    value.key = `${value.id}-${value.version.id}`;
  }
  const mode: Mode = !!onChange ? 'choose' : 'manage';
  let images = providers.find((p: any) => p.id === 'vultr').images;
  // 剔除 非 os 与 windows 系统
  images = images.filter((i: SystemImage) => i.type === 'os').filter((i: SystemImage) => i.name !== 'Windows');
  return {
    images,
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
