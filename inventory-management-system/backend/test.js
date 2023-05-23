tests = require('./app');

var assert = require('assert');
const { databaseCreation, addHash } = require('./app');
var expect = require("chai").expect;


describe("Input Testing", function() {
    describe("SQL Injection Testing", function() {
        it("Checks if SQL injected on the following: 'SELECT'", function() {
            var phrase = tests.sqlInject("SELECT");
            expect(phrase).to.equal(true);
        });
        it("Checks if SQL injected on the following: 'EMPTY'", function() {
            var phrase = tests.sqlInject("EMPTY");
            expect(phrase).to.equal(false);
        });
        it("Checks if SQL injected on the following: 'HARRY DROP TABLE'", function() {
            var phrase = tests.sqlInject("HARRY DROP TABLE");
            expect(phrase).to.equal(true);
        });
        it("Checks if SQL injected on the following: 'THISDELETE'", function() {
            var phrase = tests.sqlInject("THISDELETE");
            expect(phrase).to.equal(true);
        });
        it("Checks if SQL injected on the following: 'INSER'", function() {
            var phrase = tests.sqlInject("INSER");
            expect(phrase).to.equal(false);
        });
        it("Checks if SQL injected on the following: 'THIS IS FINE'", function() {
            var phrase = tests.sqlInject("THIS IS FINE");
            expect(phrase).to.equal(false);
        });
    });
    describe("Cross Site Scripting Injection Testing", function() {
        it("Checks if Cross Site Scripting injected on the following: '<SCRIPT>'", function() {
            var phrase = tests.cssInject("<SCRIPT>");
            expect(phrase).to.equal(true);
        });
        it("Checks if Cross Site Scripting injected on the following: 'EMPTY'", function() {
            var phrase = tests.cssInject("EMPTY");
            expect(phrase).to.equal(false);
        });
        it("Checks if Cross Site Scripting injected on the following: 'HARRY <SCRIPT> alert(1) <SCRIPT/>'", function() {
            var phrase = tests.cssInject("HARRY <SCRIPT> alert(1) <SCRIPT/>");
            expect(phrase).to.equal(true);
        });
        it("Checks if Cross Site Scripting injected on the following: 'THIS A HREF'", function() {
            var phrase = tests.cssInject("THIS A HREF");
            expect(phrase).to.equal(false);
        });
        it("Checks if Cross Site Scripting injected on the following: '<BODY>'", function() {
            var phrase = tests.cssInject("<BODY>");
            expect(phrase).to.equal(true);
        });
        it("Checks if Cross Site Scripting injected on the following: 'THIS IS FINE'", function() {
            var phrase = tests.cssInject("THIS IS FINE");
            expect(phrase).to.equal(false);
        });
    });
});

describe("Database Tests", function() {
    describe("Checking Database Connection", function() {
        it("Database Exists" , function() {
            var exists = tests.databaseCreation();
            expect(exists).to.equal(undefined);
        })
    })
});

describe("Password Testing", function() {
    describe("Checking Salt Generated", function() {
        it("Checking Salt Length" , function() {
            var length = tests.generateSalt().length;
            expect(length).to.equal(10);
        });
        it("Checking Salt Added Correctly" , function() {
            var salted = tests.addSalt("test", "1234567890");
            expect(salted).to.equal("12345test67890");
        });
    });
    describe("Checking Pepper Generated", function() {
        it("Checking Pepper Length" , function() {
            var length = tests.generatePepper().length;
            expect(length).to.equal(1);
        });
        it("Checking Pepper Added Correctly" , function() {
            var peppered = tests.addPepper("test", "B");
            expect(peppered).to.equal("Btest");
        });
    });
    describe("Checking Hash Generated", function() {
        it("Checking Hash Length" , function() {
            var length = tests.addHash("test").length;
            expect(length).to.equal(64);
        });
        it("Checking Hashes Correctly", function() {
            var hash = tests.addHash("test");
            expect(hash).to.equal("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
        })
    });
});
