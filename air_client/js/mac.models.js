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

// sub collections of revisions organized by round and experiment
// lazy loaded as needed by mac.experiments.getSelectedRevisionStore(round, experiment

mac.models.selectedRevisions = []

//A list of all revisions of all branches
mac.models.Branch = new dojo.data.ItemFileWriteStore({ 
 	data : { items : []}
});