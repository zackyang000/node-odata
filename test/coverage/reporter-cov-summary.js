var fs = require('fs');
var util = require ('util');
var Spec = require('mocha/lib/reporters/spec');

exports = module.exports = CovSummary;

function CovSummary(runner) {
  Spec.call(this, runner);
  runner.on('end', report);
}

function report() {
  var cov = global._$jscoverage || {};
  var files = Object.keys(cov);

  var covered_lines = 0;
  var total_lines = 0;

  files.forEach(function(file) {
    cov[file].forEach(function(line) {
      if(line !== undefined) {
        total_lines ++;

        if (line !== 0) {
          covered_lines ++;
        }
      }
    });
  });

  var covered = (covered_lines / total_lines * 100).toFixed(1);
  console.log(util.format('Coverage Summary: %s lines of %s lines, %s% covered \n', covered_lines, total_lines, covered));
}

CovSummary.prototype.__proto__ = Spec.prototype;