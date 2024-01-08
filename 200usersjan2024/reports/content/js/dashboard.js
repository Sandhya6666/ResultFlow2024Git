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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.45886363636363636, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "sendOTP"], "isController": false}, {"data": [0.4475, 500, 1500, "ExtrasApi"], "isController": false}, {"data": [0.055, 500, 1500, "resultValidation"], "isController": false}, {"data": [1.0, 500, 1500, "submitOTP"], "isController": false}, {"data": [0.035, 500, 1500, "Leaderboard"], "isController": false}, {"data": [0.0175, 500, 1500, "Analysis"], "isController": false}, {"data": [0.24, 500, 1500, "Pricing"], "isController": false}, {"data": [0.9325, 500, 1500, "testUsersList"], "isController": false}, {"data": [0.56, 500, 1500, "dashboardOlympiadState"], "isController": false}, {"data": [0.64, 500, 1500, "dashboardHome"], "isController": false}, {"data": [0.12, 500, 1500, "Result"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2200, 0, 0.0, 2279.2795454545485, 22, 9608, 1069.0, 5501.6, 8181.549999999998, 9367.99, 72.18321412166152, 240.3455591943369, 19.230892467517553], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["sendOTP", 200, 0, 0.0, 82.83999999999999, 27, 430, 82.5, 134.9, 146.89999999999998, 300.7600000000002, 206.61157024793388, 56.293582128099175, 56.495351239669425], "isController": false}, {"data": ["ExtrasApi", 200, 0, 0.0, 1354.0149999999996, 327, 5498, 1037.0, 3200.5, 3872.2, 5051.670000000004, 19.882692116512576, 22.716946577691623, 4.698645180932498], "isController": false}, {"data": ["resultValidation", 200, 0, 0.0, 7252.370000000002, 258, 9608, 8335.5, 9368.0, 9428.5, 9598.76, 19.675356615838663, 5.745050418101329, 4.784339645843581], "isController": false}, {"data": ["submitOTP", 200, 0, 0.0, 118.76500000000004, 22, 370, 130.0, 174.9, 224.5499999999999, 321.9100000000001, 210.3049421661409, 82.15036803364879, 52.98698738170347], "isController": false}, {"data": ["Leaderboard", 200, 0, 0.0, 4374.199999999999, 146, 6788, 4746.5, 5711.6, 6027.55, 6770.75, 11.913271384322135, 134.2799614121694, 3.6995128588873003], "isController": false}, {"data": ["Analysis", 200, 0, 0.0, 4507.435000000001, 969, 6594, 4705.0, 5685.5, 6452.849999999998, 6532.93, 11.428571428571429, 35.685435267857144, 2.8458705357142855], "isController": false}, {"data": ["Pricing", 200, 0, 0.0, 2473.995, 44, 6133, 2407.0, 4676.6, 4900.2, 6063.380000000003, 13.2687587076229, 59.702287409606576, 3.757624353148013], "isController": false}, {"data": ["testUsersList", 200, 0, 0.0, 299.6549999999999, 24, 1339, 200.5, 929.3000000000001, 1070.0, 1335.95, 105.65240359218173, 690.4549656629688, 34.976723454833596], "isController": false}, {"data": ["dashboardOlympiadState", 200, 0, 0.0, 876.045, 170, 2865, 853.5, 1250.8000000000002, 1425.8999999999996, 2801.470000000004, 36.19909502262444, 86.092689479638, 9.155472285067873], "isController": false}, {"data": ["dashboardHome", 200, 0, 0.0, 741.8300000000002, 165, 1552, 713.0, 1210.7, 1329.55, 1520.8200000000002, 68.11989100817439, 264.52337363760216, 17.22887751192098], "isController": false}, {"data": ["Result", 200, 0, 0.0, 2990.9249999999975, 392, 6645, 2865.5, 4967.3, 5296.099999999999, 6257.960000000001, 13.278449077147789, 37.691733543022174, 3.2676136552250696], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2200, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
