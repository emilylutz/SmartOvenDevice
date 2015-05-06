//@module
var PinsSimulators = require('PinsSimulators');
var configure = exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
			header : { 
				label : "Smoke Detector", 
				name : "Smoke Detected: 1, Smoke not detected: 0", 
				iconVariant : PinsSimulators.SENSOR_LED 
			},
			axes : [
				new PinsSimulators.DigitalInputAxisDescription(
					{
						valueLabel : "Smoke Detector",
						valueID : "smokeDetected"
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
		return axes.smokeDetected;
}

exports.pins = {
			smokeDetected: { type: "Digital" }
		};