//
//  SSHClient.swift
//  vpser
//
//  Created by 李茂峰 on 2018/10/2.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation

enum CertificationType {
    case password
    case key
}

struct Credential {
    var type: CertificationType
    var password: String? = nil
    var privateKey: String? = nil
    var publicKey: String? = nil
    var passphrase: String? = nil


    init(password: String) {
        self.type = CertificationType.password
        self.password = password
    }

    init(privateKey: String, publicKey: String, passphrase: String?) {
        self.type = CertificationType.key
        self.privateKey = privateKey
        self.publicKey = publicKey
        self.passphrase = passphrase
    }
}

class SSHClient: NSObject {
    let host: String
    let port: Int
    let username: String
    let credential: Credential
    let session: NMSSHSession

    init(host: String, port: Int, username: String, credential: Credential) {
        self.host = host
        self.port = port
        self.username = username
        self.credential = credential
        self.session = NMSSHSession(host: host, port: port, andUsername: username)
    }

    func connect(timeout: Int?) -> Bool {
        if (session.isConnected) {
            return true
        }
        return timeout != nil ? session.connect(withTimeout: timeout! as NSNumber) : session.connect()
    }

    func isConnected() -> Bool {
        return session.isConnected
    }

    func authenticate() -> Bool {
        if (session.isAuthorized) {
            return true
        }
        if (credential.type == CertificationType.password) {
            return session.authenticate(byPassword: credential.password!)
        } else {
            return session.authenticateBy(inMemoryPublicKey: credential.publicKey!, privateKey: credential.privateKey!, andPassword: credential.password)
        }
    }

    func isAuthorized() -> Bool {
        return session.isAuthorized
    }

    func execute(_ command: String) throws -> String {
        var error: NSError?
        let output = session.channel.execute(command, error: &error)
        if error != nil {
            throw error!
        }
        return output
    }

    func startShell(ptyType: String?,delegate: NMSSHChannelDelegate) throws -> Void {
        let channel = session.channel
        let type: NMSSHChannelPtyTerminal?
        switch ptyType {
        case "vanilla":
            type = NMSSHChannelPtyTerminal.vanilla
        case "vt100":
            type = NMSSHChannelPtyTerminal.VT100
        case "vt102":
            type = NMSSHChannelPtyTerminal.VT102
        case "vt220":
            type = NMSSHChannelPtyTerminal.VT220
        case "ansi":
            type = NMSSHChannelPtyTerminal.ansi
        default:
            type = NMSSHChannelPtyTerminal.xterm
        }
        channel.delegate = delegate
        channel.requestPty = true
        channel.ptyTerminalType = type!
        try channel.startShell()
    }

    func writeToShell(_ command: String, timeout: Int?) throws -> Void {
        if timeout != nil {
            var error: NSError?
            session.channel.write(command, error: &error, timeout: timeout! as NSNumber)
            if error != nil {
                throw error!
            }
        } else {
            try self.writeToShell(command)
        }
    }

    func writeToShell(_ command: String) throws -> Void {
        try session.channel.write(command)
    }

    func resizeShell(width: Int, height: Int) -> Bool {
        return session.channel.requestSizeWidth(UInt(width), height: UInt(height))
    }

    func closeShell() -> Void {
        session.channel.closeShell()
    }

    func disconnect() -> Void {
        session.disconnect()
    }

}
