var express = require('express')
var cookieParser = require('cookie-parser')
var path = require('path')
var http = require('http');
var cluster = require('cluster');
var favicon = require('serve-favicon');

var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');
var numCPUs = require('os').cpus().length; console.log('Total Process Count is ' + numCPUs);
var RedisStore = require('connect-redis')(session);
var wmonitor = require('./routes/wmonitor');
var hmonitor = require('./routes/hmonitor');
var haction = require('./routes/haction');
var hsubway = require('./routes/hsubway');
var omonitor = require('./routes/omonitor');
var oaction = require('./routes/oaction');
var caction = require('./routes/caction');
var oreal = require('./routes/oreal');

var user = require('./routes/user');
var contour = require('./routes/contour');

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/'));
app.use(cookieParser()); 

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  store: new RedisStore({
    port: '6379',
    host: 'localhost',
    prefix: 'wave'
  }),
  secret: 'SEKR37'
}));


app.get('/cluster', function (req, res) {
  res.sendFile('cluster.html',{ root: path.join(__dirname, '/public') })
});
app.get('/heatmap', function (req, res) {
  res.sendFile('heatmap.html',{ root: path.join(__dirname, '/public') })
});
app.get('/s1', function (req, res) { 
  res.sendFile('s1.html',{ root: path.join(__dirname, '/public') })
});
app.get('/s2', function (req, res) {
  res.sendFile('s2.html',{ root: path.join(__dirname, '/public') })
});
app.get('/s3', function (req, res) {
  res.sendFile('s3.html',{ root: path.join(__dirname, '/public') })
});
app.get('/main', function (req, res) {
  res.sendFile('main.html',{ root: path.join(__dirname, '/public/views') })
});
app.get('/trace', function (req, res) {
  res.sendFile('trace.html',{ root: path.join(__dirname, '/public/views') })
});
app.get('/', function (req, res) {
  res.redirect('/oreal');
});
app.get('/wmonitor', function (req, res) {
  if(!req.session.user_id){
    req.session.returnTo = req.path;
    res.redirect('/login');
  }else{
    res.sendFile('wmonitor.html',{ root: path.join(__dirname, '/public/views') })
  }
});
app.get('/haction', function (req, res) {
  if(!req.session.user_id){
    req.session.returnTo = req.path;
    res.redirect('/login');
  }else{
    res.sendFile('haction.html',{ root: path.join(__dirname, '/public/views') })
  }
});
app.get('/hmonitor', function (req, res) {
  if(!req.session.user_id){
    req.session.returnTo = req.path;
    res.redirect('/login');
  }else{
    res.sendFile('hmonitor.html',{ root: path.join(__dirname, '/public/views') })
  }
});
app.get('/heat', function (req, res) {
  if(!req.session.user_id){
    req.session.returnTo = req.path;
    res.redirect('/login');
  }else{
    res.sendFile('heat.html',{ root: path.join(__dirname, '/public/views') })
  }
});
app.get('/push', function (req, res) {
  if(!req.session.user_id){
    req.session.returnTo = req.path;
    res.redirect('/login');
  }else{
    res.sendFile('push.html',{ root: path.join(__dirname, '/public/views') })
  }
});
app.get('/hsubway', function (req, res) {
  if(!req.session.user_id){
    req.session.returnTo = req.path;
    res.redirect('/login');
  }else{
    res.sendFile('hsubway.html',{ root: path.join(__dirname, '/public/views') })
  }
});

app.get('/omonitor', function (req, res) {
  if(!req.session.user_id){
    req.session.returnTo = req.path;
    res.redirect('/login');
  }else{
    res.sendFile('omonitor.html',{ root: path.join(__dirname, '/public/views') })
  }
});
app.get('/oaction', function (req, res) {
  if(!req.session.user_id){
    req.session.returnTo = req.path;
    res.redirect('/login');
  }else{
    res.sendFile('oaction.html',{ root: path.join(__dirname, '/public/views') })
  }
});
app.get('/oaction1', function (req, res) {
  if(!req.session.user_id){
    req.session.returnTo = req.path;
    res.redirect('/login');
  }else{
    res.sendFile('oaction1.html',{ root: path.join(__dirname, '/public/views') })
  }
});

