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
	//get the experiment file contents directly
	getExperimentFileContents : function getExperimentFileContents (round, experiment, fileName) {
		 var stream = new air.FileStream();
		 var file = mac.experiments.getExperimentFile(round, experiment, fileName)
		 stream.open(file, air.FileMode.READ);
		 var contents = stream.readUTFBytes(stream.bytesAvailable);
		 stream.close();
		 return contents
	},
	//Take a parsed list from mac.versions.parseBranchFileList and get all experiments and rounds
	reduceToExperiments : function reduceToExperiments(list, branchName) {
		var experiments = [];
		for (var i in list) {
			var item = list[i];
			if(item.objectName.indexOf('round_') == -1) continue;
			var parts = item.objectName.split('/');
			var round = 1 * parts[0].substr(parts[0].lastIndexOf('_') +1);
			var name  = parts[1];				
			var found = false;
			for (var j in experiments) {
				var experiment = experiments[j];
				if (experiment.round == round && experiment.name == name) {
					found = true;
					break;
				}
			}
			if(!found) {
				experiments.push({
					name   : name,
					round  : round,
					branch : branchName
				})
			}
		}
		return experiments;
	},
	//Does some parsing on a branch ls-tree to find rounds and experiments
	loadExperimentsFromBranch : function loadExperimentsFromBranch(branchName) {
		var processListener = new mac.BasicAirListener('git ls-tree');
		processListener.listeners.onOutputData = function(event){
			var process = processListener.getProcess()
            var data = process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable);
            parsedList = mac.versions.parseBranchFileList(data)
			var experiments = mac.experiments.reduceToExperiments(parsedList, branchName)
			console.log(experiments)
		}
		mac.versions.getBranchFileList(branchName, processListener);
	},
	loadRemoteExperiments : function loadRemoteExperiments() {
		mac.models.Branch.fetch({onComplete: function(items, request) {
			for (var i in items) {
				var branchName = items[i].name;
				if (banchName == 'origin/' + mac.settings.branchName) continue;
				mac.experiments.loadExperimentsFromBranch(branchName);
			}
		}});
	},
	loadRemoteBranches : function loadBranches(onComplete) {
		var processListener = new mac.BasicAirListener('git branch');
		processListener.listeners.onOutputData = function (event) {
		    var process = processListener.getProcess()
            var data = process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable);
            parsedList = mac.versions.parseRemoteBranchList(data)
            for (var i in parsedList) {
				var branchName = parsedList[i]
            	mac.models.Branch.newItem({name : branchName});
            }
            if (typeof(onComplete) != 'undefined') {
        		onComplete();
        	}
        }
		mac.versions.getRemoteBranchList(processListener);
	},
	refreshExperimentList : function refreshExperimentList() {
		//Load local data
		mac.experiments.loadExperimentsFromBranch(mac.settings.gitBranchName);
		
		//Load remote data
		mac.experiments.loadRemoteBranches(function () {
			//After the branches are loaded, then loop through the branches and get experiments
			mac.experiments.loadRemoteExperiments();
		})
	},
}
