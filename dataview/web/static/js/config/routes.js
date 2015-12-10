angular.module('Wave.Routes', [])

  .config(['$routeProvider', '$locationProvider',function($routeProvider, $locationProvider) {

    if(CONFIG.routing.html5Mode) {
      $locationProvider.html5Mode(true);
    }
    else {
      var routingPrefix = CONFIG.routing.prefix;
      if(routingPrefix && routingPrefix.length > 0) {
        $locationProvider.hashPrefix(routingPrefix);
      }
    }
    ROUTER.when('undercontruct', '/uc', {
      controller : 'EmptyController',
      templateUrl : CONFIG.prepareViewTemplateUrl('uc')
    });

    ROUTER.when('report_path', '/report', {
      controller : 'ReportController',
      templateUrl : CONFIG.prepareViewTemplateUrl('report')
    });

    ROUTER.when('login_path', '/login', {
      controller : 'UserCtrl',
      templateUrl : CONFIG.prepareViewTemplateUrl('login')
    });

    ROUTER.when('admin_signup', '/signup', {
      controller : 'SignupCtrl',
      templateUrl : CONFIG.prepareViewTemplateUrl('signup')
    });    

    ROUTER.when('chartviewer_list', '/chartviewer/list', {
      controller : 'ChartViewerListController',
      templateUrl : CONFIG.prepareViewTemplateUrl('chartviewer_list')
    });

    ROUTER.when('chartviewer_view', '/chartviewer/view/:sqlid', {
      controller : 'ChartViewerViewController',
      templateUrl : CONFIG.prepareViewTemplateUrl('chartviewer_view')
    });

    ROUTER.when('dataviewer_view', '/dataviewer', {
      controller : 'DataViewerController',
      templateUrl : CONFIG.prepareViewTemplateUrl('dataviewer')
    });

    ROUTER.when('tools_querytomap', '/tools/querytomap', {
      controller : 'ToolsQuerytomapController',
      templateUrl : CONFIG.prepareViewTemplateUrl('tools_querytomap')
    });

    ROUTER.when('samsung_querytomap', '/tools/querytomap/samsung', {
      controller : 'SamsungDemoQuerytomapController',
      templateUrl : CONFIG.prepareViewTemplateUrl('samsung_querytomap')
    });

    ROUTER.when('tools_querytomapbypolyline', '/tools/querytomap/polyline', {
      controller : 'ToolsQuerytoMapByPolylineController',
      templateUrl : CONFIG.prepareViewTemplateUrl('tools_querytomap')
    });


    ROUTER.when('mapviewer_list', '/mapviewer/list', {
      controller : 'MapViewerListController',
      templateUrl : CONFIG.prepareViewTemplateUrl('mapviewer_list')
    });

    ROUTER.when('mapviewer_view', '/mapviewer/view/:sqlid', {
      controller : 'MapViewerViewController',
      templateUrl : CONFIG.prepareViewTemplateUrl('mapviewer_view')
    });

    ROUTER.when('mapboard_list', '/mapboard/list', {
      controller : 'MapBoardListController',
      templateUrl : CONFIG.prepareViewTemplateUrl('mapboard_list')
    });
    ROUTER.when('mapboard_view', '/mapboard/view/:mapboard_id', {
      controller : 'MapBoardViewController',
      templateUrl : CONFIG.prepareViewTemplateUrl('mapboard_view')
    });

    ROUTER.when('report_list', '/report/list', {
      controller : 'ReportListController',
      templateUrl : CONFIG.prepareViewTemplateUrl('report_list')
    });
    ROUTER.when('report_view', '/report/view/:report_id', {
      controller : 'ReportViewController',
      templateUrl : CONFIG.prepareViewTemplateUrl('report_view')
    });

    ROUTER.when('reportviewer', '/rv/:uri', {
      controller : 'ReportViewerController',
      templateUrl : CONFIG.prepareViewTemplateUrl('reportviewer')
    });
    //////////////////////////////////////////
    // chartmaker system menu router
    //////////////////////////////////////////
    ROUTER.when('chartmaker', '/chartmaker', {
      controller : 'ChartMakerController',
      templateUrl : CONFIG.prepareViewTemplateUrl('chartmaker')
    });

    //////////////////////////////////////////
    // Dashboard router
    //////////////////////////////////////////


    //////////////////////////////////////////
    // SqlFiddle
    //////////////////////////////////////////


    //////////////////////////////////////////
    // Map Dashboard
    //////////////////////////////////////////

    ROUTER.otherwise({
      redirectTo : '/rv/overview'
    });

    ROUTER.install($routeProvider);
  }])

  .run(['$rootScope', '$location', function($rootScope, $location) {
    var prefix = '';
    if(!CONFIG.routing.html5Mode) {
      prefix = '#' + CONFIG.routing.prefix;
    }
    $rootScope.route = function(url, args) {
      return prefix + ROUTER.routePath(url, args);
    };

    $rootScope.r = $rootScope.route;

    $rootScope.c = function(route, value) {
      var url = ROUTER.routePath(route);
      if(url == $location.path()) {
        return value;
      }
    };

  }])
  ;


//function generateUUID() {
//    var d = new Date().getTime();
//    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//        var r = (d + Math.random()*16)%16 | 0;
//        d = Math.floor(d/16);
//        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
//    });
//    return uuid;
//};