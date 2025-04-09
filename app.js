//curl structure
//curl -X POST http://192.168.1.19:3000/api/lamp/color -H "Content-Type: application/json" -d '{"data": "purple"}'

const express = require('express');

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const User = require('./user.js');
const control = require('./control');

const rgb = require('./change_color.js');
const authMiddleware = require('./authMiddleware.js');

//used to process api keys
require('dotenv').config();


const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/authdb', {
	useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection failed:', err));


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
		  process.env.secret,
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
	const {data} = req.body;
	
	if(data.toLowerCase() === "off" || data.toLowerCase() === "on" ){

		res.status(200).json({ message: `Turning light ${data}` });
		control("turn", data);
	
	}else{
		res.status(300).json({ message: `Bad request` });
	}


});

//endpoint to set brightness
app.post("/api/lamp/bright", (req, res) => {
        const {data} = req.body;
        console.log(data);
	if(parseInt(data) > 0 && parseInt(data) <= 100){
        	res.status(200).json({message: `bright is now ${data}`});
		control("brightness", data);
	}
	else{
		res.status(400).json({message: `Bad request`})
	}

});

//endpoint to change color
app.post("/api/lamp/color", authMiddleware, async (req, res) => {
	const {data} = req.body;
	console.log(data);
	rgb(data);
	res.send(`trying to change light to ${data}`);
});


app.listen(3000, () => console.log("Running!"));