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
                borderColor: 'yellow',
                lineTension: 0
            }, {
                label: 'RAM total',
                data: selectedTv.MaxRam,
                fill: false,
                borderColor: 'red',
                lineTension: 0
            }]
        },
        options: {
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
    prepareCharts();
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
                sortList();
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
                if(element.Details.CPU == 0){
                    tv.cpuLoad.push(tv.cpuLoad[tv.cpuLoad.length-1]);
                }
                else{
                    tv.cpuLoad.push(Math.round(element.Details.CPU));
                }
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