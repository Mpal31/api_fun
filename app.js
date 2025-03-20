//curl -X POST http://localhost:3000/api/lamp -H "Content-Type: application/json" -d '{"data": "off"}'
//testing
//url -X POST https://openapi.api.govee.com/router/v1/devices/control -H "Content-Type: application/json" "Govee-API-Key: " -d '{'device': '49:5B:CE:2A:45:46:4A:6D','model': 'H6076','cmd':{'name':'turn','value':'off'}}' 
//test
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios')
const app = express();
require('dotenv').config()

function control (func, data) {
	if(func === "brightness"){
		data = parseInt(data);
	}
	var unirest = require('unirest');
	var req = unirest('PUT', 'https://developer-api.govee.com/v1/devices/control')
  	.headers({
    	 	'Content-Type': 'application/json',
		'Govee-API-Key': process.env.api_key
  	})

	.send(JSON.stringify({
		"device": "49:5B:CE:2A:45:46:4A:6D",
		"model": "H6076",
		"cmd": {
			"name": func,
			"value": data
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
		control("turn", data);

	} else if (data.toLowerCase() === "on") {

		res.send(`Lamp is now ${data}`);
		control("turn", data)
	}else{
		res.send("idiot");
	}




});

app.post("/api/lamp/bright", (req, res) => {
        const {data} = req.body;
        console.log(data);
	if(parseInt(data) > 0 && parseInt(data) <= 100){
        	res.send(`bright is now ${data}`);
		control("brightness", data);
	}
	else{
		res.send('idiot');
	}

});

app.listen(3000, () => console.log("Running!"));

