// 'RIR' contains the "Function Code" that we are going to invoke on the remote device
//var RDI = require('modbus-stack').FUNCTION_CODES.READ_DISCRETE_INPUTS;
var modbus = require("./modbus-stack");
var RC = modbus.FUNCTION_CODES.READ_COILS;

console.log("connecting");
// IP and port of the MODBUS slave, default port is 502
var client = require("./modbus-stack/client").createClient(502, '192.168.70.22');
console.log("requesting");

// 'req' is an instance of the low-level `ModbusRequestStack` class
var req = client.request(RC,
                         0, 
                         2);
console.log("after request");

req.on('response', function(coils) {
    console.log("response");
    // An Array of length 50 filled with Numbers of the current registers.
    console.log("return");
    console.log(coils);
    client.end();
});
