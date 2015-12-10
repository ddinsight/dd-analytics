'use strict';

/**
* Wave Frontend app module
* @type {angular.Module}
*/
console.log('------------------------------------------');
console.log('app.js');

var Wave = window.Wave = angular.module('Wave',
[
    // ngCore //
    'ngRoute',
    'ngSanitize',

    // controllers //
    'Wave.ctrl',
    'Wave.chartviewer.ctrl',
    'Wave.chartmaker.ctrl',
    'Wave.tools.ctrl',
    'Wave.dataviewer.ctrl',
    'Wave.mapviewer.ctrl',
    'Wave.report.ctrl',

    // directive   //
    'Wave.chartviewer.directive',
    'Wave.common.directive',
    'Wave.d3.directive',
    'Wave.viewtmpl.directive',
    'Wave.Formatters',
    'Wave.chartmaker.directive',
    'Wave.report.directive',
    'Wave.dataviewer.directive',
    'Wave.mapviewer.directive',

    // service  //
    'Wave.common.service',
    'Wave.chartviewer.service',
    'Wave.chartmaker.service',
    'Wave.report.service',
    'Wave.tools.service',
    'Wave.dataviewer.service',
    'Wave.mapviewer.service',
    'Wave.Routes',

    // plug-ins //
    'ui.codemirror',
    'ui.bootstrap',
    'ui.tree',
    'ngCsv'
])

;

