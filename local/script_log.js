var ramchart, cpuchart, videochart, audiochart, selectedTv;
var tvMap = new Map();
var fileList;
var fr = new FileReader();

function startup(){
    const inputElement = document.getElementById("input");
    inputElement.addEventListener("change", handleFiles, false);
    fr.addEventListener("loadend",function(){
        selectedTv = JSON.parse(fr.result);
        prepareCharts();
        debugInfo();
    }, false)
}

function handleFiles() {
    fileList = this.files;
    fr.readAsText(fileList[0]);
}

function prepareCharts(){
    var ctx = document.getElementById("ramchart").getContext('2d');
    ramchart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: selectedTv.Details.Iteration,
            datasets: [{
                data: selectedTv.Details.UsedRAM,
                fill: false,
                borderColor: 'yellow',
                lineTension: 0
            }
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
            labels: selectedTv.Details.Iteration,
            datasets: [{
                label: 'CPU load',   
                data: selectedTv.Details.CPU,
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
            labels: selectedTv.Details.Iteration,
            datasets: [{
                label: 'Video bitrate',   
                data: selectedTv.Details.VideoBitrate,
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
    selectedTv.Details.UsedRAM.forEach(element => {
        sum += element;
    });
    document.getElementById("tizenVersion").innerHTML = selectedTv.Model;
    document.getElementById("timestart").innerHTML = new Date(selectedTv.TimeStarted).toString();
    document.getElementById("lastupdate").innerHTML = new Date(selectedTv.LastUpdate).toString();

    document.getElementById("avgRam").innerHTML = Math.round(sum/selectedTv.Details.UsedRAM.length);
    document.getElementById("bitversion").innerHTML = selectedTv.StreamDetails.BitVersion;
    document.getElementById("totalRam").innerHTML = selectedTv.Details.TotalRAM;
    document.getElementById("asset").innerHTML = selectedTv.StreamDetails.Asset;
    document.getElementById("drm").innerHTML = selectedTv.StreamDetails.DRM;
    if(selectedTv.timeEnd != ""){
        document.getElementById("timeend").innerHTML = new Date(selectedTv.TimeEnded).toString();
    }
    else{
        document.getElementById("timeend").innerHTML = ""
    }
    document.getElementById("duration").innerHTML = sToTime(selectedTv.StreamDetails.Duration);
    document.getElementById("stalltime").innerHTML = sToTime(selectedTv.StreamDetails.TotalST);
    document.getElementById("islive").innerHTML = selectedTv.StreamDetails.IsLive;
    document.getElementById("dropframe").innerHTML = selectedTv.StreamDetails.DroppedVF;
}