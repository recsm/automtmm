
mac.views.Synchronize = function() {

	var cloneButton = dijit.byId('buttonCloneSubmit')
	var syncButton = dijit.byId('buttonSyncSubmit')
	
	onCloneButtonClick = function() {
	
		 var processListener = new mac.BasicAirListener('git clone')
         processListener.setListener('onExit',  function (event) {
            //Call the branch function after the clone has finished
            mac.versions.branchRepository(mac.settings.gitBranchName);
         });
	
		mac.versions.cloneRepository(processListener)
	}
	
	onSyncButtonClick = function() {
		//var pullListener = new mac.BasicAirListener('git pull');
		//pullListener.listeners.onComplete = function() {
			var processListener = new mac.BasicAirListener('git push');
			mac.versions.push(processListener)
		//}
		//mac.versions.pull(pullListener);
	}
	
	var init = function() {
		dojo.connect(cloneButton, 'onClick', onCloneButtonClick)
		dojo.connect(syncButton, 'onClick', onSyncButtonClick)
	}
	init();
}