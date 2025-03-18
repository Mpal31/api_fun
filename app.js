//curl -X POST http://localhost:3000/api/lamp -H "Content-Type: application/json" -d '{"data": "off"}'
//testing
//url -X POST https://openapi.api.govee.com/router/v1/devices/control -H "Content-Type: application/json" "Govee-API-Key: fca3cfcd-6762-437d-8694-4b9bdbba040b" -d '{'device': '49:5B:CE:2A:45:46:4A:6D','model': 'H6076','cmd':{'name':'turn','value':'off'}}' 
//test
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios')

const app = express();
function poewer (a){
console.log('hell0' + `${a}`);
}
function power (a) {
	var unirest = require('unirest');
	var req = unirest('PUT', 'https://developer-api.govee.com/v1/devices/control')
  	.headers({
    	 	'Content-Type': 'application/json',
    	 	'Govee-API-Key': 'fca3cfcd-6762-437d-8694-4b9bdbba040b'
  	})

	.send(JSON.stringify({
		"device": "49:5B:CE:2A:45:46:4A:6D",
		"model": "H6076",
		"cmd": {
			"name": "turn",
			"value": `${a}`
	}
	}))
  	.end(function (res) { 

		if (res.error) throw new Error(res.error); 
		console.log(res.raw_body);
	});



}
//app.use(bodyParser.urlencoded({extended: true }));
app.use(express.json());
//app.use(express.urlencoded({extended: true}));
//const data = {}
//const lamps = "lamp!"

app.get('/',(req, res) => {
	res.send('hello world');
});

app.post("/api/lamp/power", (req, res) => {
	const {data} = req.body;
	console.log(data);

	if(data.toLowerCase() === "off"){

		res.send(`Lamp is now ${data}`);
		power(data);

	} else if (data.toLowerCase() === "on") {

		res.send(`Lamp is now ${data}`);
		power(data)
	}else{
		res.send("idiot");
	}




});

app.post("/api/lamp/bright", (req, res) => {
        const {data} = req.body;
        console.log(data);
        res.send(`bright is now ${data}`);
});

app.listen(3000, () => console.log("Running!"));

