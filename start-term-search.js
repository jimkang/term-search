#!/usr/bin/env node

/* global process */

var TermSearch = require('./term-search');
var logFormat = require('log-format');
var config = require('./config');
var http = require('http');

const port = 5679;

TermSearch(
  {
    // TODO: tracker
  },
  createServer
);

function createServer(error, app) {
  if (error) {
    process.stderr.write(logFormat(error.message, error.stack));
    process.exit(1);
    return;
  }

  var server = http.createServer(app);
  server.listen(port, onReady);

  function onReady(error) {
    if (error) {
      logError(error);
    } else {
      process.stdout.write(logFormat('term-search listening at', port));
    }
  }
}

function logError(error) {
  process.stderr.write(logFormat(error.message, error.stack));
}
