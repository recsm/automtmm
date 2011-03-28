
//Get a list of revisions for a single round / experiment
mac.views.ExperimentDetail = function(params){
	var revisionGrid;
	var experiment = params.experiment;
	var round = params.round;
	var store;
	var selectedRowValues          = {}
	
	var onGridRowSelected = function() {
    	var selectedRow = revisionGrid.selection.getFirstSelected();
		selectedRowValues.commitHash = store.getValue(selectedRow, 'commitHash');
		selectedRowValues.shortCommitHash = store.getValue(selectedRow, 'shortCommitHash');
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
		tabTitle = ' round ' + round + ' ' + experiment;
		tab = mac.controllers.main.openTab(tabTitle);
		tab.set('content', mac.template('experimentDetails', params));
		revisionGrid = mac.utilities.getTabDijit(".gridExperimentRevisions", tab)
		store = mac.experiments.getSelectedRevisionStore(round, experiment);
		revisionGrid.setStore(store);
		dojo.connect(revisionGrid, 'onRowDblClick', openViewRevision);
		dojo.connect(gridExperiments, 'onSelected',    onGridRowSelected);
	}
	init();
}