tests = require('./app');

var assert = require('assert');
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