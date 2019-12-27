var express = require('express');
var cors = require('cors');
var callNextTick = require('call-next-tick');

function TermSearch({ tracker }, done) {
  var app = express(cors());

  app.get('/health', respondOK);

  app.get('/search', search);
  app.head(/.*/, respondHead);

  // Async init goes here, if it is ever needed.

  callNextTick(done, null, app);

  function respondOK(req, res, next) {
    res.json(200, { message: 'OK!' });
    next();
  }

  function search(req, res, next) {
    if (!req.query.term) {
      res.status(400).json({ message: 'Missing `term` query param.' });
      return;
    }

    var searchResults = sortRefsByCount(
      tracker.getTerm({ term: req.query.term })
    );
    res.status(200).json(searchResults);
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

// TODO: term-tracker should handle this.
function sortRefsByCount({ countsInRefs }) {
  var refCounts = [];
  for (var ref in countsInRefs) {
    refCounts.push({ ref, count: countsInRefs[ref] });
  }
  return refCounts.sort(compareByCountDesc);
}

function compareByCountDesc(a, b) {
  if (a.count < b.count) {
    return 1;
  }
  return -1;
}

module.exports = TermSearch;
