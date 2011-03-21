//////////////////////////////////////////////////////
////   EXPERIMENT MANAGERS					  	  ////
//////////////////////////////////////////////////////

mac.experiments = {
	//get a local experiment directory, returns a path string
	getExperimentDirectory : function getExperimentDirectory (round, experiment) {
		var dirPath   = 'MacMTMM/repository/round_' + round + '/' + experiment
		return air.File.documentsDirectory.resolvePath(dirPath).nativePath;
	},
	//get a local experiment air file object
	getExperimentFile : function getExperimentFile (round, experiment, fileName) {
		var filePath   = mac.experiments.getExperimentDirectory(round, experiment) + '/'+ fileName
		return air.File.documentsDirectory.resolvePath(filePath)
	},
	//gets local experiment file contents directly
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
	//Get single experiment revisions from a branch experiment
	loadExperimentRevisions : function (round, experiment) {
		
		mac.models.Branch.fetch({
			onItem: function(item) {
                  var branchName = mac.models.Branch.getValue( item, 'name');
				  if (branchName != 'origin/' + mac.settings.gitBranchName) {
				  	mac.experiments.loadRevisionsFromBranch(branchName, round, experiment);
				  }	
               }
		});
		
		mac.experiments.loadRevisionsFromBranch(mac.settings.gitBranchName, round, experiment);
	},
	loadRevisionsFromBranch : function loadRevisionsFromBranch (branchName, round, experiment) {
		var processListener = new mac.BasicAirListener('git log');
		processListener.listeners.onOutputData = function(event){
			var process = processListener.getProcess()
            var data = process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable);
            var revisionList = mac.versions.parseLog(data)
			for (var i in revisionList) {
				var item 		 = revisionList[i];
				item.round 		 = round;
				item.experiment  = experiment;
				console.log(item);
				if(!mac.models.Revision.isItem(item)) {
					console.log(item)
					mac.models.Revision.newItem(item);	
				}
			}
		}
		//We want revision information for the input.ls8 file
		var fileName = 'round_' + round + '/' + experiment + '/INPUT.LS8' 
		mac.versions.getLog(branchName, fileName, processListener);
	},
	//Does some parsing on a branch ls-tree to find rounds and experiments
	loadExperimentsFromBranch : function loadExperimentsFromBranch(branchName) {
		
		var processListener = new mac.BasicAirListener('git ls-tree');
		processListener.listeners.onOutputData = function(event){
			var process = processListener.getProcess()
            var data = process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable);
            parsedList = mac.versions.parseBranchFileList(data)
			
			var experiments = mac.experiments.reduceToExperiments(parsedList, branchName)
			for (var i in experiments) {
				var item = experiments[i];
				
				if(!mac.models.Experiment.isItem(item)) {
					mac.models.Experiment.newItem(item);	
				}
			}
		}
		mac.versions.getBranchFileList(branchName, processListener);
	},
	//Get experiments on the origin server, except for our local branch origin
	loadRemoteExperiments : function loadRemoteExperiments() {
		mac.models.Branch.fetch({
			onItem: function(item) {
                  var branchName = mac.models.Branch.getValue( item, 'name');
				  if (branchName != 'origin/' + mac.settings.gitBranchName) {
				  	mac.experiments.loadExperimentsFromBranch(branchName);
				  }	
               }
		});
	},
	//Get's a list of remote branches
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
	//Reload the list of experiments
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
