#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNAudio, NSObject)
RCT_EXTERN_METHOD(playSystemSound: (NSInteger *)soundID)
RCT_EXTERN_METHOD(createSystemSoundID: (NSString *)url resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getSystemVolume: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end
