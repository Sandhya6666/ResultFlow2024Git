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

    var data = {"OkPercent": 22.90909090909091, "KoPercent": 77.0909090909091};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2290909090909091, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "sendOTP"], "isController": false}, {"data": [0.0, 500, 1500, "ExtrasApi"], "isController": false}, {"data": [0.0, 500, 1500, "resultValidation"], "isController": false}, {"data": [0.52, 500, 1500, "submitOTP"], "isController": false}, {"data": [0.0, 500, 1500, "Leaderboard"], "isController": false}, {"data": [0.0, 500, 1500, "Analysis"], "isController": false}, {"data": [0.0, 500, 1500, "Pricing"], "isController": false}, {"data": [1.0, 500, 1500, "testUsersList"], "isController": false}, {"data": [0.0, 500, 1500, "dashboardOlympiadState"], "isController": false}, {"data": [0.0, 500, 1500, "dashboardHome"], "isController": false}, {"data": [0.0, 500, 1500, "Result"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2200, 1696, 77.0909090909091, 590.4977272727243, 0, 8246, 0.0, 305.8000000000002, 6618.449999999998, 7917.919999999998, 212.78653641551406, 285.1536997352258, 25.27595753941387], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["sendOTP", 200, 0, 0.0, 133.79, 24, 442, 108.0, 283.70000000000005, 332.95, 398.96000000000004, 171.96904557179707, 45.458438574806536, 47.69453998280309], "isController": false}, {"data": ["ExtrasApi", 200, 200, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 137.45704467353954, 160.2770618556701, 0.0], "isController": false}, {"data": ["resultValidation", 200, 200, 100.0, 6043.205000000001, 130, 8246, 6745.5, 7933.1, 8138.85, 8218.8, 22.896393817973667, 6.484330280480824, 5.657019175729823], "isController": false}, {"data": ["submitOTP", 200, 96, 48.0, 142.64499999999987, 8, 403, 129.0, 274.0, 285.95, 317.94000000000005, 188.85741265344666, 57.01133144475921, 48.32093956562795], "isController": false}, {"data": ["Leaderboard", 200, 200, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 155.4001554001554, 183.0201048951049, 0.0], "isController": false}, {"data": ["Analysis", 200, 200, 100.0, 0.004999999999999999, 0, 1, 0.0, 0.0, 0.0, 0.0, 157.60441292356185, 185.15440307328606, 0.0], "isController": false}, {"data": ["Pricing", 200, 200, 100.0, 87.61499999999998, 4, 509, 51.5, 195.0, 357.39999999999986, 499.9100000000001, 176.67844522968198, 52.45141342756184, 42.961848498233216], "isController": false}, {"data": ["testUsersList", 200, 0, 0.0, 88.20000000000005, 20, 310, 77.0, 172.9, 191.0, 245.94000000000005, 231.21387283236993, 1511.0187861271677, 65.48049132947978], "isController": false}, {"data": ["dashboardOlympiadState", 200, 200, 100.0, 0.004999999999999999, 0, 1, 0.0, 0.0, 0.0, 0.0, 139.4700139470014, 164.93963563458857, 0.0], "isController": false}, {"data": ["dashboardHome", 200, 200, 100.0, 0.009999999999999998, 0, 1, 0.0, 0.0, 0.0, 0.9900000000000091, 165.56291390728478, 195.79754759933775, 0.0], "isController": false}, {"data": ["Result", 200, 200, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 137.45704467353954, 161.61941580756013, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/extra/", 200, 11.79245283018868, 9.090909090909092], "isController": false}, {"data": ["400/Bad Request", 496, 29.245283018867923, 22.545454545454547], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/test//analysis/", 200, 11.79245283018868, 9.090909090909092], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v4/user/${child_userid}/app/olympiad/dashboard/", 200, 11.79245283018868, 9.090909090909092], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/get-test-result/", 200, 11.79245283018868, 9.090909090909092], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/test//leaderboard/", 200, 11.79245283018868, 9.090909090909092], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v4/user/${child_userid}/content/dashboard/home/", 200, 11.79245283018868, 9.090909090909092], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2200, 1696, "400/Bad Request", 496, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/extra/", 200, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/test//analysis/", 200, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v4/user/${child_userid}/app/olympiad/dashboard/", 200, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/get-test-result/", 200], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["ExtrasApi", 200, 200, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/extra/", 200, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["resultValidation", 200, 200, "400/Bad Request", 200, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["submitOTP", 200, 96, "400/Bad Request", 96, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Leaderboard", 200, 200, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/test//leaderboard/", 200, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Analysis", 200, 200, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/test//analysis/", 200, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Pricing", 200, 200, "400/Bad Request", 200, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["dashboardOlympiadState", 200, 200, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v4/user/${child_userid}/app/olympiad/dashboard/", 200, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["dashboardHome", 200, 200, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v4/user/${child_userid}/content/dashboard/home/", 200, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Result", 200, 200, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://testapi.logiqids.com/v1/user/${child_userid}/get-test-result/", 200, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
