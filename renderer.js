// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { exec } = require('child_process');

function hiThere() {
	exec('youtube-dl --no-playlist https://www.youtube.com/watch?v=QZeto4CIf84', (error, stdout, stderr) => {
	if (error) {
		alert(`exec error: ${error}`);
		return;
	}
	alert(`stdout: ${stdout}`);
	alert(`stderr: ${stderr}`);
});
}

document.querySelector('#btnEd').addEventListener('click', () => {hiThere() })
