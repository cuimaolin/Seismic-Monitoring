let numberGraphSelected = 1;   

function getGraphData(e = null, fileElementName = "fileSelection0", stationElementName = "station-select-0", number) {
    /*
        1. 得到当前Plots的file选项框和station选项框的值
        2. 得到unit
        3. 调用后台processFileSelection函数，得到返回值data
        4. 调用后台getParameters函数，得到函数值parameters
        5. 调用updateGraphData函数
        6. 调用updateMarkerColorPGA函数
    */
    let selectedFile = document.getElementById(fileElementName).value;
    let selectedStation = document.getElementById(stationElementName).value;
    if (!number) {
        unit = 'ug' 
    } else {
        let unitRadios = $("input[name='unitRadio']:checked").get();
        unit = unitRadios[number - 1].value;
    }

    loadingModalIndicator[4] = true;
    loadingModal();

    if (selectedFile) {
        if (e)
            e.preventDefault();
        $.ajax({        
            type: "POST",       
            dataType: "json",   
            data: JSON.stringify({selectedStation: selectedStation, selectedFile: selectedFile, unit: unit}),   
            url: "/processFileSelection",       
            success: function (data) {          
                loadingModalIndicator[4] = false;   //loading modal
                loadingModalIndicator[5] = true;
                loadingModal();

                if (e)
                    e.preventDefault();
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify({selectedStation: selectedStation, selectedFile: selectedFile}),
                    url: "/getParameters",
                    success: function (parameters) {        
                        updateGraphData(data, parameters, number);
                        updateMarkerColorPGA(Number(parameters['PGA']).toFixed(3), selectedStation)    
                        loadingModalIndicator[5] = false;
                        loadingModal();
                    },
                    contentType: 'application/json;charset=UTF-8',
                });


            },
            contentType: 'application/json;charset=UTF-8',
        });
    }

}

