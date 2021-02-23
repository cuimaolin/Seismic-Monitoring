let loadingModalIndicator = [];
let CNRLArray = ["p2259", "p2236"];
let TWArray = ["p2223", "p2270"];
let PTArray = ["p2412", "p2409", "p2417", "p2418"];
let UBCArray = ["p2407", "p2231", "p2401"];
    // "station1", "station2", "geophone"];

function verifyAccessCode(e = null) {
    /*
        1. 得到inputAccessCode
        2. 判断用户类型，如果为admin则显示noise按钮
        3. 调用accessCodeSuccess函数
        4. 如果登录失败，则会播放效果
    */
    if (e)                         
        e.preventDefault();     
    let accessCode = document.getElementById("inputAccessCode");    

    if (accessCode.value == 999999) {      
        $('#loginModal').modal('hide');     
        window.userRole = "admin";
        $('.noiseButton').show();       //显示noise按钮
        accessCodeSuccess();
    } else if (accessCode.value == 666666) {
        $('#loginModal').modal('hide');
        window.userRole = "CNRL";
        accessCodeSuccess();
    } else if (accessCode.value == 555555) {
        $('#loginModal').modal('hide');
        window.userRole = "TW";
        accessCodeSuccess();
    } else if (accessCode.value == 444444) {
        $('#loginModal').modal('hide');
        window.userRole = "PT";
        accessCodeSuccess();
    } else if (accessCode.value == 111111) {
        $('#loginModal').modal('hide');
        window.userRole = "PA";
        accessCodeSuccess();
    } else {                                                        
        let div = document.getElementById('inputAccessCode');       
        let interval = 100;
        let distance = 10;
        let times = 4;
        $(div).css('border-color', 'red');                         
        $(div).css('position', 'relative');
        for (let iter = 0; iter < (times + 1); iter++) {          
            $(div).animate({
                left: ((iter % 2 == 0 ? distance : distance * -1))  
            }, interval);
        }
        $(div).animate({left: 0}, interval);
    }
}

function accessCodeSuccess() {
    /*
        1. station选项框添加下选项
        2. 为download按钮绑定downloadFiles函数
        3. 得到graph data
        4. 更新marker的颜色，构建marker
        5. 点击Portae Terra Stations选项
        6. 根据station radio更新map上的marker
    */
    addStationOptions();
    setupButtonClick();
    getGraphData();
    updateMarkerColorUpdatedEvent(addMarkers);
    $("#stationRadios2").click();       
    updateMarkerOnMap();
}


function addStationOptions() {
    /*
        1. 得到station选项框
        2. 根据用户类型，给选项框添加station信息
    */

    let optionArray = [];       
    optionArray[0] = document.getElementById("station-select-0");
    optionArray[1] = document.getElementById("station-select-1");
    optionArray[2] = document.getElementById("station-select-2");
    optionArray[3] = document.getElementById("station-select-3");
    optionArray[4] = document.getElementById("station-select-4");
    optionArray[5] = document.getElementById("station-select-5");

    UBCArray.forEach(function (station) {
        optionArray.forEach(function (optionElement) {
            let option = document.createElement("option");
            option.text = station;
            option.value = station;
            optionElement.add(option);
        })
    });

    if (window.userRole == 'admin' || window.userRole == 'CNRL') {
        CNRLArray.forEach(function (station) {
            optionArray.forEach(function (optionElement) {
                let option = document.createElement("option");
                option.text = station;
                option.value = station;

                if (station == 'p2236') option.text = '10-9';      
                if (station == 'p2259') option.text = 'WS'          

                optionElement.add(option);
            })
        });
    }

    if (window.userRole == 'admin' || window.userRole == 'TW') {
        TWArray.forEach(function (station) {
            optionArray.forEach(function (optionElement) {
                let option = document.createElement("option");
                option.text = station;
                option.value = station;
                optionElement.add(option);
            })
        });
    }

    if (window.userRole == 'admin' || window.userRole == 'PT') {
        PTArray.forEach(function (station) {
            optionArray.forEach(function (optionElement) {
                let option = document.createElement("option");
                option.text = station;
                option.value = station;
                optionElement.add(option);
            })
        });
    }
}

