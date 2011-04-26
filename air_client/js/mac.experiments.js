//////////////////////////////////////////////////////
////   EXPERIMENT MANAGER					  	  ////
//////////////////////////////////////////////////////

mac.experiments = {
	//get a local experiment directory, returns a path string
	getExperimentDirectory : function getExperimentDirectory (round, experiment, relative) {
		
		if (typeof(relative) == 'undefined') {
			relative = false
		}
		
		var dirPath   = 'MacMTMM/repository/round_' + round + '/' + experiment
		
		if (relative) {
			return 'round_' + round + '/' + experiment;
		}
		else {
			return air.File.documentsDirectory.resolvePath(dirPath).nativePath;
		}
	},
	//get a local experiment air file object
	getExperimentFile : function getExperimentFile (round, experiment, fileName) {
		var filePath   = mac.experiments.getExperimentDirectory(round, experiment) + '/'+ fileName
		return air.File.documentsDirectory.resolvePath(filePath)
	},
	//Move the OUT.LATEST contents into the OUT file
	moveLatestToOut : function moveLatestToOut(round, experiment) {
		var outLatestFile = mac.experiments.getExperimentFile(round, experiment, 'OUT.LATEST');
		var outFile = mac.experiments.getExperimentFile(round, experiment, 'OUT');
		//A file that exists for convenience to open in jrule
		var outOutFile = mac.experiments.getExperimentFile(round, experiment, 'OUT.OUT'); 
		//Delete the current OUT File
		if (outFile.exists) {
			outFile.deleteFile();
		}
		//Delete the current OUT.OUT File
		if (outOutFile.exists) {
			outOutFile.deleteFile();
		}
		//Copy OUT.LATEST to OUT and OUT.OUT
		outLatestFile.copyTo(outFile)
		outLatestFile.copyTo(outOutFile)
	},
	//Show a revision of a file with git
	getExperimentFileRevision : function showFileRevision(round, experiment, fileName, commitHash, onComplete) {
		//For git show, we just need a relative path
		var filePath   = 'round_' + round + '/' + experiment + '/' + fileName;
		var processListener = new mac.BasicAirListener('git show');
		processListener.listeners.onComplete = function(data) {
			//Call the callback we were passed in the args for getExperimentFileRevision
			onComplete(data);
		}
		mac.versions.showFileRevision(filePath, commitHash, processListener);
	},
	getExperimentFileDiff : function showFileDiff(round, experiment, fileName, fromCommitHash, toCommitHash, onComplete) {
		//For git show, we just need a relative path
		var filePath   = 'round_' + round + '/' + experiment + '/' + fileName;
		var processListener = new mac.BasicAirListener('git diff');
		processListener.listeners.onComplete = function(data) {
			//Call the callback we were passed in the args for getExperimentFileRevision
			onComplete(data);
		}
		mac.versions.showFileDiff(filePath, fromCommitHash, toCommitHash, processListener);
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
			//Make sure we are working with a relative path even for local objects
			//Sometimes local objects were returned from git with an absolute path
			item.objectName = item.objectName.substr(item.objectName.indexOf('round_'));
			
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
		
		processListener.listeners.onComplete = function(data){
			//var process = processListener.getProcess()
            //var data = process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable);
        	
			var revisionList = mac.versions.parseLog(data)
			var newItem;
			
			for (var i in revisionList) {
				newItem = revisionList[i];
				newItem.round = round;
				newItem.experiment = experiment;
				
				if(newItem.subject.length > 30) {
					var subject = newItem.subject.substr(0,30) + '...';
				} else {
					var subject = newItem.subject;
				}
				
				newItem.label = newItem.authorName + ' - ' + mac.experiments.formatDate(newItem.authorDate) + ' - ' + subject; 
				
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
		//console.log('Branch Name', branchName);
		mac.versions.getLog(branchName, fileName, processListener);
	},
	//Create a unique revision store by experiment and round
	getSelectedRevisionStore : function getSelectedRevisionStore(round, experiment, refresh){
		
		if(typeof(refresh) == 'undefined') {
			refresh = false;
		}
		
		//Check if we already created this store, if so return it
		for (var i in mac.models.selectedRevisions) {
			var r = mac.models.selectedRevisions[i];
			if ((r.round == round) && (r.experiment == experiment)) {
				if (refresh) {
					
					r.store.loadAll();
					return r.store;
				}
				else {
					return r.store;
				}
			}
		}
		
		//Create a linked child store to contain matching experiments and rounds
		var store = new dojo.data.ItemFileWriteStore({
			data: {
				identifier: "commitHash",
				label: "label",
				items: []
			}
		});
		
		//Whenever an item is added to the parent revison model, we check
		//and display it if it matches our criteria
		store.checkAndAddItem = function (item) {
			var itemExperiment = mac.models.Revision.getValue(item, 'experiment');
			var itemRound = mac.models.Revision.getValue(item, 'round');
			//console.log(itemExperiment, itemRound, experiment, round);
			if((itemExperiment == experiment) && ((1 * itemRound) == (1 * round))) {
				var obj = mac.models.Revision.itemToObject(item);
				try {
					store.newItem(obj);
				} 
				catch (e) {
				}
			}
		}
		
		//Since revisions only get loaded into the parent model
		//mac.models.Revision, we need to copy over new items
		//that match our requirements when they are added
		
		dojo.connect(mac.models.Revision, 'onNew', store.checkAndAddItem);
		
		store.loadAll = function(){
			//Load in existing records for matching experiments and rounds
			mac.models.Revision.fetch({onItem : function (item) {
				//Some items could be duplicates so we skip them
				try {
					store.checkAndAddItem(item);
				} catch (e) {}
			}});
			
			//Reload the experiments we need
			mac.experiments.loadExperimentRevisions(round, experiment);
		}
		
		store.loadAll();
		
		var createdStore = {
			store : store,
			round : round,
			experiment : experiment
		}
	
		//Keep a copy so that we only create each store once
		mac.models.selectedRevisions.push(createdStore);
	
		return store;
	},
	//Get the last experiment contributed by each author
	getLastestOtherAuthors : function getLastestOtherAuthors (round, experiment) {
		var store = mac.experiments.getSelectedRevisionStore(round, experiment);
		
		var sortParams = [{
			attribute: "authorDate", 
			descending:true, 
		}];
		
		var authorListStore = new dojo.data.ItemFileWriteStore({
			data: {
				identifier: "commitHash",
				label: "label",
				items: []
			}
		});
								
		var authorList = [];
		
		store.fetch({sort : sortParams,
		             onComplete : function(items ) {
					 	for (var i in items) {
							var item = items[i];
							
							var authorName = store.getValue(item, 'authorName');
							var commitHash = store.getValue(item, 'commitHash');
							var authorDate = store.getValue(item, 'authorDate');
							
							if(authorName == mac.settings.userName) continue;
							
							var found = false;
							for (var i in authorList) {
								if(authorList[i].authorName == authorName) {
									found = true;
									break;
								}
							}
							
							if (!found) {
								authorList.push({
									authorName : authorName,
									authorDate : authorDate,
									friendlyDate :mac.experiments.formatDate(authorDate),
									commitHash : commitHash, 
								});
							}
						}
						
						for (var i in authorList) {
							authorListStore.newItem(authorList[i]);
						}
					 }});
					 
		return authorListStore;
		
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
							//To make this more readable, we get rid of the origin part
							var branchShortName = experiments[i].branches.replace('origin/', '');
						  	if (branches.indexOf(branchShortName) == -1){
								mac.models.Experiment.setValue(item, 'branches', branches.replace('origin/', '') + ', ' + branchShortName);
							} else {
								mac.models.Experiment.setValue(item, 'branches', branches.replace('origin/', ''));
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
	//A date format helper, for grid displays 
	dateFormatter : function dateFormatter(data, rowIndex){
        return mac.experiments.formatDate(data);
    },
	//The actual format function
	formatDate : function formatDate(timestamp) {
		var today = new Date();
		var currentTime = Math.round(today.getTime() / 1000);
		var difference = currentTime - timestamp;
		var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		
		var endDate = function endDate(day) {
			if (('' + day).length == 1) {
				var lastDijit = day;
			} else {
				var lastDijit = ('' + day).substr(1);
			}
			switch(lastDijit) {
				case 1: return 'st';
				case 2: return 'nd';
				case 3: return 'rd';
				default: return 'th';
			}
		}
		
		var date = new Date();
		date.setTime(timestamp * 1000);
		
		if (difference < (60 * 60 * 24) && (today.getDay() == date.getDay())) {
			var dateString = 'Today';
		}
		else if(difference < (60 * 60 * 24 * 7) && difference > 0) {
			var dateString = days[date.getDay()];
		}
		else 
		{
			var dateString = months[date.getMonth()] + ' ' + date.getDate() + endDate(date.getDate());
			if(difference > (60 * 60 * 24 * 356)) {
				dateString += ', ' + date.getFullYear();
			}
		}
		
		//Hours and minutes in 24 hour time - date.toTimeString().substr(0, 5)
		return dateString + ' - ' + date.toTimeString().substr(0, 5);
	},
	init: function(){
		dojo.subscribe('/mac/sync', function(){
			//Refresh the list of experiments
			mac.experiments.refreshExperimentList();
			//Refresh any revision stores that have been loaded
			for (var i in mac.models.selectedRevisions) {
				var r = mac.models.selectedRevisions[i];
				r.store.loadAll();
			}
		});
		mac.experiments.refreshExperimentList();
	}
}
