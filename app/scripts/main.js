/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

function Util() {
  this.WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
}
Util.prototype = {
  log: function(funName, msg) {
    console.log('[%s]:%s', funName, msg);
  },
  logerr: function(funName, msg) {
    console.error('ERROR [%s]:%s', funName, msg);
  },
  toDate: function(str) {
    var chunks = str.split('.');
    return new Date(chunks[2], chunks[1] - 1, chunks[0]);
  },
  getWeekday: function(day) {
    return this.WEEKDAYS[day];
  },
  secondsToMinutes: function(seconds) {
    var totalMins = Math.round(seconds / 60);
    var mins = totalMins % 60;
    var hours = (totalMins - mins) / 60;
    if (hours === 0) {
      return mins + ' minutes';
    }
    return hours + ' hours ' + mins + ' minutes';
  },
  contains: function(a, obj) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] === obj) {
        return true;
      }
    }
    return false;
  },
  getNoDataDiv: function(text) {
    var errorPage = '<div align="center"> ' +
      '<h3>No data available.</h3> ' +
      '<p>' +
      'Sorry! ' + text +
      '</p> ' +
      '</div>';

    return errorPage;
  },
  getHtmlDataTable: function(dataPoints) {
    var content = '';
    content += '<div style="padding-left: 2%; padding-right: 2%">' +
      '<h4>Curve Parameters</h4><h5>Formula: (HRR<sub>~80%</sub>-c) &sdot; e<sup>(-(x-T)/a)</sup>+ c </h5> ' +
      '<hr> ' +
      '<p>a: curvature</p> ' +
      '<p>T: timeshift</p> ' +
      '<p>c: Average Heartrate at rest</p>' +
      '</div>';
    content += '<table id="parameters" class="mdl-data-table" style="width: 100%;">' +
      '<thead class="datathead">' +
      '<tr class="datatr">' +
      '<th class="mdl-data-table__cell--non-numeric datath"> <label id="headerbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect mdl-data-table__select" for="table-header"> <input type="checkbox" id="table-header" class="mdl-checkbox__input" /> </label> </th>' +
      '<th class="mdl-data-table__cell--non-numeric datath">Date</th>' +
      '<th class="mdl-data-table__cell--non-numeric datath">a</th>' +
      '<th class="mdl-data-table__cell--non-numeric datath">T</th>' +
      '<th class="mdl-data-table__cell--non-numeric datath">c</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody class="datatbody">';
    if (dataPoints.length !== 0) {
      try {
        for (var i = 0; i < dataPoints.length; i++) {
          if (!(dataPoints[i].a === null) && !(dataPoints[i].t === null) && !(dataPoints[i].c === null)) {
            content += '<tr class="datatr">';
            content += '<td class="mdl-data-table__cell--non-numeric datatd filterable-cell"> <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect mdl-data-table__select" for="row[' + i + ']"> <input type="checkbox" id="row[' + i + ']" class="mdl-checkbox__input" data-main="' + dataPoints[i].date + '"/> </label> </td>';
            content += '<td class="mdl-data-table__cell--non-numeric datatd filterable-cell">' + dataPoints[i].date + '</td>';
            content += '<td  class="mdl-data-table__cell--non-numeric datatd filterable-cell">' + Math.round(dataPoints[i].a * 100) / 100 + '</td>';
            content += '<td  class="mdl-data-table__cell--non-numeric datatd filterable-cell">' + Math.round(dataPoints[i].t * 100) / 100 + '</td>';
            content += '<td  class="mdl-data-table__cell--non-numeric datatd filterable-cell">' + Math.round(dataPoints[i].c * 100) / 100 + '</td>';
            content += '</tr>';
          }
        }
      } catch (e) {
        this.logerr('getNoDataTable()', e);
        return '';
      }
      content += '</tbody> </table>';
    }
    return content;
  },
  fadeInHtmlTable: function(points, tableDiv) {
    var content;
    if (tableDiv !== undefined) {
      content = this.getHtmlDataTable(points);
    }
    $(tableDiv).html(content);
  },
  formatUrl: function(root, type) {
    var url;
    if (type) {
      url = encodeURI(root + '/' + type);
    } else {
      url = encodeURI(root);
    }
    return url;
  },
  normalDensityZx: function(x, mean, stdDev) {
    var a = x - mean;
    return Math.exp(-(a * a) / (2 * stdDev * stdDev)) / (Math.sqrt(2 * Math.PI) * stdDev);
  },
  standardNormalQx: function(x, glbMean, glbDev) {
    if (x === 0) {
      return 0.50;
    }
    var t1;
    var t2;
    var t3;
    var t4;
    var t5;
    var qx;
    var negative = false;
    if (x < 0) {
      x = -x;
      negative = true;
    }
    t1 = 1 / (1 + (0.2316419 * x));
    t2 = t1 * t1;
    t3 = t2 * t1;
    t4 = t3 * t1;
    t5 = t4 * t1;
    qx = this.normalDensityZx(x, glbMean, glbDev) * ((0.319381530 * t1) + (-0.356563782 * t2) + (1.781477937 * t3) +
      (-1.821255978 * t4) + (1.330274429 * t5));
    if (negative === true) {
      qx = 1 - qx;
    }
    return qx;
  },
  standardNormalPx: function(x, glbMean, glbDev) {
    return 1 - this.standardNormalQx(x, glbMean, glbDev);
  },
  standardNormalAx: function(x, glbMean, glbDev) {
    return 1 - (2 * this.standardNormalQx(Math.abs(x), glbMean, glbDev));
  },
  initLock: function(clientId, clientDomain, options) {
    var lock = new Auth0Lock(clientId, clientDomain, options);
    return lock;
  }
};

