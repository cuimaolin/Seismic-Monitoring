let map;
let IRISStationMarkers = [];        //stationlist的marker
let westMarkersArray = [];          //markersArray的marker
let connectedMarkerArray = [];      //station marker
let firstTimeFlag = true;

function initMap(stationList, kmlFileList) {
    /*
        1. 初始化以p2407为中心的google mao
        2. 标记所有station
        3. 定义一个icons集合，并让其添加到legend下
        4. 给google map加上tilesloaded监听
    */

    //UBCArray的第一个地址
    let p2407 = {name: "p2407", label: "P2407", location: {lat: 53.1485, lng: -113.880438}};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,           
        center: p2407.location     
    });

    /*    let parser = new geoXML3.parser({map: map});
        kmlFileList.forEach(function (kmlFile) {
            parser.parse('static/shp/' + kmlFile/!**!/);

        });*/

    let pinColor = "42eff5";

    stationList.forEach(function (station) {
        let m = new MarkerWithLabel({
            position: {lat: parseFloat(station.lat), lng: parseFloat(station.lng)},
            map: map,
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor,
            labelContent: station.name,
            labelAnchor: new google.maps.Point(18, 55),
            labelClass: "label-IRIS label", // the CSS class for the label
        });
        IRISStationMarkers.push(m);
    });

    let icons = {
        newEvent: {
            name: 'New Alert',
            icon: 'https://img.icons8.com/color/35/000000/rating.png'
        },
        connectedStation: {
            name: 'Portae Terra',
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|cef542'
        },
        commonStation: {
            name: 'IRIS',
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|42eff5'
        },
        pga_not_felt: {
            name: 'PGA not felt',
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|e1f0ec'
        },
        pga_very_weak: {
            name: 'PGA very weak',
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|d0f5eb'
        },
        pga_weak: {
            name: 'PGA weak',
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|8de4f0'
        },
        pga_light: {
            name: 'PGA light',
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|33f59e'
        },
        pga_moderate: {
            name: 'PGA moderate',
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|47d67e'
        },
        pga_strong: {
            name: 'PGA strong',
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|f0e267'
        },
        pga_very_strong: {
            name: 'PGA very strong',
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|f0a967'
        },
        pga_severe: {
            name: 'PGA severe',
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|bf630d'
        },
        pga_violent: {
            name: 'PGA violent',
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|c73912'
        },
        pga_extreme: {
            name: 'PGA extreme',
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|d10902'
        },
    };

    let legend = document.getElementById('legend');     
    for (let key in icons) {
        let type = icons[key];
        let name = type.name;
        let icon = type.icon;
        let divElement = document.createElement('div');
        divElement.innerHTML = '<img src="' + icon + '"> ' + name;
        if (name == 'New Event')
            divElement.style.marginLeft = '-7px';
        legend.appendChild(divElement);
    }

    google.maps.event.addListenerOnce(map, 'tilesloaded', function () {     //平铺
        let center = new google.maps.LatLng(p2407.location.lat, p2407.location.lng);
        map.panTo(center);      //change center
        map.setZoom(5);         
        map.controls[google.maps.ControlPosition.RIGHT].push(legend);
        legend.style.display = 'initial';
    });

}

