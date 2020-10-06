var ramchart, cpuchart, videochart, audiochart, selectedTv;
var tvMap = new Map();

function startup(){
    var interv = window.setInterval(getData, 1000);
}

function prepareCharts(){
    var ctx = document.getElementById("ramchart").getContext('2d');
    ramchart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: selectedTv.labels,
            datasets: [{
                data: selectedTv.ramC,
                fill: false,
                borderColor: 'yellow',
                lineTension: 0
            }
            // , {
            //     label: 'RAM total',
            //     data: selectedTv.MaxRam,
            //     fill: false,
            //     borderColor: 'red',
            //     lineTension: 0
            // }
        ]
        },
        options: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'RAM usage'
            },
            elements: {
                point:{
                    radius: 0
                }
            },
            scales: {
                xAxes: [{
                    scaleLabel:{
                        display: true,
                        labelString: 'seconds'
                    }
                }],
                yAxes: [{
                    scaleLabel:{
                        display: true,
                        labelString: 'MB'
                    }
                }]
            }
        }
    });

    ctx = document.getElementById("cpuchart").getContext('2d');
    cpuchart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: selectedTv.labels,
            datasets: [{
                label: 'CPU load',   
                data: selectedTv.cpuLoad,
                fill: false,
                borderColor: 'red',
                lineTension: 0
            }]
        },
        options: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'CPU load'
            },
            elements: {
                point:{
                    radius: 0
                }
            },
            scales: {
                xAxes: [{
                    scaleLabel:{
                        display: true,
                        labelString: 'seconds'
                    }
                }],
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 100
                    },
                    scaleLabel:{
                        display: true,
                        labelString: '%'
                    }
                }]
            }
        }
    });

    ctx = document.getElementById("videochart").getContext('2d');
    videochart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: selectedTv.labels,
            datasets: [{
                label: 'Video bitrate',   
                data: selectedTv.videoBitrate,
                fill: false,
                borderColor: 'green',
                lineTension: 0
            }]
        },
        options: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Video bitrate'
            },
            elements: {
                point:{
                    radius: 0
                }
            },
            scales: {
                xAxes: [{
                    scaleLabel:{
                        display: true,
                        labelString: 'seconds'
                    }
                }],
                yAxes: [{
                    scaleLabel:{
                        display: true,
                        labelString: 'Bits'
                    }
                }]
            }
        }
    });
}

function getData(){
    fetch('http://192.168.1.165:3000/heartbeat/get', {
		  method: 'GET'
        })
        .then(response => response.json())
        .then(data => setVars(data));
}

function changetv(){
    selectedTv = tvMap.get(tizens.value);
    // prepareCharts();
}

function sortList() 
{ 
    var lb = document.getElementById('tizens'); 
    arrTexts = new Array(); 
    arrValues = new Array(); 
    arrOldTexts = new Array(); 

    for(i=0; i<lb.length; i++) 
    { 
        arrTexts[i] = lb.options[i].text; 
        arrValues[i] = lb.options[i].value; 
        arrOldTexts[i] = lb.options[i].text; 
    } 

    arrTexts.sort(); 

    for(i=0; i<lb.length; i++) 
    { 
        lb.options[i].text = arrTexts[i]; 
        for(j=0; j<lb.length; j++) 
        { 
            if (arrTexts[i] == arrOldTexts[j]) 
            { 
                lb.options[i].value = arrValues[j]; 
                j = lb.length; 
            } 
        } 
    } 
}

function setVars(data){
    if (data != null) {
        data.forEach(element => {
            if(!tvMap.get(element.Model)){
                var x = {
                    model: element.Model,   
                    MaxRam: element.Details.TotalRAM,
                    ramC: element.Details.UsedRAM,
                    cpuLoad: element.Details.CPU,
                    videoBitrate: element.Details.VideoBitrate,
                    labels: element.Details.Iteration,
                    streamDetails: element.StreamDetails,
                    timeStarted: element.TimeStarted,
                    timeEnd: element.TimeEnded,
                    update: element.LastUpdate
                }
                var tizens = document.getElementById("tizens");
                var option = document.createElement("option");
                option.text = element.Model;
                tizens.add(option);
                sortList();
                tvMap.set(element.Model, x);
                if (!selectedTv){
                    changetv();
                    prepareCharts();
                }
            }
            else{
                var tv = tvMap.get(element.Model);
                tv.ramC = element.Details.UsedRAM;
                tv.cpuLoad = element.Details.CPU;
                tv.videoBitrate = element.Details.VideoBitrate;
                tv.labels = element.Details.Iteration;
                tv.timeEnd = element.TimeEnded;
                tv.update = element.LastUpdate;
            }
        });
        // prepareCharts();
        changetv();
        console.log("111");
        ramchart.data.labels = selectedTv.labels;
        ramchart.data.datasets[0].data = selectedTv.ramC;
        cpuchart.data.labels = selectedTv.labels;
        cpuchart.data.datasets[0].data = selectedTv.cpuLoad;
        videochart.data.labels = selectedTv.labels;
        videochart.data.datasets[0].data = selectedTv.videoBitrate;
        ramchart.update();
        cpuchart.update();   
        videochart.update();
        debugInfo();
    }
}

function sToTime(duration) {
	var seconds = Math.floor(duration % 60),
	  minutes = Math.floor((duration / 60) % 60),
	  hours = Math.floor((duration / (60 * 60)) % 24);
  
	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
  
	return hours + ":" + minutes + ":" + seconds;
  }

function debugInfo(){
    var sum = 0;
    selectedTv.ramC.forEach(element => {
        sum += element;
    });
    document.getElementById("timestart").innerHTML = new Date(selectedTv.timeStarted).toString();
    document.getElementById("lastupdate").innerHTML = new Date(selectedTv.update).toString();

    document.getElementById("avgRam").innerHTML = Math.round(sum/selectedTv.ramC.length);
    document.getElementById("bitversion").innerHTML = selectedTv.streamDetails.BitVersion;
    document.getElementById("totalRam").innerHTML = selectedTv.MaxRam;
    document.getElementById("asset").innerHTML = selectedTv.streamDetails.Asset;
    document.getElementById("drm").innerHTML = selectedTv.streamDetails.DRM;
    if(selectedTv.timeEnd != ""){
        document.getElementById("timeend").innerHTML = new Date(selectedTv.timeEnd).toString();
    }
    else{
        document.getElementById("timeend").innerHTML = ""
    }
    document.getElementById("duration").innerHTML = sToTime(selectedTv.streamDetails.Duration);
    document.getElementById("stalltime").innerHTML = sToTime(selectedTv.streamDetails.TotalST);
    document.getElementById("islive").innerHTML = selectedTv.streamDetails.IsLive;
    document.getElementById("dropframe").innerHTML = selectedTv.streamDetails.DroppedVF;
}