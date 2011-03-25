//////////////////////////////////////////////////////
//// GIT VERSIONING 							  ////
//////////////////////////////////////////////////////
mac.versions = {
	//Make a shell call to git, you should supply an processListener instance of new mac.BasicAirListener('my process name for logging purposes')
    git : function git(args, processListener) {
    	var nativeProcessStartupInfo = new air.NativeProcessStartupInfo(); 
		var gitExecutable = new air.File();
		gitExecutable.nativePath = mac.settings.gitCommand;
		nativeProcessStartupInfo.executable = gitExecutable;
		var processArgs = new air.Vector["<String>"](); 
		for (var i in args) {
			processArgs.push(args[i]);
		}
		nativeProcessStartupInfo.arguments = processArgs;
		//Set our initial directory to our repository for the command
		var repoDir = air.File.documentsDirectory.resolvePath('MacMTMM/repository');
		if(!repoDir.isDirectory) {

			repoDir.createDirectory();	
		}
		nativeProcessStartupInfo.workingDirectory = repoDir;
		
		//Call the init method of the listener that we were passed
		var process = new air.NativeProcess();
		processListener.init(process);
		processListener.log('Calling:: git ' + args.join(' '));
		process.start(nativeProcessStartupInfo);   
		
    },
    //Do the initial checkout of the repository
    cloneRepository : function cloneRepository(processListener) {
		 //Clone the initial repository
    	 mac.versions.git(['clone', 
    	     mac.settings.masterRepository,
    	     air.File.documentsDirectory.resolvePath('MacMTMM/repository').nativePath],
    	     processListener);
    },
    branchRepository : function branchRepository(branchName) {
    	//Branch repository and switch to new branch
    	var processListener = new mac.BasicAirListener('git checkout -b');
    	mac.versions.git(['checkout', '-b', branchName], processListener);
    },
	//When the settings object for mac has been changed then we do an update
	onSettingsChanged : function onSettingsChanged() {
		var processListener = new mac.BasicAirListener('git checkout')
		processListener.listeners.onExit = function(event) {
			//1 means branch does not exist yet
			if (event.exitCode == 1) {
				mac.versions.branchRepository(mac.settings.gitBranchName);
			}
		}
		mac.versions.checkOutBranch(mac.settings.gitBranchName, processListener);
		var configProcessListener = new mac.BasicAirListener('git config');
		configProcessListener.listeners.onExit = function(event) {
			configProcessListener.log("EXIT: Process exited with code " + event.exitCode);
	        mac.versions.setConfig('user.email', mac.settings.userEmail, new mac.BasicAirListener('git config'));
		}
		mac.versions.setConfig('user.name', mac.settings.userName, configProcessListener);
		
	},
	//call git show to get a revision of a file at a specific commit
	showFileRevision : function showFileRevision(filePath, commitHash, processListener) {
		mac.versions.git(['show', commitHash + ':' + filePath], processListener);
	},
	//Get a diff of the same file between two versions
	showFileDiff : function showFileDiff(filePath, fromCommitHash, toCommitHash, processListener) {
		mac.versions.git(['diff', fromCommitHash, toCommitHash, '--', filePath], processListener);
	},
	//make a html markup of a diff file
	diffToHtml : function diffToHtml(diff){
		var lines 		= diff.split("\n");
		var diffBlocks  = []
		var blockIndex  = -1;
		
		var firstAtReached = false;
		for (var i in lines) {
			var line = lines[i];
			//The first char is the marker in the diff output
			var firstChar = line.substr(0,1);
			if(!firstAtReached && firstChar != '@') continue;  //Skip the first few lines
			if (firstChar == '@') {
				firstAtReached = true;
				blockIndex ++;
				diffBlocks[blockIndex] = '';
			}
			
			var restOfLine = line.substr(1);
			// ' ' output as a normal line
			if(firstChar == ' ') {
				diffBlocks[blockIndex] += '<div>' + restOfLine + '</div>';
			} else if(firstChar == '-') {
				diffBlocks[blockIndex] += '<div class="diffLineRemoved">' + restOfLine + '</div>';
		    } else if(firstChar == '+') {
				diffBlocks[blockIndex] += '<div class="diffLineAdded">' + restOfLine + '</div>';
			} else {
				diffBlocks[blockIndex] += '<div class="diffOtherLine">' + line + '</div>';
			}
		}
		if(diffBlocks.length == 0){
			var html = '<div class="diffBlock">No differences found in source.</div>';
		} else {
			var html = '<h4>Total Changes:' + diffBlocks.length + '</h4>';
			html += '<div class="diffBlock">' + diffBlocks.join('</div><div class="diffBlock">') + '</div>';
		}
		
		return html;
	},
	setConfig : function setConfig(property, value, processListener) {
		mac.versions.git(['config', property, value], processListener);
	},
    //Get a list of all local branches
    getRemoteBranchList : function getBranchList(processListener) {
    	//call git branch with no args 
    	mac.versions.git(['branch', '-r'], processListener);
    },
    //Parse a branch list into an array of branchNames
    parseRemoteBranchList : function parseBranchList(branchList) {
    	var current;
    	var branches = [];
    	var lines = branchList.split("\n");
    	for (var i in lines) {
    		var line = lines[i]
    		var branchName = dojo.string.trim(line)
			//Skip empty lines
    		if (branchName == '') continue;
			//Skip this line origin/HEAD -> origin/master
			if (branchName.indexOf('origin/HEAD') != -1) continue;
    		branches.push(branchName);
    	}
		console.log(branches)
    	return branches;
    },
    checkOutBranch : function checkOutBranch(branchName, processListener) {
    	//call git checkout with branchName to check out an existing branch
    	mac.versions.git(['checkout', branchName], processListener);
    },
    commit : function commit(message, processListener) {
    	//Commit our changes to the local repository
    	//Push from our origin repo to the master
    	mac.versions.git(['commit', '-a', '-m', message], processListener);
    },
    push : function push(processListener) {
    	//Push from our origin repo to the master
    	mac.versions.git(['push', 'origin', mac.settings.gitBranchName], processListener);
    },
    pull : function pull(processListener) {
    	//Push from our origin repo to the master
    	mac.versions.git(['pull'], processListener);
    },
	addDirectory : function addDirectory(directoryPath, processListener){
		//Add a directory to version control
		mac.versions.git(['add', directoryPath  + air.File.separator + '\*'], processListener)
	},
	//Get a log from git
	getLog : function getLog(branchName, path, processListener) {
		var format = '--pretty=format:shortCommitHash_:_%h_,_commitHash_:_%H_,_authorName_:_%an_,_authorDate_:_%ad_,_authorTime_:_%at_,_subject_:_%s _END_LINE_'
		mac.versions.git(['log', format, branchName, '--', path], processListener)
	},
	//Get a list of all files inside a branch
	getBranchFileList : function getBranchFileList(branchName, processListener) {
		mac.versions.git(['ls-tree', '-r', branchName], processListener)
	},
	//Returns an object list from the results of getBranchFileList
	parseBranchFileList: function(fileList) {
		var files = []
		var lines = fileList.split("\n")
		for (var i in lines) {
			if (lines[i].indexOf("\t") == -1) continue;
			var parts   = lines[i].split("\t");
			var details = parts[0].split(" ");
			files.push({
				type    	: details[1],
				SHA     	: details[2],
				objectName  : parts[1]
			})
		}
		return files;
	},
	//Parse a log obtained with getLog
	parseLog : function parseLog(logData) {
		var items = []
		var revisions = logData.split('_END_LINE_')
		for (var i in revisions) {
		    if (revisions[i].indexOf('_,_') != -1) {
			    var item = {}
				var sections = revisions[i].split('_,_')
				for (var j in sections) {
				    if (sections[j].indexOf('_:_' != -1)) {
						var parts = sections[j].split('_:_')
						item[dojo.trim(parts[0])] = dojo.trim(parts[1]);
					}
				}
				items.push(item)
			}
		}
		return items
	},
	startPageant : function startPageant() {
		//On windows pageant keeps ppk keys in memory which are used by plink to ssh
		//This calls pageant with the My Documents/MacMTMM/mac.ppk so that no 
		//password or further interaction with git on windows is needed
		var nativeProcessStartupInfo = new air.NativeProcessStartupInfo();
        var file = air.File.applicationDirectory.resolvePath("putty/pageant.exe");
        var ppkFile = air.File.documentsDirectory.resolvePath('MacMTMM/mac.ppk');
        var processArgs = new air.Vector["<String>"](); 
		processArgs.push(ppkFile.nativePath);
		nativeProcessStartupInfo.arguments = processArgs;
        nativeProcessStartupInfo.executable = file;
        var process = new air.NativeProcess();
        var processListener = new mac.BasicAirListener('pageant')
        processListener.init(process)
        process.start(nativeProcessStartupInfo);
		},
	init : function init() {
		//Setup the environment
		mac.versions.startPageant()
	}
}