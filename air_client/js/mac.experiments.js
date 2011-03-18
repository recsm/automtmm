//////////////////////////////////////////////////////
////   EXPERIMENT MANAGERS					  	  ////
//////////////////////////////////////////////////////

mac.experiments = {
	//get an experiment directory, returns a path string
	getExperimentDirectory : function getExperimentDirectory (round, experiment) {
		var dirPath   = 'MacMTMM/repository/round_' + round + '/' + experiment
		return air.File.documentsDirectory.resolvePath(dirPath).nativePath;
	},
	//get an experiment air file object
	getExperimentFile : function getExperimentFile (round, experiment, fileName) {
		var filePath   = mac.experiments.getExperimentDirectory(round, experiment) + '/'+ fileName
		return air.File.documentsDirectory.resolvePath(filePath)
	},
	//get the experiment file contents firectly
	getExperimentFileContents : function getExperimentFileContents (round, experiment, fileName) {
		 var stream = new air.FileStream();
		 var file = mac.experiments.getExperimentFile(round, experiment, fileName)
		 stream.open(file, air.FileMode.READ);
		 var contents = stream.readUTFBytes(stream.bytesAvailable);
		 stream.close();
		 return contents
	},
	//get all round directories (returns air file objects)
	getRoundDirectories : function getRounds() {
		var roundDirs = []
		var repositoryFolder = air.File.documentsDirectory.resolvePath('MacMTMM/repository')
		var children = repositoryFolder.getDirectoryListing();
		for (var i in children) {
			var child = children[i]
			if (child.isDirectory) {
				roundDirs.push(child)
			}
		}
		return roundDirs;
	},
	//Get a list of rounds as integers 1, 2, 3 etd
	getRounds : function getRounds() {
		var rounds = []
		var roundDirectories = mac.experiments.getRoundDirectories();
		for (var i in roundDirectories) {
			var dirPath = roundDirectories[i].nativePath;
			if(dirPath.indexOf('round_') != -1) {
				var round = 1 * dirPath.substr(dirPath.lastIndexOf('_') +1);					
				rounds.push(round);
			}
		}
		return rounds;
	},
	//Get a list of all experiments, returns experiments, returns list of names of experiments
	getExperiments : function getExperiments(round) {
		var experiments = []
		var roundFolder = air.File.documentsDirectory.resolvePath('MacMTMM/repository/round_' + round); 
		var children = roundFolder.getDirectoryListing();
		for (var i in children) {
			var child = children[i]
			if (child.isDirectory) {
			    var path = child.nativePath;
				var experimentName = path.substr(path.lastIndexOf(air.File.separator) + 1);
				experiments.push(experimentName)
			}
		}
		return experiments;
	},
	//Returns a list of experiments with round
	getAllExperiments: function getExperimentList() { 
	    var experiments = []
		var rounds = mac.experiments.getRounds()
		for (var i in rounds) {
			var round = rounds[i];
			var roundExperiments = mac.experiments.getExperiments(round)
			for (var j in roundExperiments) {
			    experiment = roundExperiments[j]
				experiments.push({
					round : round,
					experiment : experiment
				});
			}
		}
		return experiments;
	},
	//A helper to find all experiments accross all local branches
	ExperimentLister : function ExperimentLister() {
		
	}
}
