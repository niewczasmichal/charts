package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/rs/cors"
)

type server struct{}

type streamDetails struct {
	Asset      string
	BitVersion string
	IsLive     bool
	Duration   int
	DRM        string
	DroppedVF  int
	TotalST    int
	TimeShift  int
}

type heartbeatDetails struct {
	TotalRAM     float64
	UsedRAM      float64
	CPU          float64
	VideoBitrate int
}

//Heartbeat - basic structure sent by tvs
type Heartbeat struct {
	Model         string
	Timestamp     string
	StreamDetails streamDetails
	Details       heartbeatDetails
}

//Heartbeats - structure stored by app
type Heartbeats struct {
	Model         string
	TimeStarted   string
	TimeEnded     string
	LastUpdate    string
	StreamDetails streamDetails
	Details       heartbeatsDetails
}

type heartbeatsDetails struct {
	TotalRAM     float64
	UsedRAM      []float64
	CPU          []float64
	VideoBitrate []int
	Iteration    []int
}

var hbarr map[string]*Heartbeats = make(map[string]*Heartbeats)

func getHeartbeats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var restArr = make([]*Heartbeats, 0)
	for _, element := range hbarr {
		restArr = append(restArr, element)
	}
	js, err := json.Marshal(restArr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(js)
}

func setDetails(h Heartbeat, hs *Heartbeats) {
	hs.Details.UsedRAM = append(hs.Details.UsedRAM, h.Details.UsedRAM)
	hs.Details.CPU = append(hs.Details.CPU, h.Details.CPU)
	hs.Details.VideoBitrate = append(hs.Details.VideoBitrate, h.Details.VideoBitrate)
	hs.LastUpdate = h.Timestamp
	hs.StreamDetails = h.StreamDetails
}

func endHeartbeat(w http.ResponseWriter, r *http.Request) {
	var h Heartbeat
	err := json.NewDecoder(r.Body).Decode(&h)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var hs = hbarr[h.Model]
	hs.TimeEnded = h.Timestamp
	setDetails(h, hs)
	hs.Details.Iteration = append(hs.Details.Iteration, hs.Details.Iteration[len(hs.Details.Iteration)-1]+2)

	f, err := os.Create("local/log/" + h.Model + "_" + h.Timestamp + "_" + h.StreamDetails.Asset + "_" + h.StreamDetails.DRM + ".json")

	if err != nil {
		log.Fatal(err)
	}

	defer f.Close()

	js, err := json.Marshal(hbarr[h.Model])
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err2 := f.Write(js)

	if err2 != nil {
		log.Fatal(err)
	}

	var csv = ""
	f2, err3 := os.Create("local/log/" + h.Model + "_" + h.Timestamp + "_" + h.StreamDetails.Asset + "_" + h.StreamDetails.DRM + ".csv")

	if err3 != nil {
		log.Fatal(err)
	}

	defer f2.Close()

	for i, s := range hs.Details.Iteration {
		csv += strconv.Itoa(s) + "," + floatToString(hs.Details.UsedRAM[i]) + "," + floatToString(hs.Details.CPU[i]) + "," + strconv.Itoa(hs.Details.VideoBitrate[i]) + "\n"
	}

	_, err4 := f2.WriteString(csv)

	if err4 != nil {
		log.Fatal(err)
	}
}

func floatToString(inputNum float64) string {
	return strconv.FormatFloat(inputNum, 'f', 6, 64)
}

func saveHeartbeat(w http.ResponseWriter, r *http.Request) {
	var h Heartbeat
	err := json.NewDecoder(r.Body).Decode(&h)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if hbarr[h.Model] != nil && hbarr[h.Model].TimeEnded != "" {
		delete(hbarr, h.Model)
	}

	if hs, ok := hbarr[h.Model]; ok {
		setDetails(h, hs)
		hs.Details.Iteration = append(hs.Details.Iteration, hs.Details.Iteration[len(hs.Details.Iteration)-1]+2)
	} else {
		hbarr[h.Model] = &Heartbeats{}
		var hs = hbarr[h.Model]
		hs.Details.TotalRAM = h.Details.TotalRAM
		hs.Model = h.Model
		hs.TimeStarted = h.Timestamp
		hs.Details.Iteration = append(hs.Details.Iteration, 0)
		setDetails(h, hs)
		hs.LastUpdate = h.Timestamp
	}
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/heartbeat/add", saveHeartbeat)
	mux.HandleFunc("/heartbeat/get", getHeartbeats)
	mux.HandleFunc("/heartbeat/end", endHeartbeat)
	handler := cors.Default().Handler(mux)
	err := http.ListenAndServe(":3000", handler)
	log.Fatal(err)
}
