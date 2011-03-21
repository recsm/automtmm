//////////////////////////////////////////////////////
////   MODELS         							  ////
//////////////////////////////////////////////////////

//A list of all experiments
mac.models.Experiment = new dojo.data.ItemFileWriteStore({ 
 	data : { items : []}
});

//A list of all revisions of, organized by experiment and round
//This model is lazy loaded when details for an individual experiment 
//are required to be shown in the interface
mac.models.Revision = new dojo.data.ItemFileWriteStore({ 
 data : { items : []}
});

//A list of all revisions of all branches
mac.models.Branch = new dojo.data.ItemFileWriteStore({ 
 	data : { items : []}
});