app.get('/caction', function (req, res) {
  if(!req.session.user_id){
    req.session.returnTo = req.path;
    res.redirect('/login');
  }else{
    res.sendFile('caction.html',{ root: path.join(__dirname, '/public/views') })
  }
});



app.get('/oreal', function (req, res) {
  console.log(req.session.user_id);
  if(!req.session.user_id){
    req.session.returnTo = req.path;
    res.redirect('/login');
  }else{
    if(req.param('t', '')=='hp'){
      res.sendFile('orealhp.html',{ root: path.join(__dirname, '/public/views') })  
    }else{
      res.sendFile('oreal.html',{ root: path.join(__dirname, '/public/views') })  
    }
    
  }
});

app.get('/contour', function (req, res) {
  console.log(req.session.user_id);
  if(!req.session.user_id){
    req.session.returnTo = req.path;
    res.redirect('/login');
  }else{
    res.sendFile('contour.html',{ root: path.join(__dirname, '/public/views') })
  }
});

app.get('/login', function (req, res) {
  res.sendFile('login.html',{ root: path.join(__dirname, '/public/views') })
});



app.post('/login/proc', user.login);
app.all('/logout', user.logout);

app.all('/api/v1.0/map/list', wmonitor.list_mapdata);
// app.all('/api/v1.0/map/trace', wmonitor.list_tracedata);
app.all('/api/v1.0/map/daum', wmonitor.list_daumdata);
app.all('/api/v1.0/chart/wfcompany', wmonitor.wfcompanydata);
app.all('/api/v1.0/chart/cellwf', wmonitor.cellwfdata);
app.all('/api/v1.0/table/top10', wmonitor.list_top10);
app.all('/api/v1.0/chart/resultTrend', wmonitor.list_resultTrend);
app.all('/api/v1.1/skt/map/cell/list', hmonitor.list_map_cell_list);
app.all('/api/v1.1/skt/map/wf/list', hmonitor.list_map_wf_list);
app.all('/api/v1.1/skt/map/cellwf/detail', hmonitor.map_cellwf_detail);
app.all('/api/v1.1/skt/table/cellwf/list', hmonitor.table_cellwf_list);
app.all('/api/v1.1/skt/chart/cellwf/list', hmonitor.chart_cellwf_list);
app.all('/api/v1.1/skt/treemap/cellwf/list', hmonitor.treemap_cellwf_list);

// app.all('/api/v1.2/heat/wf/list', heat.map_wf_list);
app.all('/api/v1.3/haction/map/cell/list', haction.map_cell_list);
app.all('/api/v1.3/haction/map/wf/list', haction.map_wf_list);
app.all('/api/v1.3/haction/chart/cellwf/list', haction.chart_cellwf_list);
app.all('/api/v1.3/haction/treemap/cellwf/list', haction.treemap_cellwf_list);
app.all('/api/v1.3/haction/map/cell/info', haction.map_cell_info);
app.all('/api/v1.3/haction/map/wf/info', haction.map_wf_info);
app.all('/api/v1.4/hsubway/heat/list', hsubway.heat_list);

