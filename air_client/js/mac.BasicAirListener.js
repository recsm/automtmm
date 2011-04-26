///Helper for Air Native Process Listener
mac.BasicAirListener = function BasicAirListener(processName, onInit) {

    var listener;
	var data = '';
	
    var log = function log(message) {
        	console.log(processName + ': ' + message)
        }
	   
	    
	var listeners = {}	
	
	listeners.onOutputData = function (event) {
	    	        var process = listener.getProcess();
					var outData = process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable);
		            listener.data += outData;
					
					if(outData.length > 300) {
						var logData = outData.substr(0,300) + '...';
					} else {
						var logData = outData;
					}
					
					listener.log("DATA: " + logData); 
		       		//data =  process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable); 
		        }
				
	listeners.onErrorData =  function onErrorData(event) {
	  				var process = listener.getProcess();
		            log("ERROR: " + process.standardError.readUTFBytes(process.standardError.bytesAvailable)); 
		       		 //error = process.standardError.readUTFBytes(process.standardError.bytesAvailable); 
		        }
				
	listeners.onExit = function onExit(event) {
	            	log("EXIT: Process exited with code " + event.exitCode);
					listeners.onComplete(listener.data, event.exitCode);
	        	}
				
	listeners.onIOError =  function onIOError(event) {
	            	log('IOERROR: ' + event.type + ' ' + event.toString());
	            	//error = event.toString();
	 }
	 
	listeners.onComplete =  function onComplete(data, exitCode) {
		//Do custom stuff with the data
		//Probably the easiest place to hook into the listener and get the complete data      
	}
	
	listeners.standardInputProgress = function(event){
                    log("standardInputProgress", event);
               }
	    	
	listeners.progress = function(event){
                    log("progress", event);
               }
			   
	listeners.socketData = function(event){
                    log("socketData", event);
               }
	
	listener = {
	    log          : log,
	    listeners    : listeners,
		processName  : processName,
		data         : data,
		getProcess   : function getProcess() {
			return listener.process;
		},
  		init 		 : function init(process) {
			listener.process = process;
			process.addEventListener(air.ProgressEvent.SOCKET_DATA, listeners.socketData);
			process.addEventListener(air.ProgressEvent.PROGRESS, listeners.progress);
		    process.addEventListener(air.ProgressEvent.STANDARD_INPUT_PROGRESS, listeners.standardInputProgress);
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