function HighchartFunctions() {
  this.utils = new Util();
}
HighchartFunctions.prototype = {
  highchartsNewRandomColor: function() {
    var color = [];
    color.push((Math.random() * 255).toFixed());
    color.push((Math.random() * 255).toFixed());
    color.push((Math.random() * 255).toFixed());

    // opacity fixed to 100%
    color.push(1);
    color = 'rgba(' + color.join(',') + ')';
    return color;
  },
  highchartsGetColor: function(htmlId, name) {
    if ($(htmlId).highcharts() !== undefined) {
      var chart = $(htmlId).highcharts();
      var serieses = chart.series;
      for (var i = 0; i < serieses.length; i++) {
        if (serieses[i].options.type === 'line' && serieses[i].options.name === name) {
          return serieses[i].options.color;
        }
      }
    }
    return this.highchartsNewRandomColor();
  },
  highchartsGetFormatter: function(xlabel) {
    var formatter = null;
    if (xlabel === 'Sleep start') {
      formatter = function() {
        var format = this.value / (60 * 60);
        var hours = Math.round(format);
        var mins = format - hours;
        if (mins < 0) {
          --hours;
          mins = format - hours;
        }
        mins = Math.round(mins * 60);
        return hours + ':' + mins + 'h';
      };
    }
    if (xlabel === 'Day of week') {
      var utils = this.utils;
      formatter = function() {
        if (this.value - Math.round(this.value) === 0) {
          return utils.getWeekday(Math.round(this.value));
        }
      };
    }
    return formatter;
  },
  createLineSeries: function(id, grpType, visible, name, color, data, showInLegend, dataSelectId, legendClickFunction) {
    // tooltip.valuePrefix = legend;
    var series = {};
    series.id = id;
    series.type = 'line';
    series.grp = String(grpType);
    series.visible = visible;
    series.showInLegend	= showInLegend;
    series.name = name;
    series.data = data;
    series.color = color;
    if (showInLegend) {
      series.selected = visible;
      series.events = {};
      series.events.legendItemClick = legendClickFunction;
    }
    return series;
  },
  createScatterSeries: function(name, color, type, visible, linkedId, data, pointSymbol, showData) {
    var series = {};
    series.type = 'scatter';
    series.grp = String(type);
    if (visible && showData) {
      series.selected = true;
      series.visible = true;
    } else {
      series.selected = false;
      series.visible = false;
    }
    series.linkedTo = linkedId;
    series.name = name;
    series.data = data;
    series.showInLegend = false;
    series.color = color;
    series.marker = {radius: 2, symbol: pointSymbol};
    return series;
  },
  getScatterData: function(points, only5mins) {
    var seriesData = [];
    for (var i = 0; i < points.length; i++) {
      if (only5mins) {
        if (points[i].x <= 300) {
          seriesData.push([points[i].x, points[i].y]);
        }
      } else {
        if (points[i].x <= 12000) {
          seriesData.push([points[i].x, points[i].y]);
        }
      }
    }
    return seriesData;
  },
  getTwoDotLinePoints: function(x1, y1, x2, y2, step) {
    var m = (y2 - y1) / (x2 - x1);
    var n = y1 - m * x1;
    var points = [];
    for (var x = x1; x <= x2; x += step) {
      var y = m * x + n;
      points.push([x, y]);
    }
    points.push([x2, y2]);
    return points;
  },
  getExponentialPoints: function(a, t, c, step, maximumXValue) {
    var seriesData	= [];
    var startHeartrate = 180;
    for (var x = 0; x <= maximumXValue; x += step) {
      var y = (startHeartrate - c) * Math.exp(-(x - t) / a) + c;
      seriesData.push([x, y]);
    }
    return seriesData;
  },
  getCorellSeries: function(x1, y1, x2, y2, dataPoints, pointSymbol, id) {
    var step = (x2 - x1) / 200;
    var lineData = this.getTwoDotLinePoints(x1, y1, x2, y2, step);
    var lineColor = 'rgba(0, 85, 213, 1)';
    var scatterColor = 'rgba(228, 6, 6, 1)';
    var scatter = this.createScatterSeries('scatter ' + id, scatterColor, 'scatter', true, id, dataPoints, pointSymbol, true);
    var line = this.createLineSeries(id, null, true, 'line ' + id, lineColor, lineData, false);
    var serieses = [];
    serieses.push(line);
    serieses.push(scatter);
    return serieses;
  },
  getMultichartSeries: function(points, showData, type, visible, dataSelectId, pointSymbol, only5mins, htmlId) {
    var serieses = [];
    var maximumXValue = only5mins ? 300 : 12000;
    var step = only5mins ? 1 : 10;
    var legendClickFunction = function(event) {
      this.options.selected = !this.visible;
      this.linkedSeries[0].options.selected = !this.visible;
      this.setVisible(!this.visible, false);
      this.linkedSeries[0].setVisible($(dataSelectId).is(':checked') && this.visible, false);

      this.chart.redraw();
      return false;
    };
    for (var i = 0; i < points.length; i++) {
      try {
        var a = points[i].a;
        var t = points[i].t;
        var c = points[i].c;
        if (!(a === null) && !(t === null) && !(c === null)) {
          var dataPoints = points[i].data_points;
          var date = points[i].date;
          var dateObj = this.utils.toDate(date);
          var lineData = this.getExponentialPoints(a, t, c, step, maximumXValue);
          var scatterData = this.getScatterData(dataPoints, only5mins);
          var scatterName = this.utils.getWeekday(dateObj.getDay()) + ' ' + date;
          var lineName = this.utils.getWeekday(dateObj.getDay()) + ' ' + date;
          var color = this.highchartsGetColor(htmlId, lineName);
          var id = type + '_' + i;

          var lineSeries = this.createLineSeries(id, type, visible, lineName, color, lineData, false, dataSelectId, legendClickFunction);
          var scatterSeries = this.createScatterSeries	(scatterName, color, type, visible, id, scatterData, pointSymbol, showData);
          serieses.push(lineSeries);
          serieses.push(scatterSeries);
        }
      } catch (e) {
        this.utils.logerr('getMultiChartSeries()', e);
      }
    }
    return serieses;
  },
  clearHighchart: function(htmlId, errorText) {
    if ($(htmlId).highcharts() !== undefined) {
      $(htmlId).highcharts().destroy();
    }
    var noData = this.utils.getNoDataDiv(errorText);
    $(htmlId).html(noData);
  }
};

function AmChartFunctions(){
  this.utils = new Util();
}
AmChartFunctions.prototype = {
  getChart: function (id) {
    var allCharts = AmCharts.charts;
    for (var i = 0; i < allCharts.length; i++) {
      if (id == allCharts[i].div.id) {
        return allCharts[i];
      }
    }
  },
  amCharts_getColor: function (value, glb_maxvalue){
    var normalized_val = Math.round(value * 255 / glb_maxvalue);
    return normalized_val;
  },
  getGaussianDataPoints: function (settings, points, glb_mean, glb_dev) {
    var lowerbound 		= 0; //-5;
    var upperbound 		= 12; //5.1;
    var verticals		= [];
    var y_values 		= [];
    var dates 		= [];
    var chartData		= [];
    var index		= 0;
    glb_mean 		= settings[0].avg;
    glb_dev  		= settings[0].std;

    // extract data points
    for(i=0; i < points.length; i++){
      verticals.push(points[i].x);
      y_values.push(points[i].y);
      dates.push(points[i].date);
    }
    // Calculate data
    for (var i = lowerbound; i < upperbound; i += 0.1 ) {
      var dp = {
        category: i,
        value: this.utils.normalDensityZx(i, glb_mean, glb_dev)
      };
      if (verticals.indexOf( Math.round( i * 10 ) / 10 ) !== -1 ) {
        dp.vertical	= y_values[index]/100;
        dp.date		= dates[index];
        index		+= 1;
      }
      chartData.push( dp );
    }// for
    return chartData;
  },
  getHeatmapDataPoints: function (points, glb_maxhour, glb_maxvalue, glb_hours, glb_green, glb_blue) {
    var step		= 0.25;
    // for each hour find the relevant percents
    for(var h=0; h<=glb_maxhour; h+=step){
      var percents = []; // for each hour there is a colomn percent
      for(var j=0; j<=95; j+=5){
        percents[j/5] = {end: j + '%', value: 0};
      }
      for(var i=0; i<points.length; i++){
        var x = points[i].x;
        var y = points[i].y;
        if(x > h && x <= (h+step)){
          for(var j=0; j<=95; j+=5){
            if(y > j && y <= (j+5)){
              percents[j/5].end   = j + '%';
              percents[j/5].value +=1;
              if(percents[j/5].value > glb_maxvalue){
                glb_maxvalue = percents[j/5].value;
              }
            }
          }
        }
      }
      glb_hours[h] = percents;
    }

    var sourceData = [];
    for(var h = 0; h <= glb_maxhour; h+=step ) {
      var dataPoint = {hour: h}
      // generate value for each percent
      for (var p = 0; p < 20; p++ ) {
        dataPoint[ 'value' + p] = glb_hours[h][p].value;
      }
      sourceData.push(dataPoint);
    }
    // now let's populate the source data with the colors based on the value
    // as well as replace the original value with 1
    for ( i in sourceData ) {
      for (var p = 0; p < 20; p++) {
        if(sourceData[ i ][ 'value' + p ]==0){
          sourceData[ i ][ 'color' + p ] = 'rgb(255,255,255)';
        } else{
          sourceData[ i ][ 'color' + p ] = 'rgb(' + this.amCharts_getColor(sourceData[ i ][ 'value' + p ], glb_maxvalue) + ',' +  glb_green + ',' +  glb_blue  + ')';
        }
        sourceData[ i ][ 'percent' + p ] = 1;
      }
    }
    return sourceData;
  },
  getHeatmapGraphObjects: function(begin_date, end_date){
    var graphs = [];
    for (var p = 0; p < 20; p++) {
      graphs.push( {
        "balloonText": "<small>Sleep Data </small>" +
        "<table class=\"table\">" +
        "<tbody>" +
        "<tr><td style='text-align: left'>From </td><td style='text-align: right'><b>"+ begin_date +"</b></td></tr>" +
        "<tr><td style='text-align: left'>to </td><td style='text-align: right'><b>"+ end_date +"</b></td></tr>" +
        "<tr><td style='text-align: left'>you slept </td><td style='text-align: right'><b>[[value" + p + "]]</b> time(s)</td></tr>" +
        "<tr><td style='text-align: left'>with a percentage of </td><td style='text-align: right'><b>" + p*5 + "%-" + (p*5+5) + "%</b> of deep sleep</td></tr>" +
        "<tr><td style='text-align: left'>by </td><td style='text-align: right'><b>[[category]] h</b> of total sleeping hours</td></tr>" +
        "</tbody>" +
        "</table>",
        "fillAlphas": 1,
        "lineAlpha": 0.2,
        "lineColor": "rgb(105,105,105)",
        "type": "column",
        "colorField": "color" + p,
        "valueField": "percent" + p
      } );
    }
    return graphs;
  },
  clearAmChart: function (html_id, error_text) {
    var gaussian_chart = this.getChart(html_id);
    if (gaussian_chart != null){
      gaussian_chart.clear();
      gaussian_chart=null;
    }
    html_id = '#'+html_id;
    var no_data = this.utils.getNoDataDiv(error_text);
    $(html_id).html(no_data);
  }
};

