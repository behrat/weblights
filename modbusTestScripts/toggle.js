var modbus = require('./modbus-stack');

// IP and port of the MODBUS slave, default port is 502
var client = require('./modbus-stack/client').createClient(502, '192.168.70.22');

// 'req' is an instance of the low-level `ModbusRequestStack` class
var req = client.request(modbus.FUNCTION_CODES.WRITE_MULTIPLE_REGISTERS, // Function Code: 16
                         16,
                         [52429,15820]);  // Read 50 contiguous registers from 0

// 'response' is emitted after the entire contents of the response has been received.
req.on('response', function(registers) {
  // An Array of length 50 filled with Numbers of the current registers.
  console.log(registers);
  client.end();
});
