//@module
var PinsSimulators = require('PinsSimulators');
var configure = exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
			header : { 
				label : "Oven Temperature", 
				name : "Current Oven Temperature", 
				iconVariant : PinsSimulators.SENSOR_KNOB 
			},
			axes : [
				new PinsSimulators.AnalogInputAxisDescription(
					{
						valueLabel : "Value",
						valueID : "curOvenTemp",
						speed : 0.1
					}
				),
			]
		});
}
var close = exports.close = function() {
	shell.delegate("removeSimulatorPart", this.pinsSimulator);
}
var read = exports.read = function() {
	var axes = this.pinsSimulator.delegate("getValue");
		return axes.curOvenTemp;
}
exports.pins = {
			curOvenTemp: { type: "A2D" }
		};