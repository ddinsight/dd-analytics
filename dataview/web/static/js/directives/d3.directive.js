var module = angular.module('Wave.d3.directive', [])


//////////////////////////////////////////////////////////////////////
// d3.js related Directives
//////////////////////////////////////////////////////////////////////

.factory('d3Service',['$document','$q','$rootScope',
    function($document, $q, $rootScope){
        var d = $q.defer();
        function onScriptLoad(){
            $rootScope.$apply(function() { d.resolve(window.d3); });
        }

        var scriptTag = $document[0].createElement('script');
        scriptTag.type = 'text/javascript';
        scriptTag.async = true;
        scriptTag.src = '/static/assets/vendor/d3.js';

        scriptTag.onreadystatechange = function() {
            if(this.readyState == 'complete') onScriptLoad();
        }
        scriptTag.onload = onScriptLoad;

        var s = $document[0].getElementsByTagName('body')[0];
        s.appendChild(scriptTag);

        return {
            d3: function() {return d.promise;}
        };
    }])


.directive('d3MultiLine', ['d3Service','d3MultiLineFormatter', function(d3Service, d3MultiLineFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            // console.log('d3MultiLine started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };

                var xAxisTypes = "time";
                var parseDate = d3.time.format("%m%d:%H").parse;
                var checkDateFormat = function(data){
                    console.log(data);
                    var dtrx = /(\d){2}[\-\/]*(\d){2}[\-\/]*(\d){2}/g
                    var tmrx = /(\d)*:(\d)+/g
                    console.log('-------- checkDateFormat ---------');
                    console.log(dtrx.test(data.data[0].x));
                    console.log(tmrx.test(data.data[0].x));
                    console.log('-------- checkDateFormat(match) ---------')
                    console.log(data.data[0].x);
                    console.log(data.data[0].x.match(dtrx));
                    console.log(data.data[0].x.match(tmrx));


                    if(tmrx.test(data.data[0].x) && data.data[0].x.match(tmrx).length == 1){
                        tickString = "%m%d:%H";
                        parseDate = d3.time.format(tickString).parse;
                    }
                    else if(dtrx.test(data.data[0].x) && data.data[0].x.match(dtrx).length == 1){
                        tickString = "%y%m%d";
                        parseDate = d3.time.format(tickString).parse;
                    }
                    else{
                        parseDate = function(x){
                            xAxisTypes = "general";
                            return x;
                        }
                    }
                    console.log('------------ tickString');
                    console.log(tickString);
                }
                var stop = scope.$watch('data', function(){
                    // console.log('--------- d3MultiLine directive data!!! ---------');
                    // console.log(JSON.stringify(scope.data));
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3MultiLineFormatter.parse(scope.data);
                        checkDateFormat(_data);
                        return scope.render(_data.data, _data.legend);
                    }
                }, true);

                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                    }, function() {
//                    d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3MultiLineFormatter.parse(scope.data);
                        checkDateFormat(_data);
                        return scope.render(_data.data, _data.legend);
                    }
                });


                scope.render = function(data, legend){

                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css">.axis path,.axis line {fill: none;stroke: #000;shape-rendering: crispEdges;}.x.axis path {display: none;} .line {fill:none; stroke:steelblue, stroke-width:1.5px;}</style>');
console.log('---- d3 width height ------');
console.log(d3.select(iElement[0])[0][0].offsetWidth + ' : ' + d3.select(iElement[0])[0][0].offsetHeight)
                    var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                    var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetHeight;
                    var margin = {top:20/600*height, right:80/900*width, bottom:120/900*height, left:70/600*width};
                    width = width - margin.left - margin.right;
                    height = height  - margin.top - margin.bottom;

                    var svg = d3.select(iElement[0]).append("svg")
                        .style('width', '100%')
                        .style('height', '100%')
                        .attr("width", width + margin.left+margin.right)
                        .attr("height", height + margin.top+margin.bottom)
                        .style("font","10px sans-serif")
                    .append("g")
                        .attr("transform","translate(" + margin.left +","+margin.top +")");

                    var x;
                    if(xAxisTypes == "time"){
                        x = d3.time.scale().range([0, width]);
                    }else{
                        x = d3.scale.ordinal().rangeRoundBands([0,width])
                    }

                    data.forEach(function(d){
                        if(!_.isNull(d.x))
                            d.x = parseDate(d.x.toString());
                        // console.log(d.x);
                    });

                    var y = d3.scale.linear().range([height,0]);

                    var color = d3.scale.category10();
                    var ledcolor = d3.scale.category10();

                    var xAxis = d3.svg.axis().scale(x).orient("bottom");
                    var yAxis = d3.svg.axis().scale(y).orient("left");


                    var line = d3.svg.line()
                            .interpolate("basis-open")
                            .x(function(d){ return x(d.date);})
                            .y(function(d){ return y(d.value);});

                    var legendArr = [];
                    // // console.log( d3.keys(legend) );
                    d3.keys(legend).forEach(function(key){
                        legendArr.push({key:key, value:legend[key]});
                    });
                    legendArr = legendArr.filter(function(obj){ return obj.key!='x';});

                    color.domain(legendArr);


                    // console.log(data.length);
                    var groups = legendArr.map(function(obj){
                        return {
                            name:obj.value,
                            values: data.map(function(d){
                                return {date:d.x, value: +d[obj.key]};
                            })
                        };
                    });

                    x.domain(d3.extent(data, function(d){ return d.x; }))
                    y.domain([
                        d3.min(groups, function(c){ return d3.min(c.values, function(v){ return v.value; }); }),
                        d3.max(groups, function(c){ return d3.max(c.values, function(v){ return v.value; }); })
                    ]);

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0,"+height+")")
                        .call(xAxis)
                        .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-65)"
                         });
                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .selectAll("text")
                        .style("text-anchor", "end")
                        // .attr("dx", ".-1em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-45)"
                         })
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy",".71em")
                        .style("text-anchor","end")
                        .text("Value");

                    var group = svg.selectAll(".city")
                            .data(groups)
                        .enter().append("g")
                            .attr("class", "city");

                    group.append("path")
                            .attr("class","line")
                            .attr("d", function(d){return line(d.values);})
                            .style("stroke", function(d){ return color(d.name);});

                    // var ttlist = legendArr.map(function(obj){return obj.value;});
                    var title = svg.selectAll(".legend")
                            .data(groups)
                        .enter().append("g")
                            .attr("class", "legend")
                            .attr("transform", function(d, i){ return "translate(0," + i * 20 + ")"; });

                    title.append("rect")
                        .datum(function(d){ return {name: d.name, value:d.values[d.values.length -1]}; })
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("height", 18)
                            .style("fill", function(d){ return color(d.name);})
                            ;

                    title.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .style("text-anchor","end")
                            .text(function(d){ return d.name; });

                    group.append("text")
                            .datum(function(d){ return {name: d.name, value:d.values[d.values.length -1]}; })
                            .attr("transform", function(d){ return "translate(" + x(d.value.date) + "," + y(d.value.value) + ")"; })
                            .attr("x", 3)
                            .attr("dy", ".35em")
                            .style("fill", function(d){ return color(d.name);})
                            .text(function(d) { return d.name; });

                }
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive

.directive('d3BarLine', ['d3Service', 'd3BarLineFormatter', function(d3Service, d3BarLineFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            // console.log('d3BarLine started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };
                var xAxisTypes = "time";
                var parseDate = d3.time.format("%m%d:%H").parse;
                var tickString = "%m%d:%H";
                var checkDateFormat = function(data){
                    console.log(data);
                    var dtrx = /(\d){2}[\-\/]*(\d){2}[\-\/]*(\d){2}/
                    var tmrx = /(\d)*:(\d)+/
                    console.log('-------- checkDateFormat ---------');
                    console.log(dtrx.test(data.data[0].x));
                    console.log(tmrx.test(data.data[0].x));
                    console.log('-------- checkDateFormat(match) ---------')
                    console.log(data.data[0].x.match(dtrx));
                    console.log(data.data[0].x.match(tmrx));


                    if(tmrx.test(data.data[0].x) && data.data[0].x.match(tmrx).length == 1){
                        tickString = "%m%d:%H";
                        parseDate = d3.time.format(tickString).parse;
                    }
                    else if(dtrx.test(data.data[0].x) && data.data[0].x.match(dtrx).length == 1){
                        tickString = "%y%m%d";
                        parseDate = d3.time.format(tickString).parse;

                    }
                    else{
                        parseDate = function(x){
                            xAxisTypes = "general";
                            return x;
                        }
                    }
                }
                var stop = scope.$watch('data', function(){
                if(scope.data != undefined && scope.data.length>0){
                    var _data = d3BarLineFormatter.parse(scope.data);
                    checkDateFormat(_data);
                    return scope.render(_data.data, _data.legend);
                }
                }, true);

            scope.$watch(function() {
                return angular.element(window)[0].innerWidth;
            }, function() {
//                d3.select(iElement[0]).select("svg").remove();
                if(scope.data != undefined && scope.data.length>0){
                    var _data = d3BarLineFormatter.parse(scope.data);
                    checkDateFormat(_data);
                    return scope.render(_data.data, _data.legend);
                }
            });


            scope.render = function(data, legend){
                angular.element(iElement).empty();
                angular.element(iElement).prepend('<style type="text/css"> {fill:none; stroke:brown, stroke-width:1.5px;} .bar { fill: steelblue;z-index:0; } .axis {font: 10px sans-serif; }.axis path,.axis line {fill: none;stroke: #000;shape-rendering: crispEdges;}.x.axis path {display: none;}</style>');

                var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetHeight;

                var margin = {top:20/600*height, right:50/900*width, bottom:100/600*height, left:60/900*width};
                width = width - margin.left - margin.right;
                height = height  - margin.top - margin.bottom;

                var x;
                x = d3.scale.ordinal().rangeRoundBands([0,width], .1);

                data.forEach(function(d){
                    if(!_.isNull(d.x))
                    d.x = parseDate(d.x.toString());
                });
                var y = d3.scale.linear().range([height,0]);
                var y2 = d3.scale.linear().range([height,0]);

                var xAxis;
                if(xAxisTypes == "time"){
                    xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickString));;
                }else{
                    xAxis = d3.svg.axis().scale(x).orient("bottom");
                }
                var yAxis = d3.svg.axis().scale(y).orient("left");
                var y2Axis = d3.svg.axis().scale(y2).orient("right");

                var legendArr = [];
                // console.log( d3.keys(legend) );
                d3.keys(legend).forEach(function(key){
                    legendArr.push({key:key, value:legend[key]});
                });

                legendArr = legendArr.filter(function(obj){ return obj.key!='x';});


                var svg = d3.select(iElement[0]).append("svg")
                    .style('width', '100%')
                    .style('height', '100%')
                    .attr("width", width + margin.left+margin.right)
                    .attr("height", height + margin.top+margin.bottom)
                    .append("g")
                    .attr("transform","translate(" + margin.left +","+margin.top +")");
                var hmax  = d3.max(data, function(d){ return d.y; })
                var hmax2 = d3.max(data, function(d){ return d.y2; })

                x.domain(data.map(function(d){ return d.x; }));
                y.domain([0, hmax]);
                y2.domain([0, hmax2]);

                var color = d3.scale.category10();
                var ledcolor = d3.scale.category10();
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0,"+height+")")
                    .call(xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", function(d) {
                        return "rotate(-65)"
                    });

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate("+(width)+",0)")
                    .style("fill", color(0))
                    .call(y2Axis)
                .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    // .attr("dy",".71em")
                    .style("text-anchor","end")
                    .text(legend.y2);


                svg.append("g")
                        .attr("class", "y axis")
                        .style("fill",color(1))
                        .call(yAxis)
                    .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy",".71em")
                        .style("text-anchor","end")
                        .text(legend.y);


                var line = d3.svg.line()
                            .x(function(d){ return x(d.x)+x.rangeBand()/2;})
                            .y(function(d){ return y2(d.y2);})
                            .interpolate("basis");

                    var group = svg.append("g")
                            .attr("class", "city");

                    group.selectAll(".bar")
                            .attr("id", "id_bar")
                            .data(data)
                        .enter().append("rect")
                            .attr("class","bar")
                            .style("fill", color(0))
                            .attr("x", function(d){ return x(d.x); })
                            .attr("width", x.rangeBand())
                            .attr("y", function(d){ return y(d.y); })
                            .attr("height", function(d){ return height - y(d.y); })
                            ;

                    group.append("path")
                        .datum(data)
                            .attr("class","line")
                            .style("stroke", color(1))
                            .style("fill", "none")
                            .style("stroke-width", "2.5px")
                            .attr("d", line)
                            ;

                    var ttlist = legendArr.map(function(obj){return obj.value;});
                    var title = svg.selectAll(".legend")
                            .data(ttlist.slice(0,2).reverse())
                        .enter().append("g")
                            .attr("class", "legend")
                            .attr("transform", function(d, i){ return "translate(0," + i * 20 + ")"; });

                    title.append("rect")
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("height", 18)
                            .style("fill", ledcolor);

                    title.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .style("text-anchor","end")
                            .text(function(d){ return d; });

                }
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive

