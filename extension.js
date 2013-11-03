 
/************************************************************************************
  This is your Page Code. The appAPI.ready() code block will be executed on every page load.
  For more information please visit our docs site: http://docs.crossrider.com
****************** *******************************************************************/

/*
 to do:
 clean up code
 add comments
 add settable variables (more)
 search
 set search domain
 make boomarks clickable
 make recent bookmarks dynamic
 make work in frames

*/

var toolbarColor="#8C2633"; // Colour: Maroon
							// Pantone value: Pantone 202C
var toolbarHeight="24px";   // height of tool bar in pixels
									  
									  
var recentBMColor="#5e99aa"; // Colour: Blue
						     // Pantone value: Pantone 549C
var shieldImage="";
var bookmarkBackground="#D9C89E"; // main bookmarks
						   // shown when shield is clicked
						   // pantone 7501C  sand
			
var mainBMHeight="600px"	;
var mainBMWidth="35%"	;
			
			
			
			
									  
appAPI.ready(function($) {
	var bookmarksSet=0;
	var recentBookmarkURLs=[];
	console.log("extension loaded");
    // Place your code here (you can also define new functions above this scope)
    // The $ object is the extension's jQuery object
  /*
  test button
  	'<span id="bm-main">'+
				
					'<button id="bm-1" title="Add SMU BM" class="left">Ad12d SMU BM</button>' +
			'</span>'+
  
  */
    	// Add a toolbar 
	$('<div id="toolbarContainer">' +
			'<span id="toolbarSpan">' +
				'<span id="smu-shield">'+
					'<button id="shield" title="SHIELD" class="left">SMU shield</button>' +
				'</span>'+
			
					
					'<span id="bm-recent-container">'+
					'</span>'+
			
			
				
			'</span>' +
		'</div>')
		.prependTo('body');
		
			$('<div id="bookmarksMain">' +
			
		'</div>')
		.prependTo('body');
		
		
		/*
		
		what is this?!
	if (appAPI.dom.isIframe())
		$('#xr-crossrider-example #xr-currentTabIframes').hide();
	else
		$('#xr-crossrider-example #xr-currentTabWindow').hide();
		
		*/
	$('#toolbarSpan').css({
		'background-color':toolbarColor,
		height:toolbarHeight,
		margin: 0,
		padding: 0,
		position:'fixed',
		right:0, top:0,
		width:'100%',
		'z-index':'999'
	});
	
	
		$('#bookmarksMain').css({
		'background-color':bookmarkBackground,
		height:mainBMHeight,
		margin: 0,
		padding: 0,
		position:'fixed',
		left:0, top:toolbarHeight,
		width: mainBMWidth,
		'z-index':'999'
	});
	
	
	$('#smu-shield').css({float:'left', 'padding-left':'2px', 'padding-top':'1px'});
	
	
	/*
	cross rider example code no longer used, delete this eventually
	$('#xr-crossrider-example #xr-toolbar').css({float:'right', 'padding-right':'2px', 'padding-top':'1px', 'width':'100%'});
	$('#xr-crossrider-example #xr-tabs').css({'margin-left':'2px', 'margin-right':'2px'});
	$('#xr-crossrider-example #xr-tabs button').css({'margin-left':'0px', 'margin-right':'0px'});
	$('#xr-crossrider-example #xr-currentTabs').css({'margin-left':'2px', 'margin-right':'2px'});
	$('#xr-crossrider-example #xr-currentTabs button').css({'margin-left':'0px', 'margin-right':'0px'});
	$('#xr-crossrider-example #xr-toolbar button').css({
		'background-color':'#111111',
		border:'none',
		'margin-bottom': '2px',
		'margin-top': '2px',
		'padding': '1px 6px'
	});
	$('#xr-crossrider-example #xr-toolbar button.single').css({
		'border-radius':'4px',
		'margin-left':'2px',
		'margin-right':'2px'
	});
	$('#xr-crossrider-example #xr-toolbar button.left').css({
		'border-bottom-left-radius':'4px',
		'border-top-left-radius':'4px',
		'border-right':'1px solid #fff'
	});
	$('#xr-crossrider-example #xr-toolbar button.middle').css({
		'border-left':'1px solid #fff',
		'border-right':'1px solid #fff'
	});
	$('#xr-crossrider-example #xr-toolbar button.right').css({
		'border-bottom-right-radius':'4px',
		'border-top-right-radius':'4px',
		'border-left':'1px solid #fff'
	});
	*/
	
	/*
		holder for recent bookmarks
	*/
   /* $('#bm-recent').css({
		'padding': '15px',
		'background-color':recentBMColor,
		border:'none',
		'margin-bottom': '2px',
		'margin-top': '2px',
		'padding': '1px 6px'
	});*/

    $('#bm-recent-container').css({
		'width':'40%',
		'vertical-align':'middle',
		'margin-left':'50px',
		'margin-right':'50px'
	});

	
	/*
	cross rider sample code
	$('#xr-crossrider-example #xr-toolbar button').hover(function(){
		$(this).css({'background-color':'#fff'});
	}, function() {
		$(this).css({'background-color':'#f0f0f0'});
	});*/

	var clicked=0;
		
		// show and hide bookmarks 
					$('#bookmarksMain').hide()	;
			$('#shield')
		.click(function () {
			if(clicked==0)
			{
					$('#shield').html("SMU SHIELD")	;
					$('#bookmarksMain').show()	;
				clicked=1;
			
			}
			else
			{
					$('#bookmarksMain').hide()	;
							$('#shield').html("SMU shield")	;
				clicked=0;
			}
		});
		
		
		var lid = appAPI.message.addListener(function(msg) {
		switch(msg.action) {
			// Received message to change the background color
			case 'change-color': appAPI.dom.addInlineCSS("body {background-color: " + msg.value + ";}"); break;
			
			
			case 'setBookMarks': setBookMarksForced(); break;
			
			
			// dynamically add bookmarks to toolbar
			case 'updateBM': addBMToToolbar(msg.URL, msg.Name); break;
			
			
			case 'updateRecent': updateRecent(msg.value); break;
			
			
			case 'updateAll': updateAll(msg.value); break;
			case 'updateAllBM': updateAllBM(msg.value,msg.value2); break;
			
			
			// Received message to display an alert
			case 'alert': alert(msg.value); break;
			// Received message to remove listener
			case 'remove': appAPI.message.removeListener(lid); break;
			// Received message with an unknown action
			default: alert('Received message with an unknown action\r\nType:' + msg.type + '\r\nAction:' + msg.action + '\r\nValue:' + msg.value); break;
		}
	});
	function setBookMarksForced()
	{
		bookmarksSet=0;
		setBookMarks();
	} 
	function setBookMarks()
	{//alert("entered set book marks");
		if(bookmarksSet!=1)
		{
		bookmarksSet=1;
		 var theBookmarks = appAPI.db.get('theBookmarks');
		 if(theBookmarks == null)
		 {
		 //	alert("Error: No bookmarks.");
		 		bookmarksSet=0;
		 }
		 else
		 {
		 //	alert("found bookmarks in DB");
			var message="";
			var newBMS="";
			var recentBMS="";
			var currRecent=0;
				deleteRecent();
		insertRecentSpace(4);
			for(var i = 0; i < theBookmarks.length; i++)//; //_extrecent.length; i++)
			{
				var theRecent="recent_"+i;
	
				message+="\n"+"updateing: "+theRecent+" with: "+theBookmarks[i][0];
				
				if(theBookmarks[i][2]==1)
				{
					
					var theRecent="recent_"+currRecent;
		//	alert("updateing: "+theRecent+" with: "+_extrecent[i].title);
		//message+="\n"+"updateing: "+theRecent+" with: "+_extrecent[i].title;
			$("#"+theRecent).html(theBookmarks[i][0]);//innerHtml=_extrecent[i].title;
			recentBookmarkURLs[currRecent]=theBookmarks[i][1];
			currRecent++;
				}
				else
				{
					newBMS+=theBookmarks[i][0]+"<br>";
					
				}
				
			}
			//alert(theBookmarks);
			
		 	$('#bookmarksMain').html(newBMS);
		 	
		 }
		}
		//alert("exited set book marks");
	}
//	alert("bookmarksSet="+bookmarksSet);
	if(bookmarksSet==0)
		{
			setBookMarks();
			
		}
		function deleteRecent()
		{
			$('#bm-recent-container').html("");
			
		}
		function insertRecentSpace(howMany)
		{
			for(var i = 0; i < howMany; i++)
			{
				$(' <span id="recent_'+i+'" data-which="'+i+'" title="recent_'+i+'" class="bm-recent">recent_'+i+'</span> ').css({
		
		'background-color':recentBMColor,
		'padding-left':'4px',
		'padding-right':'4px',
		'margin-left':'5px',
		'margin-right':'5px',
		'-moz-border-radius':'10px 10px 10px 10px', // rounds corners for firefox
'border-radius':'10px 10px 10px 10px', //rounds corners for other browsers
'border':'solid 1px #000'


	})
					.appendTo('#bm-recent-container').on("click", function(){ 
					//	alert("clicked it");
					clickedRecent($(this));
					
					})
					;
				
				
			}
			
		}
		function clickedRecent(which)
		{
			window.location.href = recentBookmarkURLs[which.data("which")];
			//alert("clicked on "+which.data("which"));
		}
		$("#body").css({'margin-top':toolbarHeight}); // this didnt work to lower the page
});
