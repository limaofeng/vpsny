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
### ios build
```
fastlane ios build
```
编译
### ios beta
```
fastlane ios beta
```
提交一个新的测试版本 Apple TestFlight
### ios screenshot
```
fastlane ios screenshot
```
自动截图
### ios release
```
fastlane ios release
```
部署一个新版本到 App Store
### ios test
```
fastlane ios test
```
Runs all the tests

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
