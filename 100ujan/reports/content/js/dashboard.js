/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5718181818181818, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "sendOTP"], "isController": false}, {"data": [0.74, 500, 1500, "ExtrasApi"], "isController": false}, {"data": [0.0, 500, 1500, "resultValidation"], "isController": false}, {"data": [1.0, 500, 1500, "submitOTP"], "isController": false}, {"data": [0.06, 500, 1500, "Leaderboard"], "isController": false}, {"data": [0.045, 500, 1500, "Analysis"], "isController": false}, {"data": [0.445, 500, 1500, "Pricing"], "isController": false}, {"data": [1.0, 500, 1500, "testUsersList"], "isController": false}, {"data": [0.89, 500, 1500, "dashboardOlympiadState"], "isController": false}, {"data": [0.805, 500, 1500, "dashboardHome"], "isController": false}, {"data": [0.305, 500, 1500, "Result"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1100, 0, 0.0, 1196.3336363636356, 26, 4792, 554.5, 3123.7999999999997, 3588.1500000000005, 4624.99, 66.54567453115548, 194.94686507486387, 17.72008989337568], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["sendOTP", 100, 0, 0.0, 73.17000000000002, 28, 149, 69.5, 113.80000000000001, 139.89999999999998, 148.95, 355.87188612099646, 96.96466303380782, 97.30871886120995], "isController": false}, {"data": ["ExtrasApi", 100, 0, 0.0, 599.7600000000002, 96, 1575, 501.0, 1232.5000000000002, 1303.2999999999997, 1574.7199999999998, 29.507229271171436, 33.641987404101506, 6.967336880348186], "isController": false}, {"data": ["resultValidation", 100, 0, 0.0, 3523.3600000000006, 2080, 4792, 3502.5, 4669.1, 4720.549999999999, 4791.55, 20.79434393844874, 6.071785974215013, 5.056437149095446], "isController": false}, {"data": ["submitOTP", 100, 0, 0.0, 90.34999999999997, 26, 277, 88.0, 130.0, 143.95, 276.6899999999998, 320.51282051282055, 125.1377203525641, 80.75420673076923], "isController": false}, {"data": ["Leaderboard", 100, 0, 0.0, 2462.26, 836, 3604, 2532.0, 3352.0, 3453.7, 3603.4199999999996, 11.524720525527256, 86.74884482684108, 3.576602476374323], "isController": false}, {"data": ["Analysis", 100, 0, 0.0, 2571.3900000000003, 715, 3690, 2709.5, 3448.3, 3571.85, 3689.5899999999997, 11.842728564661297, 37.40810320197773, 2.9466882919824724], "isController": false}, {"data": ["Pricing", 100, 0, 0.0, 1214.9399999999991, 43, 2984, 1155.5, 2514.1000000000004, 2712.9999999999995, 2983.43, 13.730605519703419, 52.89688958876836, 3.885734544487162], "isController": false}, {"data": ["testUsersList", 100, 0, 0.0, 127.88000000000001, 26, 308, 121.0, 217.30000000000004, 261.6499999999999, 308.0, 191.93857965451056, 1254.3486084452975, 63.52342250479846], "isController": false}, {"data": ["dashboardOlympiadState", 100, 0, 0.0, 394.47, 136, 829, 386.5, 624.6, 663.55, 828.1199999999995, 47.23665564478035, 112.36373331955598, 11.937865346008502], "isController": false}, {"data": ["dashboardHome", 100, 0, 0.0, 468.77, 123, 1060, 344.5, 847.9, 913.0999999999993, 1059.6899999999998, 68.07351940095303, 262.7225684989789, 17.203853599387337], "isController": false}, {"data": ["Result", 100, 0, 0.0, 1633.32, 235, 3728, 1528.5, 2927.3, 3244.25, 3725.1099999999988, 15.752993068683049, 44.39174986216131, 3.8734825437145557], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1100, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
