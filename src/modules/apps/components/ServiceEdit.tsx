{/* <KeyboardAwareScrollView>
          <List style={{ marginTop: 13 }} key="input-image">
            <Item>
              <Input defaultValue={name} placeholder="Name" />
            </Item>
            <Item>
              <Icon name="docker" color="#4180EE" size={22} />
              <ItemBody>
                <DockerImageInput defaultValue={image} onValueChange={this.handleImageChange} />
              </ItemBody>
            </Item>
          </List>
          <MultiInput
            ref={this.ports}
            title="Ports"
            values={ports}
            onValueChange={this.handleProts}
            renderItem={(data: Port, { handleRemove, handleValueChange }) => {
              return (
                <Item>
                  <ItemBody>
                    <TextInput
                      defaultValue={String(data.public)}
                      onChangeText={handleValueChange('public')}
                      keyboardType="number-pad"
                      style={{ fontSize: 13, flex: 3 }}
                      placeholder="public host port"
                    />
                    <View style={{ height: 24, width: 24, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon type="FontAwesome" size={18} name="angle-right" color="#828282" />
                    </View>
                    <TextInput
                      defaultValue={String(data.private)}
                      onChangeText={handleValueChange('private')}
                      style={{ fontSize: 13, flex: 1 }}
                      placeholder="8080"
                    />
                    <Select
                      defaultValue={{
                        label: 'TCP',
                        value: data.protocol
                      }}
                      required
                      style={{
                        viewContainer: { width: 70, flex: 0 }
                      }}
                      hideIcon
                      hideClearButton
                      onValueChange={handleValueChange('protocol')}
                      items={[
                        {
                          label: 'TCP',
                          value: 'tcp'
                        },
                        { label: 'UDP', value: 'udp' }
                      ]}
                    />
                    <TouchableOpacity
                      onPress={handleRemove}
                      style={{ height: 24, width: 44, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Icon type="Ionicons" name="ios-remove" color="#E74628" size={20} />
                    </TouchableOpacity>
                  </ItemBody>
                </Item>
              );
            }}
          />
          <MultiInput
            ref={this.links}
            title="Links"
            values={[{}]}
            onValueChange={this.handleLinks}
            renderItem={(data: any, { handleRemove, handleValueChange }) => {
              return (
                <Item>
                  <ItemBody>
                    <Stretch
                      disableSlider
                      onRemove={handleRemove}
                      left={
                        <Select
                          placeholder={{
                            label: 'Choose Alias container',
                            value: ''
                          }}
                          hideIcon
                          onValueChange={handleValueChange('service')}
                          items={[
                            {
                              label: 'TCP',
                              value: 'tcp'
                            },
                            { label: 'UDP', value: 'udp' }
                          ]}
                        />
                      }
                      separator={<Icon type="FontAwesome" size={18} name="angle-right" color="#828282" />}
                      right={
                        <TextInput
                          onChangeText={handleValueChange('alias')}
                          style={{ fontSize: 13, flex: 2.3 }}
                          placeholder="Alias"
                          clearButtonMode="while-editing"
                        />
                      }
                    />
                  </ItemBody>
                </Item>
              );
            }}
          />
          <List style={{ marginTop: 15, marginBottom: 0 }}>
            <Item>
              <Icon type="MaterialIcons" name="playlist-add" color="#4180EE" size={20} />
              <ItemBody>
                <DockerToolbar tools={ServiceNew.tools} onClick={this.handleToolClick} />
              </ItemBody>
            </Item>
          </List>

          <List title="Command" visible={tool === 'Command'}>
            <Item>
              <Label>Command</Label>
              <Input placeholder="e.g. /usr/bin/nginx -t -c /mynginx.conf" />
            </Item>
            <Item>
              <Label>Entry Point</Label>
              <Input placeholder="e.g. /bin/sh -c" />
            </Item>
            <Item>
              <Label>Working Dir</Label>
              <Input placeholder="e.g. /myapp" />
            </Item>
          </List>
          <MultiInput
            ref={this.envs}
            visible={tool === 'Env'}
            title="Envs"
            values={[{}]}
            onValueChange={this.handleEnvs}
            renderItem={(data: any, { handleRemove, handleValueChange }) => {
              return (
                <Item>
                  <ItemBody>
                    <Stretch
                      onRemove={handleRemove}
                      left={
                        <TextInput
                          onChangeText={handleValueChange('key')}
                          style={[{ fontSize: 13 }]}
                          clearButtonMode="while-editing"
                          placeholder="MYSQL_ROOT_PASSWORD"
                        />
                      }
                      separator={<Text style={{ color: '#828282', fontSize: 20 }}>=</Text>}
                      right={
                        <TextInput
                          onChangeText={handleValueChange('value')}
                          style={[{ fontSize: 13 }]}
                          clearButtonMode="while-editing"
                          placeholder="数据库URL"
                        />
                      }
                    />
                  </ItemBody>
                </Item>
              );
            }}
          />
          <MultiInput
            ref={this.volumes}
            visible={tool === 'Volumes'}
            title="Volumes"
            values={[{}]}
            onValueChange={this.handleVolumes}
            renderItem={(data: any, { handleRemove, handleValueChange }) => {
              return (
                <Item>
                  <ItemBody>
                    <Stretch
                      left={
                        <TextInput
                          onChangeText={handleValueChange('local')}
                          style={{ fontSize: 13 }}
                          clearButtonMode="while-editing"
                          placeholder="/path/on/host"
                        />
                      }
                      separator={<Icon type="FontAwesome" size={18} name="angle-right" color="#828282" />}
                      right={
                        <TextInput
                          onChangeText={handleValueChange('dest')}
                          style={{ fontSize: 13 }}
                          clearButtonMode="while-editing"
                          placeholder="/path/in/container"
                        />
                      }
                      onRemove={handleRemove}
                    />
                  </ItemBody>
                </Item>
              );
            }}
          />
          {false && (
            <View
              key="toggle-view"
              style={{
                height: 40,
                position: 'absolute',
                paddingVertical: 8,
                top: 13 + 32 + 40,
                zIndex: 150,
                right: 5
              }}
            >
              <TouchableOpacity
                onPress={this.handleMagic}
                style={{
                  width: 24,
                  height: 24,
                  marginRight: 10,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {step === 1 ? (
                  <Icon type="FontAwesome5" name="staylinked" color="#4180EE" size={18} />
                ) : (
                  <Icon type="Ionicons" name="ios-arrow-back" color="#4180EE" size={18} />
                )}
              </TouchableOpacity>
            </View>
          )}
          {this.renderNginxOptions()}
          <List title="Hosts">
            {instances.map(({ id, label }) => (
              <Item key={`hosts-${id}`}>
                <ItemBody>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: '#828282'
                    }}
                  >
                    {label}
                  </Text>
                  <Switch
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginRight: 10 }}
                    value={nodes.some(node => node === id)}
                    onValueChange={this.handleNodeChange(id)}
                    tintColor="#4180EE"
                    onTintColor="#4180EE"
                  />
                </ItemBody>
              </Item>
            ))}
          </List>
        </KeyboardAwareScrollView>
        <BottomRegion>
          <SubmitButton
            style={{ width: Dimensions.get('window').width - 40 }}
            doneText="Done"
            onSubmit={this.handleSubmit}
            title={'Save'}
            submittingText="Saveing"
          />
        </BottomRegion> */}