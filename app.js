//curl structure
//curl -X POST http://192.168.1.19:3000/api/lamp/color -H "Content-Type: application/json" -d '{"data": "purple"}'

const express = require('express');
const app = express();
//used to send rest
var unirest = require('unirest');
//used to process api keys
require('dotenv').config()
//used to run python script to change color names into rgb numbers
const {spawn} = require('child_process');

//rgb function that calls python script to translate color names to rgb
function rgb (color) {
    // spawn new child process to call the python script 
    // and pass the variable values to the python script
    const python = spawn('python', ['./color.py', color]);
    // collect data from script
    python.stdout.on('data', function (data) {

		//convert recieved data from scrypt to string from buffer
        dataToSend = data.toString();

		//remove white spaces to check for error
		test = dataToSend.replace(/\s+/g, '');

		//test if there was an error in python script
		if(test === "err") {
			console.log("not a color");

		}else{
			//manipulate data to to get the three ints seperated by comma
			var dataToSend = dataToSend.replace(/'|\]| |\[/g, "");
			dataToSend = dataToSend.split(",");
			const { 0: r, 1: g, 2: b } = dataToSend;

		//Call function to sent rest command to change color
			change_color(r, g, b);

		}


    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`status code of color script run ${code}`);

    });

}

//function that send rest call to chaneg color on lamp
//looking to consolidate two rest calls into one
function change_color (r, g, b){
	r=parseInt(r);
	g=parseInt(g);
	b=parseInt(b);
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

//rest call to turn on/off lamp and set brightness
//looking to consolidate two restcalls into one function
function control (func, data) {
	if(func === "brightness"){
		data = parseInt(data);
	}

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


app.use(express.json());

//will be used to test connectivity
app.get('/',(req, res) => {
	res.send('hello world');
});

//endpoint for power cycle
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

//endpoint to set brightness
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

//endpoint to change color
app.post("/api/lamp/color", (req, res) => {
	const {data} = req.body;
	console.log(data);
	rgb (data);
	res.send(`trying to change light to ${data}`);
});


app.listen(3000, () => console.log("Running!"));