var express = require('express');
var fs = require('fs');
var csvParse = require('csv-parse');
var topojson = require('topojson');

var helpersRouter = express.Router();

var populationCsvPath = __dirname + '/../data/RUC11_LAD11_EN.csv';
var populationCsv;
var populationData;

function enrichPopulation(callback) {
  csvParse(populationCsv, {columns: true}, function(err, data) {
    populationData = {};
    populationData.totPopulation = 0;
    
    data.forEach(function(line) {  
      if (line.LAD11CD) {
        // console.log('ID LAD11CD:', line.LAD11CD);
        var currentPopulation = parseFloat(line[' Total population1'].replace(",",""));
        populationData[line.LAD11CD] = {};
        populationData[line.LAD11CD].population = currentPopulation;

        if (NaN != currentPopulation)
          populationData.totPopulation += currentPopulation;
      }
    });
    console.log('Done with enrich!');
    callback();
  });
}

function parsePopulation(callback) {
  if (!populationCsv) {
    populationCsv = fs.readFileSync(populationCsvPath, 'utf8');
    if (!populationData) {
      enrichPopulation(callback);
    }
  } else {
    console.log('Callback on population:',populationData);
    callback(null, populationData);
  }
}

helpersRouter.get('/population', function(req, res, next) {
  parsePopulation(function(err, data) {
    console.log('Returning the population');
    res.json(populationData);
  });
});

var ldaGeoJsonPath = __dirname + '/../data/ldaEngland.json';
var ldaGeoJson = JSON.parse(fs.readFileSync(ldaGeoJsonPath, 'utf8'));
var ldaTopoJson;

function getTopoJson(callback) {
  if (!ldaTopoJson) {
    console.log('Transforming the GeoJson to TopoJson');
    ldaTopoJson = topojson.feature(ldaGeoJson, ldaGeoJson.objects.lad, function() { return callback(); });
  }
  callback();
};

helpersRouter.get('/lda-polygons', function(req, res) {
  getTopoJson(function() {
    console.log('Returning the TopoJson LDA poligons');
    res.json(ldaTopoJson);
  });
});


module.exports = helpersRouter;
