//////////////////////////////////////////////////////
////   MODELS         							  ////
//////////////////////////////////////////////////////

//A list of all experiments
mac.models.ExperimentStore = new dojo.data.ItemFileWriteStore({ 
 	data : { items : []}
});

//A list of all revisions of all experiments
mac.models.RevisionStore = new dojo.data.ItemFileWriteStore({ 
 data : { items : [
    { label: 'Study 1 - Experiment 1', round:'1', experiment:'experiment_a',  revision: "2", author:"Willem Saris", date:"January 17th, 2010 at 3:17pm", notes:"Working on the yada yada part" },
	{ label: 'Study 1 - Experiment 2', round:'3', experiment:'another_experiment',  revision: "1", author:"Willem Saris", date:"January 15th, 2010, at 2:25pm", notes:"More yada yada"}
]}
});

//A list of all revisions of all branches
mac.models.Branches = new dojo.data.ItemFileWriteStore({ 
 	data : { items : []}
});