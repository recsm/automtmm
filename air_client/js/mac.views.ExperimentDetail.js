
//Get a list of revisions for a single round / experiment
mac.views.ExperimentDetail = function(params){
	var experiment = params.experiment;
	var round = params.round;
	var store, panelCurrentRevisionInfo, tab, revisionGrid;
	var selectedRowValues          = {}
	
	
	var updateRowBasedInfo =  function() {
		try {
			buttonNewRevisionSubmit.destroy()
		} catch(e) {}
    	
		
		
    	panelCurrentRevisionInfo.innerHTML = mac.template('templateRevisionListTopInfo', selectedRowValues);
		dojo.parser.parse(panelCurrentRevisionInfo);
		buttonNewRevisionSubmit = mac.utilities.getTabDijit(".buttonNewRevisionSubmit", tab);
		dojo.connect(buttonNewRevisionSubmit , 'onClick', openNewRevision);
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
		revisionGrid = mac.utilities.getTabDijit(".gridExperimentRevisions", tab)
		store = mac.experiments.getSelectedRevisionStore(round, experiment);
		revisionGrid.setStore(store);
		dojo.connect(revisionGrid, 'onRowDblClick', openNewRevision);
		dojo.connect(revisionGrid, 'onSelected',    onGridRowSelected);
	}
	init();
}