.directive('d3GroupedBar', ['d3Service', 'd3GroupedBarFormatter', function(d3Service, d3GroupedBarFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            console.log('d3GroupedBar started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };
                var xAxisTypes = "time";
                var parseDate = d3.time.format("%m%d:%H").parse;
                var tickString = "%m%d:%H";
                var checkDateFormat = function(data){
                    console.log(data);
                    var dtrx = /(\d){2}[\-\/]*(\d){2}[\-\/]*(\d){2}/
                    var tmrx = /(\d)*:(\d)+/
                    console.log('-------- checkDateFormat ---------');
                    console.log(dtrx.test(data.data[0].x));
                    console.log(tmrx.test(data.data[0].x));
                    console.log('-------- checkDateFormat(match) ---------')
                    console.log(data.data[0].x.match(dtrx));
                    console.log(data.data[0].x.match(tmrx));

                    if(tmrx.test(data.data[0].x) && data.data[0].x.match(tmrx).length == 1){
                        tickString = "%m%d:%H";
                        parseDate = d3.time.format(tickString).parse;
                    }
                    else if(dtrx.test(data.data[0].x) && data.data[0].x.match(dtrx).length == 1){
                        tickString = "%y%m%d";
                        parseDate = d3.time.format(tickString).parse;

                    }
                    else{
                        parseDate = function(x){
                            xAxisTypes = "general";
                            return x;
                        }
                    }
                }

                var stop = scope.$watch('data', function(){
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3GroupedBarFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }

                }, true);

                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                }, function() {
//                    d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3GroupedBarFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                });

                scope.render = function(data, legend){
                    console.log('////////////////////////////////////////////////////');
                    console.log('// render begin....');
                    console.log(data);
                    console.log(angular.element(iElement));
                    console.log('////////////////////////////////////////////////////');
                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css"> .bar { fill: steelblue; }  .axis {font: 10px sans-serif; }.axis path,.axis line {fill: none;stroke: #000;shape-rendering: crispEdges;}.x.axis path {display: none;}</style>');

                    var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                    var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetHeight;
                    var margin = {top:20/600*height, right:20/900*width, bottom:80/600*height, left:60/900*width};
                    width = width - margin.left - margin.right;
                    height = height   - margin.top - margin.bottom;

                    var x0 = d3.scale.ordinal()
                        .rangeRoundBands([0, width], .1);
                    var x1 = d3.scale.ordinal();
                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var color = d3.scale.category20();
                    var xAxis = d3.svg.axis().scale(x0).orient("bottom");
                    var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));

                    var svg = d3.select(iElement[0]).append("svg")
                        .style('width', '100%')
                        .style('height', '100%')
                        .attr("width", width + margin.left+margin.right)
                        .attr("height", height + margin.top+margin.bottom)
                        .append("g")
                        .attr("transform","translate(" + margin.left +","+margin.top +")");
                    var legendArr = [];
                    d3.keys(legend).forEach(function(key){
                        legendArr.push({key:key, value:legend[key]});
                    });

                    legendArr = legendArr.filter(function(obj){ return obj.key!='x';});

                    data.forEach(function(d){
                        d.groups = legendArr.map(function(obj){return {name:obj.value , value: +d[obj.key]}; });
                    });
//                    console.log(data);

                    var legs = legendArr.map(function(obj){return obj.value;});

                    x0.domain(data.map(function(d){return d.x; }));
                    x1.domain(legs).rangeRoundBands([0, x0.rangeBand()]);
                    y.domain([0, d3.max(data, function(d){ return d3.max(d.groups, function(d){ return d.value;}); })]);

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                    .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-65)"
                        });

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                    .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text("Value");

                    var chart = svg.selectAll(".state")
                        .data(data)
                    .enter().append("g")
                        .attr("class","g")
                        .attr("transform", function(d){ return "translate("+x0(d.x)+",0)";});

                    chart.selectAll("rect")
                        .data(function(d){ return d.groups; })
                    .enter().append("rect")
                        .attr("width", x1.rangeBand())
                        .attr("x", function(d){ return x1(d.name);})
                        .attr("y", function(d){ return y(d.value); })
                        .attr("height", function(d){ return height - y(d.value); })
                        .style("fill", function(d){ return color(d.name); });

                    var ttlist = legendArr.map(function(obj){return obj.value;});
                    var title = svg.selectAll(".legend")
                        .data(ttlist.slice())
                    .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, i){ return "translate(0," + i * 20 + ")"; });

                    title.append("rect")
                        .attr("x", width - 18)
                        .attr("width", 18)
                        .attr("height", 18)
                        .style("fill", color);

                    title.append("text")
                        .attr("x", width - 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor","end")
                        .text(function(d){ return decodeURIComponent(d); });

                }
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive

.directive('d3StackedBar', ['d3Service','d3StackedBarFormatter', function(d3Service, d3StackedBarFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            console.log('d3StackedBar started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };

                var stop = scope.$watch('data', function(){

                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3StackedBarFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }

                }, true);
                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                }, function() {
//                d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3StackedBarFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                });

                scope.render = function(data, legend){
                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css"> .bar { fill: steelblue; }  .axis {font: 10px sans-serif; }.axis path,.axis line {fill: none;stroke: #000;shape-rendering: crispEdges;}.x.axis path {display: none;}</style>');


                    var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                    var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetHeight;
                    var margin = {top:20/600*height, right:20/900*width, bottom:80/600*height, left:70/900*width};

                    width = width - margin.left - margin.right;
                    height = height   - margin.top - margin.bottom;

                    var x = d3.scale.ordinal()
                    .rangeRoundBands([0, width], .1);
                    var y = d3.scale.linear()
                    .rangeRound([height, 0]);
                    var color = d3.scale.category20();
                    var xAxis = d3.svg.axis().scale(x).orient("bottom");
                    var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));
                    var svg = d3.select(iElement[0]).append("svg")
                        .style('width', '100%')
                        .style('height', '100%')
                        .attr("width", width + margin.left+margin.right)
                        .attr("height", height + margin.top+margin.bottom)
                    .append("g")
                        .attr("transform","translate(" + margin.left +","+margin.top +")");

                    var legendArr = [];
                        d3.keys(legend).forEach(function(key){
                        legendArr.push({key:key, value:legend[key]});
                    });

                    legendArr = legendArr.filter(function(obj){ return obj.key!='x';});

                    data.forEach(function(d){
                        var y0 = 0;
                        d.groups = legendArr.map(function(obj){return {name:obj.value , y0:y0, y1: y0 += +d[obj.key]}; });
                        d.total = d.groups[d.groups.length -1].y1;
                    });

                    var legs = legendArr.map(function(obj){return obj.value;});
                    color.domain(legs);
                    x.domain(data.map(function(d){return d.x; }));
                    y.domain([0, d3.max(data, function(d){ return d.total; })]);

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                    .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                        return "rotate(-65)"
                        });

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                    .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text("Value");

                    var chart = svg.selectAll(".state")
                            .data(data)
                        .enter().append("g")
                            .attr("class","g")
                            .attr("transform", function(d){ return "translate("+x(d.x)+",0)";});
                    chart.selectAll("rect")
                            .data(function(d){ return d.groups; })
                        .enter().append("rect")
                            .attr("width", x.rangeBand())
                            .attr("y", function(d){ return y(d.y1); })
                            .attr("height", function(d){ return y(d.y0) - y(d.y1); })
                            .style("fill", function(d){ return color(d.name); });

                    var ttlist = legendArr.map(function(obj){return obj.value;});
                    var title = svg.selectAll(".legend")
                            .data(ttlist.slice().reverse())
                        .enter().append("g")
                            .attr("class", "legend")
                            .attr("transform", function(d, i){ return "translate(0," + i * 20 + ")"; });

                    title.append("rect")
                            .attr("x", width - 18)
                            .attr("width", 18)
                            .attr("height", 18)
                            .style("fill", color);

                    title.append("text")
                            .attr("x", width - 24)
                            .attr("y", 9)
                            .attr("dy", ".35em")
                            .style("text-anchor","end")
                            .text(function(d){ return decodeURIComponent(d); });

                }
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive

