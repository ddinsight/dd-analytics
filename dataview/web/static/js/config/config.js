var CONFIG;

(function() {

    var appPrefix = '/';
    var templateUrlPrefix = '/static/tpls/';
    var appVersion = 1;

    CONFIG = {

        version : appVersion,
        baseDirectory : appPrefix,
        templateDirectory : templateUrlPrefix,
        templateFileQuerystring : "?v=" + appVersion,
        routing : {
            prefix : '',
            html5Mode : false
        },
        viewUrlPrefix : templateUrlPrefix + 'views/',
        partialUrlPrefix : templateUrlPrefix + 'partials/',
        chartUrlPrefix : templateUrlPrefix + 'charts/',
        templateFileSuffix : '.html',

        prepareViewTemplateUrl : function(url) {
            var name = this.viewUrlPrefix + url + this.templateFileSuffix + this.templateFileQuerystring;
            return name;
        },

        preparePartialTemplateUrl : function(url) {
            var name = this.partialUrlPrefix + url + this.templateFileSuffix + this.templateFileQuerystring;
            return name;
        },

        prepareChartTemplateUrl : function(url) {
            var name = this.chartUrlPrefix + url + this.templateFileSuffix + this.templateFileQuerystring;
            return name;
        }

    };
})();