function addAllFileOptions(fileList) {
    /*
        html script中自动调用
        1. 得到file选项框
        2. 重置file选项框的内容
        3. 为file选项框添加内容
    */
    let fileListArray = fileList.toString().split(`,`);
    let fileSelectionEle0 = document.getElementById("fileSelection0");
    let fileSelectionEle1 = document.getElementById("fileSelection1");
    let fileSelectionEle2 = document.getElementById("fileSelection2");
    let fileSelectionEle3 = document.getElementById("fileSelection3");
    let fileSelectionEle4 = document.getElementById("fileSelection4");
    let fileSelectionEle5 = document.getElementById("fileSelection5");

    $("#fileSelection0").empty();
    $("#fileSelection1").empty();
    $("#fileSelection2").empty();
    $("#fileSelection3").empty();
    $("#fileSelection4").empty();
    $("#fileSelection5").empty();

    fileListArray.forEach(function (file) {
        let option = document.createElement("option");
        option.text = file;
        option.value = file;
        fileSelectionEle0.add(option);
    });

    fileListArray.forEach(function (file) {
        let option = document.createElement("option");
        option.text = file;
        option.value = file;
        fileSelectionEle1.add(option);
    });

    fileListArray.forEach(function (file) {
        let option = document.createElement("option");
        option.text = file;
        option.value = file;
        fileSelectionEle2.add(option);
    });

    fileListArray.forEach(function (file) {
        let option = document.createElement("option");
        option.text = file;
        option.value = file;
        fileSelectionEle3.add(option);
    });

    fileListArray.forEach(function (file) {
        let option = document.createElement("option");
        option.text = file;
        option.value = file;
        fileSelectionEle4.add(option);
    });

    fileListArray.forEach(function (file) {
        let option = document.createElement("option");
        option.text = file;
        option.value = file;
        fileSelectionEle5.add(option);
    });

}


function setupButtonClick() {
    /*
        1. 为download按钮绑定downloadFiles函数
        2. 为warningOk按钮绑定hide事件
    */

    $('a#downloadButton0').bind('click', function (e) {
        downloadFiles(e, "fileSelection0", "station-select-0");
    });

    $('a#downloadButton1').bind('click', function (e) {
        downloadFiles(e, "fileSelection1", "station-select-1");
    });


    $('a#downloadButton2').bind('click', function (e) {
        downloadFiles(e, "fileSelection2", "station-select-2");
    });


    $('a#downloadButton3').bind('click', function (e) {
        downloadFiles(e, "fileSelection3", "station-select-3");
    });


    $('a#downloadButton4').bind('click', function (e) {
        downloadFiles(e, "fileSelection4", "station-select-4");
    });

    $('a#downloadButton5').bind('click', function (e) {
        downloadFiles(e, "fileSelection5", "station-select-5");
    });

    //Jquery
    $('#warningOkButton').bind('click', function (e) {      //隐藏warning modal和login modal
        $('#warningModal').modal('hide');
        $('.loginModal').modal('hide');
    });
}

function downloadFiles(e = null, fileElementName = "fileSelection0", stationElementName = "station-select-0",) {
    /*
        按 download button时被调用
        1. 得到file选项框和station选项框的值
        2. 拼接得到要下载的文件名称
        3. 向后台函数downloadFiles请求
        4. 让一个<a>标签并自动点击它使文件下载到本地
        5. 调用后台removeFile函数
    */
    let selectedFile = document.getElementById(fileElementName).value;
    let selectedStation = document.getElementById(stationElementName).value;

    let fileNameSplit = selectedFile.split('.');
    let fileArray = [];
    fileArray[0] = selectedStation + '_' + fileNameSplit[0] + 'cmpss.csv';
    fileArray[1] = selectedStation + '_' + fileNameSplit[0] + 'ug.csv';
    fileArray[2] = selectedStation + '_' + fileNameSplit[0] + '_parameters.txt';
    fileArray[3] = fileNameSplit[0] + 'x.mseed';
    fileArray[4] = fileNameSplit[0] + 'y.mseed';
    fileArray[5] = fileNameSplit[0] + 'z.mseed';
    fileArray[6] = fileNameSplit[0] + 'x.png';
    fileArray[7] = fileNameSplit[0] + 'y.png';
    fileArray[8] = fileNameSplit[0] + 'z.png';
    fileArray[9] = selectedStation + '_' + fileNameSplit[0] + 'PSA.csv';

    loadingModalIndicator[0] = true;
    loadingModal();  //show loading modal
    if (selectedFile) {
        if (e)      
            e.preventDefault();
        $.ajax({    
            type: "POST",       
            //dataType: "json",     
            data: JSON.stringify({selectedStation: selectedStation, fileName: fileNameSplit[0], fileArray: fileArray}),
            url: "/downloadFiles",  
            success: function (data) {  //请求成功后
                
                let link = document.createElement("a");
                let fileName = selectedStation + '_' + fileNameSplit[0] + '.zip';
                link.download = fileName;
                link.href = '/static/' + fileName;
                document.body.appendChild(link);
                link.click();           // 自动点击

                loadingModalIndicator[0] = false;
                loadingModalIndicator[1] = true;
                loadingModal();     //shaow loading modal

                $.ajax({
                    type: "POST",
                    //dataType: "json",
                    data: JSON.stringify({
                        fileName: fileName,
                    }),
                    url: "/removeFile",
                    success: function (data) {
                        loadingModalIndicator[1] = false;
                        loadingModal();
                    },
                    contentType: 'application/json;charset=UTF-8',
                });
            },
            contentType: 'application/json;charset=UTF-8',
        });
    }
}

