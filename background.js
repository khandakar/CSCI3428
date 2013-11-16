/************************************************************************************
  This is your background code.
  For more information please visit our wiki site:
  http://docs.crossrider.com/#!/guide/scopes_background
************ *************************************************************************/
       
appAPI.ready(function($) {  
      
  // Place your code here (ideal for handling browser button, global timers, etc.)
         
	var lid = appAPI.message.addListener(function(msg) {
	    //alert('listener'+msg);
		//action:'updateFolders'
		// Performs action according to message type received
		switch (msg.action) { 
			// Received message to broadcast to all tabs
			
			case 'debugger': addDebugFromBackground(msg.level, msg.debug); break;
			
			case 'notify': notifyAction(msg.type, msg.do); break;
			
			case 'gotoUrl': sendToURL(msg.value); break;
			
				
			case 'updateFolders': updateBrowserFolder(); break;
			// Received message to broadcast to all tabs
			//case 'other': appAPI.message.toAllOtherTabs(msg); break;
			// Received message to send to the active tab
			case 'tab': appAPI.message.toActiveTab(msg); break;
			// Received message to remove listeners; Relay message all tabs, and then remove background listener
			case 'remove': appAPI.message.toAllTabs(msg); appAPI.message.removeListener(lid); break;

		}
	});
	
	
	
              
    function sendToURL(URL)
    {
    	appAPI.tabs.create(URL);
    	
    }
	function sendDebug(level, msg)
	{   
 
		appAPI.message.toActiveTab({'action':'debugger','debug':msg, 'level':level}); 

	}
	
	/*
		Crossrider API for searching all bookmarks
		Gets all bookmarks and returns them in 
		result. Result is a bookmark object
		See api doc:
	 
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
    	in a 2d array with this format:
    	[[title],[url],[status]] where status represents
    	status 0=normal bookmark
    		   1=recent bookmark
    		   2=search domain (not currently used)
        Bookmarks with its direct parent name "SMUT" are
        normal
        If the direct parent is SMUTRecent, they are a recent
        If the direct parent is SMUTSearch, they are a search
        domain
        
        This will not edit bookmarks, it simply reads them
        
        The ordering of bookmarks is directly from the order 
        of which they appear in the browser bookmarks
    */

    function getSMUTBookmarksThenCall (returnType, returnCall, otherData)
    {
    	sendDebug(3, "Entered getSMUTBookmarks<br>");
    	
    	var _bookmarks=[];
    	var _folders=[];
    	var _nodes=[];
    	var newBookmarks=new Array();
    	var newBookmarksCount=0;
    	sendDebug(0, "getSMUTBookmarks - About to enter get tree<br>");
        	
    	appAPI.bookmarks.getTree(function(nodes) {
    		sendDebug(0, "getSMUTBookmarks - Inside get tree<br>");
        	var result = searchRecursive(nodes[0]),
            	message = 'Number of nodes: ' + result.length + '\nDetails::';
           
        	for (var i=0; i < result.length; i++) {
           	 message += '\n    Title: ' +
                (result[i].title ? result[i].title : '<RootFolder>') +
                (result[i].isFolder ? ' (folder)' : '');// + 'parent folder: '+result[i].parentFolderName;

          if(!result[i].isFolder)
          {
              if(result[i].parentFolderName == "SMUT")
                {
                	newBookmarks[newBookmarksCount]=new Array();
                	newBookmarks[newBookmarksCount][0]=result[i].title;
                	newBookmarks[newBookmarksCount][1]=result[i].url;
                	newBookmarks[newBookmarksCount][2]=0;
                	newBookmarksCount++;
                	_bookmarks.push(result[i]);
                }
                if(result[i].parentFolderName == "SMUTRecent")
                {
                	newBookmarks[newBookmarksCount]=new Array();
                	newBookmarks[newBookmarksCount][0]=result[i].title;
                	newBookmarks[newBookmarksCount][1]=result[i].url;
                	newBookmarks[newBookmarksCount][2]=1;
                	newBookmarksCount++;
					_bookmarks.push(result[i]);
                }
                
          }
          else
          {
          	if(result[i].title == "SMUT")
                {

                	
                	_folders.push(result[i]);
                }
                if(result[i].title == "SMUTRecent")
                {
 
					_folders.push(result[i]);
                }
          
          }
        	
        	}
        		sendDebug(3, "Exiting getSMUTBookmarks. Found: "+newBookmarks.length+" SMUT related bookmarks.<br>");
    	
    		_nodes=_folders.concat(_bookmarks);
    		if(returnCall=="compareDBToFolder")
    		{
    			compareDBToFolder(newBookmarks, otherData);
    		}
    		else if(returnCall=="deleteCurrentSMUTBM")
    		{
    			deleteCurrentSMUTBM(_nodes,otherData);
    			//getSMUTBookmarksThenCall(1, "compareDBToFolder");
    		}
    		else
    		{
    			sendDebug(4, "<b>CRITICAL</b>: getSMUTBookmarksThenCall was called with an improper returnCall (saw "+returnCall+")<br>");
    	
    			
    		}
    		
    	//return newBookmarks;
    	
    	
    	});
    
	} // end of getSMUTBookmarks()
	
	
	
	function getSMUTBookmarks (returnType)
    {
    	sendDebug(3, "Entered getSMUTBookmarks<br>");
    	
    	var _bookmarks=[];
    	var _folders=[];
    	var _nodes=[];
    	var newBookmarks=new Array();
    	var newBookmarksCount=0;
    	sendDebug(0, "getSMUTBookmarks - About to enter get tree<br>");
        	
    	appAPI.bookmarks.getTree(function(nodes) {
    		sendDebug(0, "getSMUTBookmarks - Inside get tree<br>");
        	var result = searchRecursive(nodes[0]),
            	message = 'Number of nodes: ' + result.length + '\nDetails::';
           
        	for (var i=0; i < result.length; i++) {
           	 message += '\n    Title: ' +
                (result[i].title ? result[i].title : '<RootFolder>') +
                (result[i].isFolder ? ' (folder)' : '');// + 'parent folder: '+result[i].parentFolderName;

          if(!result[i].isFolder)
          {
              if(result[i].parentFolderName == "SMUT")
                {
                	newBookmarks[newBookmarksCount]=new Array();
                	newBookmarks[newBookmarksCount][0]=result[i].title;
                	newBookmarks[newBookmarksCount][1]=result[i].url;
                	newBookmarks[newBookmarksCount][2]=0;
                	newBookmarksCount++;
                	_bookmarks.push(result[i]);
                }
                if(result[i].parentFolderName == "SMUTRecent")
                {
                	newBookmarks[newBookmarksCount]=new Array();
                	newBookmarks[newBookmarksCount][0]=result[i].title;
                	newBookmarks[newBookmarksCount][1]=result[i].url;
                	newBookmarks[newBookmarksCount][2]=1;
                	newBookmarksCount++;
					_bookmarks.push(result[i]);
                }
                
          }
          else
          {
          	if(result[i].title == "SMUT")
                {

                	
                	_folders.push(result[i]);
                }
                if(result[i].title == "SMUTRecent")
                {
 
					_folders.push(result[i]);
                }
          
          }
        	
        	}
        		sendDebug(3, "Exiting getSMUTBookmarks. Found: "+newBookmarks.length+" SMUT related bookmarks.<br>");
    	
    		_nodes=_folders.concat(_bookmarks);
    		if(returnType==2)
    		{
    			return _nodes;
    		}
    		
    	return newBookmarks;
    	});
    
	} // end of getSMUTBookmarks()
	
	
	/*
		Dev function for testing the database
		Gets all bookmarks from browser
		If there are SMUT ones, saves them
		to the database
		
		sends a message to active tab with
		results (success or fail)
	*/
	function testDB()
	{
		var SMUTBMs=getSMUTBookmarks(1);
		var returnBMs=[];
		if(SMUTBMs!=null)
		{
				sendDebug(1, "testDB() saw "+SMUTBMs.length+" SMUT bookmarks. Attempting to save to DB.<br>");

    			
				    // saves a string value that expires 12 hours from now,
				    // and displays a message upon successful completion
				    appAPI.db.async.set(
				        "bookmarks",
				        SMUTBMs,
				        dbSuccess() 
				    );
			 
				 sendDebug(0, "testDB() is trying to get saved data.<br>");
				 appAPI.db.async.get("bookmarks", function(value) {
			        returnBMs=value;//alert(value);
			        sendDebug(0, "testDB() is got the saved data and saw "+returnBMs.length+" SMUT bookmarks.1.<br>");
			        appAPI.message.toAllTabs({'action':'notify','type':'db', 'todo':'update'}); 
			        
			    });			
				 
				//sendDebug(0, "testDB() is got the saved data and saw "+returnBMs.length+" SMUT bookmarks.2.<br>");
				//sendDebug(0, "testDB() sending message to active tab.<br>");
    			
		}
		else
		{
				sendDebug(1, "testDB() did NOT see SMUT bookmarks.<br>");
		
    	
		}
		
	}
	//testDB();
	var justATest=new Array();
	function dbSuccess()
	{
		sendDebug(1, "database saved!<br>");
			var returnBMs=[];
				 sendDebug(0, "testDB() is trying to get saved data.<br>");
				 appAPI.db.async.get("bookmarks", function(value) {
        justATest=value;//alert(value);
        sendDebug(0, "testDB() is got the saved data and saw justATest length "+justATest.length+" SMUT bookmarks.3.<br>");
    });
    if(justATest!=null)
   	 sendDebug(0, "testDB() is got the saved data and saw justATest length "+justATest.length+" SMUT bookmarks.4.<br>");
   	else
      sendDebug(0, "testDB() is got the saved data and saw justATest is null 4.<br>");
	}
	
	var oldBMSinTabs=[];
	var newBMSinTabs=[];
	var isDiff=0;
	
	/*
		since our db is asynch, sometimes the old bookmarks are sent
		to the user.
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
			sendDebug(1, "<b>timer</b> encountered an error.");
		}
		sendDebug(0, "<b>timer exited</b>");
    },1000); 
    
    
	function dbSaveBM (BMToSave, calledFrom)
	{
		oldBMSinTabs=BMToSave;
		
		 sendDebug(3, "<b>dbSaveBM</b> saving "+BMToSave+"<br>");
		  appAPI.db.async.set(
				        "bookmarks",
				        BMToSave,
				        dbSaveBMSuccess(calledFrom) 
				    );

	}
	
	function dbSaveBMSuccess (calledFrom)
	{
		
		sendDebug(0, "dbSaveBMSuccess: "+calledFrom+" DB call save successful<br>");
		if(calledFrom=="compareDBToFolder")
		{
			sendDebug(0, "dbSaveBMSuccess: letting browser know to update toolbar<br>");
			appAPI.message.toAllTabs({'action':'notify','type':'db', 'todo':'update'}); 
		}
		
		
			appAPI.db.async.get("bookmarks", function(value) {
			        //returnBMs=value;//alert(value);
			        //sendDebug(0, "testDB() is got the saved data and saw "+returnBMs.length+" SMUT bookmarks.1.<br>");
			        newBMSinTabs=value;
			        sendDebug(3, "<b>dbSaveBMSuccess</b> get test result "+value+"<br>");
			    });	
		
	}
	
	function dbGetBMSuccess (calledFrom, data)
	{
		sendDebug(0, "dbGetBMSuccess: "+calledFrom+" DB call save successful<br>");
		if(calledFrom=="updateBrowserFolder")
		{
			sendDebug(0, "updateBrowserFolder: updating browser folder<br>");
			updateBrowserFolderWithData(data);
		}
		
	}
	
	
		function dbGetBMforUpdateFolders (data)
	{
		sendDebug(0, "dbGetBMforUpdateFolders: sending data to browser<br>");

			sendDebug(0, "updateBrowserFolder: updating browser folder<br>");
			updateBrowserFolderWithData(data);

		
	}
	
	
	function convertNodeToBM (theNodes)
	{
		
		
	}
	

	setInterval(function(){
				checkAllTabs();
					//var SMUTBMs=getSMUTBookmarks();
					appAPI.db.async.get("bookmarks", function(value) {
			        //returnBMs=value;//alert(value);
			        //sendDebug(0, "testDB() is got the saved data and saw "+returnBMs.length+" SMUT bookmarks.1.<br>");
			        //appAPI.message.toActiveTab({'action':'notify','type':'db', 'do':'update'}); 
			        compareDBToFolderStepOne(value);
			    });	
    },5000); 
    
    		/*appAPI.db.async.get("bookmarks", function(value) {
			        //returnBMs=value;//alert(value);
			        //sendDebug(0, "testDB() is got the saved data and saw "+returnBMs.length+" SMUT bookmarks.1.<br>");
			        //appAPI.message.toActiveTab({'action':'notify','type':'db', 'do':'update'}); 
			        compareDBToFolder(value);
			    });	*/
    
    function checkAllTabs ()
    {
    	//jQuery.inArray( 4, arr )
    	
    	
    }
    
    function compareDBToFolderStepOne (compareWith)
    {
    	getSMUTBookmarksThenCall(1, "compareDBToFolder", compareWith);
    }
    
    function compareDBToFolder (theBMs, compareWith)
    {
    	sendDebug(0, "compareDBToFolder: ENTERED<br>");
    	
    	var SMUTBMs=theBMs;//getSMUTBookmarks(1);
    	sendDebug(3, "compareDBToFolder: SMUTBMs: "+SMUTBMs+".<br>");
    	sendDebug(3, "compareDBToFolder: compareWith: "+compareWith+".<br>");
    	
    	var stopped=0;
    	var difference=0; 
    	if(SMUTBMs==null || SMUTBMs.length == 0)
    	{
    		sendDebug(3, "compareDBToFolder: SMUTBMs was null/empty!.<br>");
    		//updateBrowserFolderWithData(getDefaults()); // reset with defaults
    		setupBrowserFolder(getDefaults());
    		dbSaveBM(getDefaults(), "compareDBToFolder"); // make sure DB is updated with defaults
    		stopped=1;
    	}
    	else
    	{
    		sendDebug(3, "compareDBToFolder: SMUTBMs was not null.<br>");
    	}
    	
    	if(stopped!=0)
    	{
    		sendDebug(0, "compareDBToFolder: Stop code: "+stopped+".<br>");
    		return;
    	}
    	if(compareWith==null || compareWith.length == 0)
    	{
    		sendDebug(3, "compareDBToFolder: compareWith was null/empty!.<br>");
    		dbSaveBM(SMUTBMs, "compareDBToFolder")
    		stopped=2;
    	}
    	else
    	{
    		sendDebug(3, "compareDBToFolder: compareWith was not null.<br>");
    	}
    	if(stopped!=0)
    	{
    		sendDebug(3, "compareDBToFolder: Stop code: "+stopped+".<br>");
    		return;
    	} 
    	
    	// both are not null, compare length
    	
    	if(SMUTBMs.length == compareWith.length)
    	{
    		sendDebug(0, "compareDBToFolder: both bookmark list are the same length ("+compareWith.length+")<br>");
    		
    		// compare the values
    		for(var i=0; i<SMUTBMs.length; i++)
    		{
    		//	alert("x is"+x);
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
    		sendDebug(3, "compareDBToFolder: difference found, lets update using the browser folders<br>");
    		dbSaveBM(SMUTBMs, "compareDBToFolder");
    		//dbSaveBMSuccess(SMUTBMs);
    		
    	}
    	else
    	{
    		sendDebug(0, "compareDBToFolder: no difference found.<br>");
    	}
    	    	sendDebug(0, "compareDBToFolder: EXITING<br>");
    	
    }
    
    
    function compareWithReturn (theBMs, compareWith)
    {
    	
    	var SMUTBMs=theBMs;
    	var stopped=0;
    	var difference=0; 
    	if(SMUTBMs==null)
    	{
			return -1;
    		stopped=1;
    	}
    	else
    	{
    	
    	}
    	

    	if(compareWith==null)
    	{
			return -1;
    	}
    	else
    	{

    	}

    	
    	// both are not null, compare length
    	
    	if(SMUTBMs.length == compareWith.length)
    	{

    		// compare the values
    		for(var i=0; i<SMUTBMs.length; i++)
    		{
    		//	alert("x is"+x);
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
			return 1;
    		
    	}
    	else
    	{
    		return 0;
    	}
    	   
    	
    }
    
    function getDefaults ()
    {
    	
    	sendDebug(0, "getDefaults: processing default BM<br>");
    	
    	var defaultBookmarks=new Array([]);
	//	defaultBookmarks.length=0;
		//var defaultRecentUrls=new Array([]);
		//defaultRecentUrls.length=0;



	//	appAPI.message.toActiveTab({'action':'debugger','debug':'Background: Creating defaults cc('+defaultRecentUrls+').<br>.'}); 
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
    	
    		sendDebug(0, "getDefaults: "+defaultBookmarks.length+" bookmarks to be inserted into browser<br>");
    
    	//updateBrowserFolderWithData(defaultBookmarks);
    		sendDebug(0, "exiting getDefaults:<br>");
    	return defaultBookmarks;
    	
    }
    function updateBrowserFolder ()
    {
    	sendDebug(0, "entered updateBrowserFolder<br>");
   // dbGetBMforUpdateFolders(data)
		 appAPI.db.async.get("bookmarks", function(value) {dbGetBMforUpdateFolders(value);});	
		 	sendDebug(0, "exiting updateBrowserFolder<br>");
    	
    }
    
    function updateBrowserFolderWithData (theBMs)
    {
    	
    	sendDebug(0, "entered updateBrowserFolderWithData<br>");
		 if(theBMs==null || theBMs.length==0)
		 {
		 	sendDebug(0, "updateBrowserFolderWithData: bookmarks are null/empty<br>");
		 	return;
		 }

		deleteCurrentSMUTBMStepOne(theBMs); 
		
		sendDebug(0, "exiting updateBrowserFolderWithData<br>");
		
    	
    }

	function deleteCurrentSMUTBMStepOne(theBMs)
	{
		getSMUTBookmarksThenCall(2, "deleteCurrentSMUTBM", theBMs);
	}

	function deleteCurrentSMUTBM (theNodes, theBMs)
	{
		var currentNodes=theNodes;
		if(currentNodes==null || currentNodes.length==0)
		{
			sendDebug(3, "<b>deleteCurrentSMUTBM</b>: currentNodes is null<br>");
			setupBrowserFolder(theBMs);
			return;
		}
		sendDebug(3, "<b>deleteCurrentSMUTBM</b>: "+currentNodes.length+" nodes about to be deleted.<br>");
		
		
		removeNodes(currentNodes, theBMs);
		
		
	}
	
	
	function removeNodes(currentNodes, theBMs) // recursive
	{
			
		//var currentNodes=getSMUTBookmarks(2);
	/*	if(currentNodes==null || currentNodes.length==0)
		{
			sendDebug(0, "deleteCurrentSMUTBM: currentNodes is null<br>");
			return;
		}
		sendDebug(0, "deleteCurrentSMUTBM: "+currentNodes.length+" nodes about to be deleted.<br>");
		*/
		var nodeLength=currentNodes.length-1;
		if(nodeLength>0)
		{
			//sendDebug(0, "removeNodes: "+currentNodes.length+" nodes about to be deleted.<br>");
	
	//	appAPI.message.toActiveTab({'action':'debugger','debug':'Background node length > 0<br>.'}); 
		
			var theNode=currentNodes[nodeLength];
			//	theNode=_nodes.pop;
			if(theNode!=null)
			{
			var theTitle=theNode.title;
				if(theNode.title!=null)
				{
			//appAPI.message.toActiveTab({'action':'debugger','debug':'Background is on ('+nodeLength+') node...'+theTitle+'<br>.'}); 
		
				}
				else
				{
					//appAPI.message.toActiveTab({'action':'debugger','debug':'Background node title is null<br>.'}); 
				}
			}
			else
			{
				sendDebug(1, "removeNodes: current node is null<br>");
	
				//appAPI.message.toActiveTab({'action':'debugger','debug':'Background node is null<br>.'}); 
			}
		
		}
		else
		{
		//	appAPI.message.toActiveTab({'action':'debugger','debug':'Background node length <= 0<br>.'}); 
		}
		if (currentNodes.length > 0) 
		{
	//	appAPI.message.toActiveTab({'action':'debugger','debug':'Background is on ('+_nodes.length+') node<br>.'}); 
		//sendDebug(1, "removeNodes: ("+currentNodes.length+") nodes left to process<br>");
	
			var node=currentNodes.pop();
			// since our list has all the folders first then bookmarks
			// we remove all bookmarks than folders
			// so when we get to a folder (aka the node has childred)
			// its length is inaccurate and we need to set it to 0
			// otheriwiese the api call bookmarks.remove will fail
			if(node.children!=null)
			{
				node.children.length=0;
			}
				//appAPI.message.toActiveTab({'action':'debugger','debug':'Background new node length ('+_nodes.length+') <br>.'}); 
		
		appAPI.bookmarks.remove(node, function() {
			if(node.title!=null)
			{
			//	appAPI.message.toActiveTab({'action':'debugger','debug':'Background removing ('+_nodes.length+') nodes, current is: '+node.title+'<br>.'}); 
			}
			removeNodes(currentNodes,theBMs);
		});
		}
		else
		{ 
		sendDebug(0, "removeNodes: all nodes removed. update from DB now<br>");
			setupBrowserFolder(theBMs);
		//	appAPI.message.toActiveTab({'action':'debugger','debug':'Background node length 0 in remove nodes<br>.'}); 
			
		}
		
	}
	
	function seperateBMs (theBMs, theStatus)
	{sendDebug(0, "seperateBMs: ENTERED<br>");
	
		var newList=[];
		var countNew=0;
		for(var i=0; i<theBMs.length; i++)
		{
		//	sendDebug(0, "seperateBMs: i->"+i+" title->"+theBMs[i][0]+" URL->"+theBMs[i][1]+" status->"+theBMs[i][2]+" <br>");
			if(theBMs[i][2]==theStatus)
			{
				newList[countNew]=new Array();
				newList[countNew][0]=theBMs[i][0];
				newList[countNew][1]=theBMs[i][1];
				newList[countNew][2]=theBMs[i][2];
				countNew++;
			}
			
		}
		sendDebug(0, "seperateBMs: newList length: "+newList.length+"<br>");
		sendDebug(0, "seperateBMs: EXITING<br>");
	
		return newList;
	}
	function setupBrowserFolder (theBMs)
	{
			sendDebug(3, "setupBrowserFolder: ENTERED<br>");
	sendDebug(3, "setupBrowserFolder: theBMs "+theBMs.length+"... "+theBMs+"  <br>");
	
		var newMains=seperateBMs(theBMs, 0);
		var newRecents=seperateBMs(theBMs, 1);
			sendDebug(3, "<b>setupBrowserFolder</b>: newMains "+newMains.length+" newRecents "+newRecents.length+" <br>");
	
		
		appAPI.bookmarks.getToolbarFolder(function(node) {

//	alert("got it");
//	appAPI.message.toActiveTab({'action':'debugger','debug':'Background: parent to SMUT is: '+node.title+'<br>.'}); 
		
					appAPI.bookmarks.createFolder({
						title: 'SMUT',
						parentFolder: node}, function(node) { 
						//	alert("folder created");
					//	_folders.push(node);
						for(var i = 0; i < newMains.length; i++)
						{
						//		appAPI.message.toActiveTab({'action':'debugger','debug':'Background: parent to '+newMAINS[i][0]+' is: '+node.title+'<br>.'}); 
	sendDebug(3, "<b>setupBrowserFolder</b>:"+newMains[i][0]+" is: "+node.title+" <br>");
	
						// Add bookmarks to the folder
							appAPI.bookmarks.create({
								title: newMains[i][0],
								url: newMains[i][1],
								parentFolder: node}, function(node) {
							//	_bookmarks.push(node);
							});
						}
						
							appAPI.bookmarks.createFolder({
								title: 'SMUTRecent',
								parentFolder: node}, function(node) { 
									//alert("folder created");
							//	_folders.push(node);
								for(var i = 0; i < newRecents.length; i++)
								{
								// Add bookmarks to the folder
									appAPI.bookmarks.create({
										title: newRecents[i][0],
										url: newRecents[i][1],
										parentFolder: node}, function(node) {
										//_bookmarks.push(node);
									});
								}
								 
						
							});
						
						});
						folderUpdateComplete();
				});
				
				
					sendDebug(0, "setupBrowserFolder: EXITING<br>");
	
		
	}
	function folderUpdateComplete()
	{
		sendDebug(3, "<b>folderUpdateComplete</b>: browser folder update complete.<br>");
	
		
	}
    /*
    	set up the toolbar when a new tab/window is made
    */
    appAPI.tabs.onTabCreated(function(tabInfo) {
    	sendDebug(0, "A new tab/window was detected. Setting up toolbar from background.<br>");
        appAPI.message.toActiveTab({'action':'notify','type':'db', 'todo':'update'}); 
    });
    
    appAPI.tabs.onTabSelectionChanged(function(tabInfo) {
        sendDebug(0, "A new tab/window was detected. Setting up toolbar from background.<br>");
        appAPI.message.toActiveTab({'action':'notify','type':'db', 'todo':'update'}); 
    });
    
    
    
});
