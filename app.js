//curl structure
//curl -X POST http://192.168.1.19:3000/api/lamp/color -H "Content-Type: application/json" -d '{"data": "purple"}'

const express = require('express');

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

//const User = require('./models/User');


//used to send rest
var unirest = require('unirest');
//used to process api keys
require('dotenv').config()
//used to run python script to change color names into rgb numbers
const {spawn} = require('child_process');

const rgb = require('./get_rgb_func.js');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/authdb', {
	useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection failed:', err));

const UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	token: { type: String, required: false, unique: true },
	role: {type: String, required: true }
});

const User = mongoose.model('User', UserSchema);


	//rgb function that calls python script to translate color names to rgb


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

// Authentication middleware
const authMiddleware = async (req, res, next) => {
	try {
	  const token = req.header('Authorization')?.replace('Bearer ', '');
	  console.log(token)
	  if (!token) {
		return res.status(401).json({ message: 'Access denied. No token provided.' });
	  }
	  console.log("hi")
	  const decoded = jwt.verify(token, 'my_seceret_key' );
	  //console.log("hello"+decoded)
	  const user = await User.findOne({ _id: decoded.userId, token });
	  
	  if (!user) {
		return res.status(401).json({ message: 'Invalid token.' });
	  }
	  
	  // Add user to request object for use in route handlers
	  req.user = decoded;
	  req.token = token;
	  next();
	} catch (error) {
	  if (error instanceof jwt.JsonWebTokenError) {
		return res.status(401).json({ message: 'Invalid token.' });
	  }
	  console.error('Auth middleware error:', error);
	  res.status(500).json({ message: 'Internal server error' });
	}
  };

//will be used to test connectivity
app.get('/',(req, res) => {
	res.send('hello world');
});

app.post('/api/register', 
	[
	  body('username'),
	  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
	], 
	async (req, res) => {
	  const errors = validationResult(req);
	  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
	  const { username, password } = req.body;
  
	  try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ username, password: hashedPassword, token: null, role: "Registered" });
		await user.save();
		res.status(201).json({ message: 'User registered successfully' });
	  } catch (err) {
		res.status(500).json({ message: 'Error registering user', error: err.message });
	  }

	}
  );


app.post("/api/auth/token", async (req,res)=> {
	const {username, password}=req.body
	try {
		// Validate request body
		const { username, password } = req.body;

		if (!username || !password) {
		  return res.status(400).json({ message: 'Username and password are required' });
		}
		
		// Find user in database
		const user = await User.findOne({ username });
		if (!user) {
		  return res.status(401).json({ message: 'Invalid username or password' });
		}
	
		// Validate password
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) {
		  return res.status(401).json({ message: 'Invalid username or password' });
		}
	
		const vaildRole =  ("Registered" === user.role);

		if(vaildRole){
			return res.status(401).json({message: 'Invalid role. Your account has not been approved yet'})
		}
		// Generate JWT token
		const token = jwt.sign(
		  { userId: user._id, username: user.username },
		  'my_seceret_key',
		  { expiresIn: '1h' }
		);
	
		// Update user with the new token in database
		await User.findByIdAndUpdate(user._id, { token });
	
		// Send response
		res.status(200).json({
		  message: 'Authentication successful',
		  token,
		  userId: user._id
		});
	  } catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Internal server error' });
	  }

});
//endpoint for power cycle
app.post("/api/lamp/power", authMiddleware, async (req, res) => {
	const { data} = req.body;
	//console.log(username);
	//console.log(password);
	console.log(data);
/*
	try {
		const user = await User.findOne({ username });
		if (!user) return res.status(400).json({ message: 'Invalid credentials' });
	
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
	
		const token = jwt.sign({ id: user._id}, 'your_secret_key', { expiresIn: '1h' });
		res.status(200).json({ token, message: 'Logged in successfully' });
	  } catch (err) {
		res.status(500).json({ message: 'Error logging in', error: err.message });
	  }
*/
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
	rgb(data);
	res.send(`trying to change light to ${data}`);
});


app.listen(3000, () => console.log("Running!"));