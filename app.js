#!/usr/bin/env nodejs

var http_server = require('./static_server.js').start();
var io = require('socket.io').listen(http_server);
io.set('log level', 1); // reduce logging

var modbus = require('./modbus-stack');
var dcLightStream = null;
var pollSwitchTimeout = null
//var pollSwitchInterval = null;
var keepAliveInterval = null;
var clientCount = 0;

function pollSwitch() {
  dcLightStream.request(modbus.FUNCTION_CODES.READ_COILS, 0, 2,
    function(error, response) {
      if(error) {
        console.log("Polling Error: " + error);
        disconnectLights();
        return;
      }
      if(!response) {
        console.log("No response");
        disconnectLights();
        return; 
      }

      if(dcLightStream.input != response[1]) {
        dcLightStream.relay = response[0];
        dcLightStream.input = response[1];
        console.log("Sending dc_lights: " + dcLightStream.input);
        io.sockets.emit("dc_lights", dcLightStream.input);
      }

      pollSwitchTimeout = setTimeout(pollSwitch, 2000);

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
    dcLightStream.request(// Function Code: 16
			  modbus.FUNCTION_CODES.WRITE_MULTIPLE_REGISTERS,
			  16,
			  [52429,15820],
      function(error, response) {
        console.log("Error: " + error + " Response: " + response)
      }
    );	  
  });

  client.on('disconnect', function() {
    console.log("Client disconnected: " + client)
    clientCount--;
    if(clientCount == 0) {
      disconnectLights();
    }
  });
  
  clientCount++;
  if(dcLightStream == null) {
    connectLights();
  } else {
    client.emit("dc_lights", dcLightStream.input);
  }
});

function connectLights() {
  console.log("Connecting Lights.")
  dcLightStream = require("./modbus-stack/client").createClient(502, '172.20.21.22');
  dcLightStream.on('error', function(error) {
      console.log("Error event! " + error);
      setTimeout(connectLights, 2000);
  });
  dcLightStream.on("connect", function() {
    console.log("Connect event!");
    dcLightStream.removeAllListeners('error');
    lightsConnected();
  });
}

function lightsConnected() {
  console.log("Lights Connected");

  dcLightStream.on('end', function() {
    console.log("End event!")
  });

  dcLightStream.setNoDelay();
  dcLightStream.setTimeout(5000, function() {
        console.log("Timeout Callback!");
        disconnectLights();
  });
  
  dcLightStream.on('error', function(error) {
      console.log("Error event! " + error);
  });
  dcLightStream.on('close', function(had_error) {
    console.log("Close event! Error: " + had_error)
    lightsDisconnected();
    if(clientCount > 0) connectLights();
  });


  pollSwitch();
//  pollSwitchInterval = setInterval(pollSwitch, 2000);
  keepAliveInterval = setInterval(keepAlive, 50000);
}

function disconnectLights() {
  console.log("Disconnecting Lights")
  if(dcLightStream == null) return;
  dcLightStream.destroy();
}

function lightsDisconnected() {
  console.log("Lights Disconnected");
  clearTimeout(pollSwitchTimeout);
  // clearInterval(pollSwitchInterval);
  clearInterval(keepAliveInterval);
  dcLightStream = null;
}

