//@program
var whiteSkin = new Skin( { fill:"white" } );
var labelStyle = new Style( { font: "bold 20px", color:"black" } );

var ovenOn = false;
var goalOvenTemp = 0;
var smokeDetectedAlertSent = false;
var isCurrentlyPreheating = false;
var curOvenTemp = 0;



/**** For Easier Logging ***/
//Whether logging messages should be displayed or not
var logging = true;
//Displays message if logging turned on
var myLog = function(message){if(logging){traceLine(message)}};
//Displays message, appending a newline symbol
var traceLine = function(message){trace(message+"\n")};

/* Commands from Phone */

Handler.bind("/turnOnOven", Behavior({
	onInvoke: function(handler, message){
		myLog("device recieved turn on command")
		application.invoke(new MessageWithObject("pins:/ovenStatus/turnOn"));
		ovenOn = true;
		message.responseText = JSON.stringify( { ovenOn: ovenOn } );
		message.status = 200;
		myLog("oven has been turned on");
	}
}));
Handler.bind("/turnOffOven", Behavior({
	onInvoke: function(handler, message){
		myLog("device recieved turn off command")
		application.invoke(new MessageWithObject("pins:/ovenStatus/turnOff"));
		ovenOn = false;
		message.responseText = JSON.stringify( { ovenOn: ovenOn } );
		message.status = 200;
		myLog("oven has been turned off");
	}
}));
Handler.bind("/setGoalTemp", Behavior({
	onInvoke: function(handler, message){
		myLog("device recieved set goal temp command")
		goalOvenTemp = message.requestText
		//push to oven through an output pin
		message.responseText = JSON.stringify( { goalTemp: goalOvenTemp } );
		message.status = 200;
		myLog("oven goal temp has been set");
	}
}));
Handler.bind("/setTimer", Behavior({
	onInvoke: function(handler, message){
		myLog("device recieved set timer command")
		//NEED TO IMPLEMENT
		//application.invoke(new MessageWithObject("pins:/ovenStatus/turnOff"));
		var timerLength = message.requestText;
		message.responseText = JSON.stringify( { timerLength: timerLength } );
		message.status = 200;
		myLog("timer set");
	}
}));
Handler.bind("/getCurrentOvenTemp", Behavior({
	onInvoke: function(handler, message){
		myLog("device recieved get cur temp command")
		message.responseText = JSON.stringify( { curTemp: curOvenTemp } );
		message.status = 200;
		myLog("sent cur temp");
	}
}));



var smokeDetectedLabel = new Label({left:0, right:0, height:20, string:"False", style: labelStyle});
var curOvenTempLabel = new Label({left:0, right:0, height:20, string:"0", style: labelStyle});
var isPreheatingLabel = new Label({left:0, right:0, height:20, string:"False", style: labelStyle});

var mainColumn = new Column({
	left: 0, right: 0, top: 0, bottom: 0, skin: whiteSkin,
	contents: [
		new Line({left:0, right:0, bottom:0, skin: whiteSkin, 
			contents:[
				new Label({left:0, right:0, height:40, string:"CurOvenTemp:", style: labelStyle}),
				curOvenTempLabel
			]
		}),
		new Line({left:0, right:0, bottom:0, skin: whiteSkin,
			contents:[
				new Label({left:0, right:0, height:40, string:"Smoke Detected:", style: labelStyle}),
				smokeDetectedLabel
			]
		}),
	]
});



/********* SENSORS *********/


/* Updates from Sensors */

Handler.bind("/gotCurOvenTemp", Object.create(Behavior.prototype, {
	onInvoke: { value: function( handler, message ){
        		curOvenTemp = message.requestObject;
        		curOvenTempLabel.string = (curOvenTemp*600).toFixed(1) + "*F";
        		//send data to phone
        		//message = new Message(phoneURL + "updateCurOvenTemp");
        		//message.requestText = curOvenTemp;
        		//application.invoke(message, Message.JSON);
        	}}
}));

Handler.bind("/gotSmokeDetectorResults", Object.create(Behavior.prototype, {
	onInvoke: { value: function( handler, message ){
        		var smokeDetected = message.requestObject;
        		if(smokeDetected){
        			if(!smokeDetectedAlertSent){        			
	        			myLog("SMOKE DETECTED ON DEVICE!\n");
	        			smokeDetectedAlertSent = true;
	        			smokeDetectedLabel.string = "True";
	        			//update status message
	        			//smokeDetectedLabel.string = smokeDetected.toFixed(2) + "%";
	        			
	        			//turn off oven
	        			
	        			//send alert to phone
	        			message = new Message(phoneURL + "smokeDetectedAlert");
	        			message.requestText = smokeDetected;
	        			application.invoke(message, Message.JSON);
        			}
        		} else{
        			if(smokeDetectedAlertSent){
        				smokeDetectedAlertSent = false;
        				smokeDetectedLabel.string = "False";
        				//send all clear
	        			message = new Message(phoneURL + "smokeDetectedAllClear");
	        			message.requestText = smokeDetected;
	        			application.invoke(message, Message.JSON);
        			}
        		}	
        	}}
}));

/* Create message for communication with hardware pins.
    	   analogSensor: name of pins object, will use later for calling 'analogSensor' methods.
    	   require: name of js or xml bll file.
    	   pins: initializes 'analog' (matches 'analog' object in the bll)
    	  	   	 with the given pin numbers. Pin types and directions
    	  		 are set within the bll.	*/
		application.invoke( new MessageWithObject( "pins:configure", {
        	// current oven temperature: analog number (input pin)
        	curOvenTempSensor: {
                require: "curOvenTemp",
                pins: {
                    curOvenTemp: { pin: 52 }
                }
            },
            //oven on: 1 if on, 0 if not (output pin)
            ovenStatus: {
		        require: "ovenStatus",
		        pins: {
		        	ovenStatus: {pin: 59}
		        }
		    },
		    //smoke detector: 1 if too much smoke, 0 if not (input pin)
		    smokeDetectorSensor: {
		        require: "smokeDetector",
		        pins: {
		        	smokeDetected: {pin: 59}
		        }
		    },
		    // Camera: (input sensor)
		    
		    //NEED TO FIGURE OUT HOW TO DO THIS
		    
        }));
    	
    	/* Use the initialized analogSensor object and repeatedly 
    	   call its read method with a given interval.  */

		application.invoke( new MessageWithObject( "pins:/curOvenTempSensor/read?" + 
			serializeQuery( {
				repeat: "on",
				interval: 20,
				callback: "/gotCurOvenTemp"
		} ) ) );
		application.invoke( new MessageWithObject( "pins:/smokeDetectorSensor/read?" + 
			serializeQuery( {
				repeat: "on",
				interval: 20,
				callback: "/gotSmokeDetectorResults"
		} ) ) );


/* Connecting to Phone */
Handler.bind("/discover", Behavior({
	onInvoke: function(handler, message){
		phoneURL = JSON.parse(message.requestText).url;
		traceLine("discovered phone");
	}
}));
Handler.bind("/forget", Behavior({
	onInvoke: function(handler, message){
		phoneURL = "";
	}
}));		

var ApplicationBehavior = Behavior.template({
	onLaunch: function(application) {
		application.shared = true;
	},
	onDisplayed: function(application) {
		application.discover("smartovenphone.app");
	},
	onQuit: function(application) {
		application.forget("smartovenphone.app");
		application.shared = false;
	},
})

application.add(mainColumn);
application.behavior = new ApplicationBehavior();
myLog("Device running\n");