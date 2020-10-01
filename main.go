package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/rs/cors"
)

type server struct{}

type heartbeatDetails struct {
	TotalRAM     int
	UsedRAM      int
	CPU          float64
	VideoBitrate int
	AudioBitrate int
}

//Heartbeat - basic structure sent by tvs
type Heartbeat struct {
	Model     string
	Timestamp string
	Details   heartbeatDetails
}

//Heartbeats - structure stored by app
type Heartbeats struct {
	Model       string
	TimeStarted string
	TimeEnded   string
	LastUpdate  string
	Details     heartbeatsDetails
}

type heartbeatsDetails struct {
	TotalRAM     []int
	UsedRAM      []int
	CPU          []float64
	VideoBitrate []int
	Iteration    []int
}

var hbarr map[string]*Heartbeats = make(map[string]*Heartbeats)

func getHeartbeats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	js, err := json.Marshal(hbarr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(js)
}

func setDetails(h Heartbeat, hs *Heartbeats) {
	hs.Details.TotalRAM = append(hs.Details.TotalRAM, h.Details.TotalRAM)
	hs.Details.UsedRAM = append(hs.Details.UsedRAM, h.Details.UsedRAM)
	hs.Details.CPU = append(hs.Details.CPU, h.Details.CPU)
	hs.Details.VideoBitrate = append(hs.Details.VideoBitrate, h.Details.VideoBitrate)
	hs.LastUpdate = h.Timestamp
}

func endHeartbeat(w http.ResponseWriter, r *http.Request) {
	var h Heartbeat
	// var hs Heartbeats
	err := json.NewDecoder(r.Body).Decode(&h)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var hs = hbarr[h.Model]
	hs.TimeEnded = h.Timestamp
	setDetails(h, hs)

	f, err := os.Create("local\\log\\" + h.Model + "_" + h.Timestamp + ".json")

	if err != nil {
		log.Fatal(err)
	}

	defer f.Close()

	js, err := json.Marshal(hbarr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err2 := f.Write(js)

	if err2 != nil {
		log.Fatal(err)
	}

}
func saveHeartbeat(w http.ResponseWriter, r *http.Request) {
	var h Heartbeat
	err := json.NewDecoder(r.Body).Decode(&h)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if hbarr[h.Model] != nil && len(hbarr[h.Model].TimeEnded) > 0 {
		delete(hbarr, h.Model)
	}

	if hs, ok := hbarr[h.Model]; ok {
		setDetails(h, hs)
		hs.Details.Iteration = append(hs.Details.Iteration, hs.Details.Iteration[len(hs.Details.Iteration)-1]+1)
	} else {
		hbarr[h.Model] = &Heartbeats{}
		var hs = hbarr[h.Model]
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
