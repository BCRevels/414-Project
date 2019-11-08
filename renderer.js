// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { exec } = require('child_process');
const Storage = require('./storage.js');


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

function youtubeDlDownload() {
	var url = document.getElementById('videoInput').value;
	
	exec('python ./youtube-dl --no-playlist ' + url, (error, stdout, stderr) => {
	if (error) {
		alert(`exec error: ${error}`);
		return;
	}
	
	//save to history in long-term storage
	let his = storage.get('history');				//get history array from storage file
	his.push(url);								//push the url on the history array
	storage.set('history', his);
	
	alert(`stdout: ${stdout}`);
	alert(`stderr: ${stderr}`);
	});
}