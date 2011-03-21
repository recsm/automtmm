
//Get a list of revisions for a single round / experiment
mac.views.ExperimentDetail = function(params){
	var experiment = params.experiment;
	var round = params.round;
	
	var init = function(){
		tabTitle = ' round ' + round + ' ' + experiment;
		tab = mac.controllers.main.openTab(tabTitle);
		tab.set('content', mac.template('experimentDetails', params));
		revisionGrid = mac.utilities.getTabDijit(".gridExperimentRevisions", tab)
		revisionGrid.setStore(mac.models.Revision);
		revisionGrid.filter({
			round: round,
			experiment: experiment
		});
		mac.experiments.loadExperimentRevisions(round, experiment);
	}
	init();
}