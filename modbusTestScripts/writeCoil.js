// 'RIR' contains the "Function Code" that we are going to invoke on the remote device
//var RDI = require('modbus-stack').FUNCTION_CODES.READ_DISCRETE_INPUTS;
//var RDI = require('./modbus-stack').FUNCTION_CODES.READ_DISCRETE_INPUTS;
require("./modbus-stack");

// IP and port of the MODBUS slave, default port is 502
var client = require('./modbus-stack/client').createClient(502, '192.168.70.22');

// 'req' is an instance of the low-level `ModbusRequestStack` class
var req = client.request(5,
                         0, 
                         true);

req.on('response', function(inputs) {
    // An Array of length 50 filled with Numbers of the current registers.
    console.log(inputs);
    var req3 = client.request(1,
                             0,
                             2);
        
    req3.on('response', function(coils) {
        // An Array of length 50 filled with Numbers of the current registers.
        console.log("return");
        console.log(coils);
        // 'req' is an instance of the low-level `ModbusRequestStack` class
        var req2 = client.request(5,
                                 0, 
                                 false);
        
        req2.on('response', function(inputs) {
            // An Array of length 50 filled with Numbers of the current registers.
            console.log(inputs);
            var req4 = client.request(1,
                                     0,
                                     2);
        
            req4.on('response', function(coils) {
                // An Array of length 50 filled with Numbers of the current registers.
                console.log("return");
                console.log(coils);
                client.end();
            });
        });
        
        
    });
});
