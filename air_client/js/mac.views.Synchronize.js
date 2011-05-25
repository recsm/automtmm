
mac.views.Synchronize = function() {

	var cloneButton = dijit.byId('buttonCloneSubmit');
	var syncButton = dijit.byId('buttonSyncSubmit');
	
	
	
	var onSyncButtonClick = function() {
		
		var dialog = new dijit.Dialog({title : 'Syncronizing with your team',
		 						        style: "width: 400px; height:250px;background-color:#fff;"});
		var logToDialog = function(message) {
			
			//This is in a try catch in the case the dialog is closed during the process
			try {
				dialog.set('content', dialog.get('content') + message + '<br>');
			} catch (e) {}
		}
		
		
		
		var pushToGit = function pushToGit() {
			
			var processListener = new mac.BasicAirListener('git push');
			processListener.listeners.onComplete = function (data, exitCode) {
				if (exitCode == 0) {
					
					logToDialog('Changes uploaded for branch ' + mac.settings.gitBranchName);
					//Publish the sync event to any listeners
					dojo.publish('/mac/sync');
					
					logToDialog('');
					logToDialog('Sync completed');
				} else {
					logToDialog('Failed to upload changes.');
				}
			}
			mac.versions.push(processListener);
		}
		
		
		var pullListener = new mac.BasicAirListener('git pull');
		pullListener.listeners.onComplete = function (data, exitCode) {
			
			if(exitCode == 0) {
				pushToGit();
				logToDialog('Uploading your changes to server');
			} else {
				logToDialog('Failed to download remote changes');
			}
		}
		
		mac.versions.remoteBranchExists(mac.settings.gitBranchName, function onComplete(exists) {
			if (!exists) {
				//Create the branch
				logToDialog('Creating remote branch ' + mac.settings.gitBranchName);
				pushToGit();
				logToDialog('Uploading your changes to server');
			}
			else {
				//Go ahead and pull to update, since we need to pull changes before pushing ours
				mac.versions.pull(pullListener);
			}
		})
	
		logToDialog('Please wait while your copy is synced with the server.');
		logToDialog('');
		logToDialog('Downloading remote changes.');
		dialog.show();
	}
	
	
	var onCloneButtonClick = function() {
	
		 var processListener = new mac.BasicAirListener('git clone')
         processListener.listeners.onExit =   function (event) {
            //Call the on settings changed to update
			//the branch and author, etc....
            mac.versions.onSettingsChanged();
			//Publish the sync event to any listeners
			dojo.publish('/mac/sync');
         }
	
		mac.versions.cloneRepository(processListener);
	}
	
	var init = function() {
		dojo.connect(cloneButton, 'onClick', onCloneButtonClick)
		dojo.connect(syncButton, 'onClick', onSyncButtonClick)
	}
	
	init();
}