function stationSelectionOnChange(stationId, number) {
    /*
        切换展示的plots时调用
        1. 得到当前展示的plots中staion选项框的值，file选项框的id，graph的id
        2. 使last的颜色恢复正常
        3. 调用后台函数getFilesInStationFolder
        4. 若后台返回数据长度为0，则删除现有graph，显示warning modal以及将file选项框设为空
        5. 否则调用updateFileOption函数，并回调函数
    */
    let selectedStation = document.getElementById(stationId).value;     
    let fileOptionId = document.getElementById(stationId).parentElement.childNodes[3].id;       
    let graphId = $('#' + stationId).closest('.graph')[0].childNodes[3].childNodes[1].childNodes[1].id; 

    $("#last30Days").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#last90Days").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});
    $("#last1Year").css({"color": 'rgb(0, 109, 204)', "font-weight": "normal"});

    loadingModalIndicator[2] = true;
    loadingModal();

    if (selectedStation) {
        $.ajax({
            type: "POST",
            dataType: "json",
            data: JSON.stringify(selectedStation),
            url: "/getFilesInStationFolder",       //可能变慢 
            success: function (data) {
                loadingModalIndicator[2] = false;
                if (data.length == 0) {   
                    // 后台无对应marker数据        
                    let graphDiv = document.getElementById(graphId);
                    if(graphDiv.data.length > 1) {
                        Plotly.deleteTraces(graphId, [0, 1, 2, 3]);   
                    }
                    $('#warningModal').modal({backdrop: 'static', keyboard: false});    
                    $("#" + fileOptionId).empty();  
                    console.log(loadingModalIndicator);
                    loadingModal();
                } else {
                    updateFileOptions(data, fileOptionId, stationId, number, getGraphData);     //getGraphData函数
                }
            },
            contentType: 'application/json;charset=UTF-8',
        });
    }
}

function updateFileOptions(fileList, eleId, stationId, number, callback) {
    /*
        1. 将fileList添加到file文件选项框中
        2. 回调函数
    */
    let fileListArray = fileList.toString().split(`,`);
    let fileSelectionElement = document.getElementById(eleId);
    $("#" + eleId).empty();

    fileListArray.forEach(function (file) {         
        let option = document.createElement("option");
        option.text = file;
        option.value = file;
        fileSelectionElement.add(option);
    });

    callback(null, eleId, stationId, number);

}

function deleteNoiseFile(stationId) {
    /*
        noise按钮时调用
        1. 得到第一个polts，station选项框和file选项框的值
        2. 调用后台removeNoiseFile函数
        3. 调用stationSelectionOnChange函数
    */
    let selectedFile = document.getElementById('fileSelection0').value;
    let selectedStation = document.getElementById('station-select-0').value;
    loadingModalIndicator[3] = true;
    loadingModal();


    if (selectedFile) {
        $.ajax({
            type: "DELETE",
            dataType: "json",
            data: JSON.stringify({stationName: selectedStation, fileName: selectedFile}),
            url: "/removeNoiseFile",
            success: function (data) {
                loadingModalIndicator[3] = false;
                stationSelectionOnChange(stationId);
            },
            contentType: 'application/json;charset=UTF-8',
        });
    }
}

