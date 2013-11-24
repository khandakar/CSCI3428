/************************************************************************************
  This is your background code.
  For more information please visit our wiki site:
  http://docs.crossrider.com/#!/guide/scopes_background
 *************************************************************************************/

appAPI.ready(function($) {  

	console.log("background started");
	/* listener so the extension can talk to the background */
	var lid = appAPI.message.addListener(function(msg) {
		switch (msg.action) { 

		case 'gotoUrl': sendToURL(msg.value); break;

		case 'updateFolders': updateBrowserFolder(); break;

		} 
	}); 



	var maxMainBookmarks=40; 	 // dont read past 200 main bookmarks
								 // this means if the folder has more than 200 they will be
								 // deleted 
	var maxRecentBookmarks=10; 	 // dont read past 20 recent bookmarks
	var useFolders=1; // 0= use folder options , 1 = use DB only
	var multiFolderDetected = 0; // when SMUT folder checked, if multiple are found or multiple recent folders, this = 1
								 // this only gets reset when the defaults are loaded
	var forcedUpdate=1; // 0 = off, 1 = on
						// forced update will send request to update UI
						// regardless if a change was detecting or not
						// this requires more resources but allows for
						// changes in 1 browser window to pass onto a 
						// second window.
						// With this off, tabs in the same window are
						// all the same. This is only useful when
						// more than 1 browser window is open.
	var bookmarkUpdateSpeed=1500;   // in ms, do not set too low (fast)
									// as this is resource heavy
									// modern computers can easily handle 
									// 5000 (5ms) tested 



	/* set the image, must be a 19x19*/
	var toolbarShown=getToolbarStatus();
	var toolbarShownIcon="icons/favicon 19x19.png";//"icons/19_19_on.png";
	var toolbarHiddenIcon="icons/favicon 19x19 BW.png";//"icons/19_19_off.png";
	var toolbarShownText="Turn SMUT Toolbar OFF";
	var toolbarHiddenText="Turn SMUT Toolbar ON";


	/* used to check what data is sent to and displayed to the user do NOT edit this*/
	var oldBMSinTabs=[];
	var newBMSinTabs=[];
	var isDiff=0;




	firstUseSetUp(); // make sure toolbar is shown or hidden on load

	/*
		first time background loads it checks to see
		if the toolbar should be shown or hidden
	 */
	function firstUseSetUp()
	{
		toolbarShown=preToggle(toolbarShown);	// so signal a toggle we swap the
		// current value and then toggle it

		appAPI.contextMenu.add("toggleToolbar", "Toolbar Toggle", function (data) {
			toggleToolbar();
		}, ["all"]);


		toggleToolbar();	
	}

	/* gets current toolbar status (0 is hidden, 1 is on) */
	function getToolbarStatus()
	{
		var value=appAPI.db.get("toolbarStatus");

		if(value==null)
		{
			appAPI.db.set("toolbarStatus", 1);
			return 1;
		}
		else
		{

			return value;
		}
	} 

	/* checks to see if the badge is lit up (on) or off */
	function checkBadge()
	{
		var currentBadge=getToolbarStatus();
		if(toolbarShown!=currentBadge)
		{
			toggleToolbar();
		}
	}

	/* given 1, return 0. given 0, return 1 */
	function preToggle(value)
	{
		if(value==0)
		{
			return 1;
		}
		return 0;

	}

	/* 
		switches the toolbar from on and off
		and saved the value in the database
		lastly, tells the UI to update
	 */
	function toggleToolbar()
	{
		if(toolbarShown==0)
		{
			turnOnToolbar();
		}
		else 
		{
			turnOffToolbar();
		}

		appAPI.db.set("toolbarStatus", toolbarShown);

		appAPI.message.toAllTabs({'action':'toggleTb', 'value':toolbarShown}); // make sure UI is on/off

	}

	/* turns the toolbar on */
	function turnOnToolbar()
	{	
		toolbarShown=1;
		appAPI.contextMenu.updateTitle("toggleToolbar", "Hide Toolbar");
		appAPI.browserAction.removeBadge();// reset the icon
		appAPI.browserAction.setResourceIcon(toolbarShownIcon);
		appAPI.browserAction.setTitle(toolbarShownText);
	} 


	/* turns the toolbar off */
	function turnOffToolbar()
	{	
		toolbarShown=0;
		appAPI.browserAction.removeBadge();// reset the icon
		appAPI.contextMenu.updateTitle("toggleToolbar", "Show Toolbar");
		appAPI.browserAction.setResourceIcon(toolbarHiddenIcon);
		appAPI.browserAction.setTitle(toolbarHiddenText);
	}

	/* user clicked the badge */
	appAPI.browserAction.onClick(function() {
		// Changes the badge text
		toggleToolbar();
	});



	/*
    	Given a url, creates a new tab that is located 
    	at the given url.
	 */          
	function sendToURL(URL)
	{
		appAPI.tabs.create(URL);

	}

	/*
    	A easy way for the background to send debugging
    	messages to the extension

    	refer to extension.js for debug information
    	function addDebug ()
	 */
	function sendDebug(level, msg)
	{   

		appAPI.message.toActiveTab({'action':'debugger','debug':msg, 'level':level}); 

	}

	/*
		Crossrider API for searching all bookmarks
		Gets all bookmarks and returns them in 
		result. Result is a bookmark object

	 */
	function searchRecursive(currentRoot){
		var result = [];
		result.push(currentRoot);
		if (currentRoot.isFolder &&
				currentRoot.hasOwnProperty("children") &&
				typeof currentRoot.children !== "undefined" &&
				currentRoot.children.length > 0) {
			currentRoot.children.forEach(function (child){
				result = result.concat(searchRecursive(child));
			});
		}

		return result;
	} 

	/*
    	Gets all bookmarks from the browser and returns them
    	in either:
    	1) if returnType is not 2
    	in a 2d array with this format:
    	[[title],[url],[status]] where status represents
    	status 0=normal bookmark
    		   1=recent bookmark
    		   2=search domain (not currently used)
    	2) if returnType is 2, nodes are returned (they are
    	apart of crossrider bookmark api)
        Bookmarks with its direct parent name "SMUT" are
        normal
        If the direct parent is SMUTRecent, they are a recent
        If the direct parent is SMUTSearch, they are a search
        domain

        This will not edit bookmarks, it simply reads them

        The ordering of bookmarks is directly from the order 
        of which they appear in the browser bookmarks
	 */
	function getSMUTBookmarks (returnType)
	{
		sendDebug(0, "Entered getSMUTBookmarks<br>");

		var _bookmarks=[];
		var _folders=[];
		var _nodes=[];
		var newBookmarks=new Array();
		var newBookmarksCount=0;
		var numFolder=new Array();
		var numRecentBM=0;
		var numMainBM=0;
		numFolder[0]=0; // SMUT
		numFolder[1]=0; // SMUTRecent
		sendDebug(0, "getSMUTBookmarks - About to enter get tree<br>");



		appAPI.bookmarks.getTree(function(nodes) {
			sendDebug(0, "getSMUTBookmarks - Inside get tree<br>");
			var result = searchRecursive(nodes[0]),
					message = 'Number of nodes: ' + result.length + '\nDetails::';

			for (var i=0; i < result.length; i++) 
			{
				message += '\n    Title: ' +
						(result[i].title ? result[i].title : '<RootFolder>') +
						(result[i].isFolder ? ' (folder)' : '');

				if(!result[i].isFolder)
				{
					if(result[i].parentFolderName == "SMUT" && numMainBM<maxMainBookmarks)
					{
						newBookmarks[newBookmarksCount]=new Array();
						newBookmarks[newBookmarksCount][0]=result[i].title;
						newBookmarks[newBookmarksCount][1]=result[i].url;
						newBookmarks[newBookmarksCount][2]=0;
						newBookmarksCount++;
						_bookmarks.push(result[i]);
						numMainBM++;
					}
					if(result[i].parentFolderName == "SMUTRecent" && numRecentBM<maxRecentBookmarks)
					{
						newBookmarks[newBookmarksCount]=new Array();
						newBookmarks[newBookmarksCount][0]=result[i].title;
						newBookmarks[newBookmarksCount][1]=result[i].url;
						newBookmarks[newBookmarksCount][2]=1;
						newBookmarksCount++;
						_bookmarks.push(result[i]);
						numRecentBM++;
					}

				}
				else
				{
					if(result[i].title == "SMUT")
					{
						numFolder[0]++;

						_folders.push(result[i]);
					}
					if(result[i].title == "SMUTRecent")
					{
						numFolder[1]++;
						_folders.push(result[i]);
					}
				}

			}
			sendDebug(0, "Exiting getSMUTBookmarks. Found: "+newBookmarks.length+" SMUT related bookmarks.<br>");

			if(numFolder[0]>1 || numFolder[1]>1)
			{
				multiFolderDetected=1;
			}
			_nodes=_folders.concat(_bookmarks);
			if(returnType==2)
			{
				return _nodes;
			}

			return newBookmarks;
		});

	} // end of getSMUTBookmarks()


	/*
		Like getSMUTBookmarks except instead of returning a value
		it calls a second function at the end.
		Also allows you to return data with it.

		VERY useful in database calls

	 */
	function getSMUTBookmarksThenCall (returnType, returnCall, otherData)
	{
		sendDebug(0, "Entered getSMUTBookmarksThenCall<br>");

		var _bookmarks=[];
		var _folders=[];
		var _nodes=[];
		var newBookmarks=new Array();
		var newBookmarksCount=0;
		var numFolder=new Array();
		var numMainBM=0;
		var numRecentBM=0;
		numFolder[0]=0; // SMUT
		numFolder[1]=0; // SMUTRecent
		sendDebug(0, "getSMUTBookmarks - About to enter get tree<br>");

		appAPI.bookmarks.getTree(function(nodes) {
			sendDebug(0, "getSMUTBookmarks - Inside get tree<br>");

			var result = searchRecursive(nodes[0]),
					message = 'Number of nodes: ' + result.length + '\nDetails::';

			for (var i=0; i < result.length; i++) 
			{
				message += '\n    Title: ' +
						(result[i].title ? result[i].title : '<RootFolder>') +
						(result[i].isFolder ? ' (folder)' : '');

				if(!result[i].isFolder)
				{
					if(result[i].parentFolderName == "SMUT" && numMainBM<maxMainBookmarks)
					{
						newBookmarks[newBookmarksCount]=new Array();
						newBookmarks[newBookmarksCount][0]=result[i].title;
						newBookmarks[newBookmarksCount][1]=result[i].url;
						newBookmarks[newBookmarksCount][2]=0;
						newBookmarksCount++;
						numMainBM++;
						_bookmarks.push(result[i]);
					}
					if(result[i].parentFolderName == "SMUTRecent" && numRecentBM<maxRecentBookmarks)
					{
						newBookmarks[newBookmarksCount]=new Array();
						newBookmarks[newBookmarksCount][0]=result[i].title;
						newBookmarks[newBookmarksCount][1]=result[i].url;
						newBookmarks[newBookmarksCount][2]=1;
						newBookmarksCount++;
						numRecentBM++;
						_bookmarks.push(result[i]);
					}

				}
				else
				{
					if(result[i].title == "SMUT")
					{						
						numFolder[0]++;

						_folders.push(result[i]);
					}
					if(result[i].title == "SMUTRecent")
					{
						numFolder[1]++;

						_folders.push(result[i]);
					}

				}

			}
			sendDebug(0, "Exiting getSMUTBookmarks. Found: "+newBookmarks.length+" SMUT related bookmarks.<br>");

			if(numFolder[0]>1 || numFolder[1]>1)
			{
				multiFolderDetected=1;
			}

			_nodes=_folders.concat(_bookmarks); // make sure folders are always before bookmarks

			/* handle our return call */
			if(returnCall=="compareDBToFolder")
			{
				compareDBToFolder(newBookmarks, otherData);
			}
			else if(returnCall=="deleteCurrentSMUTBM")
			{
				deleteCurrentSMUTBM(_nodes,otherData);
			}
			else
			{
				sendDebug(2, "<b>CRITICAL</b>: getSMUTBookmarksThenCall was called with an improper returnCall (saw "+returnCall+")<br>");
			}

		});

	} // end of getSMUTBookmarksThenCall()






	/*
		since our db is asynch, sometimes the old bookmarks are sent
		to the user (whens that were just updated, but still being processed)
		this double checks everything and if the old bm was sent,
		we let the browser know the current ones are now available
		and to update.
	 */
	setInterval(function(){
		sendDebug(0, "<b>timer running</b>");
		var currentDif=compareWithReturn (oldBMSinTabs, newBMSinTabs);
		if(currentDif!=-1)
		{
			if(isDiff!=currentDif)
			{
				appAPI.message.toAllTabs({'action':'notify','type':'db', 'todo':'update'}); 
				isDiff=0;
				oldBMSinTabs=newBMSinTabs;
				sendDebug(0, "<b>timer</b> found diff");
			}
			else
			{
				sendDebug(0, "<b>timer</b> found no diff");
			}
		}
		else
		{
			if(useFolders==0)
			{
				dbSaveBM (getDefaults(), "compareDBToFolder");
			}
			sendDebug(1, "<b>timer</b> encountered an error. This can happen if the toolbar was just installed or the browser bookmarks have not been initialised.<br>");
		}
		sendDebug(0, "<b>timer exited</b>");
	},1000); 



	/*
    	given a bookmark array and the function name
    	that called it, it will save the bookmarks to 
    	the database

    	the bookmarks to store are saved in a variable
    	which is later tested to make sure the most
    	accurate information is displayed to the user
	 */
	function dbSaveBM (BMToSave, calledFrom)
	{
		oldBMSinTabs=BMToSave;

		sendDebug(0, "<b>dbSaveBM</b> saving "+BMToSave+"<br>");

		appAPI.db.async.set(
				"bookmarks",
				BMToSave,
				dbSaveBMSuccess(calledFrom) 
				);

	}


	/*
		if called from compareDBToFolder() then the browser
		will notify all tabs to update there bookmarks that
		are currently displayed to the user

		this is usually done after saving bookmarks to the database

		the database is tested with a get to make sure the data is there
		this is saved in a variable which we can later compare with
		previous changes to make sure we have the most up to date 
		data being displayed to users
	 */
	function dbSaveBMSuccess (calledFrom)
	{

		sendDebug(0, "dbSaveBMSuccess: "+calledFrom+" DB call save successful<br>");
		if(calledFrom=="compareDBToFolder")
		{
			sendDebug(0, "dbSaveBMSuccess: letting browser know to update toolbar<br>");
			appAPI.message.toAllTabs({'action':'notify','type':'db', 'todo':'update'}); 
		}


		appAPI.db.async.get("bookmarks", function(value) {
			if(value!=null)
				newBMSinTabs=value;
			sendDebug(3, "<b>dbSaveBMSuccess</b> get test result "+value+"<br>");
		});	

	}



	/*
		given a set of bookmarks, the browser will be updated with
		the bookmarks
	 */
	function dbGetBMforUpdateFolders (data)
	{
		sendDebug(0, "dbGetBMforUpdateFolders: sending data to browser<br>");
		updateBrowserFolderWithData(data);
	}


	/* 
		every 5 seconds we get the database bookmarks and then compare with the folder
		bookmarks in the browswer
	 */
	setInterval(function(){
		if(useFolders==1)
		{
			appAPI.db.async.get("bookmarks", function(value) {
				if(forcedUpdate == 1)
				{
					checkBadge(); // update the toolbar image and status
				}
				compareDBToFolderStepOne(value);
			});	
		}
		else // no need to check difference in DB against the folders
		{
			if(forcedUpdate == 1)
			{
				checkBadge(); // update the toolbar image and status
			}
		}
	},bookmarkUpdateSpeed); 


	/*
    	given a set of bookmarks (should be the database bookmarks)
    	it will compare with the folder bookmarks
    	if changes need to be made, they are done in getSMUTBookmarksThenCall()
	 */
	function compareDBToFolderStepOne (compareWith)
	{

		getSMUTBookmarksThenCall(1, "compareDBToFolder", compareWith);
	}



	/*
    	given 2 bookmark arrays it is determined if they are
    	the same or not.

    	the first set of bookmarks is to be the folder bookmarks
    	the second set of bookmarks is to be from the database

    	In order, only one of these can occur:

    	1) If the folder bookmarks are empty, then the default
    	bookmarks are created in the browser

    	2) If the database bookmarks are empty, the folder bookmarks
    	are saved to the database

    	3) If a difference between the two is found, the folder
    	bookmarks are saved into the database

    	4) There is no difference and nothing changes

	 */
	function compareDBToFolder (theBMs, compareWith)
	{
		sendDebug(0, "compareDBToFolder: ENTERED<br>");

		var SMUTBMs=theBMs;
		sendDebug(0, "compareDBToFolder: SMUTBMs: "+SMUTBMs+".<br>");
		sendDebug(0, "compareDBToFolder: compareWith: "+compareWith+".<br>");

		var stopped=0;
		var difference=0; 
		if(SMUTBMs==null || SMUTBMs.length == 0)
		{
			sendDebug(0, "compareDBToFolder: SMUTBMs was null/empty!.<br>");
			updateBrowserFolderWithData(getDefaults());// delete any left over SMUT folders then create defaultssetupBrowserFolder(getDefaults());
			dbSaveBM(getDefaults(), "compareDBToFolder"); // make sure DB is updated with defaults
			stopped=1;
		}
		else
		{
			sendDebug(0, "compareDBToFolder: SMUTBMs was not null.<br>");
		}

		if(stopped!=0)
		{
			sendDebug(0, "compareDBToFolder: Stop code: "+stopped+".<br>");
			return;
		}
		if(compareWith==null || compareWith.length == 0)
		{
			sendDebug(0, "compareDBToFolder: compareWith was null/empty!.<br>");
			dbSaveBM(SMUTBMs, "compareDBToFolder") // update database with folder BMs
			stopped=2;
		}
		else
		{
			sendDebug(0, "compareDBToFolder: compareWith was not null.<br>");
		}
		if(stopped!=0)
		{
			sendDebug(0, "compareDBToFolder: Stop code: "+stopped+".<br>");
			return;
		} 

		if(multiFolderDetected==1 || noMain(SMUTBMs) || noRecent(SMUTBMs))
		{
			sendDebug(0, "compareDBToFolder: Detected browser folder was semi empty, or multiple SMUT folders!.<br>");
			updateBrowserFolderWithData(getDefaults());// delete any left over SMUT folders then create defaults//setupBrowserFolder(getDefaults());
			dbSaveBM(getDefaults(), "compareDBToFolder"); // make sure DB is updated with defaults
			stopped=3;

		}
		if(stopped!=0)
		{
			sendDebug(0, "compareDBToFolder: Stop code: "+stopped+".<br>");
			return;
		} 
		// both are not null, compare length
		if(SMUTBMs.length == compareWith.length)
		{
			sendDebug(0, "compareDBToFolder: both bookmark list are the same length ("+compareWith.length+")<br>");

			// compare the values
			for(var i=0; i<SMUTBMs.length; i++)
			{
				if(SMUTBMs[i][0]!=compareWith[i][0] 
						|| SMUTBMs[i][1]!=compareWith[i][1]
								|| SMUTBMs[i][2]!=compareWith[i][2])
				{ 
					difference=1;

				}	
			}	

		}
		else
		{
			difference=1;	
		}

		if(difference==1) 
		{
			sendDebug(0, "compareDBToFolder: difference found, lets update using the browser folders<br>");
			dbSaveBM(SMUTBMs, "compareDBToFolder"); // save folders to database
		}
		else
		{
			if(forcedUpdate == 1) // tell browser to update anyways
			{
				sendDebug(0, "Attempting a forced update.<br>");
				appAPI.message.toActiveTab({'action':'notify','type':'db', 'todo':'update'}); 
				sendDebug(0, "Forced update complete.<br>");
			}
			sendDebug(0, "compareDBToFolder: no difference found.<br>");
		}
		sendDebug(0, "compareDBToFolder: EXITING<br>");

	} // end of compareDBToFolder


	/*
    	given bookmarks,
    	if no main bookmarks are present, 1 is returned
    	0 otherwise
	 */
	function noMain (SMUTBMs)
	{
		if(SMUTBMs == null || SMUTBMs.length == 0)
		{
			return 1;
		}
		for(var i = 0; i < SMUTBMs.length; i++)
		{
			if(SMUTBMs[i][2]==0)
			{
				return 0;
			}
		}
		return 1;
	}


	/*
    	given bookmarks,
    	if no recent bookmarks are present, 1 is returned
    	0 otherwise
	 */
	function noRecent (SMUTBMs)
	{
		if(SMUTBMs == null || SMUTBMs.length == 0)
		{
			return 1;
		}
		for(var i = 0; i < SMUTBMs.length; i++)
		{
			if(SMUTBMs[i][2]==1)
			{
				return 0;
			}
		}
		return 1;
	}
	/*
    	given 2 bookmark arrays it is determined if they are
    	the same or not.

    	returns -1 on error
    			0 if the same
    			1 if there is a difference

	 */
	function compareWithReturn (theBMs, compareWith)
	{

		var SMUTBMs=theBMs;
		var difference=0; 
		if(SMUTBMs==null || SMUTBMs.length==0)
		{
			return -1;
		}

		if(compareWith==null || compareWith.length==0)
		{
			return -1;
		}


		// both are not null, compare length
		if(SMUTBMs.length == compareWith.length)
		{

			// compare the values
			for(var i=0; i<SMUTBMs.length; i++)
			{

				if(SMUTBMs[i][0]!=compareWith[i][0] 
						|| SMUTBMs[i][1]!=compareWith[i][1]
								|| SMUTBMs[i][2]!=compareWith[i][2])
				{ 
					difference=1;

				}	
			}	

		}
		else
		{
			difference=1;	// not the same length
		}

		if(difference==1)
		{
			return 1; // difference found

		}
		else
		{
			return 0; // no difference
		}


	} // end of compareWithReturn



	/*
    	puts the default bookmarks into an array and returns them

    	you may edit the default bookmarks here.

    	If you delete the browser folder "SMUT", these bookmarks
    	will be loaded by default overridding the database values
    	this allows for the bookmarks to be pushed and managed
    	easily via the browsers bookmark system.
	 */
	function getDefaults ()
	{

		sendDebug(0, "getDefaults: processing default BM<br>");

		var defaultBookmarks=new Array([]); 

		// main BM

		defaultBookmarks=new Array([]);
		defaultBookmarks[0][0]="Smu Home";
		defaultBookmarks[0][1]="http://smu.ca";
		defaultBookmarks[0][2]=0; 

		defaultBookmarks[1]=new Array();
		defaultBookmarks[1][0]="Smu Student";
		defaultBookmarks[1][1]="http://www.smu.ca/currentstudents/";
		defaultBookmarks[1][2]=0; 

		defaultBookmarks[2]=new Array();
		defaultBookmarks[2][0]="Academic Programs";
		defaultBookmarks[2][1]="http://www.smu.ca/academic.html";
		defaultBookmarks[2][2]=0; 

		defaultBookmarks[3]=new Array();
		defaultBookmarks[3][0]="Smu Banner";
		defaultBookmarks[3][1]="https://ssb-nlive.smu.ca/pls/sNLIVE/twbkwbis.P_GenMenu?name=homepage";
		defaultBookmarks[3][2]=0; 

		defaultBookmarks[4]=new Array();
		defaultBookmarks[4][0]="Smu Port";
		defaultBookmarks[4][1]="http://smuport.smu.ca/cp/home/loginf";
		defaultBookmarks[4][2]=0; 

		defaultBookmarks[5]=new Array();
		defaultBookmarks[5][0]="Site Map";
		defaultBookmarks[5][1]="http://www.smu.ca/sitemap.html";
		defaultBookmarks[5][2]=0; 

		defaultBookmarks[6]=new Array();
		defaultBookmarks[6][0]="Contact";
		defaultBookmarks[6][1]="http://www.smu.ca/contact-01.html";
		defaultBookmarks[6][2]=0; 

		// end of main BM


		// recents
		defaultBookmarks[7]=new Array();
		defaultBookmarks[7][0]="Smu Home";
		defaultBookmarks[7][1]="http://smu.ca";
		defaultBookmarks[7][2]=1; 

		defaultBookmarks[8]=new Array();
		defaultBookmarks[8][0]="Smu Student";
		defaultBookmarks[8][1]="http://www.smu.ca/currentstudents/";
		defaultBookmarks[8][2]=1; 

		defaultBookmarks[9]=new Array();
		defaultBookmarks[9][0]="Academic Programs";
		defaultBookmarks[9][1]="http://www.smu.ca/academic.html";
		defaultBookmarks[9][2]=1; 

		defaultBookmarks[10]=new Array();
		defaultBookmarks[10][0]="Smu Banner";
		defaultBookmarks[10][1]="https://ssb-nlive.smu.ca/pls/sNLIVE/twbkwbis.P_GenMenu?name=homepage";
		defaultBookmarks[10][2]=1; 

		// end of recent BM


		sendDebug(0, "getDefaults: "+defaultBookmarks.length+" bookmarks to be inserted into browser<br>");

		sendDebug(0, "exiting getDefaults:<br>");
		return defaultBookmarks;

	}

	/*
    	Gets the bookmarks from the database so they
    	may be inserted into the browser 

    	The current browser bookmarks are deleted and
    	after the bookmarks from the database are 
    	inserted
	 */
	function updateBrowserFolder ()
	{
		sendDebug(0, "entered updateBrowserFolder<br>");

		appAPI.db.async.get("bookmarks", function(value) {
			dbGetBMforUpdateFolders(value);
		});	
		sendDebug(0, "exiting updateBrowserFolder<br>");

	}

	/*
    	given an array of bookmarks, the current bookmarks
    	are delete from the browser and replace with 
    	the bookmarks it was passed
	 */
	function updateBrowserFolderWithData (theBMs)
	{
		sendDebug(0, "entered updateBrowserFolderWithData<br>");
		if(theBMs==null || theBMs.length==0)
		{
			sendDebug(0, "updateBrowserFolderWithData: bookmarks are null/empty<br>");
			return;
		}
		if(useFolders==1)
		{
			deleteCurrentSMUTBMStepOne(theBMs); 
		}
		else
		{
			newBMSinTabs=theBMs;
		}


		sendDebug(0, "exiting updateBrowserFolderWithData<br>");	
	}


	/*
		grabs the bookmark nodes from the browser 
		so they can be deleted and the new bookmarks 
		will be added to the browser
	 */
	function deleteCurrentSMUTBMStepOne (theBMs)
	{
		getSMUTBookmarksThenCall(0, "deleteCurrentSMUTBM", theBMs);
	}


	/*
		takes in node(s) and a bookmark array
		removes the nodes from the browser and
		then adds in bookmarks to the browser
	 */
	function deleteCurrentSMUTBM (theNodes, theBMs)
	{
		var currentNodes=theNodes;
		if(currentNodes==null || currentNodes.length==0)
		{
			sendDebug(1, "<b>deleteCurrentSMUTBM</b>: currentNodes is null<br>");
			setupBrowserFolder(theBMs);
			return;
		}
		sendDebug(0, "<b>deleteCurrentSMUTBM</b>: "+currentNodes.length+" nodes about to be deleted.<br>");


		removeNodes(currentNodes, theBMs);
	}

	/*
		given node(s) they will be processed and removed from
		the browser.
		This is a recursive call.

		Takes in the nodes, and a bookmark array to send be used
		for setting up the new bookmark nodes

	 */
	function removeNodes (currentNodes, theBMs) // recursive
	{

		if (currentNodes.length > 0) 
		{
			var node=currentNodes.pop(); // shrink the node list

			// since our list has all the folders first then bookmarks
			// we remove all bookmarks than folders
			// so when we get to a folder (aka the node has childred)
			// its length is inaccurate and we need to set it to 0
			// otheriwiese the api call bookmarks.remove will fail
			if(node.children!=null)
			{
				node.children.length=0;
			}

			appAPI.bookmarks.remove(node, function() {
				removeNodes(currentNodes,theBMs);
			});
		}
		else
		{ 
			sendDebug(0, "removeNodes: all nodes removed. update from DB now<br>");
			setupBrowserFolder(theBMs); // setup the new bookmarks
		}

	} // end of removeNodes()


	/*
		given an array of bookmarks and a status of the bookmark 
		to look for (0=main, 1=recent) the bookmarks with the
		status are returned
	 */
	function seperateBMs (theBMs, theStatus)
	{
		sendDebug(0, "seperateBMs: ENTERED<br>");

		var newList=[];
		var countNew=0;
		for(var i=0; i<theBMs.length; i++)
		{
			if(theBMs[i][2]==theStatus)
			{
				newList[countNew]=new Array();
				newList[countNew][0]=theBMs[i][0]; // title
				newList[countNew][1]=theBMs[i][1]; // url
				newList[countNew][2]=theBMs[i][2]; // status
				countNew++;
			}

		}
		sendDebug(0, "seperateBMs: newList length: "+newList.length+"<br>");
		sendDebug(0, "seperateBMs: EXITING<br>");

		return newList;
	} // end of seperateBMs



	/*
		given an array of bookmarks, they will be seperated into
		recent and main bookmarks.

		Then, the browser is updated with a folder named SMUT
		container the main bookmarks and a folder SMUTRecent which
		contains the recent bookmarks.

	 */
	function setupBrowserFolder (theBMs)
	{
		sendDebug(0, "setupBrowserFolder: ENTERED<br>");

		var newMains=seperateBMs(theBMs, 0);
		var newRecents=seperateBMs(theBMs, 1);
		sendDebug(0, "<b>setupBrowserFolder</b>: newMains "+newMains.length+" newRecents "+newRecents.length+" <br>");


		appAPI.bookmarks.getToolbarFolder(function(node) {

			appAPI.bookmarks.createFolder({
				title: 'SMUT',
				parentFolder: node}, function(node) { 

					for(var i = 0; i < newMains.length; i++)
					{
						sendDebug(0, "<b>setupBrowserFolder</b>:"+newMains[i][0]+" is: "+node.title+" <br>");

						appAPI.bookmarks.create({
							title: newMains[i][0],
							url: newMains[i][1],
							parentFolder: node}, function(node) {
								// do nothing
							});
					}

					appAPI.bookmarks.createFolder({
						title: 'SMUTRecent',
						parentFolder: node}, function(node) { 

							for(var i = 0; i < newRecents.length; i++)
							{

								appAPI.bookmarks.create({
									title: newRecents[i][0],
									url: newRecents[i][1],
									parentFolder: node}, function(node) {
										// do nothing
									});
							}


						});

				});
			folderUpdateComplete();
		}); // end of folder and bookmark creation

		sendDebug(0, "setupBrowserFolder: EXITING<br>");

	} // end of setupBrowserFolder()


	/* simply for debugging when setupBrowserFolder is done */ 
	function folderUpdateComplete()
	{
		multiFolderDetected=0;
		sendDebug(0, "<b>folderUpdateComplete</b>: browser folder update complete.<br>");

	}




	/*
    	set up the toolbar when a new tab/window is made
	 */
	appAPI.tabs.onTabCreated(function(tabInfo) {
		sendDebug(0, "A new tab/window was detected. Setting up toolbar from background.<br>");
		appAPI.message.toActiveTab({'action':'notify','type':'db', 'todo':'update'}); 
	});


	/*
    	when the user changes a tab, send notice to update the
    	bookmarks incase they have changed
	 */
	appAPI.tabs.onTabSelectionChanged(function(tabInfo) {
		sendDebug(0, "A new tab/window was detected. Setting up toolbar from background.<br>");
		appAPI.message.toActiveTab({'action':'notify','type':'db', 'todo':'update'}); 
	});



});
