
mac.views.Synchronize = function() {

	var cloneButton = dijit.byId('buttonCloneSubmit');
	var syncButton = dijit.byId('buttonSyncSubmit');
	
	onCloneButtonClick = function() {
	
		 var processListener = new mac.BasicAirListener('git clone')
         processListener.listeners.onExit =   function (event) {
            //Call the branch function after the clone has finished
            mac.versions.branchRepository(mac.settings.gitBranchName);
         }
	
		mac.versions.cloneRepository(processListener);
	}
	
	onSyncButtonClick = function() {
		
		var dialog = new dijit.Dialog({title : 'Syncronizing with your team',
		 						        style: "width: 400px; height:250px;background-color:#fff;"});
		var logToDialog = function(message) {
			try {
				dialog.set('content', dialog.get('content') + message + '<br>');
			} catch (e) {}
		}
		var pullListener = new mac.BasicAirListener('git pull');
		pullListener.listeners.onComplete = function (data, exitCode) {
			
			if(exitCode == 0) {
				var processListener = new mac.BasicAirListener('git push');
				processListener.listeners.onComplete = function (data, exitCode) {
					if (exitCode == 0) {
						//Refresh the list of experiments
						mac.experiments.refreshExperimentList();
						logToDialog('');
						logToDialog('Sync completed');
					} else {
						logToDialog('Failed to upload changes.');
					}
				}
				mac.versions.push(processListener);
				logToDialog('Uploading your changes to server');
			} else {
				logToDialog('Failed to download remote changes');
			}
			
		}
		mac.versions.pull(pullListener);
		logToDialog('Please wait while your copy is synced with the server.');
		logToDialog('');
		logToDialog('Downloading remote changes.');
		dialog.show();
	}
	
	var init = function() {
		dojo.connect(cloneButton, 'onClick', onCloneButtonClick)
		dojo.connect(syncButton, 'onClick', onSyncButtonClick)
	}
	
	init();
}