function setUnitOnChange() {
    /*
        切换unit选项时调用
        1. 得到当前unit选项
        2. 为unit选项的变换添加函数getGraphData，
    */
    let rad = $("input[name='unitRadio']");

    rad[0].addEventListener('change', function () {         
        getGraphData(null, 'fileSelection0', 'station-select-0', 1);    //比较耗时
    });
    rad[1].addEventListener('change', function () {
        getGraphData(null, 'fileSelection0', 'station-select-0', 1);
    });
    rad[2].addEventListener('change', function () {
        getGraphData(null, 'fileSelection1', 'station-select-1', 2);
    });
    rad[3].addEventListener('change', function () {
        getGraphData(null, 'fileSelection1', 'station-select-1', 2);
    });
    rad[4].addEventListener('change', function () {
        getGraphData(null, 'fileSelection2', 'station-select-2', 3);
    });
    rad[5].addEventListener('change', function () {
        getGraphData(null, 'fileSelection2', 'station-select-2', 3);
    });
    rad[6].addEventListener('change', function () {
        getGraphData(null, 'fileSelection3', 'station-select-3', 4);
    });
    rad[7].addEventListener('change', function () {
        getGraphData(null, 'fileSelection3', 'station-select-3', 4);
    });
    rad[8].addEventListener('change', function () {
        getGraphData(null, 'fileSelection4', 'station-select-4', 5);
    });
    rad[9].addEventListener('change', function () {
        getGraphData(null, 'fileSelection4', 'station-select-4', 5);
    });
    rad[10].addEventListener('change', function () {
        getGraphData(null, 'fileSelection5', 'station-select-5', 6);
    });
    rad[11].addEventListener('change', function () {
        getGraphData(null, 'fileSelection5', 'station-select-5', 6);
    });
}

function setStationRadioOnChange() {
    /*
        设置station radio时调用
        1. 得到stationRadio选项，和stationRadio1的选项
        2. 当stationRadio选项切换时，调用updateMarkerOnMap()
        3. stationRadio1被点击时，设置stationRadio1的checked为true，stationRadio2的checked为false，并调用updateMarkerOnMap()
    */
    let stationRadios = $("input[name='stationRadio']");
    let stationRadio1 = $("label[id='stationRadio1Label']");

    stationRadios[0].addEventListener('change', function () {
        updateMarkerOnMap();
    });
    stationRadios[1].addEventListener('change', function () {
        updateMarkerOnMap();
    });

    stationRadio1[0].addEventListener('click', function () {
        $("#stationRadio1").prop("checked", true);
        $("#stationRadio2").prop("checked", false);
        updateMarkerOnMap();
    });
}

function loadingModal() {
    /*
        当每次调用loading modal时，都会将loadingModalIndicator中的某个值设为True
        当有值为true时，modalSwith为True，然后显示loading modal
    */
    let modalSwitch = false;
    loadingModalIndicator.forEach(function (indicator) {
        if (indicator)
            modalSwitch = true
    });

    if (modalSwitch)
        $('.loading-modal').modal('show');
    else {
        $('.loading-modal').modal('hide');
    }
}

function updateMarkerColorUpdatedEvent(callback) {
    /*
        1. 根据用户类型拼接station矩阵
        2. 调用后台updateMarkerColor函数
        3. 将updateMarkerColor函数的返回值输入进回调函数
    */
    let role = window.userRole;
    let stations = [];
    if (role == 'admin')       
        stations = UBCArray.concat(CNRLArray.concat(PTArray.concat(TWArray)));
    else if (role == "CNRL")
        stations = CNRLArray;
    else if (role == "PT")
        stations = PTArray;
    else if (role == "TW")
        stations = TWArray;
    else if (role == "UBC")
        stations = UBCArray;
    else if (role == "PA")
        stations = UBCArray;


    $.ajax({
        type: "POST",
        dataType: "json",
        data: JSON.stringify({role: role, stations: stations}),
        url: "/updateMarkerColor",
        success: function (data) {
            callback(data);       
        },
        contentType: 'application/json;charset=UTF-8',
    });

}