function Chart(mean, dev, maxhour, hours, blue, green, maxvalue) {
  this.glb_mean = mean;
  this.glb_dev = dev;
  this.glb_maxhour = maxhour;
  this.glb_hours = hours;
  this.glb_blue = blue;
  this.glb_green = green;
  this.glb_maxvalue = maxvalue;

  this.utils = new Util();
  this.amFunctions = new AmChartFunctions();
  this.highchartFunctions = new HighchartFunctions();
}
Chart.prototype = {
  charts_createRanking: function (root, team_id, begin_date, end_date, html_id) {
    var url_data = root;//format_url(root, team_id, begin_date, end_date);
    var categories = new Object();
    var serieses = [];
    var average_data = [];
    var current_cat_val = 0;

    function find_cat(value) {
      for (var cat in categories)
        if (categories[cat].id == value) {
          return cat;
        }
      return value;
    }

    $.ajax({
      url: url_data, success: function (result) {
        var points = eval(result);
        console.log('data from  %s len: %d', url_data, points.length);
        for (var i = 0; i < points.length; i++) {
          var series_id = points[i]['athlete_id'];
          var series = new Object();
          series.name = points[i]['last_name'] + ',' + points[i]['name'];
          series.data = [];

          for (var property in points[i]) {
            if (property.startsWith('score')) {
              if (!categories.hasOwnProperty(property)) {
                categories[property] = new Object();
                categories[property].id = current_cat_val++;
                categories[property].sum = 0;
                categories[property].count = 0;

              }
              series.data.push([categories[property].id, points[i][property]]);
              categories[property].sum += points[i][property];
              categories[property].count += 1;
            }
          }
          series.type = 'column';
          serieses.push(series);
        }
        for (var cat in categories) {
          average_data.push([categories[cat].id, categories[cat].sum / categories[cat].count]);
        }
        console.log('update');
        var series = new Object();
        series.name = 'average';
        series.data = average_data;
        series.type = 'line';
        series.color = '#FF0000';
        series.lineWidth = 5;
        serieses.push(series);

        $(html_id).highcharts({
          //chart: { type: 'column'	},
          title: {text: 'Compare Scores'},
          yAxis: {min: 0, title: {text: 'score'}},
          xAxis: {
            labels: {
              formatter: function () {
                return find_cat(this.value)
              }
            }
          },
          tooltip: {
            headerFormat: '',
            /*formatter: function () {
             var s = '<b>' + find_cat(this.x) + '</b>';
             $.each(this.points, function () {
             s += '<br/>' + this.series.name + ': ' + this.y;
             });
             return s;
             },*/
            shared: false
          },
          plotOptions: {column: {pointPadding: 0, borderWidth: 0, stacking: false}},
          series: serieses
        });
      }
    });

  },
  create_heatmap: function (points, html_id, begin_date, end_date, app) {
    if ( app.sleep.changed ){
      app.sleep.sourceData = this.amFunctions.getHeatmapDataPoints(points, this.glb_maxhour, this.glb_maxvalue, this.glb_hours, this.glb_green, this.glb_blue);
      app.sleep.graphs = this.amFunctions.getHeatmapGraphObjects(begin_date, end_date);
    }


    // create the heatmap chart!
    var chart = AmCharts.makeChart(html_id, {
      "type": "serial",
      "dataProvider": app.sleep.sourceData,
      "valueAxes": [{
        "title": "Deep Sleep (in %)",
        "baseValue": 0,
        "stackType": "regular",
        "axisAlpha": 0.3,
        "gridAlpha": 1,
        "gridColor": "rgb(105,105,105)",
        "maximum": 20,
        "labelFunction": function (value, valueText, valueAxis) {
          return value * 5 + '%';
        }
      }],
      "graphs": app.sleep.graphs,
      "columnWidth": 1,
      "categoryField": "hour",
      "categoryAxis": {
        "title": "Sleeping hours",
        "gridPosition": "start",
        "axisAlpha": 0,
        "gridAlpha": 1,
        "gridColor": "rgb(105,105,105)",
        "position": "left"
      },
    });
  },
  draw_multiChart: function (points, show_data, grp_type, show_type1, data_select_id, point_symbol, html_id, only_5mins, app) {
    if (app.multichart.changed) {
      app.multichart.series = this.highchartFunctions.getMultichartSeries(points, show_data, grp_type, show_type1, data_select_id, 'circle', only_5mins, html_id);
    }
    var utils = this.utils;
    $(html_id).highcharts({
      title: {
        text: 'Heartrate Cooldown after Workout'
      },
      xAxis: {
        title: {
          text: 'time'
        },
        labels: {
          formatter: function () {
            if (only_5mins)
              return this.value;

            var hours = this.value / (60 * 60);
            return hours.toFixed(2) + 'h';
          }
        }
        //tickInterval: 1.5
      },
      yAxis: {
        title: {
          text: 'heartrate (in bpm)'
        }
      },
      tooltip: {
        formatter: function () {
          var s = '';
          if (!only_5mins) {
            s = '<small> Heartrate after ' + utils.secondsToMinutes(this.x) + '</small>' +
              '<table>';
          }
          else {
            s = '<small> Heartrate after ' + this.x + ' seconds</small>' +
              '<table>';
          }

          if (this.points != null) {
            $.each(this.points, function () {
              s += '<tr>' +
                '<td style="color: ' + this.series.color + '">' + this.series.name + ': </td>' +
                '<td style="text-align: right"><b>' + Math.round(this.y * 100) / 100 + 'bpm </b></td>' +
                '</tr>';
            });
          }
          if (this.point != null) {
            s += '<tr>' +
              '<td style="color: ' + this.point.color + '">' + this.point.series.name + ': </td>' +
              '<td style="text-align: right"><b>' + Math.round(this.y * 100) / 100 + 'bpm </b></td>' +
              '</tr>';
          }

          s += '</table>';

          return s;
        },
        shared: true,
        useHTML: true,
        valueDecimals: 2
      },
      plotOptions: {
        line: {
          marker: {
            enabled: false
          }
        }
      },
      series: app.multichart.series
    });
  },
  setTypeVisible: function (htmlId, type, visible, showdata) {
    if ($(htmlId).highcharts() != null) {
      var chart = $(htmlId).highcharts();
      var series = chart.series;
      for (var i = 0; i < series.length; i++) {
        if (series[i].options.grp == type) {
          if (series[i].options.type == 'scatter')
            series[i].setVisible(showdata && visible, false);
          else
            series[i].setVisible(visible, false);

        }// if group matches
      }// for
      chart.redraw();
    }

  },
  setScatterVisible: function (htmlId, visible) {
    if ($(htmlId).highcharts() != null) {
      var chart = $(htmlId).highcharts();
      var series = chart.series;
      for (var i = 0; i < series.length; i++) {
        if (series[i].options.type == 'scatter') {
          var linkedto = chart.get(series[i].options.linkedTo);
          series[i].setVisible((visible && linkedto.visible), false);
        }// if group matches
      }// for
      chart.redraw();
    }

  },
  draw_linearChart: function (data_points, title, xLabel, yLabel, html_id, app) {

    if (app.correlation.changed){
      app.correlation.series = this.highchartFunctions.getCorellSeries(data_points.x0, data_points.y0, data_points.x1, data_points.y1, data_points.data, 'circle', title);
    }
    var formatter = this.highchartFunctions.highchartsGetFormatter(xLabel);

    $(html_id).highcharts({
      title: {
        text: title
      },
      xAxis: {
        title: {
          text: xLabel
        },
        labels: {
          formatter: formatter
        }
      },
      yAxis: {
        title: {
          text: yLabel
        }
      },
      tooltip: {
        useHTML: true,
        formatter: function () {
          var s = '<p>' + xLabel + ': ' + Math.round(this.x * 100) / 100 + '</p>' +
            '<table>'
          if (this.points != null) {
            $.each(this.points, function () {
              s += '<tr>' +
                '<td style="color: ' + this.series.color + '">' + yLabel + ': </td>' +
                '<td style="text-align: right"><b>' + this.y + '</b></td>' +
                '</tr>';
            });
          }
          if (this.point != null) {
            s += '<tr>' +
              '<td style="color: ' + this.point.color + '">' + yLabel + ': </td>' +
              '<td style="text-align: right"><b>' + Math.round(this.y * 100) / 100 + '</b></td>' +
              '</tr>';
          }

          s += '</table>';

          return s;
        }
      },
      plotOptions: {
        line: {
          marker: {
            enabled: false
          }
        }
      },
      series: app.correlation.series
    });
  },
  create_gaussian: function (settings, points, html_id) {
    var chartData = this.amFunctions.getGaussianDataPoints(settings, points, this.glb_mean, this.glb_dev);

    // create the Gaussian chart!
    var chart = AmCharts.makeChart(html_id, {
      "type": "serial",
      "theme": "light",
      "dataProvider": chartData,
      "precision": 2,
      "valueAxes": [{
        "title": "Deep Sleep (in %)",
        "gridAlpha": 0.2,
        "dashLength": 0
      }],
      "startDuration": 1,
      "graphs": [{
        "balloonText": "[[date]]",
        "lineThickness": 3,
        "valueField": "value"
      }, {
        "balloonText": "",
        "fillAlphas": 1,
        "type": "column",
        "valueField": "vertical",
        "fixedColumnWidth": 2,
        "labelText": "[[value]]",
        "labelOffset": 20
      }],
      "chartCursor": {
        "categoryBalloonEnabled": false,
        "cursorAlpha": 0,
        "zoomable": false
      },
      "categoryField": "category",
      "categoryAxis": {
        "title": "Sleeping Hours",
        "gridAlpha": 0.05,
        "startOnAxis": true,
        "tickLength": 5,
        "labelFunction": function (label, item) {
          return '' + Math.round(item.dataContext.category * 10) / 10;
        }
      }

    });
  },
  clearHighchart: function (html_id, error_text) {
    this.highchartFunctions.clearHighchart(html_id, error_text);
  },
  clearAmChart: function (html_id, error_text) {
    this.amFunctions.clearAmChart(html_id, error_text);
  }
};

