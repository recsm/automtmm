///Helper for Air Native Process Listener
mac.BasicAirListener = function BasicAirListener(processName, onInit) {

    var listener = this;
    var log = function log(message) {
        	console.log(processName + ' ' + message)
        }
    //These listeners are internal and for logging
    var listeners = {
    	onOutputData : function onOutputData(event) {
    	        var process = listener.process;
	            log("DATA: " + process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable)); 
	       		//data =  process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable); 
	        },
  		onErrorData  : function onErrorData(event) {
  				var process = listener.process;
	            log("ERROR: " + process.standardError.readUTFBytes(process.standardError.bytesAvailable)); 
	       		 //error = process.standardError.readUTFBytes(process.standardError.bytesAvailable); 
	        },
  	    onExit 		 : function onExit(event) {
  	    		var process = listener.process;
            	log("EXIT: Process exited with code " + event.exitCode);
            	//exitCode = event.exitCode;
        	},
  		onIOError 	 :  function onIOError(event) {
  				var process = listener.process;
            	log('IOERROR: ' + event.toString());
            	//error = event.toString();
        	}
    }
        
		return  {
		    log          : log,
		    process      : false,
		    onExit       : listeners.onExit,
		    onOutputData : listeners.onOutputData,
		    onErrorData  : listeners.onErrorData,
		    onIOError	 : listeners.IOError,
  		init 		 : function init(process) {
  			listener.process = process;
        	process.addEventListener(air.ProgressEvent.STANDARD_OUTPUT_DATA, listeners.onOutputData);
            process.addEventListener(air.ProgressEvent.STANDARD_ERROR_DATA, listeners.onErrorData);
            process.addEventListener(air.NativeProcessExitEvent.EXIT, listeners.onExit);
            process.addEventListener(air.IOErrorEvent.STANDARD_OUTPUT_IO_ERROR, listeners.onIOError);
            process.addEventListener(air.IOErrorEvent.STANDARD_ERROR_IO_ERROR, listeners.onIOError);
        }
  	}
}