function addMarkers(stationList) {
    /*
        1. 将各个staion信息push到各自的array中
        2. 根据用户类型为这些station添加marker，并添加监听：点击时触发stationSelectionOnChange
        3. 将marker和对应的name添加到connectedMarkerArray中
    */
    let markersArray = [];
    let CNRLMarkerArray = [];
    let TWMarkerArray = [];
    let PTMarkerArray = [];
    let UBCMarkerArray = [];

    //CNRL
    CNRLMarkerArray.push({name: "p2259", label: "CNRL-P2259", location: {lat: 56.5746, lng: -121.3171}});
    CNRLMarkerArray.push({name: "p2236", label: "CNRL-P2236", location: {lat: 56.010628, lng: -120.74879}});

    //TW
    TWMarkerArray.push({name: "p2223", label: "TW-P2223", location: {lat: 55.17732, lng: -118.92877}});
    TWMarkerArray.push({name: "p2270", label: "TW-P2270", location: {lat: 55.18848, lng: -118.955922}});
    //PT
    PTMarkerArray.push({name: "p2405", label: "PT-P2405", location: {lat: 53.641845, lng: -114.774887}});
    PTMarkerArray.push({name: "p2409", label: "PT-P2409", location: {lat: 52.658885, lng: -114.027123}});
    PTMarkerArray.push({name: "p2410", label: "PT-P2410", location: {lat: 52.56344333, lng: -114.098896}});
    PTMarkerArray.push({name: "p2411", label: "PT-P2411", location: {lat: 52.654061667, lng: -113.90952}});

    // UBCMarkerArray.push({name: "station1", label: "station1", location: {lat: 55.1000, lng: -119.85000}});
    UBCMarkerArray.push({name: "p2407", label: "P2407", location: {lat: 53.1485, lng: -113.880438}});
    UBCMarkerArray.push({name: "p2231", label: "P2231", location: {lat: 53.38691, lng: -114.9366}});
    UBCMarkerArray.push({name: "p2401", label: "P2401", location: {lat: 53.232185, lng: -114.562039}});
    // UBCMarkerArray.push({name: "station1", label: "station1", location: {lat: 55.10, lng: -119.85}});
    // UBCMarkerArray.push({name: "station2", label: "station2", location: {lat: 55.13, lng: -119.87}});
    // UBCMarkerArray.push({name: "geophone", label: "geophone", location: {lat: 56.01354, lng: -120.765}});


   /* markersArray.push({name: "003", label: "003", location: {lat: 56.0739, lng: -120.9318}});
    markersArray.push({name: "004", label: "004", location: {lat: 56.05371, lng: -120.878}});
    markersArray.push({name: "005", label: "005", location: {lat: 56.115917, lng: -120.853967}});
    markersArray.push({name: "006", label: "006", location: {lat: 56.078037, lng: -120.619046}});
    markersArray.push({name: "0032", label: "0032", location: {lat: 55.96704, lng: -120.663546}});
    markersArray.push({name: "0052", label: "0052", location: {lat: 55.936375, lng: -120.832696}});
    markersArray.push({name: "0042", label: "0042", location: {lat: 56.037927, lng: -120.677618}});
    markersArray.push({name: "g004", label: "g004", location: {lat: 56.50498, lng: -122.31804}});
    markersArray.push({name: "g007", label: "g007", location: {lat: 56.48932, lng: -122.458912}});
    markersArray.push({name: "g006", label: "g006", location: {lat: 56.45898, lng: -122.275497}});
    markersArray.push({name: "g010", label: "g010", location: {lat: 56.567552, lng: -122.242113}});
    markersArray.push({name: "007", label: "007", location: {lat: 56.01042, lng: -121.99062}});
    markersArray.push({name: "2239", label: "2239", location: {lat: 56.4888766, lng: -121.1975883}});
*/
    let originalMarkerColor = "cef542";    

    markersArray.forEach(function (marker) {
        let m = new MarkerWithLabel({
            position: marker.location,      
            map: map,                      
            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + '42eff5',   
            labelContent: marker.label,     
            labelAnchor: new google.maps.Point(20, 55),     
            labelClass: "label label-IRIS", // the CSS class for the label
        });
        westMarkersArray.push(m);           //
    });
    for (let i = 0; i < westMarkersArray.length; i++) {
            westMarkersArray[i].setMap(null);   //remove marker from a map
        }

    UBCMarkerArray.forEach(function (marker) {
        let className = "label label-Common";
        let pinColor = originalMarkerColor;
        let icon;
        if (stationList.includes(marker.name)) {
            className = "label label-New-Event";
            icon = 'https://img.icons8.com/color/35/000000/rating.png';
        } else {
            icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor;
        }

        let m = new MarkerWithLabel({
            position: marker.location,
            map: map,
            icon: icon,
            labelContent: marker.label,
            labelAnchor: new google.maps.Point(20, 55),
            labelClass: className, // the CSS class for the label
        });

        m.addListener('click', function (e) {          
            $('#station-select-0').val(marker.name);    
            //$('#station-select-1').val(marker.name);
            //$('#station-select-2').val(marker.name);
            stationSelectionOnChange('station-select-0');
            //stationSelectionOnChange('station-select-1');
            //stationSelectionOnChange('station-select-2');
        });
        let connectedMarker = {name: marker.name, marker: m}  //定义一个connected marker
        connectedMarkerArray.push(connectedMarker);           

    });

    if (window.userRole == 'admin' || window.userRole == 'CNRL') {
        CNRLMarkerArray.forEach(function (marker) {
            let className = "label label-Common";
            let pinColor = originalMarkerColor;
            let icon;
            if (stationList.includes(marker.name)) {
                className = "label label-New-Event";
                icon = 'https://img.icons8.com/color/35/000000/rating.png';
            } else {
                icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor;
            }

            let m = new MarkerWithLabel({
                position: marker.location,
                map: map,
                icon: icon,
                labelContent: marker.label,
                labelAnchor: new google.maps.Point(38, 55),
                labelClass: className, // the CSS class for the label
            });

            m.addListener('click', function (e) {
                $('#station-select-0').val(marker.name);
                //$('#station-select-1').val(marker.name);
                //$('#station-select-2').val(marker.name);
                stationSelectionOnChange('station-select-0');
                //stationSelectionOnChange('station-select-1');
                //stationSelectionOnChange('station-select-2');
            });
            let connectedMarker = {name: marker.name, marker: m}
            connectedMarkerArray.push(connectedMarker);
        })
    }

    if (window.userRole == 'admin' || window.userRole == 'TW') {
        TWMarkerArray.forEach(function (marker) {
            let className = "label label-Common";
            let pinColor = originalMarkerColor;
            let icon;
            if (stationList.includes(marker.name)) {
                className = "label label-New-Event";
                icon = 'https://img.icons8.com/color/35/000000/rating.png';
            } else {
                icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor;
            }

            let m = new MarkerWithLabel({
                position: marker.location,
                map: map,
                icon: icon,
                labelContent: marker.label,
                labelAnchor: new google.maps.Point(33, 55),
                labelClass: className, // the CSS class for the label
            });

            m.addListener('click', function (e) {
                $('#station-select-0').val(marker.name);
                //$('#station-select-1').val(marker.name);
                //$('#station-select-2').val(marker.name);
                stationSelectionOnChange('station-select-0');
                //stationSelectionOnChange('station-select-1');
                //stationSelectionOnChange('station-select-2');
            });
            let connectedMarker = {name: marker.name, marker: m}
            connectedMarkerArray.push(connectedMarker);
        })
    }
    if (window.userRole == 'admin' || window.userRole == 'PT') {
        PTMarkerArray.forEach(function (marker) {
            let className = "label label-Common";
            let pinColor = originalMarkerColor;
            let icon;
            if (stationList.includes(marker.name)) {
                className = "label label-New-Event";
                icon = 'https://img.icons8.com/color/35/000000/rating.png';
            } else {
                icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor;
            }

            let m = new MarkerWithLabel({
                position: marker.location,
                map: map,
                icon: icon,
                labelContent: marker.label,
                labelAnchor: new google.maps.Point(30, 55),
                labelClass: className, // the CSS class for the label
            });

            m.addListener('click', function (e) {
                $('#station-select-0').val(marker.name);
                //$('#station-select-1').val(marker.name);
                //$('#station-select-2').val(marker.name);
                stationSelectionOnChange('station-select-0');
                //stationSelectionOnChange('station-select-1');
                //stationSelectionOnChange('station-select-2');
            });
            let connectedMarker = {name: marker.name, marker: m}
            connectedMarkerArray.push(connectedMarker);
        })
    }
}

