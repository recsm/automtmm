
mac.views.SingleRevision = function(params) {		
	var tabTitle = 'Round ' + params.round + ' ' + params.experiment + ' '+ params.shortCommitHash;
	tab = mac.controllers.main.openTab(tabTitle)
	tab.set('content', 'loading round ' + params.round + ' experiment ' + params.experiment + ' revision ' + params.commitHash + '...')

	mac.experiments.getExperimentFileRevision(params.round, params.experiment, 'INPUT.LS8', params.commitHash, function (data) {
		tab.set('content', '<pre>' + data + '</pre>');
	});

}	