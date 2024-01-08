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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.15781818181818183, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.251, 500, 1500, "sendOTP"], "isController": false}, {"data": [0.1805, 500, 1500, "ExtrasApi"], "isController": false}, {"data": [0.044, 500, 1500, "resultValidation"], "isController": false}, {"data": [0.238, 500, 1500, "submitOTP"], "isController": false}, {"data": [0.0645, 500, 1500, "Leaderboard"], "isController": false}, {"data": [0.0525, 500, 1500, "Analysis"], "isController": false}, {"data": [0.1225, 500, 1500, "Pricing"], "isController": false}, {"data": [0.2755, 500, 1500, "testUsersList"], "isController": false}, {"data": [0.2275, 500, 1500, "dashboardOlympiadState"], "isController": false}, {"data": [0.208, 500, 1500, "dashboardHome"], "isController": false}, {"data": [0.072, 500, 1500, "Result"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11000, 0, 0.0, 3442.3128181818124, 22, 13807, 3038.0, 6658.799999999999, 8015.0, 10591.869999999997, 104.12722453616055, 305.6514903209012, 27.74134516400038], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["sendOTP", 1000, 0, 0.0, 2889.050000000001, 27, 8781, 2739.0, 5813.4, 7131.549999999987, 8583.94, 13.599151412951832, 3.7052375431773052, 3.718517964479016], "isController": false}, {"data": ["ExtrasApi", 1000, 0, 0.0, 2809.8619999999987, 64, 8697, 2337.0, 5755.599999999999, 6619.149999999992, 8149.63, 10.85081218329192, 12.391256635949825, 2.564246133041808], "isController": false}, {"data": ["resultValidation", 1000, 0, 0.0, 6524.107999999996, 296, 13807, 6495.5, 10737.4, 11569.549999999996, 13088.87, 13.748350197976242, 4.014410848823141, 3.343104686812582], "isController": false}, {"data": ["submitOTP", 1000, 0, 0.0, 2818.388999999998, 22, 8694, 2651.0, 5463.699999999999, 6508.449999999999, 8203.91, 12.613203501425291, 4.9270326177442545, 3.1779360384450444], "isController": false}, {"data": ["Leaderboard", 1000, 0, 0.0, 4166.273000000015, 143, 9572, 4124.5, 6752.099999999999, 7780.799999999999, 8836.7, 10.412653456480314, 65.7403587777367, 3.233515305298999], "isController": false}, {"data": ["Analysis", 1000, 0, 0.0, 4157.245999999994, 175, 9080, 4075.5, 6682.0, 7790.95, 8891.44, 10.32748453459191, 32.18923630833738, 2.571684845191007], "isController": false}, {"data": ["Pricing", 1000, 0, 0.0, 3403.042999999998, 43, 8995, 3161.5, 6215.6, 7298.549999999998, 8316.98, 10.860475471616146, 55.648864197899584, 3.0756145332167644], "isController": false}, {"data": ["testUsersList", 1000, 0, 0.0, 2444.491000000004, 25, 8554, 2110.0, 5060.7, 6156.749999999997, 7758.7300000000005, 12.138426617141885, 79.32651457218115, 4.018483030479589], "isController": false}, {"data": ["dashboardOlympiadState", 1000, 0, 0.0, 2500.041999999997, 26, 8671, 2005.0, 5437.4, 6538.349999999997, 8044.150000000001, 11.063905115949726, 26.304369585601435, 2.7982820175584173], "isController": false}, {"data": ["dashboardHome", 1000, 0, 0.0, 2507.641999999997, 140, 8318, 2071.0, 5010.0, 6142.699999999998, 7780.74, 11.549477963596045, 44.77555529529128, 2.921093064249746], "isController": false}, {"data": ["Result", 1000, 0, 0.0, 3645.294999999999, 277, 9074, 3268.5, 6465.2, 7412.599999999999, 8416.91, 10.358400662937642, 29.50221208501657, 2.5490365068883363], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