function updateGraphData(data, parameters, number) {
    /*
        1. 利用processFileSelection的返回值构建x和column
        2. 根据timeColumn[0]得到staetDate
        3. 定义3个graphData和1个parameterData的参数
        4. 根据number给不同的graph id绘图
        5. 根据numberGraphSelected选择load graph函数
    */
    let x_axis = [];        
    let dataSize = Object.keys(data).length;    

    let timeColumn = [];
    let column1 = [];
    let column2 = [];
    let column3 = [];
    for (let i = 0; i < dataSize; i++) {       
        timeColumn.push(data[i][0]);
        column1.push(data[i][1]);
        column2.push(data[i][2]);
        column3.push(data[i][3]);
    }

    for (let i = 0; i < dataSize; i++) {
        x_axis.push(8 / dataSize * i);      
    }
    let date = new Date(0); // The 0 there is the key, which sets the date to the epoch //1970年1月1日
    date.setUTCSeconds(timeColumn[0]);      
    let startDate = date.toString();       //得到开始时间 

    let graphData1 = {
        x: x_axis,
        y: column1,
        type: 'scatter',
        name: "x",
        legendgroup: 'group1',
        line: {
            width: 1
        }
    };
    let graphData2 = {
        x: x_axis,
        y: column2,
        type: 'scatter',
        name: "y",
        legendgroup: 'group2',
        line: {
            width: 1
        }
    };
    let graphData3 = {
        x: x_axis,
        y: column3,
        type: 'scatter',
        name: "z",
        legendgroup: 'group3',
        line: {
            width: 1
        }
    };

    parametersText = '<br>PGAh:' + Number(parameters['PGAh']).toFixed(3) +
        '<br>PGAv: ' + Number(parameters['PGAV']).toFixed(3) +
        '<br>PGA: ' + Number(parameters['PGA']).toFixed(3) +
        '<br>PGV: ' + Number(parameters['PGV']).toFixed(3) +
        '<br>PGD: ' + Number(parameters['PGD']).toFixed(3) +
        '<br>SI: ' + Number(parameters['SI']).toFixed(3);

    let parametersGraph = {
        x: [5],
        y: [5],
        text: '',
        mode: 'text',
        name: '<br>Parameters:<br>' + parametersText,
        legendgroup: 'group4',
    };

    let graphDataAll = [graphData1, graphData2, graphData3, parametersGraph];

    let graphElementHeight = $(window).height() - 150;     
    let graphElementWidth = $("#graph-element").width();

    let layout = {
        autosize: false,
        width: graphElementWidth - 10,
        height: graphElementHeight - 110,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 30,
            pad: 4
        },
        paper_bgcolor: '#e0dede',
        xaxis: {
            title: {
                text: startDate,
                font: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                }
            },
        },
    };

    switch (number) {      
        case 1:
            Plotly.newPlot('graph0', graphDataAll, layout, {showSendToCloud: true});
            break;
        case 2:
            Plotly.newPlot('graph1', graphDataAll, layout, {showSendToCloud: true});
            break;
        case 3:
            Plotly.newPlot('graph2', graphDataAll, layout, {showSendToCloud: true});
            break;
        case 4:
            Plotly.newPlot('graph3', graphDataAll, layout, {showSendToCloud: true});
            break;
        case 5:
            Plotly.newPlot('graph4', graphDataAll, layout, {showSendToCloud: true});
            break;
        case 6:
            Plotly.newPlot('graph5', graphDataAll, layout, {showSendToCloud: true});
            break;
        default:
            Plotly.newPlot('graph0', graphDataAll, layout, {showSendToCloud: true});
            Plotly.newPlot('graph1', graphDataAll, layout, {showSendToCloud: true});
            Plotly.newPlot('graph2', graphDataAll, layout, {showSendToCloud: true});
            Plotly.newPlot('graph3', graphDataAll, layout, {showSendToCloud: true});
            Plotly.newPlot('graph4', graphDataAll, layout, {showSendToCloud: true});
            Plotly.newPlot('graph5', graphDataAll, layout, {showSendToCloud: true});
    }

    switch (numberGraphSelected) {
        case 1:
            load1Graphs();
            break;
        case 2:
            load2Graphs();
            break;
        case 3:
            load3Graphs();
            break;
        case 4:
            load4Graphs();
            break;
        case 5:
            load5Graphs();
            break;
        case 6:
            load6Graphs();
            break;
        default:
            load1Graphs();
    }

}


function load1Graphs() {
    /*
        1. 打开google map
        2. 关闭右边的container
        3. 关闭graph1和graph2
        4. 让number of plots displayed的1变红加粗
        5. 使用新的参数重新绘制整个图
        6. 变更numberGraphSelected
    */
    document.getElementById("map-element").style.display = 'initial';
    document.getElementById("graph-element-container2").style.display = 'none';

    document.getElementById("graph-element1").style.display = 'none';
    document.getElementById("graph-element2").style.display = 'none';
    $("#load2graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load1graph").css({"color": "red", "font-weight": "bold"});
    $("#load3graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load4graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load5graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load6graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});

    let graphElementHeight = $(window).height() - 160;
    let update = {
        height: graphElementHeight - 110
    };
    Plotly.relayout('graph0', update);      
    numberGraphSelected = 1;
}

function load2Graphs() {
    document.getElementById("map-element").style.display = 'initial';
    document.getElementById("graph-element-container2").style.display = 'none';

    document.getElementById("graph-element1").style.display = 'initial';
    document.getElementById("graph-element2").style.display = 'none';
    $("#load2graphs").css({"color": "red", "font-weight": "bold"});
    $("#load1graph").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load3graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load4graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load5graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load6graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});

    let graphElementHeight = $(window).height() - 190;
    let update = {
        height: graphElementHeight / 2.5
    };
    Plotly.relayout('graph0', update);
    Plotly.relayout('graph1', update);

    $("#graph-element2").height(0);
    numberGraphSelected = 2;
}

