// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var { spawn } = require('child_process');
const Storage = require('./storage.js');
const electron = require('electron').remote;
var child = require('child_process');
const fs = require('fs');

//this is the data file for long-term storage
const storage = new Storage({
	configName: 'youtubedl-gui-local-data'
});

//set text of download directory
document.getElementById('downloadDirectory').value = storage.get('dlDirectory');

async function openDialog() {
	var filePath = await electron.dialog.showOpenDialog({
		properties:['openDirectory'],
		filers:[
			{name:'Log', extensions:['csv', 'log']}
		]
	});
	if(filePath){
		storage.set('dlDirectory', filePath.filePaths[0]);
		document.getElementById('downloadDirectory').value = storage.get('dlDirectory');
	}
}

//lists the history by appending them to a list.
function listHistory() {
	var histList = document.getElementById('history-table');
	histList.style.visibility = 'visible';
	let histContent = storage.get('history');
	
	if(histContent.length > 1) {
		for(var i = 0; i < histContent.length; i++) {
			let row = histList.insertRow(i+1);
			let title = row.insertCell(0);
			let time = row.insertCell(1);
			title.innerHTML = histContent[i].Title;
			time.innerHTML = histContent[i].Time;
		}
	}
	console.log(histContent);
}

function deleteHistory() {
	storage.set('history', new Array());
}

function youtubeDlDownload() {
	//check if download directory exists
	if(!fs.existsSync(storage.get('dlDirectory'))) {
		alert("Download directory does not exist");
		return 0;
	}
	
	//make spinner and loading percentage visible
	document.getElementById('spinner').style.visibility = 'visible';
	document.getElementById('loadingPercent').innerHTML = '0%';
	var newDownload = true;
	
	//get input and build values for sending to 
	var dlRegex = new RegExp('[\\\/\=\:\.]', 'g');
	var url = document.getElementById('videoInput').value;
	var title = url;
	dlPath = storage.get('dlDirectory') + '\\\%(title)s.%(ext)s';
	
	//get video format
	var videoFormat = "";
	var videoFormatSelect = document.getElementById('videoFormat');
	if(videoFormatSelect.value)
		videoFormat = '--recode-video ' + videoFormatSelect.value;
	else
		videoFormat = '--recode-video ' + 'mp4';
	
	//start video download
	var temp = child.spawn('cmd.exe', ['/c', 'runYoutubeDl.bat \"' + dlPath + '\" ' + videoFormat + ' \"' + url + '\"'], {shell: true});
	
	//////child events//////
	
	//this info is good for the loading bar and percent tracker
	temp.stdout.on('data', (data) => {
		console.log("DATA: " + data);
		if(data.toString().match(/\[download\] Destination:/)) {
			title = data.toString().slice(25 + storage.get('dlDirectory').length, data.toString().length-1);
			console.log(title);
		}
		if(data.toString().match(/has already been downloaded/))
			newDownload = false;
			
	    var regex = new RegExp(']\\s+[0-9]+\.?[0-9]+');	//regular expression for getting percentage done
		var dlpercent = data.toString().match(regex);			//get percentage done
		if(dlpercent) {
			dlpercent = dlpercent[dlpercent.length-1];				
			dlpercent = dlpercent.slice(2, dlpercent.length);		
			dlpercent = parseFloat(dlpercent);													//change from string to float
			document.getElementById('loadingBar').style.width = dlpercent + '%';				//update loading bar
			document.getElementById('loadingPercent').innerHTML = dlpercent + '%';
		}
	});
	
	//error message
	temp.stderr.on('data', (data) => {
		console.log(data.toString());
		alert(data.toString());
	});

	//Closes the download
	temp.on('exit', (code) => {
		console.log("Exit Code: " + code);
		document.getElementById('loadingBar').style.width = 0;
		document.getElementById('loadingPercent').innerHTML = "";
		
		if(newDownload){
			if(code == 0) {
				//add to history
				historyObject = {
					Title:title,
					Location:dlPath.slice(0, dlPath.length-13) + title,
					Time:new Date().toLocaleString()
				}
				console.log(historyObject);
				let his = storage.get('history');                			 //get history array from storage file
				his.push(historyObject);                                	 //push the url on the history array
				storage.set('history', his);
				console.log("Finished Downloading");
			}
			else
				alert("An error occurred while downloading the video");
		}
		else
			alert("Video has already been downloaded in this directory");
		document.getElementById('spinner').style.visibility = 'hidden';
	});
}
