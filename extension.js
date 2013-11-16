  /************************************************************************************
  This is your Page Code. The appAPI.ready() code block will be executed on every page load.
  For more information please visit our docs site: http://docs.crossrider.com
*************************************************************************************/

appAPI.ready(function($) { 


 var searchDomains=[];
			searchDomains[0]=new Array();
			searchDomains[0][0]="Google";
			searchDomains[0][1]="https://www.google.ca/?#q=SEARCH_TERM";
			var currentDomain=0;
    // Place your code here (you can also define new functions above this scope)
    // The $ object is the extension's jQuery object

    //alert("My new Crossrider extension works! The current page is: " + document.location.href);

    
	var lid = appAPI.message.addListener(function(msg) {
	  
		// Performs action according to message type received
		switch (msg.action) { 
			// Received message to broadcast to all tabs
			
			case 'debugger': addDebugFromBackground(msg.level, msg.debug); break;
			
			case 'notify': notifyAction(msg.type, msg.todo); break;
			
				
			case 'updateFolders': updateBrowserFolder(); break;
			// Received message to broadcast to all tabs
			//case 'other': appAPI.message.toAllOtherTabs(msg); break;
			// Received message to send to the active tab
			case 'tab': appAPI.message.toActiveTab(msg); break;
			// Received message to remove listeners; Relay message all tabs, and then remove background listener
			case 'remove': appAPI.message.toAllTabs(msg); appAPI.message.removeListener(lid); break;
			// Received message to broadcast to all iframes on the active tab
			//case 'iframes': appAPI.message.toCurrentTabIframes(msg); break;
			// Received message to send to the iframe's parent page
			//case 'window': appAPI.message.toCurrentTabWindow(msg); break;
		}
	});
	
	addDebug(1, "Page loaded.<br>");
	
	
	var toolbarColor="#8C2633"; // Colour: Maroon
							// Pantone value: Pantone 202C
	var toolbarHeight="32px";   // height of tool bar in pixels  was 24, trying 32
	var toolbarHeightText="32";   // height of tool bar in pixels  was 24, trying 32
	var toolbarWithBorder="30px"; //	toolbarHeight-2 px (2*1px border)								  
										  
	var recentBMColor="#5e99aa"; // Colour: Blue
							     // Pantone value: Pantone 549C
	var shieldImage="resource-image://logo32_32.png";
	var bookmarkBackground="#D9C89E"; // main bookmarks
							   // shown when shield is clicked
							   // pantone 7501C  sand
				
	var mainBMHeight="600px"	;
	var mainBMWidth="35%"	;
	
	var clicked=0; // clicked the shield, dont change this
	var debugStatus=0; // debug holder setting, dont change this

	loadUI();
	updateFromDB(); // now that UI is loaded, fill in the BM data

	
	
	/*
	
		loadui handles setting up the look of the toolbar
		it loads the containers, sets heights, colors, etc
		
		It sets up the debug holder which can be shown/hidden
		by pressing ctrl-x, if it is enabled.
		
		Holders for recent bookmarks and main bookmarks are
		loaded later when needed
		
	*/
	function loadUI ()
	{
		addDebug(1, "Initialising UI.<br>");
			$('<div id="SMUTHolder">' +
			'<div id="toolbardiv">' +
				'<div id="smu-shield">'+
					
				'</div>'+
			
					
					'<div id="bm-recent-container">'+
					'</div>'+
					
						'<div id="bm-search">'+
						'<div id="form-wrapper" ><input type="text" length="20" id="searchTerm" >'+
						'<input type="submit" id="searchGo" value="Go!"></div>'+
						'<div id="searchDomain" style="hidden"></div>'+
					'</div>'+
			
			
				
			'</div>' +
		'</div>')
		.insertAfter('head');
			$('<div id="bookmarksMain">' +
			
		'</div>')
		.insertAfter('#SMUTHolder');
		
		$('<div id="debugMsg">' +
			
		'</div>')
		.insertAfter('#bookmarksMain');
		
			$('#debugMsg').css({
			'background-color':bookmarkBackground,
			//height:mainBMHeight,
			margin: 0,
			padding: 0,
				right: "0px",
			position:'fixed',
			float:'right', top:toolbarHeight,
			width: '60%',
			height: '75%',
			overflow: 'scroll',
			'z-index':'999999999999'
		});
		$("#debugMsg").hide();
		
		$('#smu-shield').css({float:'left', 'padding-left':'2px'});
	 		appAPI.resources.createImage(
        		'<img src="resource-image://logo32_32.png" width="32" height="32" />'
    	).appendTo('#smu-shield');
    
		var resetClass={
	
			'margin':'0',
			'padding':'0',
		  	'background':'transparent',
		     'border':'none',
		     'bottom':'auto',
		     'clear':'none',
		     'cursor':'default',
		     'float':'none',
		     'font-family':'Lucida Grande', // end of reset
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
			//height:mainBMHeight,
			margin: 0,
			padding: 0,
			position:'fixed',
			left:0, top:0,
		//	width: mainBMWidth,
			'z-index':'999999999999'
		};
		
		$('#SMUTHolder').removeClass();
		$('#form-wrapper').removeClass();
		$('#searchGo').removeClass();
		$('#searchTerm').removeClass();
		$('#bm-search').removeClass();
		
		$('#SMUTHolder').css(resetClass);
		$('#SMUTHolder').css(resetClass);
		$('#form-wrapper').css(resetClass);
		$('#searchGo').css(resetClass);
		$('#searchTerm').css(resetClass);
		$('#bm-search').css(resetClass);
		
		$('#SMUTHolder').css({
	
			'margin':'0',
			'padding':'0',
		  	'background':'transparent',
		     'border':'none',
		     'bottom':'auto',
		     'clear':'none',
		     'cursor':'default',
		     'float':'none',
		     'font-family':'Lucida Grande', // end of reset
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
			//height:mainBMHeight,
			margin: 0,
			padding: 0,
			position:'fixed',
			left:0, top:0,
		//	width: mainBMWidth,
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
	
		 $('#bm-search').css({
	 	//reset
	/* 	'margin':'0',
	'padding':'0',
  	'background':'transparent',
     'border':'none',
     'bottom':'auto',
     'clear':'none',
     'cursor':'default',
     'float':'none',
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
     'position':'absolute',*/
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

	//'font-family':'Lucida Grande', // end of reset
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
		
		'font-family':'Lucida Grande',//end of reset
		'background-color':recentBMColor,
		'padding-left':'4px',
		'padding-right':'4px',
		'margin-left':'0px',
		'margin-right':'5px',
		'-moz-border-radius':'0px 0px 0px 0px', // rounds corners for firefox
		'border-radius':'0px 0px 0px 0px', //rounds corners for other browsers
		'border':'solid 1px #000',
		//'height':toolbarWithBorder, // minus the border
		'line-height':'auto', // minus the border
		//'line-height':toolbarHeight-'3px', // minus the border
		'display':'inline-block',
		'float': 'left',// fixes mismatch position on some sites
		//'v-align':'middle',
		'width':'auto',
		'overflow':'hidden',
		'text-align':'center',
		'background-color':bookmarkBackground,
		//height:mainBMHeight,
		margin: 0,
		padding: 0,
		position:'fixed',
		left:0, top:toolbarHeight,
		//	width: mainBMWidth,
		'z-index':'999999999999'
	});
	
	
		var computedHeight=(toolbarHeightText/2)+'px';
	$('#searchTerm').css({
		//	'height':(toolbarHeightText/2-2)+'px',
		//  'padding':'1px'
		//'margin':'0',
		//'padding':'0',
		//	'background':'white',
		/* 'border':'none',
		'bottom':'auto',
		'clear':'none',
		'cursor':'default',
		'float':'none',
		'font-size':'medium',
		'font-style':'normal',
		'font-weight':'normal',*/
		// 'height':computedHeight,
		/*'left':'auto',
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
		'white-space':'normal',*/
		// 'width':'150px'
		//  'z-index':'auto',
		
		//'font-family':'Lucida Grande'
		'background':'white',
		'float':'none',
		'left':'auto',
		'height':computedHeight,
		'position':'static',
		'right':'auto',
		'top':'2px',
		'width':'150px'
	});	
	

	$('#form-wrapper').css({
		/*'font-family':'Lucida Grande', // end of reset
		'font-size':'medium',
		'font-style':'normal',
		'font-weight':'normal'*/
		// 'left':'auto',
		//'right':'auto'
		'position':'relative',
		// 'top':searchContainerHeight + 'px',
		'right':'0',
		'left':'0',
		'height':toolbarHeight,
		'display':'table-cell',
		
		'vertical-align':'middle'
		
		


	});
		$('#searchGo').css({
			'right':'0px',
			'left':'auto',
			'font-family':'Lucida Grande', // end of reset
		     'font-size':'medium',
		     'font-style':'normal',
		     'font-weight':'normal',
     'background-color':'black',
     'color':'white',
     'border': '1px solid #000000',
   'border-radius': '3px',
    'box-shadow': '0 2px 1px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.4) inset',
    

			margin: 0,
			padding: 0,
		
		
		
     
		});
		fixPositions();
		
		addDebug(1, "Finished Initialising UI.<br>");
	} // end of loadUI()

	/*
		Because we inject our toolbar, we must fix certain
		pages. 99.9% of the time just moving the body down
		will work for us. The other 0.1% we need to find
		a fix. This fixes 99.9% of pages and attempts to
		fix the 0.1%
	*/
	function fixPositions ()
	{
		
		if (!appAPI.dom.isIframe())
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
		// fix google.ca and google.com
		if (!appAPI.isMatchPages("mail.google.com/*"))
		{
			$(".gb_ub").css({'margin-top':'30px'});
			$(".gb_Ua").css({'margin-top':'30px'});
		}
		if (appAPI.isMatchPages("facebook.com/*"))
		{
			addDebug(1, "Detected facebook.com. Moving .fixed_elem down by "+toolbarHeight+".<br>");

			$(".fixed_elem").css({'margin-top':toolbarHeight});	
		}
        			
	} // end of fixPositions()

	function addDebugFromBackground(level, debug)
	{
	
		addDebug(level, debug);
	}
	var debugLevel=0;
	
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

		if(debugLevel!=-1)
		{
			if(level>=debugLevel)
			{
				if(debugStatus==1)
						$("#debugMsg").html(debug+"<Br>"+$("#debugMsg").html());
			}
		}
	}





	appAPI.shortcut.add("Ctrl+X", function(event) {
			if(debugStatus==0)
			{
	    		$("#debugMsg").show();
	    		debugStatus=1;
	    		addDebug(1, "Debug window opened!<br>");
			}
			else
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
    	gets the database data on the bookmarks
    	if the database is empty of null, no worry
    	the background will pull the data within 5
    	seconds updating the browser.
    	
    
    */
    var didit=0; // get rid of this (testing)
    function updateFromDB ()
    {
    	
    	addDebug(3, "updateFromDB: ENTERED <br>");
    	appAPI.db.async.get("bookmarks", function(value) {
		        //returnBMs=value;
		       
		       
		        if(value==null || value.length==0)
		        {
		        	addDebug(0, "updateFromDB got the saved data and returnBM was null. Waiting for background to update.<br>");
		        }
		        else
		        {
		   
			        addDebug(3, "updateFromDB got the saved data and saw "+value+" ...... "+value.length+" SMUT bookmarks.1.<br>");
			    
			        setupBookmarks(value);   
			        
			        addDebug(0, "updateFromDB got the saved data and saw "+value.length+" SMUT bookmarks.1.<br>");
			          
			        
		        }
						        
						        
			});	
			
		
    	addDebug(3, "exiting updateFromDB <br>");
    	
    }
    
    function notifyAction(theType, theDo)
    {
    		addDebug(0, "Entered notifyAction with: "+theType+" and "+theDo+" <br>");
    		//case 'notify': notifyAction(msg.type, msg.do); break;
    	
			if(theType=="db")
			{
				if(theDo=="update")
				{
						addDebug(0, "notifyAction is attempting to get the DB data.<br>");
						var returnBMs=[];
							appAPI.db.async.get("bookmarks", function(value) {
						        returnBMs=value;
						        allBMs=value;
						        if(value==null)
						        {
						        	addDebug(0, "notifyAction got the saved data and returnBM was null.<br>");
						        }
						        else
						        {
							        addDebug(0, "notifyAction got the saved data and saw "+value.length+" SMUT bookmarks.1.<br>");
							        setupBookmarks(value);
							        addDebug(0, "notifyAction got the saved data and saw "+value.length+" SMUT bookmarks.1.<br>");
						        }
    						});	
    						
    						//	appAPI.db.async.get("bookmarks", gotDbValue(value));	
				}
			}
				//appAPI.message.toActiveTab({'action':'notify','type':'db', 'do':'update'}); 
			addDebug(0, "Exited notifyAction <br>");
    }
    
    function gotDbValue(theValue)
    {
    	 addDebug(0, "gotDbValue got the saved data and saw "+returnBMs.length+" SMUT bookmarks.1.<br>");
    		setupBookmarks(theValue);
    	 addDebug(0, "gotDbValue got the saved data and saw "+returnBMs.length+" SMUT bookmarks.1.<br>");
    	
    }
    
    function setupBookmarks(theBMs)
    {
    	addDebug(0, "Entered setupBookmarks<br>");
    	addDebug(0, " setupBookmarks Total bookmark to process: "+allBMs.length+"<br>");
    	
    	if(theBMs==null)
    	{
    		addDebug(1, "setupBookmarks - the bookmarks recieved were null<br>");
    	}
    	else
    	{
    		
    		
    		addDebug(0, "  setupBookmarks mainBMptr length before setup: ("+mainBMptr.length+"), recentBMptr length before setup: ("+recentBMptr.length+")<br>");
    		setupBMPtr(theBMs);
    		addDebug(0, "  setupBookmarks mainBMptr length after setup: ("+mainBMptr.length+"), recentBMptr after before setup: ("+recentBMptr.length+")<br>");
    		updateBMRecentUI(); // display to user the changes for recent BM
    		updateBMMainUI();   // display to user the changes for main BM
    		
    		
    	}
    	
    	addDebug(0, "Exiting setupBookmarks<br>");
    }

	function deleteRecent()
	{
		$('#bm-recent-container').html("");
		
	}
		function deleteMain()
	{
		$('#bookmarksMain').html("");
		
	}
			
					
	function updateBMMainUI()
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
		//'margin-left':'5px',
		'margin':'5px',
	//	'margin-right':'5px',
		'-moz-border-radius':'10px 10px 10px 10px', // rounds corners for firefox
'border-radius':'10px 10px 10px 10px', //rounds corners for other browsers
'border':'solid 1px #000',
'height':toolbarWithBorder, // minus the border

'line-height':toolbarWithBorder, // minus the border
//'line-height':toolbarHeight-'3px', // minus the border

'v-align':'middle',



	})
					.appendTo('#bookmarksMain').on("click", function(){ 
					
					clickedMain($(this));
						addDebug(1, "Clicked a main bookmark.<br>");
					});
				
				
		
	}addDebug(0, "Exiting updateBMMainUI<br>");
	}
	
	
	function updateBMRecentUI()
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
					     //'height':computedHeight,
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
					
						'font-family':'Lucida Grande',//end of reset
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
					//'v-align':'middle',
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
	}

	function setupBMPtr(theBMs)
	{
		allBMs=theBMs;
		addDebug(0, "Entered setupBMPtr<br>");
		mainBMptr.length=0;
		var currMain=0;
		recentBMptr.length=0;
		var currRecent=0;
		for(var i = 0; i < theBMs.length; i++)
			{

				if(theBMs[i][2]==0)
				{
					mainBMptr[currMain]=i;
					currMain++;
				}
				else if(theBMs[i][2]==1)
				{
					recentBMptr[currRecent]=i;
					currRecent++;
				}
				else
				{
					addDebug(3, "ERROR: setupBMPtr saw a bookmark with no status. i="+i+" title="+theBMs[i][0]+"<br>");
				}
		
		
		}
		addDebug(0, "Exiting setupBMPtr<br>");
	}
	
	
	
	/*
		Handle clicking the shield
	*/

	$('#bookmarksMain').hide()	;
	$('#smu-shield')
		.click(function () {
		if(clicked==0)
		{
			//	$('#smu-shield').html("SMU SHIELD")	;
			$('#bookmarksMain').show()	;
			clicked=1;
			addDebug(1, "Opening main bookmarks.<br>");
		}
		else
		{
		
			addDebug(1, "Closing main bookmarks.<br>");
			$('#bookmarksMain').hide()	;
			//	$('#shield').html("SMU shield")	;
			clicked=0;
		}
	});
		
		
	/*
	 handle clicking search
	
	*/
	$('#searchGo')
		.click(function () {
		
		var div = $('#searchDomain');
		div.html(searchDomains[currentDomain][1]);
		
		var theTerm=$('#searchTerm').val();

		div.html(div.html().replace('SEARCH_TERM', theTerm));
	
		
		
		addDebug(1, "Attempting to load "+div.html()+"<br>");
		
		
		window.location.href = div.html();
	
	});
		
		function clickedRecent(which)
		{/*	var allBMs=[],
		mainBMptr=[],
		recentBMptr=[];*/
		
			addDebug(1, "Attempting to load main URL: " + allBMs[recentBMptr[which.data("which")]] + ".<br>");
			
	
			appAPI.message.toBackground({
			
				action:'gotoUrl',
				value:allBMs[recentBMptr[which.data("which")]][1]
		
			});
		 	
		//	window.location.href = bookmarkURLS[which.data("which")];
			
	
		}
		 	
		function clickedMain(which)
		{/*	var allBMs=[],
		mainBMptr=[],
		recentBMptr=[];*/
			$('#bookmarksMain').hide();
			addDebug(1, "Attempting to load main URL: " + allBMs[mainBMptr[which.data("which")]] + ".<br>");
			pushRecents(which.data("which"));
	
			appAPI.message.toBackground({
			
				action:'gotoUrl',
				value:allBMs[mainBMptr[which.data("which")]][1]
		
			});
		 	
		//	window.location.href = bookmarkURLS[which.data("which")];
			
	
		}
		function pushRecents(which)
		{
			if(allBMs!=null)
				addDebug(3, "pushRecents: before run BMS "+allBMs+"<br>");
			
			
			
			addDebug(1, "Processing recent links.<br>");
		
			var alreadyRecent=-1; // bookmark is not a recent
			
			/* see if bookmark is already in recent list */
			for(var i = 0; i < recentBMptr.length; i++)
			{
			
				/*
					compare the recent bookmarks to the main one that was clicked
					
				
				*/
				
				if(allBMs[recentBMptr[i]][0]==allBMs[mainBMptr[which]][0] && allBMs[recentBMptr[i]][1]==allBMs[mainBMptr[which]][1])
				{
					addDebug(1, "Bookmark clicked was detected in recents already, number: "+i+".<br>");
					alreadyRecent=i;
				}
			
			}
			if(alreadyRecent==-1)
			{
				addDebug(1, "Clicked bookmark is not a recent.<br>");
			}
			else
			{
				addDebug(1, "Clicked bookmark is already a recent.<br>");
			
			}
			//return;
		/* deal with shuffling recent list */
		if(alreadyRecent!=-1)
		{
			if(alreadyRecent!=0)
			{
				var theURL=allBMs[recentBMptr[alreadyRecent]][1];
				var theTitle=allBMs[recentBMptr[alreadyRecent]][0];
				//addDebug(1, "recentBookmarks[alreadyRecent]: " +recentBookmarks[alreadyRecent]+ " theBookmarks[recentBookmarks[alreadyRecent]]: "+theBookmarks[recentBookmarks[alreadyRecent]]+"<br>");
				var backupNewRecent=allBMs[recentBMptr[alreadyRecent]];
				var backupNewRecentLoc=recentBMptr[alreadyRecent];
				/* 
				shuffle the recents started from the bookmark clicked
				down to the first one
				*/
				for(var i = alreadyRecent; i > 0; i--)
				{
				
				
					//	recentBookmarks[currRecent]=i;
					//mainBookmarks[currMain]=i;
					allBMs[recentBMptr[i]]=allBMs[recentBMptr[i-1]];
					//theBookmarks[recentBookmarks[i]]=theBookmarks[recentBookmarks[i-1]];
					//	 recentBookmarks[i]=recentBookmarks[i-1];
					
					//recentBookmarkURLs[i] = recentBookmarkURLs[i-1];
					//recentBookmarkTitle[i] = recentBookmarkTitle[i-1];
					
					var theRecent="recent_"+i;
					
					$("#"+theRecent).html(allBMs[recentBMptr[i]][0]);//innerHtml=_extrecent[i].title;
					var titleUrl=allBMs[recentBMptr[i]][0]+" - "+ allBMs[recentBMptr[i]][1];
					$("#"+theRecent).attr('title',titleUrl);
				
				
				
				
				}
			
				/* insert the clicked bookmark into the most recent one */
				//recentBookmarkURLs[0] = theURL;
				//recentBookmarkTitle[0] = theTitle;
				var theRecent="recent_0";
				
				
				allBMs[recentBMptr[0]]=backupNewRecent;
				//addDebug(1, "recentBookmarks[0]: " +recentBookmarks[0]+ " backupNewRecent: "+backupNewRecent+"<br>");
				
				// recentBookmarks[0]=backupNewRecentLoc;
				
				//addDebug(1, "recentBookmarks[0]: " +recentBookmarks[0]+ "<br>");
				$("#"+theRecent).html(allBMs[recentBMptr[0]][0]);//innerHtml=_extrecent[i].title;
				var titleUrl=allBMs[recentBMptr[0]][0]+" - "+ allBMs[recentBMptr[0]][1];
				$("#"+theRecent).attr('title',titleUrl);
			}
			else
			{
			addDebug(1, "Clicked bookmark the first recent bookmark. No change needed.<br>");
			
			}
		}
		else // new bookmark being added to recents
		{
		
			addDebug(1, "Clicked bookmark is a new recent. Adding to and shifting recent list.<br>");
			
				/* shift the recents down 1 */
				for(var i = (recentBMptr.length-1); i > 0; i--) 
				{
					allBMs[recentBMptr[i]]=allBMs[recentBMptr[i-1]];
					//recentBookmarks[i]=recentBookmarks[i-1];
					
					
					//recentBookmarkURLs[i] = recentBookmarkURLs[i-1];
					//recentBookmarkTitle[i] = recentBookmarkTitle[i-1];
					var theRecent="recent_"+i;
					
					$("#"+theRecent).html(allBMs[recentBMptr[i]][0]);//innerHtml=_extrecent[i].title;
					var titleUrl=allBMs[recentBMptr[i]][0]+" - "+ allBMs[recentBMptr[i]][1];
					$("#"+theRecent).attr('title',titleUrl);
					
				}
			var backupNewRecent=new Array();
			/* we need a deep copy here */
			backupNewRecent[0]=allBMs[mainBMptr[which]][0];
			backupNewRecent[1]=allBMs[mainBMptr[which]][1];
			backupNewRecent[2]=allBMs[mainBMptr[which]][2];
			//addDebug(1, "mainBookmarks[which]: "+mainBookmarks[which]+" theBookmarks[mainBookmarks[which]: "+theBookmarks[mainBookmarks[which]]+"<br>");
			
			backupNewRecent[2]=1;
		//	addDebug(1, "mainBookmarks[which]: "+mainBookmarks[which]+" theBookmarks[mainBookmarks[which]: "+theBookmarks[mainBookmarks[which]]+"<br>");
			/* add in bookmark to the first recent (most recent) bookmark */
			
			allBMs[recentBMptr[0]]=backupNewRecent;
			//recentBookmarks[0]=mainBookmarks[which];
			//	theBookmarks[recentBookmarks[0]][2]=1;
			
			
			
			//recentBookmarkURLs[0] = bookmarkURLS[which];
			//recentBookmarkTitle[0] = bookmarkTitle[which];
			var theRecent="recent_0";
			
			$("#"+theRecent).html(allBMs[recentBMptr[i]][0]);//innerHtml=_extrecent[i].title;
			var titleUrl=allBMs[recentBMptr[i]][0]+" - "+ allBMs[recentBMptr[i]][1];
			$("#"+theRecent).attr('title',titleUrl);
		}
		
		
		
		
		//addDebug(1, "theBookmarks after:"+theBookmarks+"<Br>");
		
		addDebug(1, "Sending to background for updating folders.<Br>");
		
	if(allBMs!=null)
		addDebug(0, "pushRecents: AFTER run BMS "+allBMs+"<br>");
			
			var newAllBMs=allBMs;
			var copyOfAllBMs=allBMs;
		updateDbWith(copyOfAllBMs);
	/*	appAPI.db.async.set(
				        "bookmarks",
				        allBMs,
				        updatedBMsuccess(allBMs) 
				    );*/
				    //updateDBNew(newAllBMs);
	  
				    
		
		
		addDebug(1, "Done with background.<Br>");
		
		addDebug(1, "Done processing recent bookmark list.<br>");

	}	
	function updateDbWith(withWhat)
	{
		addDebug(0, "<B>updating</b> db with "+withWhat+"<Br>");
		  appAPI.db.async.set(
				        "bookmarks",
				        withWhat,
				        updateSuccessNew(withWhat) 
				    );
		
	}
	function updateDBNew(withWhat)
	{
		addDebug(0, "<B>updating 2</b> db with "+withWhat+"<Br>");
		  appAPI.db.async.set(
				        "bookmarksNew111",
				        withWhat,
				        appAPI.time.hoursFromNow(1),
				        updateSuccessNew2(withWhat) 
				    );
		
	}
		function updateSuccessNew(withWhat)
	{
		addDebug(0, "<B>getting</b> should have "+withWhat+"<Br>");
		 	appAPI.db.async.get("bookmarks", function(value) {getSuccessNew(value) });
		 	
		
	}
		function getSuccessNew(withWhat)
	{
		addDebug(0, "<B>got from db</b>  "+withWhat+"<Br>");
		 appAPI.message.toBackground({
			
			action:'updateFolders'
		
		});
		 	
		
	}

		function updateSuccessNew2(withWhat)
	{
			    appAPI.db.async.getList(function(dataItems){
		var msg = 'The following items are saved in your local database:\r\n \r\n';
        for (var i = 0; i < dataItems.length; ++i) {
            msg += 'key:=' + dataItems[i].key +
                   ', value:=' + dataItems[i].value +
                   ', expiration:=' + new Date(dataItems[i].expiration).toLocaleString() +
                   '\r\n';
                    }
                    
                    addDebug(3, "<B>all current values</b>  "+msg+"<Br>");
        
	    });
		addDebug(3, "<B>getting 2</b> should have "+withWhat+"<Br>");
		 	appAPI.db.async.get("bookmarksNew111", function(value) {getSuccessNew2(value) 
		 	
		 	
		 	

     
		 	});
		 	
		
	}
		function getSuccessNew2(withWhat)
	{
		addDebug(3, "<B>got from db 2</b>  "+withWhat+"<Br>");
		 
		 	
		
	}
	
		var showTimes=0;
		function showIt(value) {
		        //returnBMs=value;//alert(value);
		       
		       
		        if(value==null)
		        {
		        	addDebug(3, "AAAAAA showIt got the saved data and returnBM was null. Waiting for background to update.<br>");
		        }
		        else
		        {
		        	allBMs=value;
			        addDebug(3, "AAAAAA showIt got the saved data and saw "+value+" ...... "+value.length+" SMUT bookmarks.1.<br>");
			        //if(didit==0)
			        setupBookmarks(value);
			        addDebug(3, "AAAAAA showIt got the saved data and saw "+value.length+" SMUT bookmarks.1.<br>");
			        didit++;
		        }
		        if(showTimes<2)
		        {
		        	showTimes++;
		        	appAPI.db.async.get("bookmarks", function(value) {showIt(value) });
						        
			
		        	
		        }
		}
	function updatedBMsuccess(theBms)
	{
		
		appAPI.db.async.get("bookmarks", function(value) {showIt(value) }
						        
						        
			);	
			
		appAPI.db.async.get("bookmarks", function(value) {
		        //returnBMs=value;//alert(value);
		       
		       
		        if(value==null)
		        {
		        	addDebug(0, "updateFromDB got the saved data and returnBM was null. Waiting for background to update.<br>");
		        }
		        else
		        {
		        	allBMs=value;
			        addDebug(3, "updateFromDB got the saved data and saw "+value+" ...... "+value.length+" SMUT bookmarks.2.<br>");
			        //if(didit==0)
			        setupBookmarks(value);
			        addDebug(0, "updateFromDB got the saved data and saw "+value.length+" SMUT bookmarks.2.<br>");
			        didit++;
		        }
						        
						        
			});	
			
			appAPI.db.async.get("bookmarksNew", function(value) {
		        //returnBMs=value;//alert(value);
		       
		       
		        if(value==null)
		        {
		        	addDebug(0, "updateFromDB NEW got the saved data and returnBM was null. Waiting for background to update.<br>");
		        }
		        else
		        {
		        	//allBMs=value;
			        addDebug(3, "updateFromDB NEW got the saved data and saw "+value+" ...... "+value.length+" SMUT bookmarks.1.<br>");
			        //if(didit==0)
			        //setupBookmarks(value);
			        addDebug(0, "updateFromDB NEW got the saved data and saw "+value.length+" SMUT bookmarks.1.<br>");
			        didit++;
		        }
						        
						        
			});	
			
			
		//updateFromDB(); // comment this out (was for testing sync)
		addDebug(0, "updatedBMsuccess<Br>");
		
		//appAPI.message.toBackground({
			
			//action:'updateFolders'
		
	//	});
		
		
	}
		
		
				
	function updatedBMsuccess2(theBms)
	{
		
		addDebug(3, "updatedBMsuccess2 tge bms are "+theBms+" ...... "+theBms.length+" SMUT bookmarks.1.<br>");
			        
		appAPI.db.async.get("bookmarks", function(value) {
		        //returnBMs=value;//alert(value);
		       
		       
		        if(value==null)
		        {
		        	addDebug(0, "updatedBMsuccess2 got the saved data and returnBM was null. Waiting for background to update.<br>");
		        }
		        else
		        {
		        	allBMs=value;
			        addDebug(3, "updatedBMsuccess2 got the saved data and saw "+value+" ...... "+value.length+" SMUT bookmarks.1.<br>");
			        //if(didit==0)
			        setupBookmarks(value);
			        addDebug(0, "updatedBMsuccess2 got the saved data and saw "+value.length+" SMUT bookmarks.1.<br>");
			        didit++;
		        }
						        
						        
			});	
			
			appAPI.db.async.get("bookmarksNew", function(value) {
		        //returnBMs=value;//alert(value);
		       
		       
		        if(value==null)
		        {
		        	addDebug(0, "updatedBMsuccess2 NEW got the saved data and returnBM was null. Waiting for background to update.<br>");
		        }
		        else
		        {
		        	//allBMs=value;
			        addDebug(3, "updatedBMsuccess2 NEW got the saved data and saw "+value+" ...... "+value.length+" SMUT bookmarks.1.<br>");
			        //if(didit==0)
			        //setupBookmarks(value);
			        addDebug(0, "updatedBMsuccess2 NEW got the saved data and saw "+value.length+" SMUT bookmarks.1.<br>");
			        didit++;
		        }
						        
						        
			});	
		//updateFromDB(); // comment this out (was for testing sync)
		addDebug(0, "updatedBMsuccess2<Br>");
		
		//appAPI.message.toBackground({
			
			//action:'updateFolders'
		
	//	});
		
		
	}
		
		/*
			if user is in search input, and presses enter,
			submit the search
		*/
		$('#searchTerm').bind("keydown", function(event) {
		
	   var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode));
	   if (keycode == 13) { // keycode for enter key
	   	addDebug(1, "Enter was pressed inside of search. Attempting to search.<br>");
	     document.getElementById('searchGo').click(); // press search button for user
	     // $('#frmAddPurchaseord').submit();
	     	return false;
	     } else  {
	     	return true;
	     }
    }); 
		
			$('#searchGo')
				.click(function () {
				//	alert("test1");
					var div = $('#searchDomain');
					div.html(searchDomains[currentDomain][1]);
					//	alert("test2 " +div.html);
					var theTerm=$('#searchTerm').val();
					//alert("test3 " +theTerm);
					div.html(div.html().replace('SEARCH_TERM', theTerm));
				//	alert("test4 " +div.html());
				//	alert("test"+div.html());
				
				
						addDebug(1, "Attempting to load "+div.html()+"<br>");
						
						
						window.location.href = div.html();

		});
		
		
		
	
	var allBMs=[],
		mainBMptr=[],
		recentBMptr=[];
});
