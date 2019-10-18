// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { exec } = require('child_process');

function youtubeDlDownload() {
	//alert("youtube-dl --no playlist " + document.getElementById('videoInput').value);
	exec('youtube-dl --no-playlist ' + document.getElementById('videoInput').value, (error, stdout, stderr) => {
	if (error) {
		alert(`exec error: ${error}`);
		return;
	}
	alert(`stdout: ${stdout}`);
	alert(`stderr: ${stderr}`);
	});
}
