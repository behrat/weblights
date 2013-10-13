// 'RIR' contains the "Function Code" that we are going to invoke on the remote device
//var RDI = require('modbus-stack').FUNCTION_CODES.READ_DISCRETE_INPUTS;
//var RDI = require('./modbus-stack').FUNCTION_CODES.READ_DISCRETE_INPUTS;
require("./modbus-stack");

// IP and port of the MODBUS slave, default port is 502
var client = require('./modbus-stack/client').createClient(502, '192.168.70.22');

// 'req' is an instance of the low-level `ModbusRequestStack` class
var req = client.request(2,
                         0, 
                         1);

req.on('response', function(inputs) {
    // An Array of length 50 filled with Numbers of the current registers.
    console.log(inputs);
    client.end();
});
