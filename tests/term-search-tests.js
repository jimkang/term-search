/* global process */
var test = require('tape');
var assertNoError = require('assert-no-error');
var TermSearch = require('../term-search');
var request = require('request');
var http = require('http');

const port = 5679;
const serverHost = process.env.SERVER || 'localhost';

var testCases = [
  {
    name: 'Basic getTerm',
    path: 'term',
    qs: 'term=cat',
    expectedStatusCode: 200
  }
];

testCases.forEach(runTest);

function runTest(testCase) {
  test(testCase.name, testMethod);

  function testMethod(t) {
    var server;

    TermSearch(
      {
        // TODO: Provide tracker
      },
      startServer
    );

    function startServer(error, app) {
      assertNoError(t.ok, error, 'Server created.');
      if (error) {
        console.log('Error creating server:', error);
        process.exit();
      }
      server = http.createServer(app);
      server.listen(port, runRequest);
    }

    function runRequest(error) {
      assertNoError(t.ok, error, 'Server started correctly.');
      var reqOpts = {
        method: 'GET',
        url: `http://${serverHost}:${port}/${testCase.path}?${testCase.qs}`,
        json: true
      };

      request(reqOpts, checkResponse);
    }

    function checkResponse(error, res, body) {
      assertNoError(t.ok, error, 'No error while making request.');
      t.equal(
        res.statusCode,
        testCase.expectedStatusCode,
        'Correct status code is returned.'
      );
      if (res.statusCode !== 200) {
        console.log('body:', body);
      }
      // TODO: Check body
      server.close(t.end);
    }
  }
}
