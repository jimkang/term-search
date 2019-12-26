var express = require('express');
var cors = require('cors');
var callNextTick = require('call-next-tick');

function TermSearch({ tracker }, done) {
  var app = express(cors());

  app.get('/health', respondOK);

  app.get('/term', getTerm);
  app.head(/.*/, respondHead);

  // Async init goes here, if it is ever needed.

  callNextTick(done, null, app);

  function respondOK(req, res, next) {
    res.json(200, { message: 'OK!' });
    next();
  }

  function getTerm(req, res, next) {
    // TODO.
    res.status(200).json({ message: 'Got it!' });
    next();
  }

  function respondHead(req, res, next) {
    if (req.method !== 'OPTIONS') {
      res.writeHead(200, {
        'content-type': 'application/json'
      });
    } else {
      res.writeHead(200, 'OK');
    }
    res.end();
    next();
  }
}

module.exports = TermSearch;
