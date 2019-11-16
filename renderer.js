// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var { spawn } = require('child_process');
const Storage = require('./storage.js');
const electron = require('electron').remote;
var child = require('child_process');
const elec = require('electron');

//this is the data file for long-term storage
const storage = new Storage({
	configName: 'youtubedl-gui-local-data'
});

//I tried to get html to display all of the user's current history. I can't manage to get it to work
//	though. Let me know if you figure something out
/*
var histList = document.getElementById('history-table');
let histContent = store.get('history');
if(histContent.length > 1) {
	histContent = histContent.slice(1);
	for(int i = 0; i < histContent.length; i++) {
		let histItem = document.createElement("li");
		histItem.appendChild(document.createTextNode(histContent[i]));
		histList.appendChild(histItem);
	}
}
alert(histContent);
*/

function openDialog() {
	console.log("HI1");
	var filePath = electron.dialog.showOpenDialogSync({
			properties:['openDirectory']
			// filters:[
			// 		{name:'Log', extensions:['csv', 'log']}
			// ]
	});
	console.log("HI");
	console.log(filePath);
	if(filePath){
			electron.app.setPath('videos', filePath[0]);
			document.getElementById('downloadDirectory').value = filePath[0];
	}
}

function youtubeDlDownload() {
	//make spinner and loading percentage visible
	document.getElementById('spinner').style.visibility = 'visible';
	document.getElementById('loadingPercent').innerHTML = '0%';
	
	//get input and build values for sending to 
	var dlRegex = new RegExp('[\\\/\=\:\.]', 'g');
	var url = document.getElementById('videoInput').value;
	dlPath = electron.app.getPath('videos') + '\\\%(title)s.mp4';
	//youtube-dl -o 'C:\Users\User\Downloads\%(title)s.%(ext)s' www.youtube.com/video
	
	//start video download
	var temp = child.spawn('cmd.exe', ['/c', 'runYoutubeDl.bat \"' + dlPath + '\" \"' + url + '\"'], {shell: true});
	
	//////child events//////
	
	//this info is good for the loading bar and percent tracker
	temp.stdout.on('data', (data) => {
		console.log("DATA: " + data);
	    var regex = new RegExp(']\\s+[0-9]+\.?[0-9]+');	//regular expression for getting percentage done
		var dlpercent = data.toString().match(regex);			//get percentage done
		if(dlpercent) {
		dlpercent = dlpercent[dlpercent.length-1];				
		dlpercent = dlpercent.slice(2, dlpercent.length);		
		dlpercent = parseFloat(dlpercent);							//change from string to float
		document.getElementById('loadingBar').style.width = dlpercent + '%';				//update loading bar
		document.getElementById('loadingPercent').innerHTML = dlpercent + '%';
		}
	});
	
	temp.stderr.on('data', (data) => {
		console.log(data.toString());
		document.getElementById('loadingBar').style.width = 0;
		document.getElementById('loadingPercent').value = "";
	});

	temp.on('exit', (code) => {
		document.getElementById('loadingBar').style.width = 0;
		document.getElementById('loadingPercent').innerHTML = "";
		
		//add to history
		let his = storage.get('history');                //get history array from storage file
		his.push(url);                                	 //push the url on the history array
		storage.set('history', his);
		console.log("Finished Downloading");
		document.getElementById('spinner').style.visibility = 'hidden';
	});
}