function updateMarkerOnMap() {
    /*
        1. 得到当前station radio的值
        2. 如果为only，则关闭map中IRISStationMarker和westMarkersArray的标记，否则打开
    */
    let stationRadio = $("input[name='stationRadio']:checked").get();
    let option = stationRadio[0].value;
    if (option == 'only') {
        for (let i = 0; i < IRISStationMarkers.length; i++) {
            IRISStationMarkers[i].setMap(null);             //remove marker from a map
        }
        for (let i = 0; i < westMarkersArray.length; i++) {
            westMarkersArray[i].setMap(null);
        }
    } else {
        for (let i = 0; i < IRISStationMarkers.length; i++) {
            IRISStationMarkers[i].setMap(map);              //create markers and add them to a map
        }
        for (let i = 0; i < westMarkersArray.length; i++) {
            westMarkersArray[i].setMap(map);
        }
    }
}

function updateMarkerColorPGA(PGALevel, station) {
    /*
        1. 根据PGALevel得到className和pinColor
        2. 更新connectedMarkerArray的marker
    */
    if (!firstTimeFlag) {   
        let className = '';
        let pinColor = '';
        if (PGALevel < 0.98) {
            className = 'label label-pga-not-felt';
            pinColor = 'e1f0ec';
        } else if (PGALevel < 4.9) {
            className = 'label label-pga-very-weak';
            pinColor = 'd0f5eb';
        } else if (PGALevel < 24) {
            className = 'label label-pga-weak';
            pinColor = '8de4f0'
        } else if (PGALevel < 66) {
            className = 'label label-pga-light';
            pinColor = '33f59e';
        } else if (PGALevel < 128) {
            className = 'label label-pga-moderate';
            pinColor = '47d67e';
        } else if (PGALevel < 235) {
            className = 'label label-pga-strong';
            pinColor = 'f0e267'
        } else if (PGALevel < 432) {
            className = 'label label-pga-very-strong';
            pinColor = 'f0a967';
        } else if (PGALevel < 814) {
            className = 'label label-pga-severe';
            pinColor = 'bf630d';
        } else if (PGALevel < 1530) {
            className = 'label label-pga-violent';
            pinColor = 'c73912';
        } else {
            className = 'label label-pga-extreme';
            pinColor = 'd10902';
        }

        for (let i = 0; i < connectedMarkerArray.length; i++) {     
            if (connectedMarkerArray[i].name == station) {         
                let temp = connectedMarkerArray[i].marker;         
                let updatedMarker = new MarkerWithLabel({
                    position: temp.position,
                    map: map,
                    icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor,
                    labelContent: temp.labelContent,
                    labelAnchor: temp.labelAnchor,
                    labelClass: className, // the CSS class for the label
                });

                updatedMarker.addListener('click', function (e) {               
                    $('#station-select-0').val(connectedMarkerArray[i].name);   
                    stationSelectionOnChange('station-select-0');               
                });


                connectedMarkerArray[i].marker.setMap(null);
                connectedMarkerArray[i].marker = updatedMarker;
                connectedMarkerArray[i].marker.setMap(map);
            }
        }
    } else {
        firstTimeFlag = false;
    }
}