.directive('d3NormalizeStackedBar', ['d3Service', 'd3NormalizeStackedBarFormatter', function(d3Service, d3NormalizeStackedBarFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            // console.log('d3NormalizeStackedBar started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };
                var stop = scope.$watch('data', function(){
                    console.log('--------- d3NormalizeStackedBar directive data ---------');
                    console.log(scope.data);
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3NormalizeStackedBarFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                }, true);

                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                }, function() {
//                    d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3NormalizeStackedBarFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                });

                scope.render = function(data, legend){
                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css"> .bar { fill: steelblue; }  .axis {font: 10px sans-serif; }.axis path,.axis line {fill: none;stroke: #000;shape-rendering: crispEdges;}.x.axis path {display: none;}</style>');


                    var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                    var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetWidth;
                    var margin = {top:20/600*height, right:200/900*width, bottom:80/600*height, left:100/900*width};
                    width = width - margin.left - margin.right;
                    height = height  - margin.top - margin.bottom;

                    var x = d3.scale.ordinal()
                        .rangeRoundBands([0, width], .1);
                    var y = d3.scale.linear()
                    .rangeRound([height, 0]);
                    var color = d3.scale.category20();

                    var xAxis = d3.svg.axis().scale(x).orient("bottom");
                    var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".0%"));

                    var svg = d3.select(iElement[0]).append("svg")
                            .style('width', '100%')
                            .style('height', '100%')
                            .attr("width", width + margin.left+margin.right)
                            .attr("height", height + margin.top+margin.bottom)
                        .append("g")
                            .attr("transform","translate(" + margin.left +","+margin.top +")");

                    var legendArr = [];
                    // console.log( d3.keys(legend) );
                    d3.keys(legend).forEach(function(key){
                        legendArr.push({key:key, value:legend[key]});
                    });

                    legendArr = legendArr.filter(function(obj){ return obj.key!='x';});
                    color.domain(legendArr.filter(function(obj){ return obj.value; }));

                    data.forEach(function(d){
                        var y0 = 0;
                        d.groups = legendArr.map(function(obj){ return {name:obj.value , y0:y0, y1: y0 += +d[obj.key]}; })
                        d.groups.forEach(function(d){ d.y0 /= y0; d.y1 = y0 == 0 ?  d.y1 : d.y1 / y0; })
                    });

                    // // console.log("legs" + legs);
                    x.domain(data.map(function(d){return d.x; }));
                    // y.domain([0, d3.max(data, function(d){ return d.total; })]);

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                    .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-65)"
                         });

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                    .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-65)"
                        });
                    var chart = svg.selectAll(".state")
                        .data(data)
                    .enter().append("g")
                        .attr("class","g")
                        .attr("transform", function(d){ return "translate("+x(d.x)+",0)";});

                    chart.selectAll("rect")
                        .data(function(d){ return d.groups; })
                    .enter().append("rect")
                        .attr("width", x.rangeBand())
                        .attr("y", function(d){ return y(d.y1); })
                        .attr("height", function(d){  return y(d.y0) - y(d.y1); })
                        .style("fill", function(d){ return color(d.name); });

                    var ttlist = legendArr.map(function(obj){return obj.value;});
                    var title = svg.selectAll(".legend")
                        .data(ttlist.slice().reverse())
                    .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, i){ return "translate(0," + i * 20 + ")"; });

                    title.append("rect")
                        .attr("x", width + 18)
                        .attr("width", 18)
                        .attr("height", 18)
                        .style("fill", color);

                    title.append("text")
                        .attr("x", width + 18+19)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor","start")
                        .text(function(d){ return decodeURIComponent(d); });

                }
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive

