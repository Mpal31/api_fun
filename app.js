//curl -X POST http://localhost:3000/api/lamp -H "Content-Type: application/json" -d '{"data": "off"}'
//testing
//url -X POST https://openapi.api.govee.com/router/v1/devices/control -H "Content-Type: application/json" "Govee-API-Key: " -d '{'device': '49:5B:CE:2A:45:46:4A:6D','model': 'H6076','cmd':{'name':'turn','value':'off'}}' 
//test
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios')
const app = express();
require('dotenv').config()
const { PythonShell } = require('python-shell');
const {spawn} = require('child_process');

let dataToSend;
function rgb (color) {
    // spawn new child process to call the python script 
    // and pass the variable values to the python script
    const python = spawn('python', ['./color.py', color]);
    // collect data from script
    python.stdout.on('data', function (data) {

        dataToSend = data.toString();
		console.log(dataToSend);
		test = dataToSend.replace(/\s+/g, '');

		if(test === "err") {
			console.log("not a color");
//		return false;
		}else{
			var dataToSend = dataToSend.replace(/'|\]| |\[/g, "");

			dataToSend = dataToSend.split(",");
			const { 0: r, 1: g, 2: b } = dataToSend;

			console.log(r);
			console.log(g);
			console.log(b);
	//sent to color function
			change_color(r, g, b);
//		return "true";
		}


    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`status code of color script run ${code}`);
        // send data to browser

    });

}

function change_color (r, g, b){
	r=parseInt(r);
	g=parseInt(g);
	b=parseInt(b);
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
      		"name": "color",
      		"value": {
        		"r": r,
        		"g": g,
        		"b": b
      		}
    	}
  	}))
  	.end(function (res) {

    		if (res.error) throw new Error(res.error);
    		console.log(res.raw_body);
  	});



}


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


app.post("/api/lamp/color", (req, res) => {
	const {data} = req.body;
	console.log(data);
	rgb (data);
	res.send(`trying to change light to ${data}`);
});
app.listen(3000, () => console.log("Running!"));

