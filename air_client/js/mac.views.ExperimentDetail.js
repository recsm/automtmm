
//Get a list of revisions for a single round / experiment
mac.views.ExperimentDetail = function(params){
	var experiment = params.experiment;
	var round = params.round;
	var store, panelCurrentRevisionInfo, tab, revisionGrid;
	var selectedRowValues          = {}
	var buttonNewRevisionSubmit 
	var buttonSetToMasterSubmit
	
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
		
		//Connect the left side panel
    	panelCurrentRevisionSet.innerHTML = mac.template('templateSetRevsionToMaster', selectedRowValues);
		dojo.parser.parse(panelCurrentRevisionSet);
		buttonSetToMasterSubmit = mac.utilities.getTabDijit(".buttonSetToMasterSubmit", tab);
		dojo.connect(buttonSetToMasterSubmit , 'onClick', setRevisionToMaster);
    }
	
	var setRevisionToMaster  = function() {
		var dialog = new dijit.Dialog({title : 'Setting ' + selectedRowValues.shortCommitHash + ' as master',
		 						        style: "width: 400px; height:250px;background-color:#fff;"});
										
		var logToDialog = function(message) {
			
			//This is in a try catch in the case the dialog is closed during the process
			try {
				dialog.set('content', dialog.get('content') + message + '<br>');
			} catch (e) {}
		}
		
		
		//The below nested code basically does this:
		//git checkout master  
		//git checkout --theirs <shortCommitHash> -- /round_n/experiment/.
		//git commit -m "Set commit <shortCommitHash> for round experiment created by author on date to master  "
		//git checkout mac.settings.gitBranchName
		
		
		var relative = true;
		var directory = mac.experiments.getExperimentDirectory(round, experiment, relative);
		
		var resetBranch = function() {
			var resetBranchListener = new mac.BasicAirListener('git checkout');
			resetBranchListener.onComplete = function(data, exitCode) {
				if (exitCode != 0) {
					logToDialog('Failed to switch back to branch ' + mac.settings.gitBranchName);
				} 
			}
			mac.versions.checkOutBranch(mac.settings.gitBranchName, resetBranchListener);
		}
		
		var checkoutListener = new mac.BasicAirListener('git checkout');
		checkoutListener.listeners.onComplete = function(data, exitCode) {
			if (exitCode == 0) {
				var mergeListener = new mac.BasicAirListener('git checkout --theirs');
				
				mergeListener.listeners.onComplete = function(data, exitCode){
					if (exitCode == 0) {
						var commitListener = new mac.BasicAirListener('git commit');
						
						commitListener.listeners.onComplete = function (data, exitCode) {
							
							if(exitCode == 0) {
								logToDialog("Selection committed to local repository");
								logToDialog("Please synchronize now to finish the commit process!!");
							} else {
								logToDialog("Failed to commit to local repository");
							}
							resetBranch();
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
		
		mac.versions.checkOutBranch('master', checkoutListener);
		
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