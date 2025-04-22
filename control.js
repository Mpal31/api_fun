var unirest = require('unirest');

function control (func, data) {
    if(func === "brightness"){
        data = parseInt(data);
    }

    var req = unirest('PUT', process.env.endpoint)
    .headers({
            'Content-Type': 'application/json',
        'Govee-API-Key': process.env.api_key
    })

    .send(JSON.stringify({
        "device": process.env.device,
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

module.exports = control;