.directive('d3Pie', ['d3Service', 'd3PieFormatter', function(d3Service, d3PieFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            // console.log('d3Pie started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };

                var stop = scope.$watch('data', function(){
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3PieFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                }, true);

                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                }, function() {
//                    d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3PieFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                });

                scope.render = function(data, legend){
                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css">.arc path { storke:#fff; } </style>');
                    var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                    var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetHeight;
                    var margin = {top:20/600*height, right:20/900*width, bottom:30/600*height, left:40/900*width};
                    width = width - margin.left - margin.right;
                    height = height  - margin.top - margin.bottom;
                    var radius = Math.min(width, height) / 2;

                    var svg = d3.select(iElement[0]).append("svg")
                            .style('width', '100%')
                            .style('height', '100%')
                            .attr("width", width + margin.left+margin.right)
                            .attr("height", height + margin.top+margin.bottom)
                        .append("g")
                            .attr("transform","translate(" + width/2 +","+ height / 2 +")");

                    var color = d3.scale.category10();
                    var arc = d3.svg.arc()
                        .outerRadius(radius - 10)
                        .innerRadius(0);
                    var pie = d3.layout.pie()
                        .sort(null)
                        .value(function(d){ return d.y; })

                    data.forEach(function(d){
                        d.y = +d.y;
                    });

                    var g = svg.selectAll(".arc")
                        .data(pie(data))
                        .enter().append("g")
                        .attr("class", "arc");

                    g.append("path")
                        .attr("d", arc)
                        .style("fill", function(d){ return color(d.data.x)});
                    g.append("text")
                        .attr("transform", function(d){ return "translate("+ arc.centroid(d) + ")"; })
                        .attr("dy", ".35em")
                        .style("text-anchor", "middle")
                        .style("fill", "#fff")
                        .text(function(d){ return '[' + d.data.x + ']:' + d.data.y; });
                }
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive


.directive('d3Donut', ['d3Service', 'd3DonutFormatter', function(d3Service, d3DonutFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            // console.log('d3Donut started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };
                var stop = scope.$watch('data', function(){
                    // console.log('--------- d3Donut directive data ---------');
                    // console.log(JSON.stringify(scope.data));

                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3DonutFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                }, true);
                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                }, function() {
//                    d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3DonutFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                });

                scope.render = function(data, legend){
                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css">.arc path { storke:#fff; } </style>');

                    var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                    var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetHeight;
                    var margin = {top:20/600*height, right:20/900*width, bottom:30/600*height, left:40/900*width};
                    width = width  - margin.left - margin.right;
                    height = height   - margin.top - margin.bottom;

                    var radius = Math.min(width, height) / 2;

                    var svg = d3.select(iElement[0]).append("svg")
                            .style('width', '100%')
                            .style('height', '100%')
                            .attr("width", width + margin.left+margin.right)
                            .attr("height", height + margin.top+margin.bottom)
                        .append("g")
                            .attr("transform","translate(" + width/2 +","+ height / 2 +")");
                    var color = d3.scale.category10();
                    var arc = d3.svg.arc()
                        .outerRadius(radius*0.9)
                        .innerRadius(radius*0.4);

                    var pie = d3.layout.pie()
                        .sort(null)
                        .value(function(d){ return d.y; })

                    data.forEach(function(d){
                        d.y = +d.y;
                    });

                    var g = svg.selectAll(".arc")
                        .data(pie(data))
                        .enter().append("g")
                        .attr("class", "arc");

                    g.append("path")
                        .attr("d", arc)
                        .style("fill", function(d){ return color(d.data.x)});
                    g.append("text")
                        .attr("transform", function(d){ return "translate("+ arc.centroid(d) + ")"; })
                        .attr("dy", ".35em")
                        .style("text-anchor", "middle")
                        .style("fill", "#fff")
                        .text(function(d){ return '[' + d.data.x + ']:' + d.data.y; });
                }
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive

	
.directive('d3Scatter', ['d3Service', 'd3ScatterFormatter', function(d3Service, d3ScatterFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            // console.log('d3Scatter started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };

                var stop = scope.$watch('data', function(){
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3ScatterFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                }, true);

                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                }, function() {
                    d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3ScatterFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                });

                scope.render = function(data, legend){
                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css"> .axis path, .axis line{fill:none; stroke:#000; shape-rendering: crispEdges;} .dot{ stroke:#000 }</style>');
                    var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                    var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetHeight;
                    // var width = d3.select(iElement[0])[0][0].offsetWidth;
                    // var height = d3.select(iElement[0])[0][0].offsetHeight;
                    var margin = {top:20/900*height, right:90/900*width, bottom:30/600*height, left:40/900*width};

                    width = width  - margin.left - margin.right;
                    height = height  - margin.top - margin.bottom;

                    var svg = d3.select(iElement[0]).append("svg")
                        .style('width', '100%')
                        .style('height', '100%')
                        .attr("width", width + margin.left+margin.right)
                        .attr("height", height + margin.top+margin.bottom)
                        .style("font","10px sans-serif")
                    .append("g")
                        .attr("transform","translate(" + margin.left +","+ margin.top +")");


                    var color = d3.scale.category10();

                    var x = d3.scale.linear()
                        .range([0, width]);
                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left");

                    data.forEach(function(d){
                        d.y = +d.y;
                        d.y2 = +d.y2;
                    });

                    x.domain(d3.extent(data, function(d){ return d.y; })).nice();
                    y.domain(d3.extent(data, function(d){ return d.y2; })).nice();

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                    .append("text")
                        .attr("class", "label")
                        .attr("x", width)
                        .attr("y", -6)
                        .style("text-anchor", "end")
                        .text(legend.y);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                    .append("text")
                        .attr("class", "label")
                        .attr("transform","rotate(-90)")
                        .attr("y", 6)
                        .attr("dy",".71em")
                        .style("text-anchor", "end")
                        .text(legend.y2);

                    svg.selectAll(".dot")
                    .data(data)
                    .enter().append("circle")
                        .attr("class", "dot")
                        .attr("r", 3.5)
                        .attr("cx", function(d){ return x(d.y); })
                        .attr("cy", function(d){ return y(d.y2); })
                        .style("fill", function(d){ return color(d.x); });

                    var legend = svg.selectAll(".legend")
                    .data(color.domain())
                    .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d,i){ return "translate(0," + i*20 + ")"; });

                    legend.append("rect")
                        .attr("x", width - 24)
                        .attr("width", 18)
                        .attr("height", 18)
                        .style("fill", color);

                    legend.append("text")
                        .attr("x", width + 56)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor","end")
                        .text(function(d){ return d; })

                }
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive


	
.directive('d3Todow', ['d3Service', 'd3TodowFormatter', function(d3Service, d3TodowFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };

                var stop = scope.$watch('data', function(){
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3TodowFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }

                }, true);

                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                }, function() {
//                    d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3TodowFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                });

                scope.render = function(data, legend){
                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css"> .axis path, .axis line{fill:none; stroke:#000; shape-rendering: crispEdges;} .dot{ stroke:#000 }</style>');

                    var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                    var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetHeight;
                    var margin = {top:20/600*height, right:90/900*width, bottom:30/600*height, left:100/900*width};

                    width = width - margin.left - margin.right;
                    height = height   - margin.top - margin.bottom;


                    var svg = d3.select(iElement[0]).append("svg")
                        .style('width', '100%')
                        .style('height', '100%')
                        .attr("width", width + margin.left+margin.right)
                        .attr("height", height + margin.top+margin.bottom)
                        .style("font","10px sans-serif")
                    .append("g")
                        .attr("transform","translate(" + margin.left +","+ margin.top +")");

                    // Draw TodoW Chart
                    var x = d3.scale.linear().range([0, width]);
                    var y = d3.scale.ordinal().rangeRoundBands([0,height], .1);
                    var r = d3.scale.linear().range([height/160, height/10]);


                    // var color = d3.scale.category10();
                    var color = d3.scale.ordinal().range(['#bae4b3','#74c476','#31a354','#006d2c','#8856a7']);

                    var xAxis = d3.svg.axis().scale(x).orient("bottom");
                    var yAxis = d3.svg.axis().scale(y).orient("left");

                    x.domain(d3.extent(data, function(d){ return d.x2; }));
                    y.domain(data.map(function(d){return d.x; }));
                    r.domain(d3.extent(data, function(d){ return d.y; }));

                    color.domain(d3.extent(data, function(d){ return d.y2; }));

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                    .append("text")
                        .attr("class","label")
                        .attr("x", width)
                        .attr("y", -6)
                        .style("text-anchor", "end")
                        .text(legend.x2)

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.15em")
                        .attr("dy", ".15em")
                        .attr("transform", function(d) {
                            return "rotate(-45)"
                        });
                    svg.selectAll(".dot")
                    .data(data)
                    .enter().append("circle")
                        .attr("class", "dot")
                        .attr("r", function(d){ return r(d.y); })
                        .attr("cx", function(d){ return x(d.x2); })
                        .attr("cy", function(d){ return y(d.x); })
                        .attr("fill", function(d){ return color(d.y2); })

                }
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive

.directive('d3Bubble', ['d3Service', 'd3BubbleFormatter', function(d3Service, d3BubbleFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            // console.log('d3Bubble started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };

                var stop = scope.$watch('data', function(){

                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3BubbleFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }

                }, true);

                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                }, function() {
                    d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3BubbleFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                });

                var t = [1, 100];

                scope.render = function(data, legend){
                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css"> text {font: 10px sans-serif;}</style>');
                    var classes = [];
                    var keys = d3.keys(legend).filter(function(key){ return key!='x'; });
                    keys.forEach(function(key){
                        var extKey = [];
                        data.forEach(function(d){
                            extKey.push(d[key]);
                        });
                        var mm = d3.extent(d3.extent(extKey, function(d) { return d; }))
                        data.forEach(function(d){
                            var vv = ((t[1] - t[0])/(mm[1] - mm[0]))*d[key] + ( t[0] - ((t[1] - t[0])/(mm[1] - mm[0]))*mm[0] )
                            classes.push({ packageName:legend[key], className: d['x'] , value:vv });
                        });
                    });
                    // Draw TodoW Chart
                    var diameter = (d3.select(iElement[0])[0][0].offsetHeight + d3.select(iElement[0])[0][0].offsetWidth)/2,
                    format = d3.format(",d"),
                    color = d3.scale.category20();

                    var bubble = d3.layout.pack()
                        .sort(null)
                        .size([diameter, diameter])
                        .padding(1.5);

                    var svg = d3.select(iElement[0]).append("svg")
                        .attr("width", diameter)
                        .attr("height",diameter)
                        .attr("class", "bubble");

                    // // console.log(JSON.stringify({children:classes}));

                    var node = svg.selectAll(".node")
                        .data(bubble.nodes({children:classes})
                        .filter(function(d) { return !d.children; }))
                        .enter().append("g")
                        .attr("class", "node")
                        .attr("transform", function(d){ return "translate("+d.x+","+d.y+")";});


                    node.append("title")
                        .text(function(d){ return d.className + ":" + format(d.value); });

                    node.append("circle")
                        .attr("r", function(d){ return d.r; })
                        .style("fill", function(d){ return color(d.packageName); });

                    node.append("text")
                        .attr("dy",".3em")
                        .style("text-anchor","middle")
                        .style("fill", "#FFFFFF")
                        .style("font-family","Verdana")
                        .style("font-size","6")
                        .text(function(d){ return !_.isUndefined(d.className) ? d.className.substring(0, d.r/3):''; });
                    // .text(function(d){ return d.className.substring(0,d.r/3); });


                    var iLegend = svg.append("g")
                        .attr("class","legend")
                        .attr("x", diameter - 165)
                        .attr("y", 25)
                        .attr("height", 100)
                        .attr("width", 100);

                    iLegend.selectAll("g")
                        .data(keys)
                        .enter()
                        .append("g")
                        .each(function(d, i){
                            var g = d3.select(this);
                            // console.log(">>>>>>>>legend[d] is " + legend[d] + ":" + d);
                            g.append("rect")
                            .attr("x", 10)
                            .attr("y", i*25)
                            .attr("width", 10)
                            .attr("height", 10)
                            .style("fill", color(legend[d]));

                            g.append("text")
                            .attr("x", 25)
                            .attr("y", i*25 + 8)
                            .attr("height", 30)
                            .attr("width", 100)
                            .style("fill", color(legend[d]))
                            .text(legend[d]);
                        });
                    d3.select(self.frameElement).style("height", diameter + "px");
                }
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive


.directive('d3Treemap', ['d3Service', 'd3TreemapFormatter', function(d3Service, d3TreemapFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            // console.log('d3Treemap started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };


                var stop = scope.$watch('data', function(){
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3TreemapFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }

                }, true);

                scope.$watch(function() {
                        return angular.element(window)[0].innerWidth;
                    }, function() {
//                    d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3TreemapFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                });

                scope.render = function(data, legend){
                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css"> body {  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;} .node { border: solid 1px white;font: 10px sans-serif;line-height: 12px;overflow: hidden; position: absolute; text-indent: 2px;} </style>');
                    var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                    var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetHeight;
                    var margin = {top:40/600*height, right:10/900*width, bottom:10/600*height, left:10/900*width};
                    width = width - margin.left - margin.right;
                    height = height - margin.top - margin.bottom;


                    var color = d3.scale.category10();

                    var treemap = d3.layout.treemap()
                        .size([width, height])
                        .sticky(true)
                        .value(function(d){ return d.size; });

                    var div = d3.select(iElement[0]).append("div")
                        .style("position", "relative")
                        .style("width", (width + margin.left + margin.right)+"px")
                        .style("height", (height + margin.top + margin.bottom)+"px")
                        .style("left", margin.left + "px")
                        .style("top", margin.top + "px");

                    var classes = [];
                    var parents = _.uniq(data, function(d){ return d.x; });
                    parents.forEach(function(p){
                        var obj = {};
                        obj["name"] = p.x;
                        obj["children"] = [];
                        data.forEach(function(d){
                            if(p.x == d.x){
                                obj["children"].push({name:d.x2, size:d.y});
                            }
                        })
                        classes.push(obj);
                    });
                    // console.log(JSON.stringify(classes));

                    var node = div.datum({name:"flare", children:classes}).selectAll(".node")
                        .data(treemap.nodes)
                        .enter().append("div")
                            .attr("class", "node")
                            .call(position)
                            .style("background", function(d){ return d.children ? color(d.name): null; })
                            .text(function(d){ return d.children ? null : d.name; })
                            .style("color","#ffffff")

                    function position() {
                        this.style("left", function(d) { return d.x + "px"; })
                        .style("top", function(d) { return d.y + "px"; })
                        .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
                        .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
                    }
                }
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive
	
.directive('d3StackedArea', ['d3Service', 'd3StackedAreaFormatter', function(d3Service, d3StackedAreaFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            console.log('d3StackedArea started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };

                var xAxisTypes = "time";
                var parseDate = d3.time.format("%m%d:%H").parse;
                var tickString = "%m%d:%H";
                var checkDateFormat = function(data){
                    console.log(data);
                    var dtrx = /(\d){2}[\-\/]*(\d){2}[\-\/]*(\d){2}/
                    var tmrx = /(\d)*:(\d)+/

                    if(tmrx.test(data.data[0].x) && data.data[0].x.match(tmrx).length > 1){
                            tickString = "%m%d:%H";
                            parseDate = d3.time.format(tickString).parse;
                    }
                    else if(dtrx.test(data.data[0].x) && data.data[0].x.match(dtrx).length > 1){
                        tickString = "%y%m%d";
                        parseDate = d3.time.format(tickString).parse;
                    }
                    else{
                        parseDate = function(x){
                            xAxisTypes = "general";
                            return x;
                        }
                    }
                }

                var stop = scope.$watch('data', function(){
                    console.log('--------- d3StackedArea directive data ---------');
                    console.log(JSON.stringify(scope.data));

                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3StackedAreaFormatter.parse(scope.data);
                        checkDateFormat(_data);
                        return scope.render(_data.data, _data.legend);
                    }
                }, true);

                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                }, function() {
//                d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3StackedAreaFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                });

                scope.render = function(data, legend){
                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css"> .axis path,.axis line {fill: none;stroke: #000;shape-rendering: crispEdges;}.browser text {text-anchor: end;} </style>');

                    console.log('--------- d3StackedArea directive scope.render ---------');
                    var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                    var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetHeight;
                    var margin = {top:50/600*height, right:80/900*width, bottom:50/600*height, left:50/900*width};
                    width = width - margin.left - margin.right;
                    height = height - margin.top - margin.bottom;


                    var svg = d3.select(iElement[0]).append("svg")
                        .style('width', '100%')
                        .style('height', '100%')
                        .attr("width", width + margin.left+margin.right)
                        .attr("height", height + margin.top+margin.bottom)
                        .style("font","10px sans-serif")
                    .append("g")
                        .attr("transform","translate(" + margin.left +","+margin.top +")");

                    var x;
                    if(xAxisTypes == "time"){
                        x = d3.time.scale().range([0, width]);
                    }else{
                        x = d3.scale.ordinal().rangeRoundBands([0,width])
                    }

                    data.forEach(function(d){
                        if(!_.isNull(d.x))
                            d.x = parseDate(d.x.toString());
                    });

                    var y = d3.scale.linear().range([height, 0]);
                    var area = d3.svg.area()
                        .x(function(d) {  return x(d.date); })
                        .y0(function(d) { return y(d.y0); })
                        .y1(function(d) { return y(d.y0 + d.y); });

                    var stack = d3.layout.stack()
                        .values(function(d) { return d.values; });

                    var color = d3.scale.category20();
                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        // .tickFormat(formatPercent)
                    ;

                    var legendArr = [];
                    d3.keys(legend).forEach(function(key){
                        legendArr.push({key:key, value:legend[key]});
                    });
                    legendArr = legendArr.filter(function(obj){ return obj.key!='x';});
                    color.domain(legendArr);

                    var browsers = stack(legendArr.map(function(obj){
                    return {
                        name:obj.value,
                        values: data.map(function(d){
                            return {date:d.x, y: d[obj.key]};
                        })
                    };
                    }));
                    console.log(browsers);
                    x.domain(d3.extent(data, function(d){ return d.x; }))
                    y.domain([
                        d3.min(browsers, function(c){ return d3.min(c.values, function(v){ return v.y; }); }),
                        d3.max(browsers, function(c){ return d3.max(c.values, function(v){ return v.y+v.y0; }); })
                    ]);
                    // console.log(browsers);
                    var browser = svg.selectAll(".browser")
                    .data(browsers)
                    .enter().append("g")
                        .attr("class", "browser");

                    browser.append("path")
                        .attr("class", "area")
                        .attr("d", function(d) { return area(d.values);  })
                        .style("fill", function(d) { return color(d.name); });

                    browser.append("text")
                    .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
                        .attr("transform", function(d) {  return "translate(" + x(d.value.date) + "," + y(d.value.y0 + d.value.y / 2) + ")"; })
                        .attr("x", -6)
                        .attr("dy", ".35em")
                        .text(function(d) { return d.name; });

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);
                } // end of render
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive

.directive('d3NormalizeStackedArea', ['d3Service', 'd3NormalizeStackedAreaFormatter', function(d3Service, d3StackedAreaFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            console.log('d3StackedArea started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };

                var xAxisTypes = "time";
                var parseDate = d3.time.format("%m%d:%H").parse;
                var tickString = "%m%d:%H";
                var checkDateFormat = function(data){
                    console.log(data);
                    var dtrx = /(\d){2}[\-\/]*(\d){2}[\-\/]*(\d){2}/
                    var tmrx = /(\d)*:(\d)+/

                    if(tmrx.test(data.data[0].x) && data.data[0].x.match(tmrx).length > 1){
                            tickString = "%m%d:%H";
                            parseDate = d3.time.format(tickString).parse;
                    }
                    else if(dtrx.test(data.data[0].x) && data.data[0].x.match(dtrx).length > 1){
                        tickString = "%y%m%d";
                        parseDate = d3.time.format(tickString).parse;
                    }
                    else{
                        parseDate = function(x){
                            xAxisTypes = "general";
                            return x;
                        }
                    }
                }

                var stop = scope.$watch('data', function(){
                    console.log('--------- d3NormalizeStackedArea directive data ---------');
                    console.log(JSON.stringify(scope.data));

                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3StackedAreaFormatter.parse(scope.data);
                        checkDateFormat(_data);
                        return scope.render(_data.data, _data.legend);
                    }
                }, true);

                scope.$watch(function() {
                        return angular.element(window)[0].innerWidth;
                    }, function() {
//                        d3.select(iElement[0]).select("svg").remove();
                        if(scope.data != undefined && scope.data.length>0){
                            var _data = d3StackedAreaFormatter.parse(scope.data);
                            return scope.render(_data.data, _data.legend);
                        }
                });

                scope.render = function(data, legend){
                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css"> .axis path,.axis line {fill: none;stroke: #000;shape-rendering: crispEdges;}.browser text {text-anchor: end;} </style>');

                    console.log('--------- d3NormalizeStackedArea directive scope.render ---------');

                    var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                    var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetHeight;
                    var margin = {top:50/600*height, right:80/900*width, bottom:50/600*height, left:50/900*width};
                    width = width - margin.left - margin.right;
                    height = height - margin.top - margin.bottom;


                    var svg = d3.select(iElement[0]).append("svg")
                        .style('width', '100%')
                        .style('height', '100%')
                        .attr("width", width + margin.left+margin.right)
                        .attr("height", height + margin.top+margin.bottom)
                        .style("font","10px sans-serif")
                    .append("g")
                        .attr("transform","translate(" + margin.left +","+margin.top +")");

                    var x;
                    if(xAxisTypes == "time"){
                        x = d3.time.scale().range([0, width]);
                    }else{
                        x = d3.scale.ordinal().rangeRoundBands([0,width])
                    }

                    data.forEach(function(d){
                        // console.log(d);
                        if(!_.isNull(d.x))
                        d.x = parseDate(d.x.toString());
                    });

                    var y = d3.scale.linear().range([height, 0]);
                    var formatPercent = d3.format(".0%");

                    var area = d3.svg.area()
                        .x(function(d) {  return x(d.date); })
                        .y0(function(d) { return y(d.y0); })
                        .y1(function(d) { return y(d.y0 + d.y); });

                    var stack = d3.layout.stack()
                        .values(function(d) { return d.values; });

                    var color = d3.scale.category20();
                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .tickFormat(formatPercent)
                        ;

                    var legendArr = [];
                    // // console.log( d3.keys(legend) );
                    d3.keys(legend).forEach(function(key){
                        legendArr.push({key:key, value:legend[key]});
                    });
                    legendArr = legendArr.filter(function(obj){ return obj.key!='x';});



                    color.domain(legendArr);
                    ndata = data.map(function(d){
                        var ss = 0;
                        legendArr.forEach(function(obj){
                            ss += d[obj.key]
                        })
                        return d.sum = ss;
                    });
                    // console.log(data.length);
                    var browsers = stack(legendArr.map(function(obj){
                        return {
                            name:obj.value,
                            values: data.map(function(d){
                                return {date:d.x, y: d[obj.key] / d.sum};
                            })
                        };
                    }));

                    console.log(browsers);
                    x.domain(d3.extent(data, function(d){ return d.x; }))
                    y.domain([
                        d3.min(browsers, function(c){ return d3.min(c.values, function(v){ return v.y; }); }),
                        d3.max(browsers, function(c){ return d3.max(c.values, function(v){ return v.y+v.y0; }); })
                    ]);
                    // console.log(browsers);
                    var browser = svg.selectAll(".browser")
                        .data(browsers)
                        .enter().append("g")
                            .attr("class", "browser");

                    browser.append("path")
                        .attr("class", "area")
                        .attr("d", function(d) { return area(d.values);  })
                        .style("fill", function(d) { return color(d.name); });

                    browser.append("text")
                    .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
                        .attr("transform", function(d) {  return "translate(" + x(d.value.date) + "," + y(d.value.y0 + d.value.y / 2) + ")"; })
                        .attr("x", -6)
                        .attr("dy", ".35em")
                        .text(function(d) { return d.name; });

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);
                } // end of render
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive

.directive('d3Radar', ['d3Service', 'd3RadarFormatter', function(d3Service, d3RadarFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };
                angular.element(iElement).empty();
                var stop = scope.$watch('data', function(){

                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3RadarFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }

                }, true);

                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                }, function() {
//                    d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3RadarFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                });

                scope.render = function(data, legends){


                    var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetWidth;
                    var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetHeight;
                    var margin = {top:40/600*height, right:10/900*width, bottom:10/600*height, left:100/900*width};

                    width = width  - margin.left - margin.right;
                    height = height   - margin.top - margin.bottom;

                    var color = d3.scale.category20c();
                    var treemap = d3.layout.treemap()
                    .size([width, height])
                    .sticky(true)
                    .value(function(d){ return d.size; });

                    var div = d3.select(iElement[0]).append("svg").attr("id", "radarchart")
                        .style("width", (width + margin.left + margin.right)+"px")
                        .style("height", (height + margin.top + margin.bottom)+"px")
                        .style("left", margin.left + "px")
                        .style("top", margin.top + "px");

                    var sort_daynames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday'];
                    var sort_hours = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','00']
                    var sortforRadar = function(parent){
                        var nn=[]
                        if(parent[0].axis.toLowerCase().indexOf("day") != -1){
                            parent.sort(function(a,b){
                                return (sort_daynames.indexOf(a['axis']) - sort_daynames.indexOf(b['axis']) );
                            });
                        }else{
                            parent.sort(function(a,b){
                                return (sort_hours.indexOf(a['axis']) - sort_hours.indexOf(b['axis']) );
                            });
                        }
                        return parent;
                    }


                    var classes = [];
                    var parents = _.uniq(data, function(d){ return d.x; });
                    parents = parents.map(function(d){ return d.x; });
                    parents.forEach(function(p){
                    var parent = [];
                    data.forEach(function(d){
                        if(p == d.x){
                            parent.push({axis:d.x2, value:d.y});
                        }
                    })
                    parent = sortforRadar(parent);
                        classes.push(parent);
                    });
                    var legendOptions = parents;

                    var color = d3.scale.category10();
                    var mycfg = {
                        legends: legendOptions,
                        w:width,
                        h:height,
                        bw:width + (d3.select(iElement[0])[0][0].offsetWidth > 600 ? 100:0),
                        maxValue: 0.6,
                        levels: 12,
                        ExtraWidthX: 300
                    }
                    d3.select(iElement[0]).select("svg").remove();
                    scope.draw(iElement[0], classes, mycfg);
                }

                scope.draw = function(element, d, options){
                    var cfg = {
                     legends:[],
                     radius: 5,
                     w: 600,
                     h: 600,
                     factor: .95,
                     factorLegend: 1,
                     levels: 3,
                     maxValue: 0,
                     radians: - 2 * Math.PI,
                     opacityArea: 0.5,
                     color: d3.scale.category10(),
                     fontSize: 10,
                     sort : 1 // 0: asc, 1 : desc

                    };
                    if('undefined' !== typeof options){
                      for(var i in options){
                        if('undefined' !== typeof options[i]){
                          cfg[i] = options[i];
                        }
                      }
                    }
                    cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));

                    var __max=0, __idx=0;
                    for(i in d){
                      // __max = d[i].length > __max ? d[i].length : __max;
                      if(d[i].length > __max ){
                        __max = d[i].length; __idx = i;
                      }
                    }
                    var allAxis = (d[__idx].map(function(i, j){return i.axis}));
                    var total = allAxis.length;
                    var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
                    d3.select(element).select("svg").remove();
                    var g = d3.select(element).append("svg").attr("width", cfg.bw).attr("height", cfg.h).append("g");

                    var tooltip;
                    function getPosition(i, range, factor, func){
                      factor = typeof factor !== 'undefined' ? factor : 1;
                      return range * (1 - factor * func(i * cfg.radians / total));
                    }
                    function getHorizontalPosition(i, range, factor){
                      return getPosition(i, range, factor, Math.sin);
                    }
                    function getVerticalPosition(i, range, factor){
                      return getPosition(i, range, factor, Math.cos);
                    }

                    for(var j=0; j<cfg.levels; j++){
                      var levelFactor = radius*((j+1)/cfg.levels);
                      g.selectAll(".levels").data(allAxis).enter().append("svg:line")
                       .attr("x1", function(d, i){return getHorizontalPosition(i, levelFactor);})
                       .attr("y1", function(d, i){return getVerticalPosition(i, levelFactor);})
                       .attr("x2", function(d, i){return getHorizontalPosition(i+1, levelFactor);})
                       .attr("y2", function(d, i){return getVerticalPosition(i+1, levelFactor);})
                       .attr("class", "line").style("stroke", "grey").style("stroke-width", "0.5px").attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");

                    }

                    series = 0;
                      // allAxis  = allAxis.sort(d3.descending);

                    var axis = g.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");

                    axis.append("line")
                        .attr("x1", cfg.w/2)
                        .attr("y1", cfg.h/2)
                        .attr("x2", function(j, i){return getHorizontalPosition(i, cfg.w/2, cfg.factor);})
                        .attr("y2", function(j, i){return getVerticalPosition(i, cfg.h/2, cfg.factor);})
                        .attr("class", "line").style("stroke", "grey").style("stroke-width", "1px");

                    axis.append("text").attr("class", "legend")
                        .text(function(d){return d})
                        .style("font-family", "sans-serif").style("font-size", cfg.fontSize + "px")
                        .style("text-anchor", function(d, i){
                          var p = getHorizontalPosition(i, 0.5);
                          return (p < 0.4) ? "start" : ((p > 0.6) ? "end" : "middle");
                        })
                        .attr("transform", function(d, i){
                          var p = getVerticalPosition(i, cfg.h / 2);
                          return p < cfg.fontSize ? "translate(0, " + (cfg.fontSize - p) + ")" : "";
                        })
                        .attr("x", function(d, i){return getHorizontalPosition(i, cfg.w / 2, cfg.factorLegend);})
                        .attr("y", function(d, i){return getVerticalPosition(i, cfg.h / 2, cfg.factorLegend);});


                    d.forEach(function(y, x){
                        dataValues = [];
                        g.selectAll(".nodes")
                        .data(y, function(j, i){
                          dataValues.push([
                            getHorizontalPosition(i, cfg.w/2, (parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor),
                            getVerticalPosition(i, cfg.h/2, (parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor)
                          ]);
                        });
                        dataValues.push(dataValues[0]);
                        g.selectAll(".area")
                         .data([dataValues])
                         .enter()
                         .append("polygon")
                         .attr("class", "radar-chart-serie"+series)
                         .style("stroke-width", "2px")
                         .style("stroke", cfg.color(series))
                         .attr("points",function(d) {
                             var str="";
                             for(var pti=0;pti<d.length;pti++){
                                 str=str+d[pti][0]+","+d[pti][1]+" ";
                             }
                             return str;
                          })
                         .style("fill", function(j, i){return cfg.color(series)})
                         .style("fill-opacity", cfg.opacityArea)
                         .on('mouseover', function (d){
                                            z = "polygon."+d3.select(this).attr("class");
                                            g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
                                            g.selectAll(z).transition(200).style("fill-opacity", .7);
                                          })
                         .on('mouseout', function(){
                                            g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
                         });
                        series++;
                    });
                    series=0;


                    d.forEach(function(y, x){
                      g.selectAll(".nodes")
                        .data(y).enter()
                        .append("svg:circle").attr("class", "radar-chart-serie"+series)
                        .attr('r', cfg.radius)
                        .attr("alt", function(j){return Math.max(j.value, 0)})
                        .attr("cx", function(j, i){
                          dataValues.push([
                            getHorizontalPosition(i, cfg.w/2, (parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor),
                            getVerticalPosition(i, cfg.h/2, (parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor)
                          ]);
                          return getHorizontalPosition(i, cfg.w/2, (Math.max(j.value, 0)/cfg.maxValue)*cfg.factor);
                        })
                        .attr("cy", function(j, i){
                          return getVerticalPosition(i, cfg.h/2, (Math.max(j.value, 0)/cfg.maxValue)*cfg.factor);
                        })
                        .attr("data-id", function(j){return j.axis})
                        .style("fill", cfg.color(series)).style("fill-opacity", .9)
                        .on('mouseover', function (d){
                                    newX =  parseFloat(d3.select(this).attr('cx')) - 10;
                                    newY =  parseFloat(d3.select(this).attr('cy')) - 5;
                                    tooltip.attr('x', newX).attr('y', newY).text(d.value).transition(200).style('opacity', 1);
                                    z = "polygon."+d3.select(this).attr("class");
                                    g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
                                    g.selectAll(z).transition(200).style("fill-opacity", .7);
                                  })
                        .on('mouseout', function(){
                                    tooltip.transition(200).style('opacity', 0);
                                    g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
                                  })
                        .append("svg:title")
                        .text(function(j){return Math.max(j.value, 0)});

                      series++;
                    });
                    //Tooltip
                    tooltip = g.append('text').style('opacity', 0).style('font-family', 'sans-serif').style('font-size', '13px');

                    // legend
                    var legend = g.append("g")
                      .attr("class", "legend")
                      .attr("height", 100)
                      .attr("width", 100)
                    .attr('transform', 'translate(-20,50)')

                    legend.selectAll('rect')
                      .data(cfg.legends)
                      .enter()
                      .append("rect")
                      .attr("x", cfg.bw - 65)
                      .attr("y", function(d, i){ return i *  20;})
                      .attr("width", 10)
                      .attr("height", 10)
                      .style("fill", function(d,i) { return cfg.color(i); })

                    legend.selectAll('text')
                      .data(cfg.legends)
                      .enter()
                      .append("text")
                      .attr("x", cfg.bw - 52)
                      .attr("font-size","9pt")
                      .attr("y", function(d, i){ return i *  20 + 9;})
                      .text(function(d) { return decodeURIComponent(d); });


                  } // end of draw
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive



.directive('d3MultiLineMultiples', ['d3Service','d3MultiLineMultiplesFormatter', function(d3Service, d3MultiLineMultiplesFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            // console.log('d3MultiLine started....' + scope);
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };

                var xAxisTypes = "time";
                var formatDate = d3.time.format("%m%d:%H");
                var parseDate = formatDate.parse;
                var checkDateFormat = function(data){
                    console.log(data);
                    var dtrx = /(\d){2}[\-\/]*(\d){2}[\-\/]*(\d){2}/g
                    var tmrx = /(\d)*T(\d)+/g
                    console.log('-------- checkDateFormat ---------');
                    console.log(dtrx.test(data.data[0].x));
                    console.log(tmrx.test(data.data[0].x));
                    console.log('-------- checkDateFormat(match) ---------')
                    console.log(data.data[0].x);
                    console.log(data.data[0].x.match(dtrx));
                    console.log(data.data[0].x.match(tmrx));


                    if(tmrx.test(data.data[0].x) && data.data[0].x.match(tmrx).length == 1){
                        tickString = "%y%m%dT%H";
                        formatDate = d3.time.format(tickString);
                        parseDate = formatDate.parse;
                    }
                    else if(dtrx.test(data.data[0].x) && data.data[0].x.match(dtrx).length == 1){
                        tickString = "%y%m%d";
                        formatDate = d3.time.format(tickString);
                        parseDate = formatDate.parse;
                    }
                    else{
                        parseDate = function(x){
                            xAxisTypes = "general";
                            return x;
                        }
                    }
                    console.log('------------ tickString and parseDate ------- ');
                    console.log(tickString);
                    console.log(parseDate);
                }
                var stop = scope.$watch('data', function(){
                    // console.log('--------- d3MultiLine directive data!!! ---------');
                    // console.log(JSON.stringify(scope.data));
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3MultiLineMultiplesFormatter.parse(scope.data);
                        checkDateFormat(_data);
                        return scope.render(_data.data, _data.legend);
                    }
                }, true);

                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                    }, function() {
                    d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3MultiLineMultiplesFormatter.parse(scope.data);
                        checkDateFormat(_data);
                        return scope.render(_data.data, _data.legend);
                    }
                });


                scope.render = function(rawdata, legend1){

                    angular.element(iElement).empty();
                    angular.element(iElement).prepend('<style type="text/css">svg{padding:30px 30px 75px 5px} .arc{stroke:#fff} .axis line, .axis path{fill:none;stroke:#000;shape-rendering:crispEdges}.axis text{font-family:Verdana;font-size:6px}.x.axis path{display:none}.line{fill:none;stroke:#4682b4;stroke-width:3.5px}.line.active{stroke-width:7px}.sparkline{fill:none;stroke:#000;stroke-width:.5px}div.tooltip{position:absolute;text-align:left;width:200px;height:14px;padding:0;font:10px sans-serif;font-weight:700;border:0;border-radius:2px}</style>');

                    // var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1 : d3.select(iElement[0])[0][0].offsetWidth;
                    // var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetWidth;
                    // var margin = {top:20/600*height, right:80/900*width, bottom:120/900*height, left:70/600*width};
                    // width = width - margin.left - margin.right;
                    // height = height  - margin.top - margin.bottom;

                    // var svg = d3.select(iElement[0]).append("svg")
                    //     // .style('width', '100%')
                    //     // .style('height', '100%')
                    //     // .attr("width", width + margin.left+margin.right)
                    //     // .attr("height", height + margin.top+margin.bottom)
                    //     .style("font","10px Verdana")
                    // .append("g")
                    //     .attr("transform","translate(1,1)");


                    var cellSize = 50,
                        padding = 0;

                    // var parseDate = d3.time.format("%y%m%d").parse;

                    var color = d3.scale.ordinal()
                                .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"]);


                    var margin = {top: 10, right: 10, bottom: 40, left: 70},
                        width = 400 - margin.left - margin.right ,
                        height = 260 - margin.top - margin.bottom ;

                    function sparkline(color, data, minmax, title){
                        // var x = d3.scale.linear().range([0,width]);
                        // var x = d3.scale.ordinal().range([0, width]);

                        var x = d3.time.scale().rangeRound([0, width]);
                        var y = d3.scale.linear().range([height, 0]);
                        var formatAxis = d3.format(" 0");
                        var bisectDate = d3.bisector(function(d) { return d.date; }).left;
                        var xAxis = d3.svg.axis()
                                    .scale(x)
                                    .ticks(6)
                                    // .tickFormat(formatAxis)
                                    .tickFormat(formatDate)
                                    // .tickPadding(8)
                                    .orient("bottom");

                        var yAxis = d3.svg.axis()
                                .scale(y)
                                .orient("left");

                        var line = d3.svg.line()
                            .interpolate("basis")
                            .x(function(d) { return x(d.date); })
                            .y(function(d) { return y(d.pausetime); })

                        // Define 'div' for tooltips
                        var tooltip = d3.select("body")
                            .append("div")  // declare the tooltip div
                            .attr("class", "tooltip")              // apply the 'tooltip' class
                            .style("opacity", 1);

                        var channels = color.domain().map(function(name){
                            return {
                                name:name,
                                values:data.map(function(d){
                                    // console.log(d.x + ":" + parseDate(d.x));
                                    return {date:parseDate(d.x), pausetime: +d[name]};
                                })
                            }
                        });

                        // console.log(color);
                        // console.log(channels);
                        x.domain(d3.extent(data, function(d){return parseDate(d.x); }));
                        y.domain(minmax);
                        // console.log('------- sparkline x.domain ---------');
                        // console.log(x.domain());
                        // console.log(y.domain());

                        var svg = d3.select(iElement[0])
                            .append("svg")
                                .attr("class", "mchart")
                                .attr("width", width)
                                .attr("height", height)
                            .append("g")
                                .attr("transform", "translate(" + 1 + "," + 1 + ")");
                                ;

                        var title = svg.append("text")
                            .attr("x", 50)
                            .attr("y", 3)
                            .attr("dy", ".35em")
                            .text(title)
                            ;

                      svg.append("g")
                          .attr("class", "x axis")
                          .attr("transform", "translate(50," + (height-10)  + ")")
                          .call(xAxis)
                          .selectAll("text")
                            .attr("class","axis text")
                            .style("text-anchor", "start")
                            .attr("dx", "0em")
                            .attr("dy", "4em")
                            .attr("transform", function(d) {
                                return "rotate(65)"
                                });

                      svg.append("g")
                            .attr("class", "y axis")
                            .attr("transform", "translate(25,0)")
                            .call(yAxis);

                        svg.selectAll(".channel")
                            .data(channels)
                        .enter().append("g")
                            .attr('transform', 'translate(30, 0)')
                            .attr("class","channel")
                            .append("path")
                            .attr("class","line")
                            .attr("d",function(d){ return line(d.values); })
                            .style("stroke",function(d){ return color(d.name); })
                            .on("mouseover", function(d){
                                d3.select(this).classed("active", true);
                                // console.log(d3.select(this).data()[0].name);
                                var x0 = x.invert(d3.mouse(this)[0]),
                                        i  = bisectDate(d.values, x0, 1),
                                        d0 = d.values[i - 1];
                                boldline(d.name);
                                tooltip.transition()
                                    .duration(500)
                                    .style("opacity", 0);
                                tooltip.transition()
                                    .duration(200)
                                    .style("opacity", .9);
                                tooltip.html(legend1[d.name]+ ':' + d0.pausetime + ' at ' + formatDate(x0))
                                    .style("left", (d3.event.pageX) + "px")
                                    .style("top", (d3.event.pageY-28) + "px")
                                    .style("color", color(d.name))
                                ;

                            })
                            .on("mouseout", function(d){
                                d3.select(this).classed("active", false);
                                console.log(d3.select(this).data()[0].name);
                                plainline(d.name);
                                d3.selectAll(".tooltip").html("")
                            })
                            ;
                        var boldline = function(name){
                            d3.select(iElement[0]).selectAll(".line")
                            .filter(function(d,i){ return d.name == name;})
                            .classed("active", true);
                        }
                        var plainline = function(name){
                            d3.select(iElement[0]).selectAll(".line")
                            .filter(function(d,i){ return d.name == name;})
                            .classed("active", false);
                        }
                        // var verticalLine = d3.selectAll(".mchart")
                        //     .append('line')
                        //     .attr({
                        //         'x1': 0,
                        //         'y1': 0,
                        //         'x2': 0,
                        //         'y2': height
                        //     })
                        //     .attr("stroke", "steelblue")
                        //     .attr('class', 'verticalLine');

                        // d3.selectAll(".mchart")
                        //     .on("mousemove", function(){
                        //         var xPos = d3.mouse(this)[0];
                        //         d3.selectAll(".verticalLine").attr("transform", function () {
                        //             return "translate(" + xPos + ",0)";
                        //         });
                        // });
                    }

                    var data = d3.nest()
                        .key(function(d){ return d.x2; })
                        .key(function(d){ return d.x3; })
                        .entries(rawdata);
                    // console.log(data);
                    color.domain(d3.keys(data[0]['values'][0]['values'][0]).filter(function(key){ return key !== "x" && key !== "x2" && key !== "x3"}));
                    console.log(color.domain());

                    var minmax = [
                        d3.min(data, function(c){ return d3.min(c.values, function(v){ return d3.min(v.values, function(k){
                                var aa = [];
                                for(var i in k){
                                    color.domain().forEach(function(c){
                                        if(i == c){
                                            aa.push(k[i]);
                                        }
                                    });
                                }
                                return d3.min(aa);
                        })})}),
                        d3.max(data, function(c){ var aa= d3.max(c.values, function(v){ var bb =  d3.max(v.values, function(k){
                                var aa = [];
                                for(var i in k){
                                    color.domain().forEach(function(c){
                                        if(i == c){
                                            aa.push(k[i]);
                                        }
                                    });
                                }
                                // console.log(k);
                                // console.log(d3.max(aa));
                                return d3.max(aa, Number);
                                // return aa;
                        }); return bb; }); return aa; })
                    ];
                    console.log('---minmax---')
                    console.log(minmax);
                    var legend = d3.select(iElement[0])
                        .append("svg")
                          .attr("class", "mlegend")
                          .attr("width", width)
                          .attr("height", height)
                        .selectAll("g")
                          .data(color.domain().slice().reverse())
                        .enter().append("g")
                          .attr("transform", function(d, i) { console.log(i); return "translate(0, " + i * 20+ ")"; });

                    legend.append("rect")
                          .attr("width", 18)
                          .attr("height", 18)
                          .style("fill", color);

                    legend.append("text")
                          .attr("x", 24)
                          .attr("y", 9)
                          .attr("dy", ".35em")
                          .text(function(d) { return legend1[d]; });

                    data.forEach(function(d){
                        d.values.forEach(function(v, i){
                            // var svg;
                            // console.log(v.values);
                            // if(i == 0)
                            sparkline(color, v.values, minmax, d.key + ' ' + v.key);
                        })
                    });

                }
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive



.directive('d3MultipleRadar', ['d3Service', 'd3MultipleRadarFormatter', function(d3Service, d3RadarFormatter){
    return {
        restrict: 'EA',
        //replace: true,
        scope: {
            data: "=",
            label: "@",
            onClick: "&"
        },
        link: function(scope, iElement, iAttrs){
            d3Service.d3().then(function(d3){
                window.onresize = function() {
                    return scope.$apply();
                };
                angular.element(iElement).empty();
                var stop = scope.$watch('data', function(){

                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3RadarFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }

                }, true);

                scope.$watch(function() {
                    return angular.element(window)[0].innerWidth;
                }, function() {
                    d3.select(iElement[0]).select("svg").remove();
                    if(scope.data != undefined && scope.data.length>0){
                        var _data = d3RadarFormatter.parse(scope.data);
                        return scope.render(_data.data, _data.legend);
                    }
                });

                scope.render = function(_data, legends){

                    angular.element(iElement).prepend('<style type="text/css">svg{padding:15px 5px 30px 5px}</style>');
                    // var width = d3.select(iElement[0])[0][0].offsetWidth > 600 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetWidth;
                    // var height = d3.select(iElement[0])[0][0].offsetHeight > 400 ? d3.select(iElement[0])[0][0].offsetWidth * 1/1.618 : d3.select(iElement[0])[0][0].offsetWidth;
                    // var margin = {top:40/600*height, right:10/900*width, bottom:10/600*height, left:100/900*width};
                    var width = 300;
                    var height = 300;
                    var margin = {top:20/300*height, right:2/300*width, bottom:5/300*height, left:1/300*width};
                    // width = width  - margin.left - margin.right;
                    // height = height   - margin.top - margin.bottom;

                    var color = d3.scale.category10();
                    var treemap = d3.layout.treemap()
                            .size([width, height])
                            .sticky(true)
                            .value(function(d){ return d.size; });

                    // var div = d3.select(iElement[0]).append("svg").attr("id", "radarchart")
                    //     .style("width", (width + margin.left + margin.right)+"px")
                    //     .style("height", (height + margin.top + margin.bottom)+"px")
                    //     .style("left", margin.left + "px")
                    //     .style("top", margin.top + "px");
                    // x, x2, x3
                    // x : 20140901, x2: 서울특별시 , x3: channelname
                    // x : grouping key, x2: axis key, x3: value key
                    var groupeddata = d3.nest()
                        .key(function(d){ return d.x; })
                        .entries(_data);
                    // console.log('groupeddata -----------> ');

                    // console.log(' sort_key ------------>');
                    // var sort_key =  groupeddata[0].values.map(function(d){
                    //     // console.log(d);
                    //     return d.x2;
                    // });
                    // sort_key = _.uniq(sort_key);
                    // console.log(sort_key);


                    // var legend_dt =  groupeddata[0].values.map(function(d){
                    //     // console.log(d);
                    //     return d.x3;
                    // });
                    // legend_dt = _.uniq(legend_dt);
                    var legend_dt = _.uniq(groupeddata[0].values, function(d){ return d.x3; });
                    legend_dt = legend_dt.map(function(d){ return d.x3; });
                    //
                    console.log(legend_dt);

                    // console.log(classes);
                    d3.select(iElement[0]).selectAll("svg").remove();

                    var div = d3.select(iElement[0]).append("svg").attr("id", "radarchart")
                        .style("width", (width + margin.left + margin.right)+"px")
                        .style("height", (height + margin.top + margin.bottom)+"px")
                        .style("left", margin.left + "px")
                        .style("top", margin.top + "px");

                    // legend
                    var legend = div.append("g")
                      .attr("class", "legend")
                      .attr("height", width)
                      .attr("width", height)

                    legend.selectAll('rect')
                      .data(legend_dt)
                      .enter()
                      .append("rect")
                      .attr("x", width - 165)
                      .attr("y", function(d, i){ return (i+1) *  21;})
                      .attr("width", 10)
                      .attr("height", 10)
                      .style("fill", function(d,i) { return color(i); })

                    legend.selectAll('text')
                      .data(legend_dt)
                      .enter()
                      .append("text")
                      .attr("x", width - 152)
                      .attr("font-size","9pt")
                      .attr("y", function(d, i){ return (i+1) *  21 + 9;})
                      .text(function(d) { return decodeURIComponent(d); });

                    groupeddata.forEach(function(d){
                        var classes = [];
                        // console.log(data);
                        var data = d.values;
                        var parents = _.uniq(data, function(d){ return d.x3; });
                        parents = parents.map(function(d){ return d.x3; });
                        legend_dt = parents;
                        parents.forEach(function(p){
                            var parent = [];
                            data.forEach(function(d){
                                if(p == d.x3){
                                    parent.push({axis:d.x2, value:d.y});
                                }
                            });
                            // parent = sortforRadar(parent);
                            // classes.push(sort_key);
                            // console.log('parent ----------->');
                            // console.log(parent);
                            classes.push(parent);
                        });
                        var legendOptions = parents;
                        var color = d3.scale.category10();
                        var mycfg = {
                            legends: legend_dt,
                            w:width,
                            h:height,
                            bw:width + (d3.select(iElement[0])[0][0].offsetWidth > 300 ? 50:0),
                            maxValue: 0,
                            levels: 5,
                            ExtraWidthX: 300,
                            radius: 3,
                            header:d.key + ""
                        }
                        console.log('classes --------------->')
                        console.log(classes);

                        scope.draw(iElement[0], classes, mycfg);
                    });
                }

                scope.draw = function(element, d, options){
                    var cfg = {
                     legends:[],
                     radius: 3,
                     w: 600,
                     h: 600,
                     factor: .95,
                     factorLegend: 1,
                     levels: 3,
                     maxValue: 0,
                     radians: - 2 * Math.PI,
                     opacityArea: 0.5,
                     color: d3.scale.category10(),
                     fontSize: 10,
                     sort : 1, // 0: asc, 1 : desc
                     header : ""
                    };
                    if('undefined' !== typeof options){
                      for(var i in options){
                        if('undefined' !== typeof options[i]){
                          cfg[i] = options[i];
                        }
                      }
                    }
                    cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
console.log('cfg.maxValue ---------->');
console.log(cfg.maxValue);
                    var __max=0, __idx=0, __max_value=0;

                    for(i in d){
                      // __max = d[i].length > __max ? d[i].length : __max;
                      if(d[i].length > __max ){
                        __max = d[i].length; __idx = i;
                      }
                      __max_value = d3.max(d[i], function(d){ return d.value}) > __max_value ? d3.max(d[i], function(d){ return d.value}) : __max_value;

                    }
                    var allAxis = (d[__idx].map(function(i, j){return i.axis;}));
                    var total = allAxis.length;
                    var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);

                    var g = d3.select(element).append("svg").attr("width", cfg.bw).attr("height", cfg.h).append("g");
                    g.append("text").attr("class","header")
                        .text(cfg.header)
                        .style("font-family", "Verdana")
                        .style("font-size", "16px")
                        .style("fill", "black")
                        .style("text-anchor","start")
                        .style("stroke", "grey")
                        .attr("x", 100)
                        .attr("y", 100)
                        ;

                    var tooltip;
                    function getPosition(i, range, factor, func){
                        factor = typeof factor !== 'undefined' ? factor : 1;
                        return range * (1 - factor * func(i * cfg.radians / total));
                    }
                    function getHorizontalPosition(i, range, factor){
                        return getPosition(i, range, factor, Math.sin);
                    }
                    function getVerticalPosition(i, range, factor){
                        return getPosition(i, range, factor, Math.cos);
                    }
console.log('__max_value----------->')
console.log(__max_value);
                    for(var j=0; j<cfg.levels; j++){
                        var levelFactor = radius*((j+1)/cfg.levels);
                        g.selectAll(".levels").data(allAxis).enter().append("svg:line")
                            .attr("x1", function(d, i){return getHorizontalPosition(i, levelFactor);})
                            .attr("y1", function(d, i){return getVerticalPosition(i, levelFactor);})
                            .attr("x2", function(d, i){return getHorizontalPosition(i+1, levelFactor);})
                            .attr("y2", function(d, i){return getVerticalPosition(i+1, levelFactor);})
                            .attr("class", "line").style("stroke", "grey")
                            .style("stroke-width", "0.5px").attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");

                        // g.append("text").attr("class","leveltitle")
                        //     .text(Math.round(__max_value/cfg.levels,1) + "")
                        //     .attr("x", 0)
                        //     .attr("y", function(d){return getVerticalPosition(0, levelFactor);})
                        //     .attr("font-family","Verdana")
                        //     .attr("font-size","10px");
                    }

                    series = 0;


                    var axis = g.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");

                    axis.append("line")
                        .attr("x1", cfg.w/2)
                        .attr("y1", cfg.h/2)
                        .attr("x2", function(j, i){return getHorizontalPosition(i, cfg.w/2, cfg.factor);})
                        .attr("y2", function(j, i){return getVerticalPosition(i, cfg.h/2, cfg.factor);})
                        .attr("class", "line").style("stroke", "grey").style("stroke-width", "1px");

                    axis.append("text").attr("class", "legend")
                        .text(function(d){return decodeURIComponent(d);})
                        .style("font-family", "Verdana").style("font-size", cfg.fontSize + "px")
                        .style("text-anchor", function(d, i){
                          var p = getHorizontalPosition(i, 0.5);
                          return (p < 0.4) ? "start" : ((p > 0.6) ? "end" : "middle");
                        })
                        .attr("transform", function(d, i){
                          var p = getVerticalPosition(i, cfg.h / 2);
                          return p < cfg.fontSize ? "translate(0, " + (cfg.fontSize - p) + ").rotate(-45)" : "";
                        })
                        .attr("x", function(d, i){return getHorizontalPosition(i, cfg.w / 2, cfg.factorLegend);})
                        .attr("y", function(d, i){return getVerticalPosition(i, cfg.h / 2, cfg.factorLegend);})
                        ;
console.log('d--------------->');
console.log(d);
                    d.forEach(function(y, x){
                        // console.log('x--------------->');
                        // console.log(x);
                        dataValues = [];
                        g.selectAll(".nodes")
                        .data(y, function(j, i){
                          dataValues.push([
                            getHorizontalPosition(i, cfg.w/2, (parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor),
                            getVerticalPosition(i, cfg.h/2, (parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor)
                          ]);
                        });

                        dataValues.push(dataValues[0]);
                        // console.log([dataValues]);
                        g.selectAll(".area")
                         .data([dataValues])
                         .enter()
                         .append("polygon")
                         .attr("class", "radar-chart-serie"+series)
                         .style("stroke-width", "2px")
                         .style("stroke", cfg.color(series))
                         .attr("points",function(d) {
                             var str="";
                             for(var pti=0;pti<d.length;pti++){
                                 str=str+d[pti][0]+","+d[pti][1]+" ";
                             }
                             return str;
                          })
                         .style("fill", function(j, i){return cfg.color(series)})
                         .style("fill-opacity", cfg.opacityArea)
                         .on('mouseover', function (d){
                                            z = "polygon."+d3.select(this).attr("class");
                                            g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
                                            g.selectAll(z).transition(200).style("fill-opacity", .7);
                                          })
                         .on('mouseout', function(){
                                            g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
                         });
                        series++;
                    });
                    series=0;


                    d.forEach(function(y, x){
                        // console.log(y);
                      g.selectAll(".nodes")
                        .data(y).enter()
                        .append("svg:circle").attr("class", "radar-chart-serie"+series)
                        .attr('r', cfg.radius)
                        .attr("alt", function(j){return Math.max(j.value, 0)})
                        .attr("cx", function(j, i){
                          dataValues.push([
                            getHorizontalPosition(i, cfg.w/2, (parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor),
                            getVerticalPosition(i, cfg.h/2, (parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor)
                          ]);
                          return getHorizontalPosition(i, cfg.w/2, (Math.max(j.value, 0)/cfg.maxValue)*cfg.factor);
                        })
                        .attr("cy", function(j, i){
                          return getVerticalPosition(i, cfg.h/2, (Math.max(j.value, 0)/cfg.maxValue)*cfg.factor);
                        })
                        .attr("data-id", function(j){return j.axis})
                        .style("fill", cfg.color(series)).style("fill-opacity", .9)
                        .on('mouseover', function (d){
                                    newX =  parseFloat(d3.select(this).attr('cx')) - 10;
                                    newY =  parseFloat(d3.select(this).attr('cy')) - 5;
                                    tooltip.attr('x', newX).attr('y', newY).text(d.value).transition(200).style('opacity', 1);
                                    z = "polygon."+d3.select(this).attr("class");
                                    g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
                                    g.selectAll(z).transition(200).style("fill-opacity", .7);
                                  })
                        .on('mouseout', function(){
                                    tooltip.transition(200).style('opacity', 0);
                                    g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
                                  })
                        .append("svg:title")
                        .text(function(j){return Math.max(j.value, 0)});

                      series++;
                    });
                    //Tooltip
                    tooltip = g.append('text').style('opacity', 0).style('font-family', 'Verdana').style('font-size', '13px');


                  } // end of draw
            }) // end of d3Service.d3().then
        } // end of link()
    } // end of return
}]) // end of directive





;