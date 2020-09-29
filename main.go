package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

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

var hbarr []Heartbeat

func getHeartbeats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	js, err := json.Marshal(hbarr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(js)
}

func saveHeartbeat(w http.ResponseWriter, r *http.Request) {
	var h Heartbeat
	err := json.NewDecoder(r.Body).Decode(&h)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var i = 0
	for range hbarr {
		if hbarr[i].Model == h.Model {
			hbarr[i] = h
			break
		}
		i++
	}
	if i+1 > len(hbarr) {
		hbarr = append(hbarr, h)
	}
	fmt.Printf("New heartbeat: %+v\n", h)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/heartbeat/add", saveHeartbeat)
	mux.HandleFunc("/heartbeat/get", getHeartbeats)
	handler := cors.Default().Handler(mux)
	err := http.ListenAndServe(":3000", handler)
	log.Fatal(err)
}