function ChartUpdater() {
  this.chart = new Chart(0, 0, 12, [], 0, 0, 0);
  this.multichart_points;
  this.utils = new Util();
}
ChartUpdater.prototype = {
  getChartObject: function(){
    return this.chart;
  },
  update_correlations: function (url, user_id, linearData, app){
    app.invokeLoading('correlation');
    var nextDay;
    var xLabel = $(app.correlation.xLabel).val();
    var yLabel = $(app.correlation.yLabel).val();
    for (var i = 0; i<linearData.length; i++){
      if (linearData[i].x_label==xLabel&&linearData[i].y_label==yLabel){
        nextDay=linearData[i].next_day;
      }
    }
    var reqUrl = this.utils.formatUrl(url, 'correlation');
    this.charts_getCorrelations(reqUrl, user_id, xLabel, yLabel, nextDay, app);
  },
  charts_getCorrelations: function (rooturl, user_id, xLabel, yLabel, nextDay, app){
    var data = {
      userId: user_id,
      xAxis: xLabel,
      yAxis: yLabel,
      nextDay: nextDay
    };
    if (localStorage.getItem('id_token')) {
      var authorization = 'Bearer ' + localStorage.getItem('id_token');
    }
    var chart = this.getChartObject();
    $.ajax({type: 'POST', url: rooturl, headers: {'authorization': authorization}, data: JSON.stringify(data), success: function(result){
      console.log('data from  %s', rooturl);
      app.invokeReady('correlation', result);
      return;
    }});
  },
  update_mutlichart: function (url, user_id, date_from, date_to, app, newData){
    if (newData){
      app.invokeLoading('heartrate');
      var reqUrl = this.utils.formatUrl(url, 'heartrate');
      this.charts_createMultiChart(reqUrl, user_id, date_from, date_to, app);
    }
    // else{
    //   this.charts_switchMultiChart(show_type1, show_data, multichart_id, chk_data, only5min);
    // }
  },
  charts_createMultiChart: function (rooturl, user_id, begin_date, end_date, app){
    var data = {
      userId: user_id,
      type: "Cooldown",
      beginDate: begin_date,
      endDate: end_date
    };
    var multichart_points = this.multichart_points;
    if (localStorage.getItem('id_token')) {
      var authorization = 'Bearer ' + localStorage.getItem('id_token');
    }
    //var utils = this.utils;
    //var chart = this.getChartObject();
    $.ajax({type: "POST", url: rooturl, headers: {'authorization': authorization}, data: JSON.stringify(data), success: function(result){
      multichart_points = eval(result);
      //if (multichart_points.length!=0){
        console.log('data from  %s len: %d', rooturl, multichart_points.length);
        // the following commented lines are for getting type2 uncomment to get the results
        //$.ajax({url: type2_url, success: function(result_type2){
        //    	var points2 = eval(result_type2);
        //	console.log('data from  %s len: %d', type2_url, points2.length);
        //	addSerieses(points2, show_data, 'Type2', true, data_select_id, serieses,  'triangle');
        app.invokeReady('heartrate', multichart_points);
        //chart.draw_multiChart(multichart_points, show_data, 'Type1', show_type1, data_select_id, 'circle', html_id, only_5mins);
        //utils.fadeInHtmlTable(multichart_points, table_id);
                //}});
      // }
      // else{
      //   var error_text = 'There is no heartrate data measured in the given time period. Please choose another period to analyse your personal heartrate data.';
      //   chart.clearHighchart(html_id, error_text);
      //   var no_data = utils.getNoDataDiv(error_text);
      //   $(table_id).html(no_data);
      // }
    }});
  },
  charts_switchMultiChart: function (show_type1, show_data, html_id, data_select_id, only_5mins){
    if (this.multichart_points.length != 0){
      this.chart.draw_multiChart(this.multichart_points, show_data, 'Type1', show_type1, data_select_id, 'circle', html_id, only_5mins);
    }
  },
  setScatterVisible: function (html_id, visible){
    this.chart.setScatterVisible(html_id, visible);
  },
  setTypeVisible: function (html_id, type, visible, showdata){
    this.chart.setTypeVisible(html_id, type, visible, showdata);
  },
  update_heatmap: function (url, user_id, date_from, date_to, app){
    app.invokeLoading('sleep');
    app.sleep.beginDate = date_from;
    app.sleep.endDate = date_to;
    var reqUrl = this.utils.formatUrl(url, 'sleepPoints');
    this.charts_createHeatmap(reqUrl, user_id, date_from, date_to, app);
  },
  charts_createHeatmap: function (rooturl, user_id, begin_date, end_date, app){
    var data = {
      userId: user_id,
      beginDate: begin_date,
      endDate: end_date,
      gaussianSettings: false
    };
    if (localStorage.getItem('id_token')) {
      var authorization = 'Bearer ' + localStorage.getItem('id_token');
    }
    $.ajax({type: "POST", url: rooturl, headers: {'authorization': authorization}, data: JSON.stringify(data), success: function(result){
      var points = eval(result);
      console.log('data from  %s len: %d', rooturl , points.length);
      app.invokeReady('sleep', points);

    }});
  },
  update_gaussian: function (url, user_id,  date_from, date_to , gaussian_id){
    var reqUrl = this.utils.formatUrl(url, 'sleepPoints');
    this.charts_createGaussian(reqUrl, user_id,  date_from, date_to , gaussian_id);
  },
  charts_createGaussian: function (rooturl, user_id, begin_date, end_date, html_id){
    try{
      var data = {
        userId: user_id,
        beginDate: begin_date,
        endDate: end_date,
        gaussianSettings: true
      };
      var chart = this.getChartObject();
      if (localStorage.getItem('id_token')) {
        var authorization = 'Bearer ' + localStorage.getItem('id_token');
      }
      $.ajax({type: "POST", url:  rooturl, headers: {'authorization': authorization}, data: JSON.stringify(data), success: function(setting_result){
        var settings = eval(setting_result);
        data.gaussianSettings = false;
        $.ajax({type: "POST", url:  rooturl,headers: {'authorization': authorization}, data: JSON.stringify(data), success: function(points_result){
          var points = eval(points_result);
          if (points.length != 0){
            console.log('data from  %s len: %d', rooturl , points.length);
            chart.create_gaussian(settings, points, html_id);
          }
          else{
            var error_text = 'There is no sleep data measured in the given time period. Please choose another period to analyse your personal sleep data.';
            chart.clearAmChart(html_id, error_text);
          }
        }});
      }});
    }
    catch(e){
      this.utils.logerr('charts_createGaussian', e);
    }
  }
};