app.all('/api/v1.5/omonitor/map/cell/list', omonitor.map_cell_list);
app.all('/api/v1.5/omonitor/map/lte/list', omonitor.map_lte_list);
app.all('/api/v1.5/omonitor/map/wf/list', omonitor.map_wf_list);
app.all('/api/v1.5/omonitor/map/cell/name/list', omonitor.map_cell_name_list);
app.all('/api/v1.5/omonitor/map/lte/name/list', omonitor.map_lte_name_list);
app.all('/api/v1.5/omonitor/map/wf/name/list', omonitor.map_wf_name_list);
app.all('/api/v1.5/omonitor/map/cell/detail', omonitor.map_cell_detail);
app.all('/api/v1.5/omonitor/map/lte/detail', omonitor.map_lte_detail);
app.all('/api/v1.5/omonitor/map/wf/detail', omonitor.map_wf_detail);
app.all('/api/v1.5/omonitor/bubble/cell/list', omonitor.bubble_cell_list);
app.all('/api/v1.5/omonitor/bubble/lte/list', omonitor.bubble_lte_list);
app.all('/api/v1.5/omonitor/bubble/wf/list', omonitor.bubble_wf_list);
app.all('/api/v1.5/omonitor/chart/cell/list', omonitor.chart_cell_list);
app.all('/api/v1.5/omonitor/chart/lte/list', omonitor.chart_lte_list);
app.all('/api/v1.5/omonitor/chart/wf/list', omonitor.chart_wf_list);
app.all('/api/v1.5/omonitor/treemap/cell/list', omonitor.treemap_cell_list);
app.all('/api/v1.5/omonitor/treemap/lte/list', omonitor.treemap_lte_list);
app.all('/api/v1.5/omonitor/treemap/wf/list', omonitor.treemap_wf_list);
app.all('/api/v1.5/omonitor/radar/cell/list', omonitor.radar_cell_list);
app.all('/api/v1.5/omonitor/radar/lte/list', omonitor.radar_lte_list);
app.all('/api/v1.5/omonitor/radar/wf/list', omonitor.radar_wf_list);
app.all('/api/v1.5/omonitor/pie/cell/list', omonitor.pie_cell_list);
app.all('/api/v1.5/omonitor/pie/lte/list', omonitor.pie_lte_list);
app.all('/api/v1.5/omonitor/pie/wf/list', omonitor.pie_wf_list);
app.all('/api/v1.5/omonitor/heat/cell/list', omonitor.heat_cell_list);

app.all('/api/v1.6/oaction/map/cell/list', oaction.map_cell_list);
app.all('/api/v1.6/oaction/map/lte/list', oaction.map_lte_list);
app.all('/api/v1.6/oaction/map/wf/list', oaction.map_wf_list);
app.all('/api/v1.6/oaction/chart/cell/list', oaction.chart_cell_list);
app.all('/api/v1.6/oaction/chart/lte/list', oaction.chart_lte_list);
app.all('/api/v1.6/oaction/chart/wf/list', oaction.chart_wf_list);
app.all('/api/v1.6/oaction/treemap/cell/list', oaction.treemap_cell_list);
app.all('/api/v1.6/oaction/treemap/lte/list', oaction.treemap_lte_list);
app.all('/api/v1.6/oaction/treemap/wf/list', oaction.treemap_wf_list);
app.all('/api/v1.6/oaction/map/cell/info', oaction.map_cell_info);
app.all('/api/v1.6/oaction/map/lte/info', oaction.map_lte_info);
app.all('/api/v1.6/oaction/map/wf/info', oaction.map_wf_info);


app.all('/api/v1.7/caction/map/cell/list', caction.map_cell_list);
app.all('/api/v1.7/caction/map/lte/list',  caction.map_lte_list);
app.all('/api/v1.7/caction/map/wf/list',   caction.map_wf_list);

app.all('/api/v1.8/oreal/map/lte/newfactor/list',  oreal.map_lte_newfactor_list);
app.all('/api/v1.8/oreal/map/fullid/detail',  oreal.map_fullid_detail);
app.all('/api/v1.8/oreal/map/fullid/indicator',  oreal.map_fullid_indicator);
app.all('/api/v1.8/oreal/map/fullid/nearcell',  oreal.map_fullid_nearcell);
app.all('/api/v1.8/oreal/heat/cell/list', oreal.heat_cell_list);
app.all('/api/v1.8/oreal/map/fullid/all/movement', oreal.map_fullid_movement);
app.all('/api/v1.8/oreal/map/fullid/badness/movement', oreal.map_fullid_badness_movement);
app.all('/api/v1.8/oreal/wifiloc/cell/list', oreal.wifiloc_cell_list);

// app.all('/api/v1.9/osubway/table/list', osubway.table_cell_list);
// app.all('/api/v1.9/osubway/map/fullid/detail',  osubway.map_fullid_detail);

app.all('/api/v2.0/contour/map/cell/list',  contour.map_cell_list);


if ('development' == app.get('env')) {
  app.use(errorHandler());
}

if (cluster.isMaster) {
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
	});	
}else{
	http.createServer(app).listen(3333, function(){
	  console.log('Express server listening on port ');
	});
}



// var server = app.listen(3333, function () {
//   var host = server.address().address
//   var port = server.address().port
//   console.log('Example app listening at http://%s:%s', host, port)
// });
