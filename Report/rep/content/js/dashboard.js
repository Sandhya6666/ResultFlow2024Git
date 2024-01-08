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

    var data = {"OkPercent": 36.36363636363637, "KoPercent": 63.63636363636363};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.33295454545454545, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "sendOTP"], "isController": false}, {"data": [0.0, 500, 1500, "ExtrasApi"], "isController": false}, {"data": [0.6875, 500, 1500, "resultValidation"], "isController": false}, {"data": [0.975, 500, 1500, "submitOTP"], "isController": false}, {"data": [0.0, 500, 1500, "Leaderboard"], "isController": false}, {"data": [0.0, 500, 1500, "Analysis"], "isController": false}, {"data": [0.0, 500, 1500, "Pricing"], "isController": false}, {"data": [1.0, 500, 1500, "testUsersList"], "isController": false}, {"data": [0.0, 500, 1500, "dashboardOlympiadState"], "isController": false}, {"data": [0.0, 500, 1500, "dashboardHome"], "isController": false}, {"data": [0.0, 500, 1500, "Result"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 440, 280, 63.63636363636363, 174.95000000000005, 0, 1248, 0.0, 418.0, 563.5999999999999, 986.0799999999997, 74.80448826929616, 100.96215147908875, 9.455489204352261], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["sendOTP", 40, 0, 0.0, 313.57500000000005, 127, 428, 349.5, 393.6, 416.84999999999997, 428.0, 8.514261387824606, 2.319803639846743, 2.3281183482332906], "isController": false}, {"data": ["ExtrasApi", 40, 40, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 9.449562957713205, 11.018338058114812, 0.0], "isController": false}, {"data": ["resultValidation", 40, 0, 0.0, 655.0, 258, 1248, 591.0, 989.8, 1135.9999999999995, 1248.0, 7.878668505022651, 2.3005096513689187, 1.9158090407721096], "isController": false}, {"data": ["submitOTP", 40, 0, 0.0, 392.8999999999999, 275, 564, 404.0, 461.0, 512.7499999999998, 564.0, 8.244023083264633, 3.218711356141797, 2.0771073784006595], "isController": false}, {"data": ["Leaderboard", 40, 40, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 9.47867298578199, 11.163359004739338, 0.0], "isController": false}, {"data": ["Analysis", 40, 40, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 9.476427386875148, 11.1329513148543, 0.0], "isController": false}, {"data": ["Pricing", 40, 40, 100.0, 237.42500000000004, 6, 382, 271.5, 360.2, 363.84999999999997, 382.0, 9.532888465204957, 2.830076263107722, 2.773288548617731], "isController": false}, {"data": ["testUsersList", 40, 0, 0.0, 325.54999999999995, 96, 477, 341.0, 392.09999999999997, 426.5999999999999, 477.0, 8.908685968819599, 58.21965478841871, 2.9483922605790642], "isController": false}, {"data": ["dashboardOlympiadState", 40, 40, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 9.447331128956069, 11.172576169107227, 0.0], "isController": false}, {"data": ["dashboardHome", 40, 40, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 9.447331128956069, 11.172576169107227, 0.0], "isController": false}, {"data": ["Result", 40, 40, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 9.476427386875148, 11.142205638474294, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/extra/", 40, 14.285714285714286, 9.090909090909092], "isController": false}, {"data": ["400/Bad Request", 40, 14.285714285714286, 9.090909090909092], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/test//analysis/", 40, 14.285714285714286, 9.090909090909092], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v4/user/${child_userid}/app/olympiad/dashboard/", 40, 14.285714285714286, 9.090909090909092], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/get-test-result/", 40, 14.285714285714286, 9.090909090909092], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/test//leaderboard/", 40, 14.285714285714286, 9.090909090909092], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v4/user/${child_userid}/content/dashboard/home/", 40, 14.285714285714286, 9.090909090909092], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 440, 280, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/extra/", 40, "400/Bad Request", 40, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/test//analysis/", 40, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v4/user/${child_userid}/app/olympiad/dashboard/", 40, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/get-test-result/", 40], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["ExtrasApi", 40, 40, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/extra/", 40, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Leaderboard", 40, 40, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/test//leaderboard/", 40, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Analysis", 40, 40, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/test//analysis/", 40, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Pricing", 40, 40, "400/Bad Request", 40, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["dashboardOlympiadState", 40, 40, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v4/user/${child_userid}/app/olympiad/dashboard/", 40, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["dashboardHome", 40, 40, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v4/user/${child_userid}/content/dashboard/home/", 40, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Result", 40, 40, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/get-test-result/", 40, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
