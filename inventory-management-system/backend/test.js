//=============================================================================
//                                Tests.js
//  This file contains all the mocha and chai testing for the backend system.
//  This tests the SQL injection and Cross-Site Scripting prevention, the
//  connection to the database/whether the database exists and the password
//  generation functions (salt, pepper and hash) that are all found in the 
//  main backend file (app.js)
//
//                              By Harry Yelland
//=============================================================================
//				
//                               Changelog
//
//  24/05 - Added formal comments
//  23/05 - Created File, Added SQL, CSS, DB and Hash/Salt/Pepper Tests
//
//=============================================================================

// All requires for mocha, chai and loading functions from app.js
tests = require('./app');
var assert = require('assert');
const { databaseCreation, addHash } = require('./app');
var expect = require("chai").expect;



//=============================================================================
//                                Input Testing Functions
//  
//  These are a group of functions to test the sanitisation functions. This
//  includes both the prevention of SQL injection and cross-site scripting
//
//          Parameters: N/A (No input parameters as test data hard-coded) 
//
//       Returns: N/A (No Return as Mocha/Chai Outcome Outputted to Console)
//=============================================================================
describe("Input Testing", function() {
    // Start SQL injection testing
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
    // start cross site scripting testing
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

//=============================================================================
//                        Database Testing Function
//  
//  This function runs the database creation function to ensure that a db
//  exists (prior to the system being run). If success, expects undefined,
//  if unsuccessful, expects error.
//
//          Parameters: N/A (No input parameters as test data hard-coded) 
//
//       Returns: N/A (No Return as Mocha/Chai Outcome Outputted to Console)
//=============================================================================
describe("Database Tests", function() {
    describe("Checking Database Connection", function() {
        it("Database Exists" , function() {
            var exists = tests.databaseCreation();
            expect(exists).to.equal(undefined);
        })
    })
});


//=============================================================================
//                        Password Testing Function
//  
//  These sets of functions test the salt, pepper and hash functions for the
//  password generator/checker functions found in the main app.js file. Each
//  checks the length of the generated string to ensure it is consistent with
//  expectations (salt generates len 10, pepper len 1 and hash 64). Adding
//  functions hard-coded to check that the salt, pepper and hash always return
//  consistent data.
//
//          Parameters: N/A (No input parameters as test data hard-coded) 
//
//       Returns: N/A (No Return as Mocha/Chai Outcome Outputted to Console)
//=============================================================================
describe("Password Testing", function() {
    // start salt testing
    describe("Checking Salt Generated", function() {
        // checks length of salt
        it("Checking Salt Length" , function() {
            var length = tests.generateSalt().length;
            expect(length).to.equal(10);
        });
        // checks that the salt gets added to the string correctly
        it("Checking Salt Added Correctly" , function() {
            var salted = tests.addSalt("test", "1234567890");
            expect(salted).to.equal("12345test67890");
        });
    });
    // start pepper testing
    describe("Checking Pepper Generated", function() {
        // tests the lenth of the pepper
        it("Checking Pepper Length" , function() {
            var length = tests.generatePepper().length;
            expect(length).to.equal(1);
        });
        // checks that pepper gets added to strings correctly
        it("Checking Pepper Added Correctly" , function() {
            var peppered = tests.addPepper("test", "B");
            expect(peppered).to.equal("Btest");
        });
    });
    // start hash testing
    describe("Checking Hash Generated", function() {
        // checks that hash length is consistent (64) with SHA256
        it("Checking Hash Length" , function() {
            var length = tests.addHash("test").length;
            expect(length).to.equal(64);
        });
        // checks that always hashes to the same value
        it("Checking Hashes Correctly", function() {
            var hash = tests.addHash("test");
            expect(hash).to.equal("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
        })
    });
});
