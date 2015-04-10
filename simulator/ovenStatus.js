//@module
var PinsSimulators = require('PinsSimulators');
var configure = exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
			header : { 
				label : "Oven Status", 
				name : "On = 1, Off = 0", 
				iconVariant : PinsSimulators.SENSOR_LED 
			},
			axes : [
				new PinsSimulators.DigitalOutputAxisDescription(
					{
						valueLabel : "Oven Status",
						valueID : "ovenStatus"
					}
				),
			]
		});
}
var close = exports.close = function() {
	shell.delegate("removeSimulatorPart", this.pinsSimulator);
}
var turnOn = exports.turnOn = function() {
	this.setValue(1);
}
var turnOff = exports.turnOff = function() {
	this.setValue(0);
}
var setValue = exports.setValue = function(value) {
	this.pinsSimulator.delegate("setValue", "ovenStatus", value);
}
exports.pins = {
			ovenStatus: { type: "Digital", direction: "output" }
		};