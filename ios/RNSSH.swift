//
//  RNSSH.swift
//  vpser
//
//  Created by 李茂峰 on 2018/9/26.
//  Copyright © 2018年 Facebook. All rights reserved.
//

import Foundation
import Crashlytics

@objc(RNSSH)
class RNSSH: RCTEventEmitter {
    private var clients: Dictionary<String, SSHClientProxy> = [:]

    override func supportedEvents() -> [String] {
        return ["Shell"]
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    private func clientForKey(_ key: String) throws -> SSHClientProxy {
        guard let client = clients[key] else {
            throw NSError(domain: "RNSSH", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unknown client"])
        }
        return client
    }

    @objc func link(_ host: String, port: Int, username: String, credential: NSDictionary, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        let withCredential: Credential
        if (credential.value(forKey: "type") as! String == "password") {
            let password = credential.value(forKey: "password") as! String
            withCredential = Credential(password: password)
        } else {
            let privateKey = credential.value(forKey: "privateKey") as! String
            let publicKey = credential.value(forKey: "publicKey") as! String
            let passphrase = credential.value(forKey: "passphrase") as? String
            withCredential = Credential(privateKey: privateKey, publicKey: publicKey, passphrase: passphrase)
        }
        let withKey = UUID().uuidString
        let client = SSHClientProxy(withKey, host: host, port: port, username: username, credential: withCredential)
        clients[withKey] = client
        resolve(withKey)
    }

    @objc func isConnected(_ key: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        do {
            let client = try clientForKey(key)
            resolve(client.isConnected())
        } catch let error as NSError {
            reject(String(error.code), error.domain, error)
        }
    }

    @objc func isAuthorized(_ key: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        do {
            let client = try clientForKey(key)
            resolve(client.isAuthorized())
        } catch let error as NSError {
            reject(String(error.code), error.domain, error)
        }
    }

    @objc func connect(_ key: String, timeout: Int, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        do {
            let client = try clientForKey(key)
            let isConnected = client.connect(timeout: timeout)
            if !isConnected {
                throw NSError(domain: "RNSSH", code: 1, userInfo: [NSLocalizedDescriptionKey: "Connection to host \(String(describing: client.host)) failed"])
            }
            resolve(nil)
        } catch let error as NSError {
            Crashlytics.sharedInstance().recordError(error)
            reject(String(error.code), error.domain, error)
        }

    }

    @objc func authenticate(_ key: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        do {
            let client = try clientForKey(key)
            let isAuthorized = client.authenticate()
            if !isAuthorized {
                throw NSError(domain: "RNSSH", code: 2, userInfo: [NSLocalizedDescriptionKey: "Authentication to host \(client.host) failed"])
            }
            resolve(nil)
        } catch let error as NSError {
            Crashlytics.sharedInstance().recordError(error)
            reject(String(error.code), error.domain, error)
        }
    }

    @objc func execute(_ key: String, command: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        do {
            let client = try clientForKey(key)
            resolve(try client.execute(command))
        } catch let error as NSError {
            Crashlytics.sharedInstance().recordError(error)
            reject(String(error.code), error.domain, error)
        }
    }

    @objc func startShell(_ key: String, ptyType: String?, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        do {
            let client = try clientForKey(key)
            try client.startShell(ptyType: ptyType, delegate: client.delegate(emitter: self)) //  ShellDelegate(key: key), emitter: self
            resolve(nil)
        } catch let error as NSError {
            Crashlytics.sharedInstance().recordError(error)
            reject(String(error.code), error.domain, error)
        }
    }

    @objc func writeToShell(_ key: String, command: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        do {
            let client = try clientForKey(key)
            try client.writeToShell(command)
            resolve(nil)
        } catch let error as NSError {
            Crashlytics.sharedInstance().recordError(error)
            reject(String(error.code), error.domain, error)
        }
    }

    @objc func resizeShell(_ key: String, width: Int, height: Int, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        do {
            let client = try clientForKey(key)
            resolve(client.resizeShell(width: width, height: height))
        } catch let error as NSError {
            Crashlytics.sharedInstance().recordError(error)
            reject(String(error.code), error.domain, error)
        }
    }

    @objc func closeShell(_ key: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        do {
            let client = try clientForKey(key)
            client.closeShell()
            resolve(nil)
        } catch let error as NSError {
            Crashlytics.sharedInstance().recordError(error)
            reject(String(error.code), error.domain, error)
        }
    }

    @objc func disconnect(_ key: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        defer {
            clients.removeValue(forKey: key)
        }
        do {
            let client = try clientForKey(key)
            client.disconnect()
            resolve(nil)
        } catch let error as NSError {
            Crashlytics.sharedInstance().recordError(error)
            reject(String(error.code), error.domain, error)
        }
    }

    private class SSHClientProxy: SSHClient, NMSSHChannelDelegate {
        let key: String
        var emitter: RCTEventEmitter?

        init(_ key: String, host: String, port: Int, username: String, credential: Credential) {
            self.key = key
            super.init(host: host, port: port, username: username, credential: credential)
        }

        func delegate(emitter: RCTEventEmitter) -> NMSSHChannelDelegate {
            self.emitter = emitter
            return self
        }

        func channel(_ channel: NMSSHChannel, didReadData message: String) -> Void {
            emitter!.sendEvent(withName: "Shell", body: ["key": key, "name": "Shell", "body": ["name": "message", "body": message]] as [String: Any])
        }

        func channel(_ channel: NMSSHChannel, didReadError error: String) -> Void {
            emitter!.sendEvent(withName: "Shell", body: ["key": key, "name": "Shell", "body": ["name": "error", "body": error]] as [String: Any])
        }

        func channelShellDidClose(_ channel: NMSSHChannel) -> Void {
            emitter!.sendEvent(withName: "Shell", body: ["key": key, "name": "Shell", "body": ["name": "close"]] as [String: Any])
        }

    }
}
