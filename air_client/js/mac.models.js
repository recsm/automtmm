//////////////////////////////////////////////////////
////   MODELS         							  ////
//////////////////////////////////////////////////////

//A list of all experiments
mac.models.Experiment = new dojo.data.ItemFileWriteStore({ 
 	data : { 
		identifier: "identifier",		//For drop downs that use this store it is the value, and an index
		label: "roundAndExperiment",	//The label for dropdowns
		items : []}
});


//A list of all revisions of, organized by experiment and round
//This model is lazy loaded when details for an individual experiment 
//are required to be shown in the interface
mac.models.Revision = new dojo.data.ItemFileWriteStore({ 
 	data : { 
		identifier: "commitHash",
		label: "label",
		items : []}
});

//Take a ItemFileWriteStore item and make it into a simple readable object
mac.models.Revision.itemToObject = function(item) {
	return {
		label: mac.models.Revision.getValue(item, 'label'),
		experiment: mac.models.Revision.getValue(item, 'experiment'),
		round: mac.models.Revision.getValue(item, 'round'),
		authorName: mac.models.Revision.getValue(item, 'authorName'),
		authorDate: mac.models.Revision.getValue(item, 'authorDate'),
		subject: mac.models.Revision.getValue(item, 'subject'),
		commitHash: mac.models.Revision.getValue(item, 'commitHash'),
		shortCommitHash: mac.models.Revision.getValue(item, 'shortCommitHash'),
		timeSince: mac.models.Revision.getValue(item, 'timeSince')
	}
}

// sub collections of revisions organized by round and experiment
// lazy loaded as needed by mac.experiments.getSelectedRevisionStore(round, experiment

mac.models.selectedRevisions = [];

//A list of all revisions of all branches
mac.models.Branch = new dojo.data.ItemFileWriteStore({ 
 	data : { items : []}
});