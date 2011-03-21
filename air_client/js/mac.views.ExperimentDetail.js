
//Get a list of revisions for a single round / experiment
mac.views.ExperimentDetail = function(params){
	var experiment = params.experiment;
	var round = params.round;
	
	//Create a linked child store to contain matching experiments and rounds
	var SelectedExperiment =  new dojo.data.ItemFileWriteStore({ 
 		data : { items : []}
	});
	
	var checkAndAddItem = function (item) {
		console.log('beep');
		console.log(item)
		var itemExperiment = mac.models.Revision.getValue(item, 'experiment');
		var itemRound = mac.models.Revision.getValue(item, 'round');
		if(itemExperiment == experiment && itemRound == round) {
			var itemAsJson = {
				experiment  : mac.models.Revision.getValue(item, 'experiment'),
				round : mac.models.Revision.getValue(item, 'round'),
				authorName : mac.models.Revision.getValue(item, 'authorName'),
				authorDate : mac.models.Revision.getValue(item, 'authorDate'),
				subject : mac.models.Revision.getValue(item, 'subject'),
				commitHash : mac.models.Revision.getValue(item, 'commitHash')
			}
			SelectedExperiment.newItem(itemAsJson);
		}
	}
	
	var init = function(){
		tabTitle = ' round ' + round + ' ' + experiment;
		tab = mac.controllers.main.openTab(tabTitle);
		tab.set('content', mac.template('experimentDetails', params));
		revisionGrid = mac.utilities.getTabDijit(".gridExperimentRevisions", tab)
		revisionGrid.setStore(SelectedExperiment);
		
		//Load in existing records for matching experiments and rounds
		mac.models.Revision.fetch({onItem : function (item) {
			checkAndAddItem(item);
		}});
		
		dojo.connect(mac.models.Revision, 'onNew', checkAndAddItem);
		mac.experiments.loadExperimentRevisions(round, experiment);
	}
	init();
}