# charts
Project consist of two apps:
- backend (main.go) working on port 3000
- presentation site (local\index.html)

#Prerequirements
1. App for device which performance we want to measure should send POST requests to server on port 3000 to endpoint /heartbeat/add with structure:
```javascript
{
			"model": string,
			"timestamp" : string,
			"streamDetails" : {
				"Asset": string,
				"BitVersion": string,
				"IsLive": boolean,
				"Duration": int,
				"DRM": string,
				"DroppedVF": int,
				"TotalST": int,
				"TimeShift": int
			},
			"details" : {
				"TotalRAM" : int,
				"UsedRAM" : int,
				"CPU" : float,
				"VideoBitrate" : int
			}
	}
```
2. At the end of playback it should send request with same structure as in point 1. to endpoint /heartbeat/end so the app will save results to file in local/log/ directory

#Running app
1. Open directory in terminal
2. Run command `go run main.go` to start backend app
3. In another tab run presentation site e.g. `cd local/ && php -S IP_ADDRESS:PORT_NUMBER`
4. Open up browser tab with IP_ADDRESS:PORT_NUMBER
