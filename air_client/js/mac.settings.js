mac.settings = {
		//These are the default settings which get 
		//saved to MACMTMM/settings.json
	   	lisrelCommand        : 'C:\\lisrel87\\lisrel87.exe',
	    gitCommand           : 'C:\\msysgit\\msysgit\\bin\\git.exe',
	    masterRepository     : 'git@github.com:recsm/MTMMTest.git',
	    gitBranchName        : 'default',
		userName             : 'Default User',
		userEmail            : 'user@example.com'
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
		mac.controllers.main.onSettingsChanged();
		mac.versions.onSettingsChanged();
	},
	//Load the settings back in from the file
	load : function load() {
		var settingsFile = mac.settingsManager.getSettingsFile();
		var fs = new air.FileStream();
		fs.open(settingsFile, air.FileMode.READ);
		var settingsJson = fs.readUTFBytes(fs.bytesAvailable);
		fs.close();
		mac.settings = dojo.fromJson(settingsJson);
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