
//Compare View to compare two revisions
mac.views.CompareBase = function() {
    
	var inputCompareRoundAndExperiment,
	    inputCompareFromRevision,
		inputCompareToRevision, 
	    buttonCompareSubmit, 
		round,
		experiment;
	
	var onCompareSubmit = function() {
		
		//Send the selected commit hashed to the compare view
		var from  = inputCompareFromRevision.get('value');
		var to    = inputCompareToRevision.get('value');
		mac.controllers.main.openCompareRevisions(
			{fromRevision : from,
		  	 toRevision   : to}
		)
	}
	
	var setRoundAndExperiment = function() {
		var value = inputCompareRoundAndExperiment.get('value');
		var p = value.split(':');
		round = 1 * p[0];
		experiment = p[1];
	}
	
	var updateRevisionSelects = function() {
		setRoundAndExperiment();
		
		if (mac.settingsManager.verify()) {
			var store = mac.experiments.getSelectedRevisionStore(round, experiment);
		}
		
		//Here the child select elements get recreated, since we
		//are swapping the store to a new store
		//this seems to be the easiest way to go about it.
		if (typeof(inputCompareFromRevision) != 'undefined'){
			inputCompareFromRevision.destroy();
			inputCompareToRevision.destroy()
		}
		
		dojo.byId('fromRevisionHolder').innerHTML = '<select id="inputCompareFromRevision"></select>';
		dojo.byId('toRevisionHolder').innerHTML = '<select id="inputCompareToRevision"></select>';
		
		inputCompareFromRevision = new dijit.form.Select({},'inputCompareFromRevision');
		inputCompareToRevision = new dijit.form.Select({},'inputCompareToRevision');
		
		inputCompareFromRevision.setStore(store);
		inputCompareToRevision.setStore(store);
		
	}
	
	var init = function() {
		buttonCompareSubmit         	= dijit.byId('buttonCompareSubmit');
		inputCompareRoundAndExperiment  = dijit.byId('inputCompareRoundAndExperiment');
		//inputCompareFromRevision  	= dijit.byId('inputCompareFromRevision');
		//inputCompareToRevision  		= dijit.byId('inputCompareToRevision');
		
		//Set the drop down input to our experiment store
		inputCompareRoundAndExperiment.setStore(mac.models.Experiment);
		
		dojo.connect(buttonCompareSubmit , 'onClick', onCompareSubmit);
		dojo.connect(inputCompareRoundAndExperiment, 'onChange', updateRevisionSelects);
	}
	
	init();
}