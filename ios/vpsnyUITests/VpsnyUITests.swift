//
//  vpsnyUITests.swift
//  vpsnyUITests
//
//  Created by 李茂峰 on 17/01/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import XCTest

class VpsnyUITests: XCTestCase {

    override func setUp() {
        super.setUp()

        let app = XCUIApplication()
        setupSnapshot(app)
        app.launch()
    }

    override func tearDown() {
        super.tearDown()
    }

    func testExample() {
      let app = XCUIApplication()
      snapshot("login")
      app.buttons["Log in"].tap()
      snapshot("home")
      app.buttons["Counter"].tap()
      snapshot("counter")
      app.buttons["header-back"].tap()
      app.buttons["Profile"].tap()
      snapshot("profile")
    }

}
