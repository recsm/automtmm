//////////////////////////////////////////////////////
////   LISREL       							  ////
//////////////////////////////////////////////////////
mac.lisrel = {
	//Run a model in lisrel, you should provide the path and a processListener
	runModel: function (sourceFileNativePath, processListener) {
	
		var nativeProcessStartupInfo = new air.NativeProcessStartupInfo(); 
		var lisrelExecutable = new air.File();
		lisrelExecutable.nativePath = mac.settings.lisrelCommand;
		nativeProcessStartupInfo.executable = lisrelExecutable; 
		var processArgs = new air.Vector["<String>"](); 
		processArgs.push(sourceFileNativePath); 
		processArgs.push("OUT.LATEST");
		nativeProcessStartupInfo.arguments = processArgs; 
		var process = new air.NativeProcess(); 
		processListener.init(process)
		process.start(nativeProcessStartupInfo); 
	},
	//Call python script
	parseToMatrix : function parseToMatrix (lisrelOutFileNativePath, processListener) {
		var nativeProcessStartupInfo = new air.NativeProcessStartupInfo(); 
		var pythonExecutable = new air.File();
		pythonExecutable.nativePath = mac.settings.pythonCommand;
		nativeProcessStartupInfo.executable = pythonExecutable; 
		var pythonScript = air.File.applicationDirectory.resolvePath('py/lisrel/jsonify_lisrel.py').nativePath;
		var processArgs = new air.Vector["<String>"]();
		
		//Since we are calling python.exe, then the first arg is the python script
		var args = [pythonScript,"-i", lisrelOutFileNativePath, "-o", lisrelOutFileNativePath + '.JSON' ];
		var processArgs = new air.Vector["<String>"](); 
		for (var i in args) {
			processArgs.push(args[i]);
		}
		nativeProcessStartupInfo.arguments = processArgs; 
		var process = new air.NativeProcess(); 
		processListener.init(process)
		processListener.log('Calling:: '+  mac.settings.pythonCommand + ' '+ args.join(' '));
		process.start(nativeProcessStartupInfo); 
	},
	//Call python exe (unused)
	__parseToMatrix : function parseToMatrix (lisrelOutFileNativePath, processListener) {
		var nativeProcessStartupInfo = new air.NativeProcessStartupInfo(); 
		var pythonCommand = air.File.applicationDirectory.resolvePath('py/lisrel/dist/jsonify_lisrel.exe').nativePath;
		nativeProcessStartupInfo.executable = pythonCommand; 
		var processArgs = new air.Vector["<String>"]();
		
		//Since we are calling python.exe, then the first arg is the python script
		var args = ["-i", lisrelOutFileNativePath, "-o", lisrelOutFileNativePath + '.JSON' ];
		var processArgs = new air.Vector["<String>"](); 
		for (var i in args) {
			processArgs.push(args[i]);
		}
		nativeProcessStartupInfo.arguments = processArgs; 
		var process = new air.NativeProcess(); 
		processListener.init(process)
		processListener.log('Calling:: '+  pythonCommand + ' '+ args.join(' '));
		process.start(nativeProcessStartupInfo); 
	},
	
	saveModelToFile : function saveModelToFile(round, experiment, modelContent) {
		//Write the model to disk
		var cr       = air.File.lineEnding;
		modelContent = modelContent.replace('\n', cr)
		var ls8AirFile = mac.experiments.getExperimentFile(round, experiment, 'INPUT.LS8')
		var fs = new air.FileStream();
		fs.open(ls8AirFile, air.FileMode.WRITE);
		fs.writeUTFBytes(modelContent);
		fs.close();
		return ls8AirFile; 
	}
}