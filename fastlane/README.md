fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

# Available Actions
## iOS
### ios setup_signing
```
fastlane ios setup_signing
```
获取最新的 证书 与 配置文件
### ios screenshots
```
fastlane ios screenshots
```
自动截图
### ios update_metadata
```
fastlane ios update_metadata
```

### ios test
```
fastlane ios test
```
Runs all the tests
### ios beta
```
fastlane ios beta
```
提交一个新的测试版本 Apple TestFlight
### ios release
```
fastlane ios release
```
部署一个新版本到 App Store

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
