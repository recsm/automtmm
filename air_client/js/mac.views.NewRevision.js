//New Revision View
mac.views.NewRevision = function(params) {

	var ls8AirFile;
	
	var experiment = params.experiment;
	var round      = params.round;

	var commitNotes = '';
	var resumeEditButton, showOutButton, chooseCompare, compareMineButton, store;
	var OUT; //The results of the last run
	
	var tabTitle 	=  experiment + ' (new)'; 
	var tab   = mac.controllers.main.openTab(tabTitle);
	tab.set('content', mac.template('templateNewRevision', params));
	
	var buttonNewRevisionRun 	= mac.utilities.getTabDijit(".buttonNewRevisionRun", tab);
	var inputNewRevisionModel 	= mac.utilities.getTabDijit(".inputNewRevisionModel", tab);
	var searchInput	 		    = mac.utilities.getTabDijit(".searchInput", tab);
	var searchButton		    = mac.utilities.getTabDijit(".searchButton", tab);
	var inputNewRevisionModel 	= mac.utilities.getTabDijit(".inputNewRevisionModel", tab);
	var nodeNewRevisionCompose 	= mac.utilities.getTabNode(".newRevisionCompose", tab);
	var nodeNewRevisionReview 	= mac.utilities.getTabNode(".newRevisionReview", tab);
	var nodeNewRevisionSearch 	= mac.utilities.getTabNode(".newRevisionSearch", tab);
	var nodeProcessLog 			= mac.utilities.getTabNode(".processLog", tab);
	var nextStepOptions 		= mac.utilities.getTabNode(".nextStepOptions", tab);
	
	var sortParams = [{
			attribute: "authorDate", 
			descending:true, 
		}];
	
	var logProgress = function(progress) {
		nodeProcessLog.innerHTML += progress;
	}
	
	var resetProgress = function() {
		try {
			resumeEditButton.destroy();
		}
		catch(e) {
		}
		nodeProcessLog.innerHTML = '';
	}
	
	//Try to find the next text being searched for
	var findNext = function() {
		var searchText = searchInput.get('value').toLowerCase();
		var inputText = inputNewRevisionModel.getValue().toLowerCase();
		
		start = inputNewRevisionModel.containerNode.selectionStart;
		if (!start || start == '0') start = 0;
		
		nextIndex = inputText.indexOf(searchText, start + searchText.length);
		
		if(nextIndex == -1) {
			nextIndex = inputText.indexOf(searchText, 0);
		}
		
		if(nextIndex != -1) {
			lines 		= inputText.split("\n").length - 1;
			totalHeight = inputNewRevisionModel.containerNode.scrollHeight;
			lineHeight  = totalHeight / lines;
			beforePart  = inputText.substr(0, nextIndex);
			beforeLines = beforePart.split("\n").length - 1;
			dijit.selectInputText(inputNewRevisionModel.containerNode, nextIndex, nextIndex+searchText.length);
			inputNewRevisionModel.focus()
			inputNewRevisionModel.containerNode.scrollTop = Math.round((lineHeight * beforeLines) - 60)
		}
		else
		{
			alert ('The search text "' + searchText + '" could not be found');
		}
	}
	
	var resumeEdit = function resumeEdit() {
		resetProgress();
	    mac.utilities.nodeHide(nodeNewRevisionReview);
		mac.utilities.nodeShow(nodeNewRevisionCompose);
		mac.utilities.nodeShow(nodeNewRevisionSearch);
	}
	
	var showOut = function showOut() {
		mac.controllers.main.openShowLisrelOut({round : round, experiment : experiment, out : OUT});
	}
	
	var compareWithMine = function () {
		store = mac.experiments.getSelectedRevisionStore(round, experiment);
		store.fetch({query : {authorName : mac.settings.userName},
		             sort : sortParams,
					 onComplete : function (items) {
						 	if(items.length < 2) {
								alert('Could not find 2 versions for comparison by author ' + mac.settings.userName);
								
							}else {
								mac.controllers.main.openCompareRevisions(
									{fromRevision : store.getValue(items[1], 'commitHash'),
								  	 toRevision   : store.getValue(items[0], 'commitHash')}
								)
								
							}
					 	},
					 onError : function (error) {
						 	alert('There was an error getting the two lastest versions.');
							console.log(error)
					 	}
					});
	}
	
	var showOptions = function (options) {
		
		var html = '<br><br><div class="nextStepButtons">';
		//Add html
		if (options.resumeEdit) {
			html += '<button dojoType="dijit.form.Button" class="resumeEditButton">Resume Editing</button>';
		}
		
		if (options.showOut) {
			html += '<button dojoType="dijit.form.Button" class="showOutButton">View Lisrel Output</button>';
		}
		
		if(options.compare) {
		 	//html += '<select dojoType="dijit.form.FilteringSelect" searchAttr="label" labelAttr="label" class="chooseCompareVersion"</select>';
			html += '<button dojoType="dijit.form.Button" class="compareWithMine">Compare with my Last Version</button>';

		}
		
		html += '</div>';
		nextStepOptions.innerHTML = html;
		
		//Parse them to widgets
		dojo.parser.parse(nextStepOptions);
		
		//Connect the new widgets
		if (options.resumeEdit) {
			resumeEditButton = mac.utilities.getTabDijit('.resumeEditButton', tab);
			dojo.connect(resumeEditButton, 'onClick',  resumeEdit);
		}
		if (options.showOut) {
			showOutButton = mac.utilities.getTabDijit('.showOutButton', tab);
			dojo.connect(showOutButton, 'onClick', showOut);
		}
		if (options.compare) {
			compareMineButton = mac.utilities.getTabDijit('.compareWithMine', tab);
			dojo.connect(compareMineButton, 'onClick',  compareWithMine);
			//chooseCompare = mac.utilities.getTabDijit('.chooseCompareVersion', tab);
			//chooseCompare.store = mac.experiments.getLastestOtherAuthors(round, experiment);
		}
		
		logProgress('<br><br>');
	}
	
	var showErrors = function (OUT) {
		
		var searchIndex = 0;
		while((OUT.indexOf('E_R_R_O_R', searchIndex) != -1)) {
			var index = OUT.indexOf('E_R_R_O_R', searchIndex);
			
			var prevLineBreak = OUT.indexOf('\n', index - 1000);
			if(prevLineBreak == -1) prevLineBreak = 0;
			
			nodeProcessLog.innerHTML += '<pre>' + OUT.substr(prevLineBreak, 1600) + '</pre><br>' ;
			searchIndex = index + 10;
		}
		
		searchIndex = 0;
		
		while((OUT.indexOf('W_A_R_N_I_N_G', searchIndex) != -1)) {
			var index = OUT.indexOf('W_A_R_N_I_N_G', searchIndex);
			var prevLineBreak = OUT.indexOf('\n', index - 1000);
			if(prevLineBreak == -1) prevLineBreak = 0;
			nodeProcessLog.innerHTML += '<pre>' + OUT.substr(prevLineBreak, 1600) + '</pre><br>' ;
			searchIndex = index + 10;
		}
	}
	
	var setLisrelResult = function setLisrelResult(exitCode) {
		//An output file has been created 
		if (exitCode == 0) {
			//Open up the output file, and check for errors
			//If we find E_R_R_O_R then we alert the user and show the output
			OUT = mac.experiments.getExperimentFileContents(round, experiment, 'OUT.LATEST')
			if ((OUT.indexOf('E_R_R_O_R') != -1) || (OUT.indexOf('W_A_R_N_I_N_G') != -1)) {
				logProgress('<h4>Lisrel reported an error in the input.</h4>');
				showOptions({'resumeEdit': true, 'showOut' : true, 'compare' : false});
				showErrors(OUT);
			}
			else {
				logProgress('<h4>Lisrel ran with success.</h4>');
				//Success
				
				//Copy the OUT.LATEST File to OUT, overwriting the last OUT file
				mac.experiments.moveLatestToOut(round, experiment)
				
				//If the output is ok, then we process it in python to extract the dataset we need	
				parseToMatrix();
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
		
		textarea.focus();
		
		dojo.connect(buttonSaveNotes, 'onClick', function() {
			if(dojo.trim(textarea.get('value')) == '') {
				textarea.focus();
				alert('You must enter some notes to continue.')
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
					showOptions({'resumeEdit': true, 'showOut' : true, 'compare' : true});
				}
				mac.versions.commit(commitNotes, commitListener);
				logProgress("Commit Finished<br>");
			}
		}
		
		var relative = true;
		var directory = mac.experiments.getExperimentDirectory(round, experiment, relative);
		
		//Commit just the important files
		mac.versions.addPaths([directory  + '/\*.LS8',
							   directory + '/OUT', 
		                       directory + '/\*.JSON',], processListener);
							   
		logProgress("Committing new revision.<br>");
	}
	
	var processModel = function processModel() {
	
		try {
			showOutButton.destroy();
			resumeEditButton.destroy();
			compareMineButton.destroy();
			nextStepOptions.innerHTML = '';
		} catch(e) {}
	    
		mac.utilities.nodeHide(nodeNewRevisionCompose);
		mac.utilities.nodeHide(nodeNewRevisionSearch);
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
	dojo.connect(searchButton, 'onClick', findNext);
	
	if(params.initialContent) {
		inputNewRevisionModel.set('value', params.initialContent)
	}
	 
}
