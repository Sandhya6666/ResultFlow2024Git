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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1534090909090909, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5375, 500, 1500, "sendOTP"], "isController": false}, {"data": [0.0, 500, 1500, "ExtrasApi"], "isController": false}, {"data": [0.25, 500, 1500, "resultValidation"], "isController": false}, {"data": [0.5, 500, 1500, "submitOTP"], "isController": false}, {"data": [0.0, 500, 1500, "Leaderboard"], "isController": false}, {"data": [0.0, 500, 1500, "Analysis"], "isController": false}, {"data": [0.0, 500, 1500, "Pricing"], "isController": false}, {"data": [0.375, 500, 1500, "testUsersList"], "isController": false}, {"data": [0.0125, 500, 1500, "dashboardOlympiadState"], "isController": false}, {"data": [0.0125, 500, 1500, "dashboardHome"], "isController": false}, {"data": [0.0, 500, 1500, "Result"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 440, 0, 0.0, 2634.0931818181853, 201, 6992, 2726.0, 4380.500000000001, 5580.4, 6506.339999999995, 13.964264178488687, 40.04510616014472, 3.7185556110952427], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["sendOTP", 40, 0, 0.0, 802.6500000000001, 201, 964, 860.5, 932.7, 937.8, 964.0, 21.90580503833516, 5.9684761774370205, 5.98986856516977], "isController": false}, {"data": ["ExtrasApi", 40, 0, 0.0, 3058.025, 1843, 6373, 2967.0, 3572.5, 6159.7, 6373.0, 3.4153005464480874, 3.8949101349043715, 0.8064645235655737], "isController": false}, {"data": ["resultValidation", 40, 0, 0.0, 1382.8499999999995, 526, 2189, 1494.0, 2119.0, 2138.55, 2189.0, 16.46090534979424, 4.806455761316872, 4.00270061728395], "isController": false}, {"data": ["submitOTP", 40, 0, 0.0, 1041.125, 703, 1170, 1052.0, 1157.7, 1163.7, 1170.0, 14.727540500736376, 5.750069035346097, 3.7106498527245946], "isController": false}, {"data": ["Leaderboard", 40, 0, 0.0, 2999.925, 2546, 4367, 2909.5, 3265.1, 4202.999999999996, 4367.0, 4.187166335182665, 30.215373279336333, 1.2994936145713387], "isController": false}, {"data": ["Analysis", 40, 0, 0.0, 3665.3500000000004, 3111, 6182, 3449.5, 4364.8, 4433.45, 6182.0, 3.85951370127364, 12.281187433664607, 0.9603555576997298], "isController": false}, {"data": ["Pricing", 40, 0, 0.0, 3067.9250000000006, 2389, 4534, 3026.5, 3566.3999999999996, 3872.7499999999995, 4534.0, 4.647920055775041, 16.113054300778526, 1.3153976876597722], "isController": false}, {"data": ["testUsersList", 40, 0, 0.0, 1354.2999999999997, 977, 1574, 1388.0, 1539.9, 1549.55, 1574.0, 12.547051442910917, 81.99694165621078, 4.152534896486825], "isController": false}, {"data": ["dashboardOlympiadState", 40, 0, 0.0, 3806.5499999999993, 1314, 6310, 3717.0, 5999.7, 6264.849999999999, 6310.0, 4.231908590774439, 10.069793429961912, 1.0695487727465087], "isController": false}, {"data": ["dashboardHome", 40, 0, 0.0, 3943.7999999999997, 1497, 6992, 3864.0, 6570.9, 6726.95, 6992.0, 4.346408779745736, 16.755108728132132, 1.0984869064435512], "isController": false}, {"data": ["Result", 40, 0, 0.0, 3852.525000000001, 2244, 4477, 3920.0, 4396.5, 4414.95, 4477.0, 4.124987109415283, 11.61048922991647, 1.0143278849128596], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 440, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
