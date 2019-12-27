/* global process, __dirname */
var test = require('tape');
var assertNoError = require('assert-no-error');
var TermSearch = require('../term-search');
var request = require('request');
var http = require('http');
var Tracker = require('term-tracker');

const fixturesPath = `${__dirname}/fixtures`;

const port = 5679;
const serverHost = process.env.SERVER || 'localhost';

var testCases = [
  {
    name: 'Basic search',
    path: 'search',
    qs: 'term=cat',
    trackedDocs: [
      { caption: 'Cat is OK.', id: 'a' },
      { caption: 'Cat is best! Wily is good cat.', id: 'b' },
      { caption: 'Cauldron of eggs', id: 'c' }
    ],
    expectedStatusCode: 200,
    expectedBody: [{ ref: 'b', count: 2 }, { ref: 'a', count: 1 }]
  }
];

testCases.forEach(runTest);

function runTest(testCase) {
  test(testCase.name, testMethod);

  function testMethod(t) {
    var server;

    var tracker = Tracker({
      storeFile: `${fixturesPath}/tmp.json`,
      textProp: 'caption'
    });
    testCase.trackedDocs.forEach(tracker.track);
    TermSearch(
      {
        tracker
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
      t.deepEqual(body, testCase.expectedBody, 'Results are correct.');
      server.close(t.end);
    }
  }
}
