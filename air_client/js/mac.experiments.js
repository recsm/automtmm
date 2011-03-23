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
			
			
			//Some useful things for creating the drop down select
			var roundAndExperiment = 'Round ' + round + ' ' + name;
			var identifier = round + ':' + name;
			experiments.push({
				identifier 			: identifier,
				roundAndExperiment 	: roundAndExperiment,
				name   				: name,  //name as in experiement name
				round  				: round,
				branches 			: branchName
			})
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
				var newItem = revisionList[i];
				newItem.round = round;
				newItem.experiment = experiment;
				newItem.label = newItem.authorName + ' - ' + newItem.authorDate; 
				
				//Some duplicate commit hashes may throw an exception, so we
				//try to add everything and ignore the expections
				//This is much easier and faster than other techniques
				try {
					mac.models.Revision.newItem(newItem);
				} catch(e) {}
			}
		}
		//We want revision information for the input.ls8 file
		var fileName = 'round_' + round + '/' + experiment + '/INPUT.LS8' 
		mac.versions.getLog(branchName, fileName, processListener);
	},
	//Create a unique revision store by experiment and round
	getSelectedRevisionStore : function getSelectedRevisionStore(round, experiment){
		
		//Check if we already created this store, if so return it
		for (var i in mac.models.selectedRevisions) {
			var r = mac.models.selectedRevisions[i];
			if ((r.round == round) && (r.experiment == experiment)) {
				return r.store;
			}
		}
		
		mac.experiments.loadExperimentRevisions(round, experiment);
			
		//Create a linked child store to contain matching experiments and rounds
		var store =  new dojo.data.ItemFileWriteStore({ 
			 data : { 
				identifier: "commitHash",
				label: "label",
				items : []}
		});
		
		//Whenever an item is added to the parent revison model, we check
		//and display it if it matches our criteria
		var checkAndAddItem = function (item) {
			var itemExperiment = mac.models.Revision.getValue(item, 'experiment');
			var itemRound = mac.models.Revision.getValue(item, 'round');
			if((itemExperiment == experiment) && ((1 * itemRound) == (1 * round))) {
				var itemAsJson = {
					label : mac.models.Revision.getValue(item, 'label'), 
					experiment  : mac.models.Revision.getValue(item, 'experiment'),
					round : mac.models.Revision.getValue(item, 'round'),
					authorName : mac.models.Revision.getValue(item, 'authorName'),
					authorDate : mac.models.Revision.getValue(item, 'authorDate'),
					subject : mac.models.Revision.getValue(item, 'subject'),
					commitHash : mac.models.Revision.getValue(item, 'commitHash')
				}
				store.newItem(itemAsJson);
			}
		}
		
		//Load in existing records for matching experiments and rounds
		mac.models.Revision.fetch({onItem : function (item) {
			checkAndAddItem(item);
		}});
		
		dojo.connect(mac.models.Revision, 'onNew', checkAndAddItem);
		
		var createdStore = {
			store : store,
			round : round,
			experiment : experiment
		}
		
		//Keep a copy so that we only create each store once
		mac.models.selectedRevisions.push(createdStore);
		
		return store;
	},
	//Does some parsing on a branch ls-tree to find rounds and experiments
	loadExperimentsFromBranch : function loadExperimentsFromBranch(branchName) {
		
		var processListener = new mac.BasicAirListener('git ls-tree');
		processListener.listeners.onOutputData = function(event){
			var process = processListener.getProcess()
			var data = process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable);
			parsedList = mac.versions.parseBranchFileList(data)
			var experiments = mac.experiments.reduceToExperiments(parsedList, branchName)
			
			//Try to add in everything, some existing items will be skipped
			//Dojo uses the identifier to make sure items are unique
			for (var i in experiments) {
				var item = experiments[i];
				try {
					mac.models.Experiment.newItem(item);
				} catch (e) {}
			}
			//Here we add in all of the branches that an experiment exists in
			mac.models.Experiment.fetch({
				onItem: function(item) {
	                  var identifier = mac.models.Experiment.getValue( item, 'identifier');
					  for (var i in experiments) {
						  	if(experiments[i].identifier == identifier) {
						  	var branches = mac.models.Experiment.getValue(item, 'branches');
						  	if (branches.indexOf(experiments[i].branches) == -1){
								mac.models.Experiment.setValue(item, 'branches', branches + ', ' + experiments[i].branches);
							}
						  } 
					  }				  
	               }
			});
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
