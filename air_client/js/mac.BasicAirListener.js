///Helper for Air Native Process Listener
mac.BasicAirListener = function BasicAirListener(processName, onInit) {

    var listener;

	
    var log = function log(message) {
        	console.log(processName + ': ' + message)
        }
	    //These listeners are internal and for logging
	    
	var listeners = {}	
	
	listeners.onOutputData = function (event) {
	    	        var process = listener.getProcess();
		            log("DATA: " + process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable)); 
		       		//data =  process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable); 
		        }
				
	listeners.onErrorData =  function onErrorData(event) {
	  				var process = listener.getProcess();
		            log("ERROR: " + process.standardError.readUTFBytes(process.standardError.bytesAvailable)); 
		       		 //error = process.standardError.readUTFBytes(process.standardError.bytesAvailable); 
		        }
				
	listeners.onExit = function onExit(event) {
	            	log("EXIT: Process exited with code " + event.exitCode);
	            	//exitCode = event.exitCode;
	        	}
				
	listeners.onIOError =  function onIOError(event) {
	            	log('IOERROR: ' + event.type + ' ' + event.toString());
	            	//error = event.toString();
	 }
	    	
	listener = {
	    log          : log,
	    listeners    : listeners,
		processName  : processName,
		getProcess   : function getProcess() {
			return listener.process;
		},
  		init 		 : function init(process) {
			listener.process = process;
        	process.addEventListener(air.ProgressEvent.STANDARD_OUTPUT_DATA, listeners.onOutputData);
            process.addEventListener(air.ProgressEvent.STANDARD_ERROR_DATA, listeners.onErrorData);
            process.addEventListener(air.NativeProcessExitEvent.EXIT, listeners.onExit);
			process.addEventListener(air.IOErrorEvent.STANDARD_INPUT_IO_ERROR, listeners.onIOError);
            process.addEventListener(air.IOErrorEvent.STANDARD_OUTPUT_IO_ERROR, listeners.onIOError);
            process.addEventListener(air.IOErrorEvent.STANDARD_ERROR_IO_ERROR, listeners.onIOError);
        }
  	}
	
	return listener;
}
