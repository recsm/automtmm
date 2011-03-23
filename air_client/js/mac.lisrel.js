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
		processArgs.push("OUT");
		nativeProcessStartupInfo.arguments = processArgs; 
		var process = new air.NativeProcess(); 
		processListener.init(process)
		process.start(nativeProcessStartupInfo); 
	},
	
	parseToMatrix : function parseToMatrix (outFileNativePath,processListener) {
		var nativeProcessStartupInfo = new air.NativeProcessStartupInfo(); 
		var pythonExecutable = new air.File();
		pythonExecutable.nativePath = mac.settings.pythonCommand;
		nativeProcessStartupInfo.executable = pythonExecutable; 
		var pythonScript = air.File.applicationDirectory.resolvePath('parse_lisrel_out.py').nativePath;
		var processArgs = new air.Vector["<String>"]();
		processArgs.push(pythonScript); 
		processArgs.push(outFileNativePath); 
		nativeProcessStartupInfo.arguments = processArgs; 
		var process = new air.NativeProcess(); 
		processListener.init(process)
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