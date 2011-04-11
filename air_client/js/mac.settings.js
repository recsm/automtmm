mac.settings = {
		//These are the default settings which get 
		//saved to MACMTMM/settings.json
	   	lisrelCommand        : 'C:\\lisrel87\\lisrel87.exe',
	    gitCommand           : 'C:\\Archivos de programa\\Git\\bin\\git.exe',
		pythonCommand        : 'C:\\Python27\\python.exe',
	    masterRepository     : 'git@github.com:recsm/MTMMArchive.git',
	    gitBranchName        : 'default',
		userName             : 'Default User',
		userEmail            : 'user@example.com',
		diffMode			 : 'external',
		diffTool			 : 'kdiff3'
 	}
	
mac.settingsManager = {
	//write the settings to a file
	save  : function save () {
		var settingsJson = dojo.toJson(mac.settings, true);
		var settingsFile = mac.settingsManager.getSettingsFile();
		var fs = new air.FileStream();
		fs.open(settingsFile, air.FileMode.WRITE);
		fs.writeUTFBytes(settingsJson);
		fs.close();
		//These should really be proper event listeners, but this will work for the moment
		if (mac.settingsManager.verify()) {
			mac.controllers.main.onSettingsChanged();
			mac.versions.onSettingsChanged();
		}
	},
	//Load the settings back in from the file
	load : function load() {
		var settingsFile = mac.settingsManager.getSettingsFile();
		var fs = new air.FileStream();
		fs.open(settingsFile, air.FileMode.READ);
		var settingsJson = fs.readUTFBytes(fs.bytesAvailable);
		fs.close();
		var settings = dojo.fromJson(settingsJson);
		
		for (var prop in settings) {
			mac.settings[prop] = settings[prop];
		}
	},
	//Verify the settings are correct
	verify : function (){
		var valid = true;
		var checkFiles = [];
		checkFiles.push(mac.settings.lisrelCommand);
		checkFiles.push(mac.settings.gitCommand);
		checkFiles.push(mac.settings.pythonCommand);
		
		for (var i in checkFiles) {
			var file = new air.File();
			file.nativePath = checkFiles[i];
			if(!file.exists) {
				console.log(checkFiles[i] + ' could not be found, please check your settings');
				valid = false;
			}
		}
		
		if (valid) {
			if (mac.settings.gitBranchName == 'default') {
				console.log('You must change the gitBranchName in settings to be a custom name, not "default", please check your settings');
			}
			
			if (mac.settings.userName  == 'Default User') {
				console.log('You must change the userName in settings to be a custom name, not "Default User", please check your settings');
			}
			
			if (mac.settings.userEmail  == 'user@example.com') {
				console.log('You must change the userEmail in settings to be a custom email, not "user@example.com", please check your settings');
			}
		}
		
		return valid;
	},
	init : function init() {
		//Check if our settings file exists yet
		//If not we save it
		var settingsFile = mac.settingsManager.getSettingsFile();
		if (!settingsFile.exists) {
			mac.settingsManager.save();
		}
		else {
			mac.settingsManager.load();
		}
	},
	getSettingsFile : function getSettingsFile() {
		return air.File.documentsDirectory.resolvePath('MacMTMM/settings.json');
	} 
}