var unirest = require('unirest');
function rgb (color) {
    const {spawn} = require('child_process');
    // spawn new child process to call the python script 
    // and pass the variable values to the python script
    const python = spawn('python', ['./color_lookup.py', color]);
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



module.exports = rgb;

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
