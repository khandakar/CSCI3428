  /************************************************************************************
  This is your Page Code. The appAPI.ready() code block will be executed on every page load.
  For more information please visit our docs site: http://docs.crossrider.com
*************************************************************************************/


appAPI.ready(function($) { // put all code within the ready scope
						   // it ensures all resources are loaded before starting

	/*
		In this document:
		BM refers to bookmark
		Main BMs are the ones stored in the drop down menu, accessed by clicking the shield
		Recent BMs are the ones always displayed, they update based on clicking main BMs
		db or DB refers to database
	*/
	
	
	
	
	
	

    /*
    	Our listener helps the background.js to contact
    	extension.js to tell it to do things, such as
    	to let extension.js know there are new bookmarks
    	to load
    	
    	Note: KEEP LISTENER ARS FIRST OBJECT ON PAGE
    		  This ensures the listener is set up
    		  on time.	
    */
	var lid = appAPI.message.addListener(function(msg) {
		// Performs action according to message type received
		switch (msg.action) { 

			case 'debugger': addDebugFromBackground(msg.level, msg.debug); break;
			
			case 'notify': notifyAction(msg.type, msg.todo); break;
			
			case 'updateFolders': updateBrowserFolder(); break;
		}
	});
	
	addDebug(1, "Page loaded.<br>");
	
	/*
		Start of Variables and settings
		Note, some settings are later, or at the top of
		background.js 
	*/
	
	var toolbarColor="#8C2633";   // Colour: Maroon
								  // Pantone value: Pantone 202C
	var toolbarHeight="32px";     // height of tool bar in pixels  was 24, trying 32
	var toolbarHeightText="32";   // height of tool bar in pixels  was 24, trying 32
	var toolbarWithBorder="30px"; //	toolbarHeight-2 px (2*1px border)								  
										  
	var recentBMColor="#5e99aa"; 	// Colour: Blue
							        // Pantone value: Pantone 549C
							        
	var shieldImage="resource-image://logo32_32.png"; // not used yet, hard coded 
	
	var bookmarkBackground="#D9C89E"; // main bookmarks
							   		  // shown when shield is clicked
							          // pantone 7501C  sand
				
	var mainBMHeight="600px";
	var mainBMWidth="35%";
	var defaultSearchTarget=0; // 0 = same page, 1 = new tab
	var fontFamily="Lucida Grande";
	var fontSize="medium";
	
	
	var debugLevel=0;	// -1 = off
						// shows debugLevel or higher
	
	/*
		Search domains must be in the format of
		https://www.google.ca/?#q=SEARCH_TERM where
		the toolbar replaces SEARCH_TERM with the
		users text to search with.
	*/
	var searchDomains=[];
		searchDomains[0]=new Array();
		searchDomains[0][0]="Google"; 							     // title
		searchDomains[0][1]="https://www.google.ca/?#q=SEARCH_TERM"; // search url
		
		searchDomains[1]=new Array();
		searchDomains[1][0]="SMU"; 							     // title
		searchDomains[1][1]="http://www.smu.ca/searchresults.html?q=SEARCH_TERM&sa=Search"; // search url
		
	var currentDomain=0;	// points to the search domain the user currently has selected
	

	var searchBoxBackground="white";
	var searchBoxFontColor="black";
	var searchBoxHeight=(toolbarHeightText/2)+'px';
	var searchBoxWidth="150px";
	
	var searchDomainTextOn="/\\";
	var searchDomainTextOff="\\/";
		
	
	/* auto resizing options */
	var resizes=0;    // tracks number of browser resizes since last change
	var inResize=0;   // if the browser is current resizing =1, 0 otherwise
	var threshhold=4; // how many resizes are needed to trigger a change in the
				      // toolbar. Too low and you get bad performance. Too high
				      // and you might not get accurate changes

	var timerThreshold=4; // 4* intervalTIme = time to wait before a timed resize
	var intervalTime=100; // in milliseconds ie 100 = 100 ms 0.1 of a second
	var documentHidden=0; // if current page is in focus, if 0 no resizes will be done
						  // if 1, resizes will occur. This helps with performance

	/* Dont change these */
	var clicked=0;        // 0 = shield is not clicked/inactive, 1 = shield is clicked/active
	var debugStatus=0;    // 0 = debug is open, 1 = debug is closed
	var clickedDomains=0; // 0 = domains is open, 1 = domains is closed
	/* our bookmark array holders */
	
	/* 
		allBMs is in the form [[title],[url],[status]]
		where title is displayed in the UI, url is the url of the bookmark, and
		status symbolizes the type of BM. 
		0= main BM, 1= recent BM
	*/
	var allBMs=[];
	
	/* 
		mainBMptr and recentBMptr are arrays that contain integers that symbolize
		a pointer to a bookmark in allBMs for ease of tracking the different bookmarks
	*/
	var	mainBMptr=[];
	var	recentBMptr=[];


	/*
		End of Variables and settings
	*/
	
	
	
	loadUI();			// set up UI so bookmarks may load
	updateFromDB(); 	// now that UI is loaded, fill in the BM data
	
	
	
	/*
	
		loadui handles setting up the look of the toolbar
		it loads the containers, sets heights, colors, etc
		
		It sets up the debug holder which can be shown/hidden
		by pressing ctrl-x, if it is enabled.
		
		Holders for recent bookmarks and main bookmarks are
		loaded later when needed
		
		Note: some css is located elsewhere
		updateBMMainUI -> css for the main bookmarks
		updateBMRecentUI -> css for the recent bookmarks
		
	*/
	function loadUI ()
	{
		addDebug(1, "Initialising UI.<br>");
		
		/* our main toolbar */
		$('<div id="SMUTHolder">' +
				'<div id="toolbardiv">' +
					'<div id="smu-shield">'+
					'</div>'+
		
					'<div id="bm-recent-container">'+
					'</div>'+
				
					'<div id="bm-search">'+
						'<div id="form-wrapper" >'+
							'<input type="text" length="20" id="searchTerm" >'+
							'<input type="submit" id="searchGo" value="Go!" style="">'+
							'<input type="submit" id="changeDomain" value="\\/" style="">'+
						'</div>'+
						'<div id="searchDomain" style="display: hidden">'+
						'</div>'+
					'</div>'+
				'</div>' +
			'</div>')
		.insertAfter('head'); // keep this as insert after head, it seems
							  // to fix position issues on 99% of websites
		
		/* dropdown bookmark container */
		$('<div id="bookmarksMain">' +
			'</div>')
		.insertAfter('#SMUTHolder');
		
		/* dropdown domains */
		$('<div id="domainMain">' +
			'</div>')
		.insertAfter('#bookmarksMain');
		
		/* debug container */
		$('<div id="debugMsg">' +
			'</div>')
		.insertAfter('#bookmarksMain');
		
		
		
		
		/* set up our CSS */
		$('#debugMsg').css({
			'background-color':bookmarkBackground,
			//height:mainBMHeight,
			margin: 0,
			padding: 0,
			right: "15%", // to allow for domains
			position:'fixed',
			float:'right', 
			top:toolbarHeight,
			width: '60%',
			height: '75%',
			overflow: 'scroll',
			'z-index':'999999999999'
		});
		

		$('#smu-shield').css({float:'left', 'padding-left':'2px'});

		/* 
			resetClass allows us to clear out any CSS the 
			current web page may have set that affects the
			toolbar
			
			This is similar to YUI method which simply sets
			every CSS class 
		*/
		
		var resetClass={
			'margin':'0',
			'padding':'0',
			'background':'transparent',
			'border':'none',
			'bottom':'auto',
			'clear':'none',
			'cursor':'default',
			'float':'none',
			'font-family':'Lucida Grande', 
			'font-size':'medium',
			'font-style':'normal',
			'font-weight':'normal',
			'height':toolbarHeight,
			'left':'auto',
			'letter-spacing':'normal',
			'line-height':'normal',
			'max-height':'none',
			'max-width':'none',
			'min-height':'0',
			'min-width':'0',
			'overflow':'visible',
			'position':'static',
			'right':'auto',
			'text-align':'left',
			'text-decoration':'none',
			'text-indent':'0',
			'text-transform':'none',
			'top':'0px',
			'visibility':'visible',
			'white-space':'normal',
			'width':'auto',
			'z-index':'9999999999999',
			'background-color':'transparant',
			'color':'black',
			'box-shadow':'',
			'border-radius':'',
			'border': '0px solid #000000',
			'border-radius': '0px',
			'box-shadow': '0 0px 0px rgba(0, 0, 0, 0.3), 0 0px 0 rgba(255, 255, 255, 0.4) inset',
			'border': 'none',
			'float':'right',
			'height':toolbarHeight, 
			'vertical-align':'middle',
			'line-height':toolbarHeight,
			margin: 0,
			padding: 0,
			position:'fixed',
			left:0, top:0,
			'z-index':'999999999999'
		};
		
		/* remove classes */
		$('#SMUTHolder').removeClass();
		$('#form-wrapper').removeClass();
		$('#searchGo').removeClass();
		$('#searchTerm').removeClass();
		$('#bm-search').removeClass();
		$('#bm-recent-container').removeClass();
		
		$('#changeDomain').removeClass();
		
	
		
		
		/* add reset class incase page affects our toolbar */
		$('#SMUTHolder').css(resetClass);
		$('#SMUTHolder').css(resetClass);
		$('#form-wrapper').css(resetClass);
		$('#searchGo').css(resetClass);
		$('#searchTerm').css(resetClass);
		$('#changeDomain').css(resetClass);	
		$('#bm-search').css(resetClass);
		$('#bm-recent-container').css(resetClass);
		
		/* proceed with setting css as needed */
		$('#SMUTHolder').css({
			'margin':'0',
			'padding':'0',
			'background':'transparent',
			'border':'none',
			'bottom':'auto',
			'clear':'none',
			'cursor':'default',
			'float':'none',
			'font-family':'Lucida Grande',
			'font-size':'medium',
			'font-style':'normal',
			'font-weight':'normal',
			'height':toolbarHeight,
			'left':'auto',
			'letter-spacing':'normal',
			'line-height':'normal',
			'max-height':'none',
			'max-width':'none',
			'min-height':'0',
			'min-width':'0',
			'overflow':'visible',
			'position':'static',
			'right':'auto',
			'text-align':'left',
			'text-decoration':'none',
			'text-indent':'0',
			'text-transform':'none',
			'top':'0px',
			'visibility':'visible',
			'white-space':'normal',
			'width':'100%',
			'z-index':'9999999999999',
			'background-color':'transparant',
			'color':'black',
			'box-shadow':'',
			'border-radius':'',
			'border': '0px solid #000000',
			'border-radius': '0px',
			'box-shadow': '0 0px 0px rgba(0, 0, 0, 0.3), 0 0px 0 rgba(255, 255, 255, 0.4) inset',
			'border': 'none',
			'float':'right',
			'height':toolbarHeight, 
			'vertical-align':'middle',
			'line-height':toolbarHeight,
			margin: 0,
			padding: 0,
			position:'fixed',
			left:0, 
			top:0,
			'z-index':'999999999999'
		});
	
				
		$('#toolbardiv').css({
			'background-color':toolbarColor,
			height:toolbarHeight,
			margin: 0,
			padding: 0,
			position:'fixed',
			right:0, top:0,
			width:'100%',
			'z-index':'999999999999'
		});	
		
		$('#bm-recent-container').css({
			'width':'40%',
			'float':'left',
			'margin-right':'50px',
			'position':'static',
			'height':toolbarHeight,
			'display':'inline-block',
			'overflow':'hidden'
		});
	
	
		 $('#bm-search').css({
			'right':'0px',
			'text-align':'left',
			'text-decoration':'none',
			'text-indent':'0',
			'text-transform':'none',
			'top':'0px',
			'visibility':'visible',
			'white-space':'normal',
			'width':'auto',
			'z-index':'auto',
			'float':'right',
			'left':'auto',
			'height':toolbarHeight, 
			'vertical-align':'middle',
			'line-height':toolbarHeight
		});
	
		$('#bookmarksMain').css({
			'margin':'0',
			'padding':'0',
			'background':'white',
			'border':'none',
			'bottom':'auto',
			'clear':'none',
			'cursor':'default',
			'float':'none',
			'font-size':'medium',
			'font-style':'normal',
			'font-weight':'normal',
			'height':'auto',
			'left':'0px',
			'letter-spacing':'normal',
			'line-height':'normal',
			'max-height':'none',
			'max-width':'45%',
			'min-height':'0',
			'min-width':'0',
			'overflow':'visible',
			'position':'static',
			'right':'auto',
			'text-align':'left',
			'text-decoration':'none',
			'text-indent':'0',
			'text-transform':'none',
			'top':'2px',
			'visibility':'visible',
			'white-space':'normal',
			'width':'auto',
			'z-index':'auto',
			'font-family':'Lucida Grande',
			'background-color':recentBMColor,
			'padding-left':'4px',
			'padding-right':'4px',
			'margin-left':'0px',
			'margin-right':'5px',
			'-moz-border-radius':'0px 0px 0px 0px', // rounds corners for firefox
			'border-radius':'0px 0px 0px 0px', //rounds corners for other browsers
			'border':'solid 1px #000',
			'line-height':'auto', // minus the border
			'display':'inline-block',
			'float': 'left',// fixes mismatch position on some sites
			'width':'auto',
			'overflow':'hidden',
			'text-align':'center',
			'background-color':bookmarkBackground,
			margin: 0,
			padding: 0,
			position:'fixed',
			left:0, top:toolbarHeight,
			'z-index':'999999999999'
		});
		
		
		$('#domainMain').css({
			'margin':'0',
			'padding':'0',
			'background':'white',
			'border':'none',
			'bottom':'auto',
			'clear':'none',
			'cursor':'default',
			'float':'right',
			'font-size':'medium',
			'font-style':'normal',
			'font-weight':'normal',
			'height':'auto',
			'left':'auto',
			'letter-spacing':'normal',
			'line-height':'normal',
			'max-height':'none',
			'max-width':'15%',
			'min-height':'0',
			'min-width':'10%',
			'overflow':'visible',
			'position':'fixed',
			'right':'0px',
			'text-align':'left',
			'text-decoration':'none',
			'text-indent':'0',
			'text-transform':'none',
			'top':'2px',
			'visibility':'visible',
			'white-space':'normal',
			'width':'auto',
			'z-index':'auto',
			'font-family':'Lucida Grande',
			'background-color':recentBMColor,
			'padding-left':'4px',
			'padding-right':'0px',
			'margin-left':'5px',
			'margin-right':'0px',
			'-moz-border-radius':'0px 0px 0px 0px', // rounds corners for firefox
			'border-radius':'0px 0px 0px 0px', //rounds corners for other browsers
			'border':'solid 1px #000',
			'line-height':'auto', // minus the border
			'display':'inline-block',
			'float': 'left',// fixes mismatch position on some sites
			'width':'auto',
			'overflow':'hidden',
			'text-align':'center',
			'background-color':bookmarkBackground,
			margin: 0,
			padding: 0,
			position:'fixed',
			left:'auto', top:toolbarHeight,
			'z-index':'999999999999'
		});
	
	
	
	

		$('#form-wrapper').css({
			'position':'relative',
			'right':'0',
			'left':'0',
			'float':'none',
			'height':toolbarHeight,
			'display':'table-cell',
			'vertical-align':'middle'
		});
		
		
		$('#searchTerm').attr('style', 'font-family: '+fontFamily+' !important; font-size: '+fontSize+' !important; border: 1px solid #999999'); // !important cant be overidden
		$('#searchTerm').css({
			'display':'inline-block',
			'letter-spacing': '0px',
			'text-decoration': 'none',
			'text-transform': 'none',
			'background':searchBoxBackground,
			'color':searchBoxFontColor,
			'bottom':'auto',
			'vertical-align':'auto',
			'float':'none',
			'left':'auto',
			'margin':'0px',
			'height':searchBoxHeight,
			'padding':'0px',
			'position':'static',
			'right':'auto',
			'top':'2px',
			'width':searchBoxWidth
		});	
		
		$('#searchTerm').css({
			'vertical-align':''
		});	
		
		$('#searchGo').attr('style', 'font-family: Lucida Grande !important; font-size: medium !important');
		$('#searchGo').css({
			'display':'inline-block',
			'right':'0px',
			'width':'auto',
			'height':'auto',			
			'letter-spacing': '0px',
			'text-decoration': 'none',
			'text-transform': 'none',
			'left':'auto',
			'float':'none',
			'font-family':'Lucida Grande !important',
		    'font-size':'medium !important',
		    'font-style':'normal !important',
		    'font-weight':'normal !important',
     		'background-color':'black',
     		'color':'white',
     		'border': '1px solid #000000',
   			'border-radius': '3px',
    		'box-shadow': '0 2px 1px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.4) inset',
			'margin': '0',
			'padding': '0',
			'position':'static'
		});
		
		    
  

		$('#changeDomain').attr('style', 'font-family: Lucida Grande !important; font-size: medium !important');
		$('#changeDomain').css({
			'display':'inline-block',
			'right':'0px',			
			'width':'auto',
			'height':'auto',
			'letter-spacing': '0px',
			'text-decoration': 'none',
			'text-transform': 'none',
			'left':'auto',
			'float':'none',
			'font-family':'Lucida Grande !important',
		    'font-size':'medium !important',
		    'font-style':'normal !important',
		    'font-weight':'normal !important',
     		'background-color':'black',
     		'color':'white',
     		'border': '1px solid #000000',
   			'border-radius': '3px',
    		'box-shadow': '0 2px 1px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.4) inset',
			'margin': '0',
			'padding': '0',
			'position':'static'
		});
		/*
		var searchGoHeight=$("#searchGo").height();
		var searchGoHeightPx=searchGoHeight+'px';
		var computedMarginTop=toolbarHeightText-searchGoHeight-2*3;
		var computedMarginTopPx=computedMarginTop+'px';
		$('#changeDomain').attr('style', 'font-family: Lucida Grande !important; font-size: medium !important');
		$('#changeDomain').css({
			'height':'auto',
			'right':'0px',
			'left':'auto',
			'float':'right',
			'font-family':'Lucida Grande',
		    'font-size':'medium',
		    'font-style':'normal',
		    'font-weight':'normal',
     		'background-color':'black',
     		'color':'white',
     		'border': '1px solid #000000',
   			'border-radius': '3px',
    		'box-shadow': '0 2px 1px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.4) inset',
			'margin': '0',
			'padding': '0',
			'position':'static',
			//'margin-top':computedMarginTopPx // toolbar height - button height - 2*border-radius
		});
		*/
		
		
		//$('#changeDomain').css({'line-height':searchGoHeightPx}); // make same height as go button


		$("#debugMsg").hide(); 	    // make sure debug container is not displayed at first
		$('#bookmarksMain').hide(); // main BM container
		$('#domainMain').hide();    // domain container
		$('#searchDomain').hide();    // this is a holder for processing, keep it hidden

		/* load the smu shield image */
		appAPI.resources.createImage(
        	'<img src="resource-image://logo32_32.png" width="32" height="32" />'
    	).appendTo('#smu-shield');
    	
		fixPositions();
		
		addDebug(1, "Finished Initialising UI.<br>");
	} // end of loadUI()



	/*
		Because we inject our toolbar, we must fix certain
		pages. 99.9% of the time just moving the body down
		will work for us. The other 0.1% we need to find
		a fix. This fixes 99.9% of pages and attempts to
		fix the 0.1%
		
		alternatively, a program could be made that goes through
		all css to bring everything down by toolbarheight but
		this can be inefficient
	*/
	function fixPositions ()
	{
		var bodyMoved=0;
		if (!appAPI.isMatchPages("*.google.ca/*"))
		{

			addDebug(1, "Moving margin top down by "+toolbarHeight+".<br>");
			$("body").css({'margin-top':toolbarHeight}); // move page down, works 99% of the time
			//bodyMoved=1;
		}

		/*
		we dont use frames anymore, but if it was enabled this is how it is done
		if (!appAPI.dom.isIframe()) // only works if iframes turned on
		{

			if (!appAPI.isMatchPages("mail.google.com/*"))
			{
				addDebug(1, "Moving margin top down by "+toolbarHeight+".<br>");
				$("body").css({'margin-top':toolbarHeight}); // move page down, works 99% of the time
			}
			else
			{
				addDebug(1, "Detected mail.google.com/* page. Not resizing top margin.<br>");
			
			}

		}
		*/
		
		/* specific web pages */
		//if ((bodyMoved==0 && !appAPI.isMatchPages("google.ca") && 
		if((!appAPI.isMatchPages("google.com")) && ( appAPI.isMatchPages("google.com/?*") || appAPI.isMatchPages("*.google.com/*") || appAPI.isMatchPages("google.ca/?*")))
		{
			$(".gb_ub").css({'margin-top':toolbarHeight});
			$(".gb_Ua").css({'margin-top':toolbarHeight});
			$("#gb").css({'margin-top':toolbarHeight});
			$("#gba").css({'margin-top':toolbarHeight});
			$("#mngb").css({'margin-top':toolbarHeight});
		}

		
		if (appAPI.isMatchPages("facebook.com/*"))
		{
			addDebug(1, "Detected facebook.com. Moving .fixed_elem and .fbChatSidebar down by "+toolbarHeight+".<br>");
			$(".fixed_elem").css({'margin-top':toolbarHeight});	
			$(".fbChatSidebar").css({'top':toolbarHeight});	
			
			
			
		}
		if (appAPI.isMatchPages("twitter.com/*"))
		{
			addDebug(1, "Detected twitter.com. Moving .topbar down by "+toolbarHeight+".<br>");
			$(".topbar").css({top:toolbarHeight});	
		}
        			
        			
        			
	} // end of fixPositions()

	/*
		Triggered by message API. Allows background to send
		debug messages to the extension file
	*/
	function addDebugFromBackground (level, debug)
	{
		addDebug(level, debug);
	}
	

	/*
		addDebug allows for displaying debugging messages to the user
		You access the log with ctrl+x, and put it away with ctrl+x
		
		The debug messages only update when the debugger is open
		This is for efficiency.
		
		
		
		recommended debug levels
		0 = Info
		1 = Warning
		2 = Error
	*/
	function addDebug (level, debug)
	{
		// uncomment these three to get debug every page right away
		//debugStatus=1;
		//$("#debugMsg").show();
		//level=0;
		if($("#debugMsg").html()==null)
		{
			console.log("Debugger not ready.");
			return;
		}

		if(debugLevel!=-1) 		   // make sure debug is on
		{
			if(level>=debugLevel)  // debug message level is >= current debug level 
			{
				if(debugStatus==1) // debug window is open
				{
				    
				    if(level==0)
				    {
				    	debug = "(Info)" + debug;
				    }
				    if(level==1)
				    {
				    	debug = "(Warn)" + debug;
				    }
				    if(level==2)
				    {
				    	debug = "<strong>(ERROR)</strong>" + debug;
				    }
				    
				    /* 
				    	this is highly inefficient and could be made better
				    	it can slow down the browser on level 0 (show all)
				    */
					$("#debugMsg").html(debug+"<Br>"+$("#debugMsg").html());
				}
			}
		}
	} // end of addDebug()



	/* add the shortcut for opening and closing the debugger */
	appAPI.shortcut.add("Ctrl+X", function(event) {
			if(debugStatus==0)  // debug window is closed, open it
			{
				debugStatus=1;
				$("#debugMsg").show();
				addDebug(1, "Debug window opened!<br>");
			}
			else		        // debug window is open, close it
			{	debugStatus=0;
				$("#debugMsg").hide();	
				addDebug(1, "Debug window closed!<br>");	
			}
		}, {
			// Options
			type: 'keydown',
			propagate: true,
			disable_in_input: true,
			target: document
    });
    
    /*
    	updateFromDB gets the database data on the bookmarks
    	if the database is empty or null, no worry
    	the background will pull the data within 5
    	seconds, updating the browser.
    	
    	All database calls are asynchroneous so the order
    	in which they are called is not guaranteed 
    */
    function updateFromDB ()
    {
    	
    	addDebug(0, "updateFromDB: ENTERED <br>");
    	
    	appAPI.db.async.get("bookmarks", function(value) {
		        if(value==null || value.length==0)
		        {
		        	addDebug(1, "updateFromDB got the saved data and returnBM was null. Waiting for background to update.<br>");
		        }
		        else 
		        {
		   
			        addDebug(0, "updateFromDB got the saved data and saw "+value+" ...... "+value.length+" SMUT bookmarks.1.<br>");
			        setupBookmarks(value);   // update UI with the BMs
			        addDebug(0, "updateFromDB got the saved data and saw "+value.length+" SMUT bookmarks.1.<br>");
		        }		        
			});	

    	addDebug(0, "exiting updateFromDB <br>");
    } // end of updateFromDB()
    
    
    /*
    	notifyAction handles some background request
    	for example, if the background wants the page
    	to update its bookmarks displayed to the user,
    	it is directed here.
    */
    function notifyAction (theType, theDo)
    {
    		addDebug(0, "Entered notifyAction with: "+theType+" and "+theDo+" <br>");
    		//case 'notify': notifyAction(msg.type, msg.do); break;
    	
			if(theType=="db")
			{
				if(theDo=="update")
				{
					addDebug(0, "notifyAction is attempting to get the DB data.<br>");
					appAPI.db.async.get("bookmarks", function(value) {
						allBMs=value; // update current BM values
						if(value==null)
						{
							addDebug(1, "notifyAction got the saved data and returnBM was null.<br>");
						}
						else
						{
							addDebug(0, "notifyAction got the saved data and saw "+value.length+" SMUT bookmarks.1.<br>");
							setupBookmarks(value);	// update UI with the BMs
							addDebug(0, "notifyAction got the saved data and saw "+value.length+" SMUT bookmarks.1.<br>");
						}
					});	
				}
			}
				//appAPI.message.toActiveTab({'action':'notify','type':'db', 'do':'update'}); 
			addDebug(0, "Exited notifyAction <br>");
    } // end of notifyAction()
    
    
    /*
    	given an array of BMs setupBookmarks will
    	1) setup the boommark pointers splitting up recent BMs and main BMs
    	2) update the UI for the recent BMs
    	3) update the UI for the main BMs
    
    */
    function setupBookmarks(theBMs)
    {
    	addDebug(0, "Entered setupBookmarks<br>");

    	if(theBMs==null)
    	{
    		addDebug(1, "setupBookmarks - the bookmarks recieved were null<br>");
    	}
    	else
    	{
    		addDebug(0, " setupBookmarks Total bookmark to process: "+allBMs.length+"<br>");
    	
    		
    		addDebug(0, "  setupBookmarks mainBMptr length before setup: ("+mainBMptr.length+"), recentBMptr length before setup: ("+recentBMptr.length+")<br>");
    		setupBMPtr(theBMs);
    		addDebug(0, "  setupBookmarks mainBMptr length after setup: ("+mainBMptr.length+"), recentBMptr after before setup: ("+recentBMptr.length+")<br>");
    		updateBMRecentUI(); // display to user the changes for recent BM
    		updateBMMainUI();   // display to user the changes for main BM
    	}
    	
    	addDebug(0, "Exiting setupBookmarks<br>");
    } // end of setupBookmarks

	/* deletes the currently displayed recent bookmarks */
	function deleteRecent ()
	{
		$('#bm-recent-container').html("");
	}
	
	/* deletes the currently displayed main bookmarks */
	function deleteMain ()
	{
		$('#bookmarksMain').html("");
	}
			
				
	/*
		goes through the mainBMptr list in order to determine which of the
		bookmarks in the allBMs array to display to the user
		
		Setups up divs containing the bookmark and then inserts it into the
		bookmark container
		
		Some css is done here
	*/	
	function updateBMMainUI ()
	{
		addDebug(0, "Entered updateBMMainUI<br>");
		deleteMain(); // empty out UI container
		for(var i = 0; i < mainBMptr.length; i++)
		{
			$(' <div id="main_'+i+'" data-which="'+i+'" title="'+allBMs[mainBMptr[i]][0]+' - '+allBMs[mainBMptr[i]][1]+'" >'+allBMs[mainBMptr[i]][0]+'</div> ').css({
				'overflow':'hidden',
				'background-color':recentBMColor,
				'padding-left':'4px',
				'padding-right':'4px',
				'margin':'5px',
				'-moz-border-radius':'10px 10px 10px 10px', // rounds corners for firefox
				'border-radius':'10px 10px 10px 10px', //rounds corners for other browsers
				'border':'solid 1px #000',
				'height':toolbarWithBorder, // minus the border
				'line-height':toolbarWithBorder, // minus the border
				'v-align':'middle',
			})
			.appendTo('#bookmarksMain').on("click", function(){ 
				addDebug(0, "Clicked a main bookmark.<br>");
				clickedMain($(this));
			});	
		}
		addDebug(0, "Exiting updateBMMainUI<br>");
	} // end of updateBMMainUI()
	
	
	/*
		goes through the recentBMptr list in order to determine which of the
		bookmarks in the allBMs array to display to the user
		
		Setups up divs containing the bookmark and then inserts it into the
		bookmark container
		
		Some css is done here
	*/	
	function updateBMRecentUI ()
	{
		addDebug(0, "Entered updateBMRecentUI<br>");
		deleteRecent(); // empty out UI container
		for(var i = 0; i < recentBMptr.length; i++)
		{
			$(' <div id="recent_'+i+'" data-which="'+i+'" title="'+allBMs[recentBMptr[i]][0]+' - '+allBMs[recentBMptr[i]][1]+'">'+allBMs[recentBMptr[i]][0]+'</div> ').css({
			'margin':'0',
			'padding':'0',
			'background':'white',
			'border':'none',
			'bottom':'auto',
			'clear':'none',
			'cursor':'default',
			'float':'none',
			'font-size':'medium',
			'font-style':'normal',
			'font-weight':'normal',
			'left':'auto',
			'letter-spacing':'normal',
			'line-height':'normal',
			'max-height':'none',
			'max-width':'none',
			'min-height':'0',
			'min-width':'0',
			'overflow':'visible',
			'position':'static',
			'right':'auto',
			'text-align':'left',
			'text-decoration':'none',
			'text-indent':'0',
			'text-transform':'none',
			'top':'2px',
			'visibility':'visible',
			'white-space':'normal',
			'width':'150px',
			'z-index':'auto',
			'font-family':'Lucida Grande',
			'background-color':recentBMColor,
			'padding-left':'4px',
			'padding-right':'4px',
			'margin-left':'5px',
			'margin-right':'5px',
			'-moz-border-radius':'10px 10px 10px 10px', // rounds corners for firefox
			'border-radius':'10px 10px 10px 10px', //rounds corners for other browsers
			'border':'solid 1px #000',
			'height':toolbarWithBorder, // minus the border
			'line-height':toolbarWithBorder, // minus the border
			//'line-height':toolbarHeight-'3px', // minus the border
			'display':'inline-block',
			'float': 'left',// fixes mismatch position on some sites
			'width':'100px',
			'overflow':'hidden',
			'text-align':'center'
			})
			.appendTo('#bm-recent-container').on("click", function(){ 
				addDebug(1, "Clicked a RECENT bookmark.<br>");
				clickedRecent($(this));
			});
		}
		addDebug(0, "Exiting updateBMRecentUI<br>");
	}// end of updateBMRecentUI()



	/*
		given an array of bookmarks, it goes through them to determine which
		ones are main bookmarks and which are recents.
		It sets up pointer holders (arrays) for these bookmarks
	*/
	function setupBMPtr (theBMs)
	{
		allBMs=theBMs;
		addDebug(0, "Entered setupBMPtr<br>");
		mainBMptr.length=0;	  // reset current pointers
		recentBMptr.length=0;
		var currMain=0;
		var currRecent=0;
		for(var i = 0; i < theBMs.length; i++)
		{
			if(theBMs[i][2]==0) // main bookmark
			{
				mainBMptr[currMain]=i;
				currMain++;
			}
			else if(theBMs[i][2]==1) // recent
			{
				recentBMptr[currRecent]=i;
				currRecent++;
			}
			else
			{
				addDebug(2, "setupBMPtr saw a bookmark with no status. i="+i+" title="+theBMs[i][0]+"<br>");
			}
		}
		addDebug(0, "Exiting setupBMPtr<br>");
	} // end of setupBMPtr()
	
	
	
	/*
		Handle clicking change domain search
	*/
	$('#changeDomain')
		.click(function () {
		if(clickedDomains==0) // shield is not active, activate it
		{
			addDebug(0, "Opening domains.<br>");
			setupDomains();
			$('#domainMain').show();
			$('#changeDomain').attr('value',searchDomainTextOn);
			clickedDomains=1;
		}
		else	// shield is active, deactivate it
		{
			addDebug(0, "Closing domains.<br>");
			$('#domainMain').hide();
			$('#changeDomain').attr('value',searchDomainTextOff);
			clickedDomains=0;
		}
	});
		
	/*
		makes sure search domain container has the
		domain information for the user to click
		
		Some css is done here
	*/
	function setupDomains ()
	{
		addDebug(0, "Entered setupDomains<br>");
		deleteDomain(); // empty out UI container
		for(var i = 0; i < searchDomains.length; i++)
		{
			var addOn=" ";
			if(i==currentDomain)
			{
			//	addOn="X";
			}
			$(' <div id="domain_'+i+'" data-which="'+i+'" title="'+searchDomains[i][0]+' - '+searchDomains[i][1]+'" >'+addOn+' '+searchDomains[i][0]+'</div> ').css({
				'overflow':'hidden',
				'background-color':recentBMColor,
				'padding-left':'4px',
				'padding-right':'4px',
				'margin':'5px',
				'-moz-border-radius':'10px 10px 10px 10px', // rounds corners for firefox
				'border-radius':'10px 10px 10px 10px', //rounds corners for other browsers
				'border':'solid 1px #000',
				'height':toolbarWithBorder, // minus the border
				'line-height':toolbarWithBorder, // minus the border
				'v-align':'middle',
			})
			.appendTo('#domainMain').on("click", function(){ 
				addDebug(0, "Clicked a search domain.<br>");
				clickedDomain($(this));
			});	
		
		}
		
	}
		
	/* deletes the currently displayed search domains */
	function deleteDomain ()
	{
		$('#domainMain').html("");
	}
			
				

		
		
	/*
		Handle clicking the shield
	*/
	$('#smu-shield')
		.click(function () {
			toggleBookmarks();
	});
		
	/*
		opens and close the bookmark container based
		on its current state
	*/
	function toggleBookmarks ()
	{
		if(clicked==0) // shield is not active, activate it
		{
			showBookmarks();
		}
		else	// shield is active, deactivate it
		{
			hideBookmarks();
		}
	}
	
	/*
		Shows the bookmark container to the user
	*/
	function showBookmarks ()
	{
		$('#bookmarksMain').show();
		clicked=1;
	}
	
	/*
		Shows the bookmark container to the user
	*/
	function hideBookmarks ()
	{
		$('#bookmarksMain').hide();
		clicked=0;
	}	
		
		
		
		
	/*
		handle clicking search
		changes current window to that of searchDomain searching for
		what the user typed into the search input
	*/
	$('#searchGo')
		.click(function () {
			addDebug(0, "processing search request.<br>");
			currentDomain=getCurrentDomain(); // make sure domain is up to date
			var searchTerm=$('#searchTerm').val();
			addDebug(0, "processing search saw term: "+searchTerm+" .<br>");
			searchByTerm(searchTerm);
		});
	
	
	/*
		given a term to search for, will use the default domain
		and target to search for that term
	
	*/
	function searchByTerm (searchTerm)
	{
		addDebug(0, "searchByTerm: "+searchTerm+" .<br>");
		var domain=searchDomains[currentDomain][1];
		var target=defaultSearchTarget;
		addDebug(0, "searchByTerm: using  domain "+domain+"  target "+target+" .<br>");

		searchByAll(domain, searchTerm, target); 
	}
	
	/*
		Given a domain to use to search for term, the
		resulting page will either load in the current page
		if target is 1, and in another (new) page otherwise
	*/
	function searchByAll (domain, term, target)
	{
		addDebug(0, "searchByAll: domain "+domain+" term "+term+" target "+target+" .<br>");

		var div = $('#searchDomain');
		
		div.html(domain); // our current search URL
		
		div.html(div.html().replace('SEARCH_TERM', term)); // enter search term into URL
		var domainWithTerm=div.html();
		addDebug(0, "current search domain with term: "+domainWithTerm+"<br>");
		
		if(target==0)
		{
			window.location.href = domainWithTerm; // set current page to the search URL we generated
		}
		else
		{
			appAPI.message.toBackground({
				action:'gotoUrl',
				value:domainWithTerm
			});
		}
	}
	
	
	
	/*
		updates the current default search domain value (such as 1 2 3) pointing
		to the domain array
		
		then changes the users url based on the search term and domain
	*/ 	
	function clickedDomain (which)
	{
		$('#domainMain').hide(); // auto hide the main BM container
		clickedDomains=0;
		var theDomainPos=which.data("which"); // bookmark position as displayed on UI
		if(searchDomains!=null && theDomainPos<searchDomains.length) // make sure we have the domain data
		{
			addDebug(0, "clickedDomain search domain "+searchDomains[theDomainPos]+" was clicked.<br>");
			currentDomain=theDomainPos;
			changeSearchDomain(currentDomain);
			document.getElementById('searchGo').click(); // submit the search
			
			
		}
		else
		{
			addDebug(2, "clickedDomain attempted to load a domain that appears to not exist<br>");
		}
	
	}
	
	/*
		Gets the current set search domain and sets it
		for the page to use
	*/
	function getCurrentDomain ()
	{
		var newCurrentDomain = appAPI.db.get("searchDomain");
		if(newCurrentDomain==null || newCurrentDomain>searchDomains.length)
		{
			newCurrentDomain=0;
			addDebug(2, "getCurrentDomain had no value. Setting current domain to 0.<br>");
			setCurrentDomain(0);
		}
		return newCurrentDomain;
	}
		
	/*
		Sets the current set search domain in the DB
	*/
	function changeSearchDomain (domain)
	{
		addDebug(0, "changeSearchDomain setting current DB value for domain to "+domain+".<br>");
		currentDomain=domain;
		appAPI.db.set("searchDomain", domain);
	}
	


	/*
		sends a signal to the background with what bookmark URL was clicked
		the background will then direct the user to a newly created tab which
		loads the URL of the bookmark the user clicked.	
	*/
	function clickedRecent (which)
	{
		var theBMpos=which.data("which"); // bookmark position as displayed on UI
		if(allBMs!=null && recentBMptr!=null && theBMpos<=recentBMptr.length) // make sure we have the bookmark data
		{
			addDebug(0, "Attempting to load main URL: " + allBMs[recentBMptr[theBMpos]] + ".<br>");

			appAPI.message.toBackground({
				action:'gotoUrl',
				value:allBMs[recentBMptr[which.data("which")]][1]
			});
		}
		else
		{
			addDebug(2, "clickedRecent attempted to load a bookmark that appears to not exist<br>");
		}
	}
		
	/*
		sends a signal to the background with what bookmark URL was clicked
		the background will then direct the user to a newly created tab which
		loads the URL of the bookmark the user clicked.	
	*/ 	
	function clickedMain (which)
	{
		$('#bookmarksMain').hide(); // auto hide the main BM container
		
		var theBMpos=which.data("which"); // bookmark position as displayed on UI
		if(allBMs!=null && mainBMptr!=null && theBMpos<=mainBMptr.length) // make sure we have the bookmark data
		{
			
			addDebug(0, "Attempting to load main URL: " + allBMs[mainBMptr[theBMpos]] + ".<br>");
			pushRecents(which.data("which"));

			appAPI.message.toBackground({
				action:'gotoUrl',
				value:allBMs[mainBMptr[which.data("which")]][1]
			});
		}
		else
		{
			addDebug(2, "clickedMain attempted to load a bookmark that appears to not exist<br>");
		}
		//	window.location.href = bookmarkURLS[which.data("which")];


	}
	
	
	/*
		processes the users recently clicked main bookmark
		if the bookmark is already a recent, all the recents shift down one
		and the one clicked goes in front
		ie: recent bookmarks 1 2 3 4
		user clicks on main bookmark 2
		new recent bookmarks 2 1 3 4
		
		if the bookmark is not already a recent, all the recents shift down
		one and the one clicked is inserted into the recents in front
		ie: recent bookmarks 1 2 3 4
		user clicks on main bookmark 10
		new recent bookmarks 10 1 2 3
	*/
	function pushRecents (which)
	{
		var alreadyRecent=-1; // bookmark is not a recent
	
		if(allBMs!=null)
			addDebug(0, "pushRecents: before run BMS "+allBMs+"<br>");
	
	
		if(allBMs==null || mainBMptr==null || recentBMptr==null || which>mainBMptr.length) // make sure we have the bookmark data
		{
			addDebug(2, "pushRecents tried to process data it did not have<br>");
			return;
		}
	
		addDebug(0, "Processing recent links.<br>");

		/* see if bookmark is already in recent list */
		for(var i = 0; i < recentBMptr.length; i++)
		{
	
			/* compare the recent bookmarks to the main one that was clicked */
			if(allBMs[recentBMptr[i]][0]==allBMs[mainBMptr[which]][0] && allBMs[recentBMptr[i]][1]==allBMs[mainBMptr[which]][1])
			{
				addDebug(0, "Bookmark clicked was detected in recents already, number: "+i+".<br>");
				alreadyRecent=i;
			}
	
		}
		if(alreadyRecent==-1)
		{
			addDebug(0, "Clicked bookmark is not a recent.<br>");
		}
		else
		{
			addDebug(0, "Clicked bookmark is already a recent.<br>");
	
		}

		/* deal with shuffling recent list */
		if(alreadyRecent!=-1) // this is already a recent
		{
			if(alreadyRecent!=0) // recent is not already the first (latest) recent
			{
				var theURL=allBMs[recentBMptr[alreadyRecent]][1];
				var theTitle=allBMs[recentBMptr[alreadyRecent]][0];
				var backupNewRecent=allBMs[recentBMptr[alreadyRecent]];
				var backupNewRecentLoc=recentBMptr[alreadyRecent];
				
				/* 
					shuffle the recents started from the bookmark clicked
					down to the first one
				*/
				for(var i = alreadyRecent; i > 0; i--)
				{
					allBMs[recentBMptr[i]]=allBMs[recentBMptr[i-1]];
					var theRecent="recent_"+i;
					$("#"+theRecent).html(allBMs[recentBMptr[i]][0]); // update UI portion
					var titleUrl=allBMs[recentBMptr[i]][0]+" - "+ allBMs[recentBMptr[i]][1];
					$("#"+theRecent).attr('title',titleUrl);
				}
		
				/* insert the clicked bookmark into the most recent one */
				var theRecent="recent_0";
				allBMs[recentBMptr[0]]=backupNewRecent;
				
				$("#"+theRecent).html(allBMs[recentBMptr[0]][0]); // update UI portion
				var titleUrl=allBMs[recentBMptr[0]][0]+" - "+ allBMs[recentBMptr[0]][1];
				$("#"+theRecent).attr('title',titleUrl);
			}
			else
			{
				addDebug(0, "Clicked bookmark the first recent bookmark. No change needed.<br>");
			}
		}
		else // new bookmark being added to recents
		{
	
			addDebug(0, "Clicked bookmark is a new recent. Adding to and shifting recent list.<br>");
		
			/* shift the recents down 1 */
			for(var i = (recentBMptr.length-1); i > 0; i--) 
			{
				allBMs[recentBMptr[i]]=allBMs[recentBMptr[i-1]];
				var theRecent="recent_"+i;
			
				$("#"+theRecent).html(allBMs[recentBMptr[i]][0]); // update UI portion
				var titleUrl=allBMs[recentBMptr[i]][0]+" - "+ allBMs[recentBMptr[i]][1];
				$("#"+theRecent).attr('title',titleUrl);
			
			}
			var backupNewRecent=new Array();
			
			/* we need a deep copy here */
			backupNewRecent[0]=allBMs[mainBMptr[which]][0];
			backupNewRecent[1]=allBMs[mainBMptr[which]][1];
			backupNewRecent[2]=allBMs[mainBMptr[which]][2];
			
		
			backupNewRecent[2]=1;
		
			/* add in bookmark to the first recent (most recent) bookmark */
		
			allBMs[recentBMptr[0]]=backupNewRecent;
			var theRecent="recent_0";
		
			$("#"+theRecent).html(allBMs[recentBMptr[i]][0]); // update UI portion
			var titleUrl=allBMs[recentBMptr[i]][0]+" - "+ allBMs[recentBMptr[i]][1];
			$("#"+theRecent).attr('title',titleUrl);
		}

		addDebug(1, "Sending to background for updating folders.<Br>");
	
		if(allBMs!=null)
			addDebug(0, "pushRecents: AFTER run BMS "+allBMs+"<br>");
		
		var newAllBMs=allBMs;
		var copyOfAllBMs=allBMs;
		
		updateDbWith(copyOfAllBMs);



		addDebug(1, "Done processing recent bookmark list.<br>");

	}	// end of pushRecents()
	
	
	/*
		updates the database bookmarks
	*/
	function updateDbWith (withWhat)
	{
		addDebug(0, "<B>updating</b> db with "+withWhat+"<Br>");
		appAPI.db.async.set(
			"bookmarks",
			withWhat,
			updateSuccessNew(withWhat) 
		);
		
	}
	
	
	/*
		now that we saved data to the db, try to retrieve the data
	*/
	function updateSuccessNew(withWhat)
	{
		addDebug(0, "<B>getting</b> should have "+withWhat+"<Br>");
		appAPI.db.async.get("bookmarks", function(value) {getSuccessNew(value) });
	}
	
	/*
		we now saved, then retrieved the DB data.
		Now we must tell the background the data is ready for
		the background to update the browser folders
	*/
	function getSuccessNew(withWhat)
	{
		addDebug(0, "<B>got from db</b>  "+withWhat+"<Br>");
		appAPI.message.toBackground({
			action:'updateFolders'
		});
	}
	
	

		
		
		
	/*
		if user is in search input, and presses enter,
		submit the search
	*/
	$('#searchTerm').bind("keydown", function(event) {

		var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
		if (keycode == 13) { // keycode for enter key
			addDebug(0, "Enter was pressed inside of search. Attempting to search.<br>");
			document.getElementById('searchGo').click(); // press search button for user
		
			return false;
		} else  {
			return true;
		}
	}); 
	
	
	/*
		Handle the browser resizing
		If there is not enough room the recent bookmarks shrink/cutt off
		If the search overlaps the recent bookmarks the bookmarks will
		be hidden
		If there is not enough room for the search it will hide too.
		
		Once room allows, the search will be reenabled and recent bookmarks
		will show up depending on how much room there is.
	*/
	

	/* fires when the browser is resized */
	$(function(){
		$(window).resize(function(){
		
			addDebug(0, "Resize detected. Resizes: "+resizes+"<br>"); 
			inResize=1;
			resizes++;
			if(resizes>threshhold)
			{
				addDebug(1, "Resize threshold hit..<br>"); 
				resizeNow();	
			}

		});
	
	});

	/* set up the timer to check our resize status */
    var intervalId = appAPI.setInterval(function() {
    	if(document.hidden)
    	{
    		documentHidden=1;
    		addDebug(0, "Window is hidden.<br>"); 
    	}
    	else
    	{
    		if(documentHidden!=0)
    		{
    			addDebug(0, "Window activated, resize.<br>"); 
    			documentHidden=0;
    			resizes=0;
    			inResize=0;
    			resizeNow();
    			
    		}
	    	else if(resizes>0) // the browser has been resized
	        {
	        	if(inResize>timerThreshold)
	        	{
	        		addDebug(0, "Timer threshold hit.<br>"); 
	        		inResize=0;
	        		resizeNow(); // handle the toolbar resizing
	        	}
	        	else if(inResize>=1)
	        	{
	        		addDebug(0, "Currently in a resize.<br>"); 
	        		inResize++; // count the number of times timer has seen
	        					// the browser in a continuous resize
	        	}
	        	else
	        	{
	        		//do nothing
	        	}
	        }
	    }
    }, intervalTime);
    
   
	
	function resizeNow()
	{
		if(document.hidden) // window is not focused, don't do anything
		{
			documentHidden=1;
			addDebug(1, "Window is not in focus, skipping resize.<br>");
			return;
		}
	
		resizes=0; // reset the resize count
		
  		var searchContainX=$("#bm-search").offset().left;
  		var recentContainX=$("#bm-recent-container").offset().left+$("#bm-recent-container").width();
  		var smuShieldX=$("#smu-shield").offset().left+$("#smu-shield").width();
  		
  		addDebug(0, "resizeNow Search LEFT: "+searchContainX+ "<br>");
  		addDebug(0, "resizeNow Recent RIGHT "+recentContainX+  "<br>");
  		addDebug(0, "resizeNow shield RIGHT "+smuShieldX+ "<br>");
  		
  		if($("#bm-search").is(":visible")==true)
  		{
  			addDebug(1, "Search container is currently visible.<br>");
  			if($("#bm-recent-container").is(":visible")==true)
  			{
  				addDebug(1, "Recent container is currently visible.<br>");
  				if(searchContainX<=recentContainX)
  				{
	  				$("#bm-recent-container").hide();
	  				addDebug(1, "making sure recent container is HIDDEN<br>");
  				}
  			}
  			else
  			{
  				addDebug(1, "Recent container is currently invisible.<br>");
  				// since its invisible, check widths as offset will be 0
  				if(($("#smu-shield").width()+$("#bm-recent-container").width())<searchContainX)
  				{
  					addDebug(1, "making sure recent container is SHOWN<br>");
  					$("#bm-recent-container").show();
  				}
  			}
  			
  				if(searchContainX<=smuShieldX)
  			{
  				$("#bm-search").hide();
  				addDebug(1, "making sure search container is HIDDEN<br>");
  			}

  		
  		}
  		else
  		{
  			addDebug(1, "Search container is currently invisible.<br>");
  			
  		    	if(($("#smu-shield").width()+$("#bm-search").width())<$(window).width())
  				{
  					addDebug(1, "making sure recent container is SHOWN<br>");
  					$("#bm-search").show();
  				}
  			
  		}
  			
		addDebug(1, "Resize DONE<br>");
	  			
	}

		
});
