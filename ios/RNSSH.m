#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNSSH, NSObject) //RCT_EXTERN_MODULE将模块导出到Reac-Native
  RCT_EXTERN_METHOD(testCall)  //RCT_EXTERN_METHOD将方法导出到ReacNative
@end
