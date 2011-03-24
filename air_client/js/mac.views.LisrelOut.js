
//A helper view to see output from lisrel when there is an error

mac.views.LisrelOut = function(params) {
	var tabTitle = 'Round ' + params.round + ' ' + params.experiment + ' (OUT)';
	tab = mac.controllers.main.openTab(tabTitle)
	tab.set('content', '<h3>Lisrel Output for new version of Round' + params.round  +' ' + params.experiment +'</h3><pre>' + params.out + '</pre>')
}