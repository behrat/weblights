var http_server = require('./static_server.js').start();
var io = require('socket.io').listen(http_server);
io.set('log level', 1); // reduce logging

var modbus = require('./modbus-stack');
var dcLightSwitch = null;
var pollSwitchInterval = null;
var keepAliveInterval = null;
var clientCount = 0;

function pollSwitch() {
    dcLightSwitch.request(modbus.FUNCTION_CODES.READ_COILS, 0, 2,
      function(error, response) {
        if(error) {
          console.log(error);
        }
        if(!response) {
          console.log("No response");
          return; 
        }

        if(dcLightSwitch.input != response[1]) {
          dcLightSwitch.relay = response[0];
          dcLightSwitch.input = response[1];
          console.log("Sending dc_lights: " + dcLightSwitch.input);
          io.sockets.emit("dc_lights", dcLightSwitch.input);
        }

      }
    );
}

function keepAlive() {
    io.sockets.emit("keep_alive")
}

io.sockets.on('connection', function(client) {
  console.log("Client connected: " + client)
  client.on('toggle_lights', function() {
    console.log("Toggling lights")
    dcLightSwitch.request(// Function Code: 16
			  modbus.FUNCTION_CODES.WRITE_MULTIPLE_REGISTERS,
			  16,
			  [52429,15820],
      function(registers) {
        console.log("Response: " + registers)
      }
    );	  
  });


  client.on('disconnect', function() {
    console.log("Client disconnected: " + client)
    clientCount--;
    if(clientCount == 0) {
      console.log("Stopping polling")
      clearInterval(pollSwitchInterval)
      clearInterval(keepAliveInterval)
      dcLightSwitch.end();
      dcLightSwitch = null;
    }
  });
  
  clientCount++;
  if(dcLightSwitch == null) {
    console.log("Starting polling")
    dcLightSwitch = require("./modbus-stack/client").createClient(502, '192.168.70.22');
    pollSwitchInterval = setInterval(pollSwitch, 10000);
    keepAliveInterval = setInterval(keepAlive, 50000);
  } else {
    client.emit("dc_lights", dcLightSwitch.input);
  }
});

