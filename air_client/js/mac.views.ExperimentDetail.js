
//Get a list of revisions for a single round / experiment
mac.views.ExperimentDetail = function(params){
	var experiment = params.experiment;
	var round = params.round;
	var store, panelCurrentRevisionInfo, tab, revisionGrid;
	var selectedRowValues          = {};
	var buttonNewRevisionSubmit; 
	var buttonSetToMasterSubmit;
	var buttonSaveOutput;
	
	var updateRowBasedInfo =  function() {
		try {
			buttonNewRevisionSubmit.destroy()
			buttonSetToMasterSubmit.destroy()
		} catch(e) {}
		
		
		//Connect the right side panel
    	panelCurrentRevisionInfo.innerHTML = mac.template('templateRevisionListTopInfo', selectedRowValues);
		dojo.parser.parse(panelCurrentRevisionInfo);
		buttonNewRevisionSubmit = mac.utilities.getTabDijit(".buttonNewRevisionSubmit", tab);
		dojo.connect(buttonNewRevisionSubmit , 'onClick', openNewRevision);
		buttonSaveOutput = mac.utilities.getTabDijit(".buttonSaveOutput", tab);
		dojo.connect(buttonSaveOutput, 'onClick', saveOutput);
		
		//Connect the left side panel
    	panelCurrentRevisionSet.innerHTML = mac.template('templateSetRevsionToMaster', selectedRowValues);
		dojo.parser.parse(panelCurrentRevisionSet);
		buttonSetToMasterSubmit = mac.utilities.getTabDijit(".buttonSetToMasterSubmit", tab);
		dojo.connect(buttonSetToMasterSubmit , 'onClick', setRevisionToMaster);
    }
	
	
	var saveOutput = function () {
		mac.experiments.getExperimentFileRevision(round, experiment, 'OUT', selectedRowValues.commitHash, function (data) {
			var fileName = 'OUT-' + selectedRowValues.shortCommitHash + '.OUT';
			var revisionFile = mac.experiments.getExperimentFile(round, experiment, fileName)
			var fs = new air.FileStream();
			fs.open(revisionFile, air.FileMode.WRITE);
			fs.writeUTFBytes(data);
			fs.close();
			
			
			var dialog = new dijit.Dialog({title : 'Output saved',
		 						        style: "width: 400px; height:250px;background-color:#fff;"});
										
		
			dialog.set('content', 'The file was saved as ' + revisionFile.nativePath );
			dialog.show();
			
			//alert('The output for revision ' + selectedRowValues.shortCommitHash + ' was saved to the file ' + revisionFile.nativePath);
		});
	}
	
	var setRevisionToMaster  = function() {
		
		var changesStashed = true;
		
		var dialog = new dijit.Dialog({title : 'Setting ' + selectedRowValues.shortCommitHash + ' as master',
		 						        style: "width: 400px; height:250px;background-color:#fff;"});
										
		var logToDialog = function(message) {
			
			//This is in a try catch in the case the dialog is closed during the process
			try {
				dialog.set('content', dialog.get('content') + message + '<br>');
			} catch (e) {}
		}
		
		
		//The below nested code basically does this:
		//
		//Add all files to the index so that they can be stashed
		//git add .
		//
		//Stash everything    
		//git stash
		//
		//Checkout the head master branch
		//git checkout master 
		// 
		//Update the master branch
		//git pull
		//
		//Merge in the changes from our branch into the master branch
		//git checkout --theirs <shortCommitHash> -- /round_n/experiment/.
		//
		//Commit the changes
		//git commit -m "Set commit <shortCommitHash> for round experiment created by author on date to master  "
		//
		//Push to the remote repository
		//git push origin master 
		//
		//Switch back to our branch
		//git checkout mac.settings.gitBranchName
		//
		//Unstash our changes
		//git stash pop
		//
		//Reset the index to clear the git add .
		//git reset
		
		
		var relative = true;
		var directory = mac.experiments.getExperimentDirectory(round, experiment, relative);
		
		var resetBranch = function() {
			var resetBranchListener = new mac.BasicAirListener('git checkout');
			resetBranchListener.listeners.onComplete = function(data, exitCode) {
				if (exitCode == 0) {
					if (changesStashed){
						var stashPopListener = new mac.BasicAirListener('git stash pop');
						stashPopListener.listeners.onComplete = function(data, exitCode) {
							if (exitCode == 0) {
								var resetIndexListener = new mac.BasicAirListener('git reset');
								resetIndexListener.listeners.onComplete = function (data, exitCode) {
									if (exitCode != 0) {
										logToDialog('Failed to reset git index');
									}
								}
								mac.versions.reset(resetIndexListener)
							} else {
								logToDialog('Failed to unstash your non committed local changes.');
							}
						}
						mac.versions.stashPop(stashPopListener);
					}
					
				} else {
					logToDialog('Failed to switch back to branch ' + mac.settings.gitBranchName);
				} 
			}
			mac.versions.checkOutBranch(mac.settings.gitBranchName, resetBranchListener);
		}
		
		var pushMasterToGit = function pushToGit() {
			
			var processListener = new mac.BasicAirListener('git push');
			processListener.listeners.onComplete = function (data, exitCode) {
				if (exitCode == 0) {
					logToDialog('Complete, revision correctly set to master!');
					resetBranch();
				} else {
					logToDialog('Sync failed to upload changes to master branch.');
					resetBranch();
				}
			}
			mac.versions.pushBranch('master', processListener);
		}
		
		var commitMaster = function commitMaster() {
			var commitListener = new mac.BasicAirListener('git commit');
						
			commitListener.listeners.onComplete = function (data, exitCode) {
				
				if(exitCode == 0) {
					logToDialog("Experiment has been committed to the master branch");
					logToDialog("Uploading changes to master branch.");
					pushMasterToGit();
				} else {
					logToDialog("Failed to commit to local repository");
					resetBranch();
				}
				
			}
			
			var commitNotes = "Set commit " + 
							   selectedRowValues.shortCommitHash + 
							   " to master for experiment " +
							   experiment +
							   ' in round ' + 
							   round +
							   ' from version created by ' +
							   selectedRowValues.authorName + 
							   ' on ' +  
							   selectedRowValues.dateFriendly 
							   
			
			mac.versions.commit(commitNotes, commitListener);
		}
		
		
		
		var pullMaster = function pullMaster() {
			
			var processListener = new mac.BasicAirListener('git pull');
			processListener.listeners.onComplete = function (data, exitCode) {
				if (exitCode == 0) {
					logToDialog('Syncing master. Downloaded remote changes');
					commitMaster();
					
				} else {
					logToDialog('Failed to pull changes from master branch.');
				}
			}
			mac.versions.pullBranch('master', processListener);
		}
		
		
		var checkoutListener = new mac.BasicAirListener('git checkout');
		checkoutListener.listeners.onComplete = function(data, exitCode) {
			if (exitCode == 0) {
				var mergeListener = new mac.BasicAirListener('git checkout --theirs');
				
				mergeListener.listeners.onComplete = function(data, exitCode){
					if (exitCode == 0) {
						logToDialog('Checked out master branch');
						pullMaster(); 
					} else {
						logToDialog('Error merging experiment to master.  This commit was not set as master.');
						resetBranch();
					}
				}
				
				//Not really a merge, just overwriting the master files with
				//files from a specific commit
				mac.versions.git(['checkout', 
				                  '--theirs',
								  selectedRowValues.shortCommitHash,
								  '--',
								  directory + '/.'
								 ], mergeListener);
				
			} else {
				logToDialog('Error switching to master branch. This commit was not set as master.');
				resetBranch();
			}
		}
		
		var stashEverything = function () {
			var stashListener = new mac.BasicAirListener('git stash');
			stashListener.listeners.onComplete = function(data, exitCode) {
				if (exitCode == 0) {
						
					mac.versions.checkOutBranch('master', checkoutListener);
					
				} else {
					logToDialog('Failed to stash your local changes.');
				}
			}
			
			stashListener.listeners.onOutputData =  function onOutputData(event) {
	  				var process = stashListener.getProcess();
					var errorData = process.standardOutput.readUTFBytes(process.standardOutput.bytesAvailable); 
		            stashListener.log("DATA: " + errorData); 
					if (errorData.indexOf('No local changes') != -1) {
						changesStashed = false;
					}
		        }
		
			var addListener = new mac.BasicAirListener('git add .');
			addListener.listeners.onComplete = function(data, exitCode) {
				if (exitCode == 0) {
					mac.versions.stash(stashListener);
				
				} else {
					logToDialog('Failed add local changes to index.');
				}
			}
			
			//Add in everything so we can stash it since only tracked items may be stashed
			//This is undone later with git reset
			mac.versions.addPaths(['.'], addListener);
			
		}
		

		stashEverything();
		
		logToDialog('Setting ' + selectedRowValues.shortCommitHash + ' by ' + selectedRowValues.authorName + ' created ' +  selectedRowValues.dateFriendly + ' as master' );
		dialog.show();
	}
	
	
	var openNewRevision = function() {
		mac.experiments.getExperimentFileRevision(round, experiment, 'INPUT.LS8', selectedRowValues.commitHash, function (data) {
			
			fromInfoText =  'Started from: ' + selectedRowValues.authorName + ' created ' + selectedRowValues.dateFriendly  + ' (' + selectedRowValues.shortCommitHash + ')';
 			
			mac.controllers.main.openNewRevision({round : round,
								                  experiment : experiment,
												  initialContent : data,
												  fromInfoText : fromInfoText});
		});
	}
	
	
	var onGridRowSelected = function() {
    	var selectedRow = revisionGrid.selection.getFirstSelected();
		selectedRowValues.commitHash = store.getValue(selectedRow, 'commitHash');
		selectedRowValues.shortCommitHash = store.getValue(selectedRow, 'shortCommitHash');
		selectedRowValues.authorName = store.getValue(selectedRow, 'authorName');
		selectedRowValues.authorDate = store.getValue(selectedRow, 'authorDate');
		selectedRowValues.dateFriendly = mac.experiments.formatDate(selectedRowValues.authorDate);
		updateRowBasedInfo();
	}
	
	var openViewRevision = function() {
		onGridRowSelected();
		//console.log(selectedRowValues);
		mac.controllers.main.openSingleRevision({round : round, 
		                                         experiment : experiment,
												 commitHash : selectedRowValues.commitHash,
												 shortCommitHash : selectedRowValues.shortCommitHash});
	}
	
	
	
	var init = function(){
		var tabTitle = ' round ' + round + ' ' + experiment;
		tab = mac.controllers.main.openTab(tabTitle);
		tab.set('content', mac.template('experimentDetails', params));
		panelCurrentRevisionInfo = mac.utilities.getTabNode('.panelCurrentRevisionInfo', tab);
		panelCurrentRevisionSet = mac.utilities.getTabNode('.panelCurrentRevisionSet', tab);
		revisionGrid = mac.utilities.getTabDijit(".gridExperimentRevisions", tab)
		store = mac.experiments.getSelectedRevisionStore(round, experiment);
		revisionGrid.setStore(store);
		dojo.connect(revisionGrid, 'onRowDblClick', openNewRevision);
		dojo.connect(revisionGrid, 'onSelected',    onGridRowSelected);
	}
	
	init();
}