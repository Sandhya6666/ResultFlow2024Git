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

    var data = {"OkPercent": 98.72727272727273, "KoPercent": 1.2727272727272727};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5590909090909091, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "sendOTP"], "isController": false}, {"data": [0.73, 500, 1500, "ExtrasApi"], "isController": false}, {"data": [0.055, 500, 1500, "resultValidation"], "isController": false}, {"data": [0.98, 500, 1500, "submitOTP"], "isController": false}, {"data": [0.12, 500, 1500, "Leaderboard"], "isController": false}, {"data": [0.015, 500, 1500, "Analysis"], "isController": false}, {"data": [0.465, 500, 1500, "Pricing"], "isController": false}, {"data": [1.0, 500, 1500, "testUsersList"], "isController": false}, {"data": [0.755, 500, 1500, "dashboardOlympiadState"], "isController": false}, {"data": [0.74, 500, 1500, "dashboardHome"], "isController": false}, {"data": [0.29, 500, 1500, "Result"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1100, 14, 1.2727272727272727, 1127.2245454545448, 20, 3980, 614.5, 3032.3999999999996, 3406.900000000001, 3825.0, 70.62600321027287, 224.31418037720707, 18.756207363563405], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["sendOTP", 100, 0, 0.0, 61.2, 31, 167, 57.5, 84.80000000000001, 103.94999999999999, 166.96999999999997, 327.86885245901635, 89.33785860655738, 89.65163934426229], "isController": false}, {"data": ["ExtrasApi", 100, 2, 2.0, 606.9800000000001, 69, 2916, 433.0, 1407.4, 1839.6499999999985, 2908.7299999999964, 21.862702229995627, 24.536826697092263, 5.141364574223874], "isController": false}, {"data": ["resultValidation", 100, 0, 0.0, 2644.62, 1136, 3860, 2656.5, 3768.7, 3824.8, 3859.71, 25.100401606425702, 7.3291211721887555, 6.103515625], "isController": false}, {"data": ["submitOTP", 100, 2, 2.0, 70.88999999999999, 25, 198, 71.5, 95.0, 102.74999999999994, 197.32999999999964, 350.8771929824561, 136.43777412280704, 88.4046052631579], "isController": false}, {"data": ["Leaderboard", 100, 2, 2.0, 2407.75, 247, 3914, 2573.0, 3543.5000000000005, 3708.899999999999, 3913.41, 12.781186094069529, 95.01526253355061, 3.9530561014187118], "isController": false}, {"data": ["Analysis", 100, 2, 2.0, 2633.7699999999995, 1300, 3980, 2611.5, 3545.9, 3718.1499999999996, 3979.0999999999995, 11.043622308117062, 67.91967921728327, 2.736208413859746], "isController": false}, {"data": ["Pricing", 100, 0, 0.0, 1154.4, 42, 3027, 1057.0, 2507.8, 2751.3999999999987, 3025.7599999999993, 15.405946695424433, 59.348852016253275, 4.34510885264212], "isController": false}, {"data": ["testUsersList", 100, 0, 0.0, 115.30999999999997, 20, 367, 99.0, 192.4000000000001, 226.5999999999999, 366.0199999999995, 212.7659574468085, 1390.4587765957447, 70.2127659574468], "isController": false}, {"data": ["dashboardOlympiadState", 100, 2, 2.0, 489.29, 78, 1396, 462.5, 722.7, 757.8499999999999, 1390.9299999999973, 38.28483920367534, 89.44033846190658, 9.638881245214394], "isController": false}, {"data": ["dashboardHome", 100, 2, 2.0, 536.3900000000002, 146, 1127, 482.0, 903.5000000000001, 1073.95, 1126.7399999999998, 67.75067750677506, 256.54680619071814, 17.057423992208673], "isController": false}, {"data": ["Result", 100, 2, 2.0, 1678.8699999999997, 373, 3886, 1473.5, 3042.6000000000004, 3382.0999999999995, 3885.8199999999997, 13.785497656465399, 38.142748828232705, 3.3765045578301627], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 2, 14.285714285714286, 0.18181818181818182], "isController": false}, {"data": ["405/Method Not Allowed", 2, 14.285714285714286, 0.18181818181818182], "isController": false}, {"data": ["401/Unauthorized", 8, 57.142857142857146, 0.7272727272727273], "isController": false}, {"data": ["404/Not Found", 2, 14.285714285714286, 0.18181818181818182], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1100, 14, "401/Unauthorized", 8, "400/Bad Request", 2, "405/Method Not Allowed", 2, "404/Not Found", 2, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["ExtrasApi", 100, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["submitOTP", 100, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Leaderboard", 100, 2, "405/Method Not Allowed", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Analysis", 100, 2, "404/Not Found", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["dashboardOlympiadState", 100, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["dashboardHome", 100, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Result", 100, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
