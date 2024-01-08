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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4721818181818182, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.781, 500, 1500, "sendOTP"], "isController": false}, {"data": [0.675, 500, 1500, "ExtrasApi"], "isController": false}, {"data": [0.044, 500, 1500, "resultValidation"], "isController": false}, {"data": [0.846, 500, 1500, "submitOTP"], "isController": false}, {"data": [0.223, 500, 1500, "Leaderboard"], "isController": false}, {"data": [0.272, 500, 1500, "Analysis"], "isController": false}, {"data": [0.383, 500, 1500, "Pricing"], "isController": false}, {"data": [0.423, 500, 1500, "testUsersList"], "isController": false}, {"data": [0.654, 500, 1500, "dashboardOlympiadState"], "isController": false}, {"data": [0.543, 500, 1500, "dashboardHome"], "isController": false}, {"data": [0.35, 500, 1500, "Result"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5500, 0, 0.0, 2006.7200000000018, 18, 15075, 924.5, 5310.800000000001, 8620.949999999997, 12403.52999999999, 88.27825305362502, 275.6905077303661, 23.518458305579188], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["sendOTP", 500, 0, 0.0, 600.9659999999997, 27, 4826, 159.0, 1834.8000000000002, 2803.7499999999995, 4057.3800000000024, 9.7380465478625, 2.6532372918492553, 2.662747102931152], "isController": false}, {"data": ["ExtrasApi", 500, 0, 0.0, 895.2080000000009, 66, 5170, 467.0, 2204.0, 3880.95, 4644.620000000001, 9.407868741415319, 10.743142986669051, 2.223178607212072], "isController": false}, {"data": ["resultValidation", 500, 0, 0.0, 8285.980000000005, 226, 15075, 8058.0, 12250.700000000003, 13834.049999999997, 14629.48, 8.606444505645827, 2.5130145578008816, 2.0927780096736437], "isController": false}, {"data": ["submitOTP", 500, 0, 0.0, 436.976, 23, 5336, 148.5, 1138.8000000000004, 1838.0499999999988, 3849.430000000001, 9.691237183338826, 3.7856395247417285, 2.441737493458415], "isController": false}, {"data": ["Leaderboard", 500, 0, 0.0, 3216.934000000002, 104, 12989, 2301.0, 6844.100000000003, 10714.949999999999, 12583.210000000001, 9.947675228299147, 87.99153950221833, 3.089044594184589], "isController": false}, {"data": ["Analysis", 500, 0, 0.0, 2224.5979999999986, 191, 6336, 1651.5, 4710.6, 5080.65, 5648.490000000001, 9.701955914312325, 29.654293539952654, 2.415843870061704], "isController": false}, {"data": ["Pricing", 500, 0, 0.0, 1728.5180000000003, 53, 6248, 1295.0, 4097.800000000001, 4756.85, 5682.010000000001, 10.098358006988063, 47.676754400359506, 2.85970903474845], "isController": false}, {"data": ["testUsersList", 500, 0, 0.0, 1229.0019999999995, 18, 4952, 1225.0, 2146.3, 2532.5499999999997, 4401.63, 9.78167305735973, 63.924761816261054, 3.2382687172313953], "isController": false}, {"data": ["dashboardOlympiadState", 500, 0, 0.0, 755.682, 28, 5460, 586.5, 1217.2000000000007, 1979.55, 4444.82, 9.430581489654653, 22.426972671353667, 2.385108257181388], "isController": false}, {"data": ["dashboardHome", 500, 0, 0.0, 989.4239999999988, 116, 4999, 955.5, 1422.2000000000003, 1532.5, 3595.2600000000043, 9.635767970707265, 37.30758575833494, 2.4370024029196378], "isController": false}, {"data": ["Result", 500, 0, 0.0, 1710.6319999999987, 220, 5609, 1095.0, 4274.6, 4665.55, 5322.490000000001, 9.38174312787316, 26.71385390280514, 2.3086234344216154], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5500, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
