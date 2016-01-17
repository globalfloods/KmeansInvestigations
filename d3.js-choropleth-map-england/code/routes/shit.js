var request = require('request');
var util = require('util');

var cleanShit = function(shit) {
  console.log('FOOOO', shit);
  var cleanString = shit.substring(1,shit.length-1)
  var cleanArray = cleanString.split(',');
  var cleanNumArray = cleanArray.map(function(element) {
    return parseFloat(element);
  });
  console.log('YOO!', cleanNumArray);
  return cleanNumArray;
}

var rasdamanStuff = function(callback) {

  var qp = {};
  qp.service = 'WCS';
  qp.version = '2.0.1';
  qp.request = 'ProcessCoverages'
  
  var queryFormat = 'for c in (%s) return encode(c[Lat(%d), Long(%d), ansi("%s" : "%s")], "csv")'
  // var queryFormat = 'for c in (%s) return encode(c[Lat(%d), "csv")'
  // var rasdamanStuff = util.format(queryFormat, 'T2m', 54.89, 356.85, '2014-12-20T00:00:00+00:00', '2014-12-30T00:00:00+00:00');
  var rasdamanStuff = util.format(queryFormat, 'TP', 54.89, 356.85, '2014-12-20T00:00:00+00:00', '2014-12-30T00:00:00+00:00');
  // var rasdamanStuff = util.format(queryFormat, 'return_level5', 54.89, 356.85);
  // var rasdamanStuff = util.format(queryFormat, 'discha', 54.89, 356.85, '2014-12-20T00:00:00+00:00', '2014-12-30T00:00:00+00:00');
  console.log('rasdamanStuff:',rasdamanStuff);
  console.log('queryFormat:',queryFormat);

  qp.query = rasdamanStuff;

  request({
      url: 'http://incubator.ecmwf.int/2e/rasdaman/ows',
      qs: qp,
      method: 'GET',
      headers: {}
  }, function(error, response, body){
      if(error) {
          callback(error);
      } else {
          console.log('body',body);
          if (response.statusCode > 201) {
            console.log('PROBLEMS HERE!', response.statusCode);
          }
          callback(null, cleanShit(body));
      }
  });
};


var express = require('express');
var rasdamanStuffRouter = express.Router();

rasdamanStuffRouter.get('/', function(req, res) {
  console.log('Returning rasdamanStuff!');
  rasdamanStuff(function(err, data) {
    res.json(data);
  })
});

module.exports = rasdamanStuffRouter;
