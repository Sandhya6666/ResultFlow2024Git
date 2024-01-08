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

    var data = {"OkPercent": 99.99636363636364, "KoPercent": 0.0036363636363636364};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6085818181818182, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9268, 500, 1500, "sendOTP"], "isController": false}, {"data": [0.8951, 500, 1500, "ExtrasApi"], "isController": false}, {"data": [0.0083, 500, 1500, "resultValidation"], "isController": false}, {"data": [0.9221, 500, 1500, "submitOTP"], "isController": false}, {"data": [0.4698, 500, 1500, "Leaderboard"], "isController": false}, {"data": [0.5714, 500, 1500, "Analysis"], "isController": false}, {"data": [0.5637, 500, 1500, "Pricing"], "isController": false}, {"data": [0.4908, 500, 1500, "testUsersList"], "isController": false}, {"data": [0.7662, 500, 1500, "dashboardOlympiadState"], "isController": false}, {"data": [0.5245, 500, 1500, "dashboardHome"], "isController": false}, {"data": [0.5557, 500, 1500, "Result"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 55000, 2, 0.0036363636363636364, 1511.055818181827, 21, 23706, 624.0, 4218.0, 7915.950000000001, 8698.990000000002, 91.53836039817523, 268.2805583912799, 24.387852492901615], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["sendOTP", 5000, 0, 0.0, 313.65940000000046, 25, 5850, 168.0, 522.8000000000011, 1294.8499999999995, 3104.439999999988, 8.682530228228991, 2.365650325855359, 2.374129359281364], "isController": false}, {"data": ["ExtrasApi", 5000, 0, 0.0, 447.75540000000024, 61, 6193, 239.0, 750.0, 1926.2499999999973, 4113.799999999996, 8.428846208957841, 9.621205280756438, 1.9919520191090372], "isController": false}, {"data": ["resultValidation", 5000, 0, 0.0, 8655.8486, 206, 16328, 8841.0, 11052.0, 11337.0, 13211.719999999994, 8.686165370690793, 2.536292427574753, 2.1121632590839914], "isController": false}, {"data": ["submitOTP", 5000, 0, 0.0, 327.4151999999998, 23, 5363, 156.0, 533.7000000000016, 1527.3999999999978, 3650.9799999999996, 8.630450992847083, 3.3712699190808912, 2.174469097807175], "isController": false}, {"data": ["Leaderboard", 5000, 1, 0.02, 1447.3403999999998, 88, 13408, 783.0, 3232.9000000000005, 5359.149999999997, 8327.0, 8.4607952132205, 53.73388740701586, 2.6274437684974137], "isController": false}, {"data": ["Analysis", 5000, 1, 0.02, 927.928599999998, 122, 23706, 614.0, 1606.7000000000016, 3485.8999999999996, 5459.919999999998, 8.435174000769287, 26.456203298131946, 2.1005263706735993], "isController": false}, {"data": ["Pricing", 5000, 0, 0.0, 1004.0516000000001, 43, 7478, 717.0, 1664.0, 2475.549999999991, 4701.919999999998, 8.520355128401752, 42.70189647129492, 2.412969564758959], "isController": false}, {"data": ["testUsersList", 5000, 0, 0.0, 1118.5778000000023, 21, 5982, 1038.0, 1402.0, 1985.8499999999995, 4445.98, 8.604385827544014, 56.231005818285695, 2.848522261267013], "isController": false}, {"data": ["dashboardOlympiadState", 5000, 0, 0.0, 633.0992000000001, 24, 6233, 464.0, 834.5000000000027, 1925.9499999999998, 4205.959999999999, 8.47887319166832, 20.171727851805407, 2.1445372183318323], "isController": false}, {"data": ["dashboardHome", 5000, 0, 0.0, 871.2266000000014, 117, 6523, 710.0, 1120.800000000001, 2248.449999999998, 4781.369999999964, 8.55552019273876, 33.08905585343025, 2.163923325748865], "isController": false}, {"data": ["Result", 5000, 0, 0.0, 874.711199999998, 147, 6676, 640.0, 1373.9000000000005, 2778.8999999999996, 4871.649999999992, 8.424812758536442, 24.106576579968323, 2.0732723736699326], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["405/Method Not Allowed", 1, 50.0, 0.0018181818181818182], "isController": false}, {"data": ["404/Not Found", 1, 50.0, 0.0018181818181818182], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 55000, 2, "405/Method Not Allowed", 1, "404/Not Found", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Leaderboard", 5000, 1, "405/Method Not Allowed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Analysis", 5000, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
