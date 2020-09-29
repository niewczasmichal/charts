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
                label: 'RAM usage',   
                data: selectedTv.ramC,
                fill: false,
                borderColor: 'yellow'
            }, {
                label: 'RAM total',
                data: selectedTv.MaxRam,
                fill: false,
                borderColor: 'red'
            }]
        },
        options: {
            elements: {
                point:{
                    radius: 0
                }
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
                borderColor: 'red'
            }]
        },
        options: {
            elements: {
                point:{
                    radius: 0
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 100
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
                borderColor: 'green'
            }]
        },
        options: {
            elements: {
                point:{
                    radius: 0
                }
            }
        }
    });

}

function getData(){
    fetch('http://192.168.0.206:3000/heartbeat/get', {
		  method: 'GET'
        })
        .then(response => response.json())
        .then(data => setVars(data));
}

function changetv(){
    selectedTv = tvMap.get(tizens.value);
    prepareCharts();
}

function setVars(data){
    if (data != null) {
        data.forEach(element => {
            if(!tvMap.get(element.Model)){
                var x = {
                    model: element.Model,
                    i: 1,
                    MaxRam: [Math.round(element.Details.TotalRAM/1024/1024)],
                    ramC: [Math.round(element.Details.UsedRAM/1024/1024)],
                    cpuLoad: [Math.round(element.Details.CPU)],
                    videoBitrate: [element.Details.VideoBitrate],
                    audioBitrate: [element.Details.AudioBitrate],
                    labels: [0]
                }
                var tizens = document.getElementById("tizens");
                var option = document.createElement("option");
                option.text = element.Model;
                tizens.add(option);
                tvMap.set(element.Model, x);
                if (!selectedTv){
                    changetv();
                    prepareCharts();
                }
            }
            else{
                var tv = tvMap.get(element.Model);
                tv.MaxRam.push(Math.round(element.Details.TotalRAM/1024/1024));
                tv.ramC.push(Math.round(element.Details.UsedRAM/1024/1024));
                tv.cpuLoad.push(Math.round(element.Details.CPU));
                tv.videoBitrate.push(element.Details.VideoBitrate);
                tv.audioBitrate.push(element.Details.AudioBitrate);
                tv.labels.push(tv.i);
                tv.i++;
            }
        });
        ramchart.update();
        cpuchart.update();   
        videochart.update();
        debugInfo();
    }
}

function debugInfo(){
    var sum = 0;
    selectedTv.ramC.forEach(element => {
        sum += element;
    });
    document.getElementById("avgRam").innerHTML = Math.round(sum/selectedTv.ramC.length);
}

function clearContent(){
    // selectedTv.i = 1;
    // selectedTv.MaxRam = [];
    // selectedTv.ramC = [];
    // selectedTv.cpuLoad = [];
    // selectedTv.videoBitrate = [];
    // selectedTv.audioBitrate = [];
    // selectedTv.labels = [];
    selectedTv.i = 1;
    selectedTv.MaxRam = selectedTv.MaxRam.slice(selectedTv.MaxRam.length - 1);
    selectedTv.ramC = selectedTv.ramC.slice(selectedTv.ramC.length - 1);
    selectedTv.cpuLoad = selectedTv.cpuLoad.slice(selectedTv.cpuLoad.length - 1);
    selectedTv.videoBitrate = selectedTv.videoBitrate.slice(selectedTv.videoBitrate.length - 1);
    selectedTv.audioBitrate = selectedTv.audioBitrate.slice(selectedTv.audioBitrate.length - 1);
    selectedTv.labels = selectedTv.labels.slice(selectedTv.labels.length - 1);
    console.log(selectedTv);
    prepareCharts();
}