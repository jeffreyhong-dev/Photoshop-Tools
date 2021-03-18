/* ========================================================== 
// Jeffrey Hong
// ======================================================= */
// This script is supplied as is. It is provided as freeware.   
// The author accepts no liability for any problems arising from its use.  
// enable double-clicking from Mac Finder or Windows Explorer  
//  ctrl + command + s
/*
<javascriptresource>
<name>Save Next Iteration</name>
<about>
This script will save another copy of the active doc in a folder that is in the same directory as the active photoshop doc.
It will also save the current active photoshop doc.
</about>
<category>CustomTools</category>
<enableinfo>true</enableinfo>
</javascriptresource>
*/

#target photoshop // this command only works in Photoshop CS2 and higher  
// bring application forward for double-click events  
app.bringToFront();

//  Dynamic variables
var padding = 2;                                  //  Number of digits in the iteration.
var splitText = "-";
var debug = false;


//  Document caches
var doc = app.activeDocument;                           //  Active document.
var docName = doc.name;                                 //  Document filename.

//  Active doc variables
var basename = docName.match(/(.*)\.[^\.]+$/)[1];;       //  basename of active doc.
var docPath = doc.path;	                                 // Path for next iteration file

//  Global variables
var allFiles = new Array;

//  Save destination caches
var dstFolders = ["_old", "_versions", "_version"];
var dstPath;

// Psd save options.
psdSaveOptions = new PhotoshopSaveOptions();
psdSaveOptions.alphaChannels = false;
psdSaveOptions.embedColorProfile = false;
psdSaveOptions.layers = true;
psdSaveOptions.spotColors = false;



var DebugLogger = function (debugHeader) {
    this.debugLog = debugHeader + "\n";
    this.logCount = 0;

    this.AddLog = function (log) {
        this.debugLog += log + "\n";
        this.logCount += 1;
    }

    this.PrintLog = function () {
        if (this.logCount > 0)
            alert(this.debugLog)
    }
}



function Main()
{
    // Check there is an open document, otherwise quit
    if (app.documents.length == 0) { alert("No active document."); return 1; }

    docName = docName.replace(/ /g, '_');
    basename = docName.match(/(.*)\.[^\.]+$/)[1];;
    
    //  Initialize debugger
    debugLog = new DebugLogger("Debug Logger:")
    //  -- Add to DebugLogger
    debugLog.AddLog("document name: " + docName);
    debugLog.AddLog("basename: " + basename);

    //  Get the save destination.
    dstPath = GetIterationSavePath(docPath, dstFolders)
    //  -- Add to DebugLogger
    debugLog.AddLog("save destination: " + dstPath);

    //  Get all files.
    allFiles = GetAllFiles(dstPath);

    //  Get the highest iteration in the save directory.
    var highestIteration = GetHighestIteration(basename, allFiles)
    var iteration = Number(highestIteration) + 1;
    iteration = ZeroSuppress(iteration, padding);
    //  -- Add to DebugLogger
    debugLog.AddLog("next save iteration: " + iteration);

    //  Set new name for the saved iteration file.

    //  Save new iteration in the save directory.
    var saveFile = new File(dstPath + '/' + basename + splitText + iteration + ".psd")
    doc.saveAs(saveFile, psdSaveOptions, true, Extension.LOWERCASE);
    //  Save the current active doc.
    doc.save();
    

    //  Print Debug Log
    if (debug) debugLog.PrintLog();

    alert("File Saved\nNew iteration named: \n" + basename + splitText + iteration + ".psd\n" + "has been saved.");
}


//  Get the destination folder for the save iterations.
function GetIterationSavePath(docPath, dstFolders)
{
    //  Check given save folder names exists in active doc directory.
    for (var i = 0; i < dstFolders.length; i++) {
        var savePath = new Folder(docPath + "/" + dstFolders[i]);

        if (savePath.exists){
            return savePath;
        }
        else {
            //  If folder doesn't exist, create a new "_old" folder.
            var newPath = new Folder(savePath);
            if (newPath.create()){
                alert("Creating a new folder")
                return newPath;
            } else {
                alert("Folder doesn't exist:\n The export folder doesn't exist and couldn't be created. Please check you've entered a valid path.");
                return docPath;
            }
        }
    }
}

//
function GetAllFiles(saveDir)
{
    var allFiles = [];
    var files = Folder(saveDir).getFiles("*" + ".psd")

    for (i = 0; i < files.length + 1; i++) 
    {
        if (typeof files[i] != "undefined") {  // Make sure only .psd's are checked.
            if (files[i].name.match(basename + splitText + "[0-9]{1,5}" + ".psd")) {
                //alert("Grabbing Files\n  file name: " + files[i].name);
                allFiles.push(files[i].name)
            }
        }
    }
    return allFiles;
}


//  Find the highest iteration from the contents of the save destination.
function GetHighestIteration(basename, allFiles)
{
    var allIterations = new Array;
    for (var m = 0; m < allFiles.length; m++) {
        if (typeof allFiles[m] != "undefined") {  // Make sure only .psd's are checked.
            if (allFiles[m].match(basename + splitText + "[0-9]{1,5}" + ".psd")) {
                // alert(allFiles[m].name.slice(0, allFiles[m].name.length - 4));
                var thisIteration = Number(allFiles[m].slice(0, allFiles[m].length - 4).match(/\d{1,5}$/));
                allIterations.push(thisIteration);
            }
        }
    }

    var highest = new Array;
    highest = highest.concat(allIterations);
    while (highest.length > 1){
        if (highest[0] >= highest[highest.length - 1]) {
            var a = highest.pop();
        }
        else{
            var a = highest.shift();
        }
    }

    debugLog.AddLog("all iterations count: " + allIterations);
    debugLog.AddLog("highest iteration: " + highest);

    return highest;
}


///////////////////////////////////////////////////////////////////////////////
// Function: ZeroSuppress
// Usage: return a string padded to digit(s)
// Input: num to convert, digit count needed
// Return: string padded to digit length
///////////////////////////////////////////////////////////////////////////////
function ZeroSuppress(num, digit) {
    var tmp = num.toString();
    while (tmp.length < digit) {
        tmp = "0" + tmp;
    }
    return tmp;
}



Main();