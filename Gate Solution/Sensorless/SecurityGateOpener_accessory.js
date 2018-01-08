//START SETUP
var gateName = 'Security Gate';
var uuidTag = 'gate';
//END SETUP

var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var cmd=require('node-cmd');

var SECURITY_GATE = {
  open: function() {
    console.log("Opening the Gate!");
    cmd.run('sudo python /home/pi/HAP-NodeJS/python/gate.py');
  },
  identify: function() {
    console.log("Identify the Gate");
  }
};

var gateUUID = uuid.generate('hap-nodejs:accessories:'+uuidTag);
var gate = exports.accessory = new Accessory(gateName, gateUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
gate.username = "C1:5D:3F:EE:5E:FA"; //edit this if you use Core.js
gate.pincode = "031-45-154";

gate
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Gatemaster")
  .setCharacteristic(Characteristic.Model, "Rev-1")
  .setCharacteristic(Characteristic.SerialNumber, "TW000165");

gate.on('identify', function(paired, callback) {
  SECURITY_GATE.identify();
  callback();
});

gate
  .addService(Service.SecurityGateOpener, "Security Gate")
  .setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED) // force initial state to CLOSED
  .getCharacteristic(Characteristic.TargetDoorState)
  .on('set', function(value, callback) {

    if (value == Characteristic.TargetDoorState.OPEN) {
      SECURITY_GATE.open();
      callback();
    }
  });

gate
  .getService(Service.SecurityGateOpener)
  .getCharacteristic(Characteristic.CurrentDoorState)
  .on('get', function(callback) {

    var err = null;

    if (SECURITY_GATE.opened) {
      console.log("Query: Is Gate Open? Yes.");
      callback(err, Characteristic.CurrentDoorState.OPEN);
    }
    else {
      console.log("Query: Is Gate Open? No.");
      callback(err, Characteristic.CurrentDoorState.CLOSED);
    }
  });