function load3Graphs() {
    document.getElementById("map-element").style.display = 'initial';
    document.getElementById("graph-element-container2").style.display = 'none';

    document.getElementById("graph-element1").style.display = 'initial';
    document.getElementById("graph-element2").style.display = 'initial';
    $("#load2graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load1graph").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load3graphs").css({"color": "red", "font-weight": "bold"});
    $("#load4graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load5graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load6graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});

    let graphElementHeight = $(window).height() - 230;
    let update = {
        height: graphElementHeight / 4
    };
    Plotly.relayout('graph0', update);
    Plotly.relayout('graph1', update);
    Plotly.relayout('graph2', update);
    numberGraphSelected = 3;
}

function load4Graphs() {
    load2Graphs();
    document.getElementById("map-element").style.display = 'none';
    document.getElementById("graph-element-container2").style.display = 'initial';

    document.getElementById("graph-element3").style.display = 'initial';
    document.getElementById("graph-element4").style.display = 'initial';
    document.getElementById("graph-element5").style.display = 'none';
    $("#load1graph").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load2graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load3graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load4graphs").css({"color": "red", "font-weight": "bold"});
    $("#load5graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load6graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});


    let graphElementHeight = $(window).height() - 190;
    let update = {
        height: graphElementHeight / 2.5
    };
    Plotly.relayout('graph3', update);
    Plotly.relayout('graph4', update);
    numberGraphSelected = 4;

}

function load5Graphs() {
    load3Graphs();
    document.getElementById("map-element").style.display = 'none';
    document.getElementById("graph-element-container2").style.display = 'initial';

    document.getElementById("graph-element3").style.display = 'initial';
    document.getElementById("graph-element4").style.display = 'initial';
    document.getElementById("graph-element5").style.display = 'none';
    $("#load1graph").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load2graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load3graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load4graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load5graphs").css({"color": "red", "font-weight": "bold"});
    $("#load6graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});


    let graphElementHeight = $(window).height() - 190;
    let update = {
        height: graphElementHeight / 2.5
    };
    Plotly.relayout('graph3', update);
    Plotly.relayout('graph4', update);
    numberGraphSelected = 5;
}

function load6Graphs() {
    load3Graphs();
    document.getElementById("map-element").style.display = 'none';
    document.getElementById("graph-element-container2").style.display = 'initial';

    document.getElementById("graph-element3").style.display = 'initial';
    document.getElementById("graph-element4").style.display = 'initial';
    document.getElementById("graph-element5").style.display = 'initial';
    $("#load1graph").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load2graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load3graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load4graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load5graphs").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#load6graphs").css({"color": "red", "font-weight": "bold"});


    let graphElementHeight = $(window).height() - 230;
    let update = {
        height: graphElementHeight / 4
    };
    Plotly.relayout('graph3', update);
    Plotly.relayout('graph4', update);
    Plotly.relayout('graph5', update);
    numberGraphSelected = 6;
}

function loadLastDays(numberOfMonth) {

    /*
        1. 让选择的last便为红色加粗
        2. 得到可以展示的起始时间
        3. 遍历file文件框，不显示时间在起始时间之前的file
    */

    if (numberOfMonth == 1) {
        $("#last30Days").css({"color": "red", "font-weight": "bold"});
        $("#last90Days").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
        $("#last1Year").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    }
    if (numberOfMonth == 3) {
        $("#last90Days").css({"color": "red", "font-weight": "bold"});
        $("#last30Days").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
        $("#last1Year").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    }
    if (numberOfMonth == 12) {
        $("#last1Year").css({"color": "red", "font-weight": "bold"});
        $("#last30Days").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
        $("#last90Days").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    }

    let today = new Date();
    today.setMonth(today.getMonth() - numberOfMonth);   //today month-past month

    $("#fileSelection0 option").each(function (option) {
        let fileName = this.value;
        let fileDateString = fileName.split('_')[0];

        let year = fileDateString.substring(0, 4);
        let month = fileDateString.substring(4, 6);
        let day = fileDateString.substring(6, 8);
        let fileDate = new Date(year, month - 1, day);

        if (today > fileDate) {             //显示大于起始时间的file selection
            this.style.display = 'none';
        } else {
            this.style.display = 'initial';
        }

    });


}