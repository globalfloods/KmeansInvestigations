var express = require('express');
var geomapsRouter = express.Router();

geomapsRouter.get('/', function(req, res, next) {
  console.log('Rendering the map!');
  res.render('englishLDAs', { ldaTitle: 'Local District Authorities', ldaDescription: 'population'});
});

module.exports = geomapsRouter;
