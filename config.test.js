"use strict";

describe("config can come from env", function () {
  test("works", function() {
    process.env.SECRET_KEY = "config_test_SK";
    process.env.PORT = "5000";
    process.env.DATABASE_URI = "other";
    process.env.NODE_ENV = "other";

    const config = require("./config");
    expect(config.SECRET_KEY).toEqual("config_test_SK");
    expect(config.PORT).toEqual(5000);
    expect(config.getDatabaseURI()).toEqual("other");
    expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.BCRYPT_WORK_FACTOR;
    delete process.env.DATABASE_URI;

    expect(config.getDatabaseURI()).toEqual("postgresql:///wanderlyst");

    process.env.NODE_ENV = "test";
    expect(config.getDatabaseURI()).toEqual("postgresql:///wanderlyst_test");
  });
})

