//
//  vpsnyUITests.swift
//  vpsnyUITests
//
//  Created by 李茂峰 on 17/01/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import XCTest

class vpsnyUITests: XCTestCase {
    var app: XCUIApplication!
  
    override func setUp() {
        super.setUp()

      app = XCUIApplication()
        setupSnapshot(app)
        app.launch()
    }

    override func tearDown() {
        super.tearDown()
    }

    func testExample() {
      sleep(10)
      snapshot("home")
    //   app.buttons["Log in"].tap()
    //   snapshot("home")
    //   app.buttons["Counter"].tap()
    //   snapshot("counter")
    //   app.buttons["header-back"].tap()
    //   app.buttons["Profile"].tap()
    //   snapshot("profile")
    }

}
