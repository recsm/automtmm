//New Revision View
mac.views.NewRevision = function(params) {

	var ls8AirFile
	
	var experiment = params.experiment
	var round      = params.round

	var commitNotes = '';
	var resumeEditButton, showOutButton;
	var OUT; //The results of the last run
	
	var tabTitle 	=  experiment + ' (new)' 
	var tab   = mac.controllers.main.openTab(tabTitle)
	tab.set('content', mac.template('templateNewRevision', params))
	
	var buttonNewRevisionRun 	= mac.utilities.getTabDijit(".buttonNewRevisionRun", tab)
	var inputNewRevisionModel 	= mac.utilities.getTabDijit(".inputNewRevisionModel", tab)
	var nodeNewRevisionCompose 	= mac.utilities.getTabNode(".newRevisionCompose", tab)
	var nodeNewRevisionReview 	= mac.utilities.getTabNode(".newRevisionReview", tab)
	var nodeProcessLog 			= mac.utilities.getTabNode(".processLog", tab)
	
	var logProgress = function(progress) {
		nodeProcessLog.innerHTML += progress
	}
	
	var resetProgress = function() {
		try {
			resumeEditButton.destroy();
		}
		catch(e) {
			
		}
		nodeProcessLog.innerHTML = '';
	}
	
	var resumeEdit = function() {
		resetProgress();
	    mac.utilities.nodeHide(nodeNewRevisionReview);
		mac.utilities.nodeShow(nodeNewRevisionCompose);
	}
	
	var showOut = function() {
		mac.controllers.main.openShowLisrelOut({round : round, experiment : experiment, out : OUT});
	}
	
	var showOptions = function (options) {
		//Add html
		if (options.resumeEdit) {
			logProgress('<button dojoType="dijit.form.Button" class="resumeEditButton">Resume Editing</button>');
		}
		
		if (options.showOut) {
			logProgress('<button dojoType="dijit.form.Button" class="showOutButton">View Lisrel Output</button>');
		}
		
		//Parse them to widgets
		dojo.parser.parse(nodeProcessLog);
		
		//Connect the new widgets
		if (options.resumeEdit) {
			resumeEditButton = mac.utilities.getTabDijit('.resumeEditButton', tab);
			dojo.connect(resumeEditButton, 'onClick', resumeEdit);
		}
		
		//Connect the new widgets
		if (options.showOut) {
			showOutButton = mac.utilities.getTabDijit('.showOutButton', tab);
			dojo.connect(showOutButton, 'onClick', showOut);
		}
	}
	
	var setLisrelResult = function setLisrelResult(exitCode) {
		//An output file has been created 
		if (exitCode == 0) {
			//Open up the output file, and check for errors
			//If we find E_R_R_O_R then we alert the user and show the output
			OUT = mac.experiments.getExperimentFileContents(round, experiment, 'OUT')
			if (OUT.indexOf('E_R_R_O_R') == -1) {
				logProgress('Lisrel ran with success.<br>');
				//Success
				//If the output is ok, then we process it in python to extract the dataset we need	
				parseToMatrix();
			}
			else {
				logProgress('Lisrel reported an error in the input.<br>');
				showOptions({'resumeEdit': true, 'showOut' : true});
			}
		}
		else {
			logProgress('There was an error running lisrel, lisrel exited with code (' + exitCode +')<br>');
		}
	}
	
	var getNotes = function() {
		var dialog = new dijit.Dialog({title : 'Change notes'});
		dialog.set('content', mac.template('templateNewRevisionNotes', params));
		dialog.show();
		
		var textarea	 = mac.utilities.getViewDijit('.newRevisionNotes', dialog);
		var buttonSaveNotes = mac.utilities.getViewDijit('.buttonSaveNotes', dialog);
		
		textarea.set('value', commitNotes);
		textarea.focus();
		
		dojo.connect(buttonSaveNotes, 'onClick', function() {
			if(dojo.trim(textarea.get('value')) == '') {
				textArea.focus();
			}
			else {
				commitNotes = textarea.get('value');
				dialog.hide();
				dialog.destroy();
				processModel();
			}
		})
	}
	
	var addAndCommit = function addAndCommit() {
		var processListener = new mac.BasicAirListener('git add')
		processListener.listeners.onExit = function (event) {
			if(event.exitCode == 0) {
			    var commitListener = new mac.BasicAirListener('git commit')
				commitListener.listeners.onComplete = function (data) {
					//Refresh our store
					mac.experiments.getSelectedRevisionStore(round, experiment,  true);
					//Make sure the experiment list is up to date;
					mac.experiments.refreshExperimentList();
					logProgress("Experiment list refreshed for round " + round + ' ' + experiment + '<br>');
					showOptions({'resumeEdit': true, 'showOut' : true});
				}
				mac.versions.commit(commitNotes, commitListener);
				logProgress("Commit Finished<br>");
			}
		}
		var directory = mac.experiments.getExperimentDirectory(round, experiment);
		mac.versions.addDirectory(directory, processListener);
		logProgress("Committing new revision.<br>");
	}
	
	var processModel = function processModel() {
		mac.utilities.nodeHide(nodeNewRevisionCompose);
	    mac.utilities.nodeShow(nodeNewRevisionReview);
	   
	    var modelContent = inputNewRevisionModel.get('value')
	    
		ls8AirFile = mac.lisrel.saveModelToFile(round, experiment, modelContent)
		logProgress("Input saved as " + ls8AirFile.nativePath + '<br>');
		
		var processListener = new mac.BasicAirListener('lisrel')
		processListener.listeners.onExit = function(event) 
		{ 
		    setLisrelResult(event.exitCode)
		}
		
        mac.lisrel.runModel(ls8AirFile.nativePath, processListener)
        logProgress("Running input in lisrel <br>")
	}
	
	
	var parseToMatrix = function parseToMatrix() {
		var processListener = new mac.BasicAirListener('parse_lisrel_out.py')
		processListener.listeners.onExit = function(event){
			logProgress("Lisrel output parsed.<br>");
			addAndCommit();
		}
		logProgress('Breaking lisrel output down into matrix.<br>');
        mac.lisrel.parseToMatrix(ls8AirFile.nativePath.replace('INPUT.LS8', 'OUT'), processListener)
	}
	
	mac.utilities.nodeHide(nodeNewRevisionReview)
	dojo.connect(buttonNewRevisionRun, 'onClick', getNotes);
}
