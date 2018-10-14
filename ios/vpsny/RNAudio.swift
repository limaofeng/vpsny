//
//  RNAudio.swift
//  vpsny
//
//  Created by 李茂峰 on 2018/10/1.
//  Copyright © 2018 Facebook. All rights reserved.
//

import AudioToolbox
import AVFoundation
import Foundation
import Crashlytics

@objc(RNAudio)
class RNAudio: NSObject {

    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc func createSystemSoundID(_ url: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
        var soundID: SystemSoundID = 0
        let cfUrl: CFURL = CFURLCreateWithFileSystemPath(kCFAllocatorDefault, url as CFString, CFURLPathStyle.cfurlposixPathStyle, false)
        AudioServicesCreateSystemSoundID(cfUrl as CFURL, &soundID)
        resolve(soundID)
    }

    @objc func getSystemVolume(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) -> Void {
        do {
            try AVAudioSession.sharedInstance().setActive(true)
        } catch let error as NSError {
            Crashlytics.sharedInstance().recordError(error)
            reject(String(error.code), error.domain, error)
        }
        let currentVolume = AVAudioSession.sharedInstance().outputVolume
        resolve(currentVolume)
    }

    @objc func playSystemSound(_ soundID: UInt32) {
        print(soundID)
        AudioServicesPlaySystemSound(soundID)
    }
}