function Setup() {
  this.utils = new Util();
  this.updater = new ChartUpdater();
}
Setup.prototype = {
  set_default_picker: function (time, dateRange, picker_id){
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth()+1;
    var curr_year = d.getFullYear();
    var startDay = curr_date;
    var startMonth = curr_month-dateRange;
    var startYear = curr_year;

    if (startDay>28){
      startDay=28;
    }

    while(startMonth<1){
      startYear--;
      startMonth = 12 + startMonth;
    }
    time.date_from 	= startDay.toString()+'.' + startMonth.toString() + '.' +startYear.toString();
    time.datepicker_date_from = startMonth.toString() + '/' + startDay.toString() + '/' + startYear.toString();

    time.date_to 	= curr_date.toString()+'.'+curr_month.toString()+'.'+curr_year.toString();
    time.datepicker_date_to = (curr_month).toString() + '/' + curr_date.toString() + '/' + curr_year.toString();

    $(picker_id).attr ('value', time.datepicker_date_from + " - " + time.datepicker_date_to);
  },
  select_all: function (checkboxes){
    checkboxes.forEach(function(html_id){
      $(html_id).attr('checked', true);
    });
  },
  fillInXlabels: function(linearData, x_label_id){
    var temp = '';
    var xLabels = [];
    for (var i = 0; i<linearData.length; i++){
      if (!(this.utils.contains(xLabels, linearData[i].x_label))){
        xLabels.push(linearData[i].x_label);
        temp += '<li class="mdl-menu__item">' + linearData[i].x_label + '</li>';
      }
    }
    var html_code = '<div id="xMDL" class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height getmdl-select__fullwidth"> ' +
      '<input class="mdl-textfield__input" type="text" id="xLabel" value="' + xLabels[0] + '"readonly tabIndex="-1"/> ' +
      '<label for="xLabel" class="mdl-textfield__label">Choose x Label</label> ' +
      '<ul id="x" for="xLabel" class="mdl-menu mdl-menu--bottom-left mdl-js-menu">' +
      temp +
      '</ul> ' +
      '</div>'
    $('#xPicker').html(html_code);
    getmdlSelect.init('#xMDL');
  },
  fillInYlabels: function (url, user_id, linearData, x_label_id, y_label_id, app){
    var currXlabel = $(x_label_id).val();
    var temp = '';
    var yLabels = [];
    for (var i = 0; i<linearData.length; i++){
      if (linearData[i].x_label==currXlabel){
        yLabels.push(linearData[i].y_label);
        temp += '<li class="mdl-menu__item">' + linearData[i].y_label + '</li>';
      }
    }
    var html_code = '<div id="yMDL" class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height getmdl-select__fullwidth">' +
      '<input class="mdl-textfield__input" type="text" id="yLabel" value="' + yLabels[0] + '"  readonly tabIndex="-1"/>' +
      '<label for="yLabel" class="mdl-textfield__label">Choose y Label</label>' +
      '<ul id="y" for="yLabel" class="mdl-menu mdl-menu--bottom-left mdl-js-menu">' +
      temp +
      '</ul></div>';
    $('#yPicker').html(html_code);
    $(app.correlation.yLabel).on('change', function() {
      app.updater.update_correlations(app.url, user_id, app.correlations_list, app)
    });
    getmdlSelect.init('#yMDL');
    this.updater.update_correlations(url, user_id, linearData, app);
  },
  setup_datepicker: function (picker_id, time, update_function) {
    $(picker_id).daterangepicker(
      {
        locale: {
          format: 'DD.MM.YYYY'
        },
        "startDate": time.datepicker_date_from,
        "endDate": time.datepicker_date_to
      },
      function(start, end, label) {
        time.date_from=start.format('DD.MM.YYYY');
        time.date_to=end.format('DD.MM.YYYY');
        update_function ();
      }
    );
  },
  get_correlationsList: function(url){
    var correlationsUrl = this.utils.formatUrl(url, 'get_correlations_list');
    var list;
    $.ajax({type : 'GET', crossDomain:true, url: correlationsUrl, success: function (data) {
      list=JSON.parse(data);
    },
      async: false
    });
    return list;
  }
};
/* eslint-env browser */
(function() {
  // Uncomment if service worker is ready for usage

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  // var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
  //     // [::1] is the IPv6 localhost address.
  //     window.location.hostname === '[::1]' ||
  //     // 127.0.0.1/8 is considered localhost for IPv4.
  //     window.location.hostname.match(
  //       /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  //     )
  //   );
  //
  // if ('serviceWorker' in navigator &&
  //     (window.location.protocol === 'https:' || isLocalhost)) {
  //   navigator.serviceWorker.register('service-worker.js')
  //   .then(function(registration) {
  //     // updatefound is fired if service-worker.js changes.
  //     registration.onupdatefound = function() {
  //       // updatefound is also fired the very first time the SW is installed,
  //       // and there's no need to prompt for a reload at that point.
  //       // So check here to see if the page is already controlled,
  //       // i.e. whether there's an existing service worker.
  //       if (navigator.serviceWorker.controller) {
  //         // The updatefound event implies that registration.installing is set:
  //         // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
  //         var installingWorker = registration.installing;
  //
  //         installingWorker.onstatechange = function() {
  //           switch (installingWorker.state) {
  //             case 'installed':
  //               // At this point, the old content will have been purged and the
  //               // fresh content will have been added to the cache.
  //               // It's the perfect time to display a "New content is
  //               // available; please refresh." message in the page's interface.
  //               break;
  //
  //             case 'redundant':
  //               throw new Error('The installing ' +
  //                               'service worker became redundant.');
  //
  //             default:
  //               // Ignore
  //           }
  //         };
  //       }
  //     };
  //   }).catch(function(e) {
  //     console.error('Error during service worker registration:', e);
  //   });
  // }

  // Your custom JavaScript goes here
  var AUTH0_CLIENT_ID='kMlSIl3Itqt6mQetzGXES6biAVFei6k8';
  var AUTH0_DOMAIN='app-iss.eu.auth0.com';
  var refreshBearer = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI1T3Y0SDRUQXg0Rm90ck1tTXZvWk1YbVp3bWNIaVVHbSIsInNjb3BlcyI6eyJkZXZpY2VfY3JlZGVudGlhbHMiOnsiYWN0aW9ucyI6WyJyZWFkIiwiZGVsZXRlIl19fSwiaWF0IjoxNDc5MTYzMDk4LCJqdGkiOiI5MzBjOWM0MTAzN2FhMTRmMDkwZTY2Nzc4ZjNhYWM1NyJ9.glDslHBRwWHgRIyOGCx61m3WA3KTrpHOVXOnpU57pps';
  var app = {
    isLoading: true,
    spinner: document.querySelector('#dashboard-spinner'),
    cardTemplate: document.querySelector('.cardTemplate'),
    corellationsContainer: document.querySelector('#corellContainer'),
    sleepContainer: document.querySelector('#sleepContainer'),
    utils: new Util(),
    setup: new Setup(),
    updater: new ChartUpdater(),
    chart: new Chart(0, 0, 12, [], 0, 0, 0),
    url: 'http://81.169.137.80:5000',
    correlations_list: JSON.parse('[{"x_label": "Day of week", "y_label": "Sleep length", "next_day": false}, ' +
            '{"x_label": "Sleep length", "y_label": "Load", "next_day": false},' +
            '{"x_label": "Sleep start", "y_label": "Load", "next_day": false},' +
            '{"x_label": "Sleep end", "y_label": "Load", "next_day": false},' +
            '{"x_label": "Sleep length", "y_label": "Deep sleep", "next_day": false},' +
            '{"x_label": "Deep sleep", "y_label": "Load", "next_day": false},' +
            '{"x_label": "Load", "y_label": "Deep sleep", "next_day": true},' +
            '{"x_label": "Load", "y_label": "Activity A", "next_day": false},' +
            '{"x_label": "Load", "y_label": "Activity G", "next_day": false},' +
            '{"x_label": "RPE", "y_label": "Deep sleep", "next_day": true},' +
            '{"x_label": "RPE", "y_label": "Load", "next_day": false},' +
            '{"x_label": "DALDA", "y_label": "Deep sleep", "next_day": true},' +
            '{"x_label": "Sleep end", "y_label": "RPE", "next_day": false},' +
            '{"x_label": "Sleep length", "y_label": "RPE", "next_day": false}]'),
    datepickerId: '#datepicker',
    correlation: {
      id: '#correlationsdiv',
      container: document.querySelector('#corellContainer'),
      xLabel: '#xLabel',
      yLabel: '#yLabel',
      spinner: document.querySelector('#dashboard-spinner'),
      ready: false,
      data: null,
      series: [],
      changed: false
    },
    multichart: {
      id: '#multichart',
      dataTableId: '#parameterTable',
      container: document.querySelector('#heartrateContainer'),
      rangepicker: '#timerange',
      chk_data: '#chk_data',
      chk_type1: '#table-header',
      spinner: document.querySelector('#heartrate-spinner'),
      ready: false,
      data: [],
      series: null,
      changed: false
    },
    sleep: {
      id: 'sleepchart',
      container: document.querySelector('#sleepContainer'),
      spinner: document.querySelector('#sleep-spinner'),
      ready: false,
      data: [],
      sourceData: [],
      graphs: null,
      beginDate: null,
      endDate: null,
      changed: false
    }
  };


  app.invokeReady = function (label, data) {
    if (label === 'heartrate') {
      app.multichart.ready = true;
      app.multichart.spinner.setAttribute('hidden', 'true');
      app.multichart.container.removeAttribute('hidden');
      app.multichart.data = data;
      if (data.length !== 0) {
        app.utils.fadeInHtmlTable(app.multichart.data, app.multichart.dataTableId);
        app.configureHtmlTable();
        var show_data = $(app.multichart.chk_data).is(':checked');
        var show_type1 = $(app.multichart.chk_type1).is(':checked');
        var grp_type = 'Type1';
        var data_select_id = app.multichart.chk_data;
        var point_symbol = 'circle';
        var html_id = app.multichart.id;
        var only_5mins = $(app.multichart.rangepicker).val() === 'First 5 minutes';
        if (app.multichart.changed){
          $(app.multichart.id).css('min-height', screen.height * 0.55);
          $(app.multichart.id).css('max-height', screen.height * 0.7);
          app.chart.draw_multiChart(data, show_data, grp_type, show_type1, data_select_id, point_symbol, html_id, only_5mins, app);
          app.multichart.changed = false;
        }
        $('#tab-heartrate').click(function (e) {
          e.preventDefault();
          if ($(app.multichart.id).highcharts()) {
            app.chart.draw_multiChart(app.multichart.data, $(app.multichart.chk_data).is(':checked'), grp_type, $(app.multichart.chk_type1).is(':checked'), data_select_id, point_symbol, html_id, $(app.multichart.rangepicker).val() === 'First 5 minutes', app);
          }
        });
      } else {
        $(app.multichart.id).css('min-height', '0px');
        var error_text = 'There is no heartrate data measured in the given time period. Please choose another period to analyse your personal heartrate data.';
        app.chart.clearHighchart(app.multichart.id, error_text);
        var noData = app.utils.getNoDataDiv(error_text);
        $(app.multichart.dataTableId).html(noData);
        app.multichart.boxes = null;
        app.multichart.headerCheckbox = null;
      }
    }
    if (label === 'correlation') {
      app.correlation.spinner.setAttribute('hidden', 'true');
      app.correlation.container.removeAttribute('hidden');
      app.correlation.data = data;
      var xLabel = $(app.correlation.xLabel).val();
      var yLabel = $(app.correlation.yLabel).val();
      var html_id = app.correlation.id;
      if (data != null){
        var title = 'Correlation between <strong>' + xLabel + '</strong> and <strong>' + yLabel + '</strong>';
        if (app.correlation.changed){
          $(app.correlation.id).css('min-height', screen.height * 0.55);
          $(app.correlation.id).css('max-height', screen.height * 0.7);
          app.chart.draw_linearChart(data, title, xLabel, yLabel, html_id, app);
          app.correlation.changed = false;
        }
        $('#tab-dashboard').click(function(e) {
          e.preventDefault();
          app.chart.draw_linearChart(app.correlation.data, title, xLabel, yLabel,html_id, app);
        })

      } else{
        $(app.correlation.id).css('min-height', '0px');
        var error_text = 'There is no correlation data available from ' + xLabel + ' to ' + yLabel + '. Please choose other labels.';
        app.chart.clearHighchart(html_id, error_text);
      }
    }
    if (label === 'sleep') {
      app.sleep.spinner.setAttribute('hidden', 'true');
      app.sleep.container.removeAttribute('hidden');
      app.sleep.data = data;
      var htmlId = app.sleep.id;
      if (data.length !== 0 && app.sleep.beginDate !== null && app.sleep.endDate !== null) {
        if (app.sleep.changed) {
          $('#' + app.sleep.id).css('min-height', screen.height * 0.55);
          $('#' + app.sleep.id).css('max-height', screen.height * 0.7);
          app.chart.create_heatmap(data, htmlId, app.sleep.beginDate, app.sleep.endDate, app);
          app.sleep.changed = false;
        }
        $('#tab-sleep').click(function(e) {
          e.preventDefault();
          if (app.chart.amFunctions.getChart(html_id)){
            app.chart.create_heatmap(app.sleep.data, htmlId, app.sleep.beginDate, app.sleep.endDate, app);
          }
        });
      } else {
        $('#' + app.sleep.id).css('min-height', '0px');
        var error_text = 'There is no sleep data measured in the given time period. Please choose another period to analyse your personal sleep data.';
        app.chart.clearAmChart(htmlId, error_text);
      }
    }
  };

  app.invokeLoading = function(label) {
    if (label === 'heartrate') {
      app.multichart.container.setAttribute('hidden', 'true');
      app.multichart.spinner.removeAttribute('hidden');
      app.multichart.ready = false;
      app.multichart.changed = true;
    }
    if (label === 'correlation') {
      app.correlation.container.setAttribute('hidden', 'true');
      app.correlation.spinner.removeAttribute('hidden');
      app.correlation.ready = false;
      app.correlation.changed = true;
    }
    if (label === 'sleep') {
      app.sleep.container.setAttribute('hidden', 'true');
      app.sleep.spinner.removeAttribute('hidden');
      app.sleep.ready = false;
      app.sleep.changed = true;
    }
  }

  app.initDatePicker = function () {
    $('#datepicker').show();
    var start = moment().subtract(11, 'months');
    var end = moment();
    document.getElementById('date-from').setAttribute('value', start.format(('DD.MM.YYYY')));
    document.getElementById('date-to').setAttribute('value', end.format(('DD.MM.YYYY')));

    var datepicker1 = new MaterialTextfield(document.querySelector('#datepicker1'));
    datepicker1 = new MaterialTextfield(document.querySelector('#datepicker2'));

    $('#datepicker').hide();
    var dialogFrom = new mdDateTimePicker.default({
      type: 'date',
      init: start,
      future: moment()
    });
    document.getElementById('date-from').addEventListener('click', function() {
      dialogFrom.toggle();
    });
    dialogFrom.trigger = document.getElementById('date-from');
    document.getElementById('date-from').addEventListener('onOk', function() {
      this.value = dialogFrom.time.format('DD.MM.YYYY');
      app.readHeartrateData(dialogFrom.time.format('DD.MM.YYYY'), dialogTo.time.format('DD.MM.YYYY'));
      app.readSleepData(dialogFrom.time.format('DD.MM.YYYY'), dialogTo.time.format('DD.MM.YYYY'));
    });
    var dialogTo = new mdDateTimePicker.default({
      type: 'date',
      init: end
    });
    document.getElementById('date-to').addEventListener('click', function() {
      dialogTo.toggle();
    });
    dialogTo.trigger = document.getElementById('date-to');
    document.getElementById('date-to').addEventListener('onOk', function() {
      this.value = dialogTo.time.format('DD.MM.YYYY');
      app.readHeartrateData(dialogFrom.time.format('DD.MM.YYYY'), dialogTo.time.format('DD.MM.YYYY'));
      app.readSleepData(dialogFrom.time.format('DD.MM.YYYY'), dialogTo.time.format('DD.MM.YYYY'));
    });
  };



  app.readCorrelations = function () {
    var user_id	= JSON.parse(localStorage.getItem('profile')).email;
    app.setup.fillInXlabels(app.correlations_list, '#x');
    app.setup.fillInYlabels(app.url, user_id, app.correlations_list, app.correlation.xLabel, '#y', app);

    $(app.correlation.xLabel).on('change', function() {
      app.setup.fillInYlabels(app.url, user_id, app.correlations_list, app.correlation.xLabel, '#y', app);
    });

  };

  app.readSleepData = function(start, end) {
    var userId = JSON.parse(localStorage.getItem('profile')).email;
    app.updater.update_heatmap(app.url, userId, start, end, app);
  };

  app.readHeartrateData = function(start, end) {
    var userId = JSON.parse(localStorage.getItem('profile')).email;
    var beginDate = start;
    var endDate = end;
    app.updater.update_mutlichart(app.url, userId, beginDate, endDate, app, true);

  }

  app.multichartSwitch = function() {
    if (app.multichart.data.length != 0){
      app.multichart.changed = true;
      app.chart.draw_multiChart(app.multichart.data, $(app.multichart.chk_data).is(':checked'), 'Type1', $(app.multichart.chk_type1).is(':checked'), app.multichart.chk_data, 'circle', app.multichart.id, $(app.multichart.rangepicker).val() === 'First 5 minutes', app);
    }
  };

  app.configureHtmlTable = function () {
    var table = document.querySelector('#parameters');
    var headerLabel = table.querySelector('thead .mdl-data-table__select');
    app.multichart.headerCheckbox = headerLabel.querySelector('input');
    headerLabel.MaterialCheckbox = new MaterialCheckbox(headerLabel);
    headerLabel.MaterialCheckbox.check();
    app.multichart.boxes = table.querySelectorAll('tbody .mdl-data-table__select');
    for (var i = 0; i < app.multichart.boxes.length; i++) {
      app.multichart.boxes[i].MaterialCheckbox = new MaterialCheckbox(app.multichart.boxes[i]);
      app.multichart.boxes[i].MaterialCheckbox.check();
    }
    var headerCheckHandler = function(event) {
      var chart = $(app.multichart.id).highcharts();
      if (event.target.checked) {
        for (var i = 0, length = app.multichart.boxes.length; i < length; i++) {
          app.multichart.boxes[i].MaterialCheckbox.check();
        }
      } else {
        for (var i = 0, length = app.multichart.boxes.length; i < length; i++) {
          app.multichart.boxes[i].MaterialCheckbox.uncheck();
        }
      }
      app.chart.setTypeVisible(app.multichart.id, 'Type1', event.target.checked, $(app.multichart.chk_data).is(':checked'))
    };
    app.multichart.headerCheckbox.addEventListener('change', headerCheckHandler);
    var inputCheckhandler = function (event) {
      var date = $(this).attr('data-main');
      var chart = $(app.multichart.id).highcharts();
      for (var i = 0; i < chart.series.length; i++) {
        if (chart.series[i].name.split(' ')[1] == date) {
          if (chart.series[i].options.type == 'scatter') {
            chart.series[i].setVisible($(app.multichart.chk_data).is(':checked') && event.target.checked, false)
          } else {
            chart.series[i].setVisible(event.target.checked);

          }
        }
      }
      chart.redraw();
    };
    for (var i = 0; i < app.multichart.boxes.length; i++) {
      app.multichart.boxes[i].querySelector('input').addEventListener('change', inputCheckhandler);
    }
  };

  var refreshTokens = function() {
    var refreshToken = localStorage.getItem('refresh_token');
    var data = {
      'client_id':       AUTH0_CLIENT_ID,
      'grant_type':      'urn:ietf:params:oauth:grant-type:jwt-bearer',
      'refresh_token':   refreshToken,
      'api_type':        'app'
    };
    $.ajax({url: 'https://app-iss.eu.auth0.com/delegation', type: 'POST', data: JSON.stringify(data), success: function(data){
      localStorage.setItem('id_token', data.id_token);
    }});
  };

  var getRefreshTokenIDs = function () {
    var data = {
      type: 'refresh_token',
      client_id: AUTH0_CLIENT_ID,
      user_id: JSON.parse(localStorage.getItem('profile')).user_id
    };
    $.ajax({type: 'GET', data: data, headers: {'authorization' : 'Bearer ' +refreshBearer}, url: 'https://app-iss.eu.auth0.com/api/v2/device-credentials', success: function (response) {
      var temp = [];
      for (var i = 0; i<response.length; i++) {
        if (response[i].device_name === 'web-app') {
            temp.push(response[i].id);
        }
      }
      localStorage.setItem('refresh_id', JSON.stringify(temp));
    }, error: function (xhr) {
      console.error(xhr);
    }});
  };
  //retrieve the profile:
  var retrieve_profile = function() {
    var id_token = localStorage.getItem('id_token');
    if (id_token) {
      lock.getProfile(id_token, function (err, profile) {
        if (err) {
          refreshTokens();
          retrieve_profile();
        } else {
          // Display user information
          show_profile_info(profile);
        }
      });
    }
  };

  function show_profile_info(profile){
    document.getElementById('username').innerHTML = profile.email;
    if (profile.email){
      document.querySelector('#user-email span input').setAttribute('value', profile.email);
    }
    var lastname = document.querySelector('#user-lastname span input');
    var prename = document.querySelector('#user-prename span input');
    var sport = document.querySelector('#user-sport span input');
    if (!profile.user_metadata){
      $('.avatar').attr('src', profile.picture).show();
      if (profile.family_name) {
        lastname.setAttribute('value', profile.family_name);
      }
      if (profile.given_name) {
        prename.setAttribute('value', profile.given_name);
      }
    } else {
      if (profile.user_metadata.picture){
        $('.avatar').attr('src', profile.user_metadata.picture).show();
      } else {
        $('.avatar').attr('src', profile.picture).show();
      }
      if (profile.user_metadata.sport){
        sport.setAttribute('value', profile.user_metadata.sport);
      }
      if (profile.user_metadata.family_name) {
        lastname.setAttribute('value', profile.user_metadata.family_name);
      } else {
        if (profile.family_name) {
          lastname.setAttribute('value', profile.family_name);
        }
      }
      if (profile.user_metadata.given_name) {
        prename.setAttribute('value', profile.user_metadata.given_name);
      } else {
        if (profile.given_name) {
          prename.setAttribute('value', profile.given_name);
        }
      }
    }

    var temp = new MaterialTextfield(document.querySelector('#user-sport div'));
    temp = new MaterialTextfield(document.querySelector('#user-email div'));
    temp = new MaterialTextfield(document.querySelector('#user-lastname div'));
    temp = new MaterialTextfield(document.querySelector('#user-prename div'));
    $('#user-sport').show();
    $('#user-email').show();
    $('#user-lastname').show();
    $('#user-prename').show();

    $('#edit').click(function (e) {
      e.preventDefault();
      $('#btn1').hide();
      $('#submit-profile').show();
      document.querySelector('#user-sport input').removeAttribute('readonly');
      document.querySelector('#user-lastname input').removeAttribute('readonly');
      document.querySelector('#user-prename input').removeAttribute('readonly');
    });

    $('#submit-profile').click(function (e) {
      e.preventDefault();
      document.querySelector('#user-sport input').setAttribute('readonly', 'true');
      document.querySelector('#user-lastname input').setAttribute('readonly', 'true');
      document.querySelector('#user-prename input').setAttribute('readonly','true');
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://app-iss.eu.auth0.com/api/v2/users/" + profile.user_id,
        "method": "PATCH",
        "headers": {
          "authorization": "Bearer " + localStorage.getItem('id_token'),
          "content-type": "application/json"
        },
        "processData": false,
        "data": "{\"user_metadata\": {\"family_name\": \"" + lastname.value + "\", \"given_name\": \"" + prename.value + "\", \"sport\": \"" + sport.value + "\"}}"
      };


      $.ajax(settings).done(function (response) {
        console.log('successfully updated user profile');
      });
      $('#submit-profile').hide();
      $('#btn1').show();


    })
  }

  var lock = app.utils.initLock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
    auth: {
      params: {scope: 'openid profile offline_access', device: 'web-app'}
    },
    closable: false
  });


  var logout = function() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('profile');
    var refreshToken = localStorage.getItem('refresh_token');
    var refreshIDs = JSON.parse(localStorage.getItem('refresh_id'));
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh_id');

    for (var i = 0; i < refreshIDs.length; i++) {
      $.ajax({type: 'DELETE', headers: {'authorization' : 'Bearer ' + refreshBearer}, url: 'https://app-iss.eu.auth0.com/api/v2/device-credentials/' + refreshIDs[i], success: function (res) {
        if (i === refreshIDs.length) {
          window.location.href = "/";
        }
      }, error: function (res) {
        console.error(res);
      }});
    }



    document.getElementById('profile-button').setAttribute('style', 'display: none');
    if (!app.isLoading) {
      app.spinner.setAttribute('hidden', false);
      app.corellationsContainer.setAttribute('hidden', true);
      app.isLoading = true;
    }
  };

  var on_logged_in = function () {
    getRefreshTokenIDs();
    $.ajaxSetup({
      'beforeSend': function(xhr) {
        xhr.setRequestHeader('Accept', 'application/json; charset=utf-8');
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      }
    });
    document.getElementById('profile-button').setAttribute('style', 'display: block');
    retrieve_profile();
    lock.hide();
    app.setup.select_all([app.multichart.chk_data]);
    app.initDatePicker();
    $('#tab-dashboard').click(function (e) {
      e.preventDefault();
      $('#datepicker').hide();
      $('#heartrate').css('display', 'none');
      $('#sleepdata').css('display', 'none');
      $('#dashboard').css('display', 'block');
    });
    $('#tab-profile').click(function (e) {
      e.preventDefault();
      $('#datepicker').hide();
      $('#heartrate').css('display', 'none');
      $('#dashboard').css('display', 'none');
      $('#sleepdata').css('display', 'none');
    });
    $('#tab-heartrate').click(function (e) {
      e.preventDefault();
      $('#datepicker').show();
      $('#heartrate').css('display', 'block');
      $('#sleepdata').css('display', 'none');
      $('#dashboard').css('display', 'none');
    });
    $('#tab-sleep').click(function (e) {
      e.preventDefault();
      $('#datepicker').show();
      $('#heartrate').css('display', 'none');
      $('#dashboard').css('display', 'none');
      $('#sleepdata').css('display', 'block');
    });
    $(app.multichart.rangepicker).on('change', function () {
      app.multichartSwitch();
      if (app.multichart.boxes !== null && app.multichart.headerCheckbox !== null){
        if ($('#table-header').is(':checked')) {
          for (var i = 0; i < app.multichart.boxes.length; i++) {
            app.multichart.boxes[i].MaterialCheckbox.check();
          }
        } else {
          for (var i = 0; i < app.multichart.boxes.length; i++) {
            app.multichart.boxes[i].MaterialCheckbox.uncheck();
          }
        }
      }

    });
    $(app.multichart.chk_data).click(function() {
      var checked = $(app.multichart.chk_data).is(':checked');
      app.chart.setScatterVisible(app.multichart.id, checked);
    });
    app.readCorrelations();
    app.readHeartrateData($('#date-from').val(), $('#date-to').val());
    app.readSleepData($('#date-from').val(), $('#date-to').val());
  };

  lock.on("authenticated", function(authResult) {
    lock.getProfile(authResult.idToken, function(error, profile) {
      if (error) {
        alert('There was an error while logging in: ' + error.message);
        logout();
        return;
      }
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('profile', JSON.stringify(profile));
      localStorage.setItem('refresh_token', authResult.refreshToken)
      // Display user information
      on_logged_in();

    });
  });

  $('#btn-logout').click(function(e) {
    e.preventDefault();
    logout();
  });


  if(!localStorage.getItem('id_token')){
    document.getElementById('profile-button').setAttribute('style', 'display: none');
    $('#datepicker').hide();
    lock.show();
  }
  else{
    on_logged_in();
  }


})();
