var cpuLoad = [];
var videoBitrate = [];
var audioBitrate = [];
var ramC = [];
var labels = [];
var i = 0;
var ramchart, cpuchart, videochart, audiochart;
var MaxRam = [];
function startup(){
    var ctx = document.getElementById("ramchart").getContext('2d');
    ramchart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'RAM usage',   
                data: ramC,
                fill: false,
                borderColor: 'yellow'
            }, {
                label: 'RAM total',
                data: MaxRam,
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
            labels: labels,
            datasets: [{
                label: 'CPU load',   
                data: cpuLoad,
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

    var interv = window.setInterval(getData, 1000);
}

function getData(){
    fetch('http://192.168.0.206:3000/heartbeat/get', {
		  method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            if (data != null) {
                data = data[0];
                console.log(data);
                MaxRam.push(data.Details.TotalRAM/1024/1024);
                ramC.push(data.Details.UsedRAM/1024/1024);
                cpuLoad.push(data.Details.CPU);
                labels.push(i);
                ramchart.update()        
            }
            i++;
        });
}