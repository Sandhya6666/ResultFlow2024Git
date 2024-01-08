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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6379772727272728, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9445, 500, 1500, "sendOTP"], "isController": false}, {"data": [0.90725, 500, 1500, "ExtrasApi"], "isController": false}, {"data": [0.016, 500, 1500, "resultValidation"], "isController": false}, {"data": [0.9515, 500, 1500, "submitOTP"], "isController": false}, {"data": [0.45175, 500, 1500, "Leaderboard"], "isController": false}, {"data": [0.59975, 500, 1500, "Analysis"], "isController": false}, {"data": [0.5985, 500, 1500, "Pricing"], "isController": false}, {"data": [0.518, 500, 1500, "testUsersList"], "isController": false}, {"data": [0.825, 500, 1500, "dashboardOlympiadState"], "isController": false}, {"data": [0.59725, 500, 1500, "dashboardHome"], "isController": false}, {"data": [0.60825, 500, 1500, "Result"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 22000, 0, 0.0, 1433.0051818181796, 23, 17161, 548.0, 3560.4000000000087, 8379.95, 10015.890000000018, 88.46390471633245, 272.449298339241, 23.568632973814683], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["sendOTP", 2000, 0, 0.0, 253.20199999999952, 27, 6052, 152.0, 430.9000000000001, 685.7999999999993, 3042.820000000002, 8.401772774055326, 2.28915488668109, 2.297359742905753], "isController": false}, {"data": ["ExtrasApi", 2000, 0, 0.0, 361.28899999999953, 66, 5871, 220.5, 678.6000000000004, 1003.0, 3097.090000000002, 8.390986402406535, 9.580089146363976, 1.982985111767939], "isController": false}, {"data": ["resultValidation", 2000, 0, 0.0, 8216.763000000006, 369, 17161, 8353.0, 9974.7, 11290.699999999999, 15546.66, 8.160034598546698, 2.3826663525053347, 1.9842271631231716], "isController": false}, {"data": ["submitOTP", 2000, 0, 0.0, 239.757, 23, 5791, 139.0, 381.9000000000001, 652.8999999999996, 3307.4800000000023, 8.402549333467775, 3.2822458333858493, 2.117048562533873], "isController": false}, {"data": ["Leaderboard", 2000, 0, 0.0, 1612.4555000000012, 157, 14964, 785.0, 4663.1, 6077.349999999994, 9518.84, 8.516581784734878, 67.10829828449428, 2.6447562740593433], "isController": false}, {"data": ["Analysis", 2000, 0, 0.0, 986.5330000000013, 83, 6933, 586.0, 1767.6000000000004, 4525.5999999999985, 5755.6, 8.462313088659656, 26.494068480475327, 2.107272974651141], "isController": false}, {"data": ["Pricing", 2000, 0, 0.0, 992.2015000000023, 51, 6743, 817.5, 1617.8000000000002, 2588.2999999999975, 4983.47, 8.69164645858865, 44.671705818459756, 2.4614589987875153], "isController": false}, {"data": ["testUsersList", 2000, 0, 0.0, 992.3214999999973, 80, 6817, 899.0, 1288.8000000000002, 2035.4999999999982, 4790.56, 8.422329279385506, 55.04123782973419, 2.788251587609069], "isController": false}, {"data": ["dashboardOlympiadState", 2000, 0, 0.0, 542.278999999999, 33, 6206, 420.0, 794.7000000000003, 1055.6499999999987, 4021.8100000000013, 8.386377168926796, 19.94779660388415, 2.1211228074865187], "isController": false}, {"data": ["dashboardHome", 2000, 0, 0.0, 753.9105000000002, 128, 6292, 622.0, 985.0, 1370.3999999999978, 4917.200000000001, 8.404208827780954, 32.55061697398057, 2.125632876319461], "isController": false}, {"data": ["Result", 2000, 0, 0.0, 812.3450000000017, 100, 6457, 596.0, 1336.2000000000007, 2266.95, 4674.490000000001, 8.417402137178403, 23.936827035275225, 2.0714289565998745], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 22000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
