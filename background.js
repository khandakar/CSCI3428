/************************************************************************************
  This is your background code.
  For more information please visit our wiki site:
  http://docs.crossrider.com/#!/guide/scopes_background
*************************************************************************************/
//alert("background good to go");
     
      var newBookmarksCount=0;
 var        _bookmarks=[],
        _folders=[];  
appAPI.ready(function($) { 
         
/*
        
 appAPI.bookmarks.getDefaultFolder(function(node) {
        alert('Default folder name: ' + node.title);
    });
     appAPI.bookmarks.getToolbarFolder(function(node) {
        alert('Toolbar folder name: ' + node.title);
    });*/
    /*
     // Store the bookmark objects for later use
    var _nodes = [];

    // Add a bookmark to the default folder
    appAPI.bookmarks.getDefaultFolder(function(node) {
        appAPI.bookmarks.create({
            title: 'NEWEST',
            url: 'http://facebook.com',
            parentFolder: node}, function(bookmark) {
            _nodes.push(bookmark);
        });
    });
    */
    
console.log("background loaded"); 
  // Place your code here (ideal for handling browser button, global timers, etc.)

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
    
        setInterval(function(){
        //        alert("timer fired");
                console.log("timer executed");
        //        alert("timer test 1 (should see 2 next)");
      // method to be executed;
      var oldBookmarks=appAPI.db.get('theBookmarks');
       
      var newBookmarks=[]; 
      var newBookmarksCount=0;

        //        alert("timer test 2 (should see 3 next)");

//alert("timer fired");

//alert("ABOUT TO CHECK tree ..."+newBookmarks+" OKAY "+window.newBookmarksCount);
            appAPI.bookmarks.getTree(function(nodes) {
                            var newBookmarks=[];
                            var newBookmarksCount=0;
                var result = searchRecursive(nodes[0]),
                    message = 'Number of nodes: ' + result.length + '\nDetails::';
            //        alert("i is " +result.length);
                for (var i=0; i < result.length; i++) {
                    message += '\n    Title: ' +
                (result[i].title ? result[i].title : '<RootFolder>') +
                (result[i].isFolder ? ' (folder)' : '');// + 'parent folder: '+result[i].parentFolderName;
                
              
              if(result[i].parentFolderName == "SMUT")
                {
                //        alert(result[i].title + " is a recent");
                        newBookmarks[newBookmarksCount]=new Array();
                        newBookmarks[newBookmarksCount][0]=result[i].title;
                        newBookmarks[newBookmarksCount][1]=result[i].url;
                        newBookmarks[newBookmarksCount][2]=0;
                        newBookmarksCount++;
                //        alert("found smut");
                        //recent.push(result[i]);
                }
                if(result[i].parentFolderName == "Recent")
                {
                        //alert(result[i].title + " is a recent");
                        newBookmarks[newBookmarksCount]=new Array();
                        newBookmarks[newBookmarksCount][0]=result[i].title;
                        newBookmarks[newBookmarksCount][1]=result[i].url;
                        newBookmarks[newBookmarksCount][2]=1;
                        newBookmarksCount++;
                 
                        //recent.push(result[i]);
                }
                }
                //        alert("tree checked FIRST ROUND..."+newBookmarks+" OKAY "+window.newBookmarksCount);
                checkNewBM(newBookmarks);
        //alert(message);
       // alert("doink");
       // return 1;
    
    
            //alert("tree checkeddd"+newBookmarks);
            });
            //alert("tree checked"+newBookmarks+" ciut "+newBookmarksCount);
              if(newBookmarksCount==0)
              {
                      newBookmarks[newBookmarksCount]=new Array();
            newBookmarks[newBookmarksCount][0]="SMU Home";
            newBookmarks[newBookmarksCount][1]="http://smu.ca";
            newBookmarks[newBookmarksCount][2]=0;
            newBookmarksCount++;
                      
 //createDefaults();
                      
                      
                      
                      
              }
      //        alert(oldBookmarks);
      //        alert(newBookmarks);
      
              //if(oldBookmarks != newBookmarks)
      //        if($(oldBookmarks).not(newBookmarks).length == 0 && $(newBookmarks).not(oldBookmarks).length == 0)
    //          {        //alert("difference found");
     //                 appAPI.db.set('theBookmarks', newBookmarks);
      //                appAPI.message.toActiveTab({action: "setBookMarks", type: "setBookMarks", Name: "lol", URL: "lol"});
      //        }
              
    },5000); // every 5 seconds
        function getAllBookmarks()
        {        //alert("inside getAllBookmarks()");
                
                        appAPI.bookmarks.getTree(function(nodes) {
                var result = searchRecursive(nodes[0]),
                    message = 'Number of nodes: ' + result.length + '\nDetails::';
                for (var i=0; i < result.length; i++) {
                    message += '\n    Title: ' +
                (result[i].title ? result[i].title : '<RootFolder>') +
                (result[i].isFolder ? ' (folder)' : '');// + 'parent folder: '+result[i].parentFolderName;
                
              /*  if(result[i].parentFolderName == "SMUT")
                {
                //        alert(result[i].title + " is a recent");
                        newBookmarks[newBookmarksCount]=new Array();
                        newBookmarks[newBookmarksCount][0]=result[i].title;
                        newBookmarks[newBookmarksCount][1]=result[i].url;
                        newBookmarks[newBookmarksCount][2]=0;
                        newBookmarksCount++;
                
                        //recent.push(result[i]);
                }
                if(result[i].parentFolderName == "Recent")
                {
                //        alert(result[i].title + " is a recent");
                        newBookmarks[newBookmarksCount]=new Array();
                        newBookmarks[newBookmarksCount][0]=result[i].title;
                        newBookmarks[newBookmarksCount][1]=result[i].url;
                        newBookmarks[newBookmarksCount][2]=1;
                        newBookmarksCount++;
                
                        //recent.push(result[i]);
                }*/
                }
        //alert(message);
       // alert("doink");
        return 1;
            });
        //        alert("end of getAllBookmarks()");
        }
function checkNewBM(newBms)
    {//alert("in checkNewBM");
            var oldBookmarks=appAPI.db.get('theBookmarks');
    //        alert("dd");
            if(newBms.length==0)
            {
                            alert("new bms length 0");
                    createDefaults(); //uncomment this
                    //alert("new bms length 0");
                    
            }
            else
            {
    //        alert("old bookmark:"+oldBookmarks);
    //        alert("new bookmark:"+newBms);
            var difference=0;
            if(oldBookmarks != null)
            {
            for(var i=0; i<oldBookmarks.length; i++)
            {        //alert("i is"+i);
                    for(var x=0; x<newBms.length; x++)
                    {
                    //        alert("x is"+x);
                                    if(oldBookmarks[i][0]!=newBms[x][0] 
                                            || oldBookmarks[i][1]!=newBms[x][1]
                                            || oldBookmarks[i][2]!=newBms[x][2])
                                            { 
                                                    difference=1;
                                                    
                                            }
                                    
                    }        
                    
            }
                    if(oldBookmarks.length!=newBms.length)
            {
                    difference=1;
            }
            
            }
            else
            {
                    difference=1;
            }
    //        alert("heyo");
    //        alert("heyoa");
            //        if($(oldBookmarks).not(newBms).length == 0 && $(newBms).not(oldBookmarks).length == 0)
            if(difference==1)
              {        
              //        alert("difference found");
                      appAPI.db.set('theBookmarks', newBms);
                      appAPI.message.toActiveTab({action: "setBookMarks", type: "setBookMarks", Name: "lol", URL: "lol"});
              }
              else
              {
              //        alert("no difference");
              }
    }
    
    }
    var countCreates=0;
    
            function createDefaults(){
                    if(countCreates==0)
                    {countCreates++;
                var defaultBookmarks=[];
                
                var defaultRecentUrls=new Array([]);

                defaultRecentUrls[0]=new Array();
                defaultRecentUrls[0][0]="Smu Home";
                defaultRecentUrls[0][1]="http://smu.ca";
                defaultRecentUrls[1]=new Array();
                defaultRecentUrls[1][0]="Smu Student";
                defaultRecentUrls[1][1]="http://www.smu.ca/currentstudents/";
                defaultRecentUrls[2]=new Array();
                defaultRecentUrls[2][0]="Academic Programs";
                defaultRecentUrls[2][1]="http://www.smu.ca/academic.html";
                defaultRecentUrls[3]=new Array();
                defaultRecentUrls[3][0]="Smu Banner";
                defaultRecentUrls[3][1]="https://ssb-nlive.smu.ca/pls/sNLIVE/twbkwbis.P_GenMenu?name=homepage";


                defaultBookmarks=new Array([]);
                defaultBookmarks[0][0]="Smu Home";
                defaultBookmarks[0][1]="http://smu.ca"; 
                defaultBookmarks[1]=new Array();
                defaultBookmarks[1][0]="Smu Student";
                defaultBookmarks[1][1]="http://www.smu.ca/currentstudents/";
                
                defaultBookmarks[2]=new Array();
                defaultBookmarks[2][0]="Academic Programs";
                defaultBookmarks[2][1]="http://www.smu.ca/academic.html";
                
                defaultBookmarks[3]=new Array();
                defaultBookmarks[3][0]="Smu Banner";
                defaultBookmarks[3][1]="https://ssb-nlive.smu.ca/pls/sNLIVE/twbkwbis.P_GenMenu?name=homepage";
                 
                defaultBookmarks[4]=new Array();
                defaultBookmarks[4][0]="Smu Port";
                defaultBookmarks[4][1]="http://smuport.smu.ca/cp/home/loginf";
                
                defaultBookmarks[5]=new Array();
                defaultBookmarks[5][0]="Site Map";
                defaultBookmarks[5][1]="http://www.smu.ca/sitemap.html";
                
                defaultBookmarks[6]=new Array();
                defaultBookmarks[6][0]="Contact";
                defaultBookmarks[6][1]="http://www.smu.ca/contact-01.html";

                var bookmarkLength=defaultBookmarks.length;
                
                var bookmarkLengthRecent=defaultRecentUrls.length;
        //        alert("entered create defaults");
                                     appAPI.bookmarks.getToolbarFolder(function(node) {
//        alert("got it");
                                        appAPI.bookmarks.createFolder({
                                                title: 'SMUT',
                                                parentFolder: node}, function(node) { 
                                                //        alert("folder created");
                                                _folders.push(node);
                                                for(var i = 0; i < bookmarkLength; i++)
                                                {
                                                // Add bookmarks to the folder
                                                        appAPI.bookmarks.create({
                                                                title: defaultBookmarks[i][0],
                                                                url: defaultBookmarks[i][1],
                                                                parentFolder: node}, function(node) {
                                                                _bookmarks.push(node);
                                                        });
                                                }
                                                
                                                        appAPI.bookmarks.createFolder({
                                                                title: 'Recent',
                                                                parentFolder: node}, function(node) { 
                                                                        //alert("folder created");
                                                                _folders.push(node);
                                                                for(var i = 0; i < bookmarkLengthRecent; i++)
                                                                {
                                                                // Add bookmarks to the folder
                                                                        appAPI.bookmarks.create({
                                                                                title: defaultRecentUrls[i][0],
                                                                                url: defaultRecentUrls[i][1],
                                                                                parentFolder: node}, function(node) {
                                                                                _bookmarks.push(node);
                                                                        });
                                                                }
                                                                
                                                
                                                        });
                                                
                                                });
                                                getNewBmsandCompare();
                                });

                //alert("exited create defaults");
        }
        else
        {
                alert("tried to create defaults multiple times..ouch");
        }
            }
            
            
        function getNewBmsandCompare()
        {
        appAPI.bookmarks.getTree(function(nodes) {
                            var newBookmarks=[];
                            var newBookmarksCount=0;
                var result = searchRecursive(nodes[0]),
                    message = 'Number of nodes: ' + result.length + '\nDetails::';
            //        alert("i is " +result.length);
                for (var i=0; i < result.length; i++) {
                    message += '\n    Title: ' +
                (result[i].title ? result[i].title : '<RootFolder>') +
                (result[i].isFolder ? ' (folder)' : '');// + 'parent folder: '+result[i].parentFolderName;
                
              
              if(result[i].parentFolderName == "SMUT")
                {
                //        alert(result[i].title + " is a recent");
                        newBookmarks[newBookmarksCount]=new Array();
                        newBookmarks[newBookmarksCount][0]=result[i].title;
                        newBookmarks[newBookmarksCount][1]=result[i].url;
                        newBookmarks[newBookmarksCount][2]=0;
                        newBookmarksCount++;
                        //alert("found smut");
                        //recent.push(result[i]);
                }
                if(result[i].parentFolderName == "Recent")
                {
                        //alert(result[i].title + " is a recent");
                        newBookmarks[newBookmarksCount]=new Array();
                        newBookmarks[newBookmarksCount][0]=result[i].title;
                        newBookmarks[newBookmarksCount][1]=result[i].url;
                        newBookmarks[newBookmarksCount][2]=1;
                        newBookmarksCount++;
                
                        //recent.push(result[i]);
                }
                }
                
                checkNewBM(newBookmarks);
        //alert(message);
       // alert("doink");
       // return 1;
    
            //alert("tree checked AND NEWEST IS..."+newBookmarks+" OKAY "+window.newBookmarksCount);
            //alert("tree checkeddd"+newBookmarks);
            });
}
        
        
});



    
