const electron = require('electron');
const path = require('path');
const fs = require('fs');

class Storage {
	constructor(options) {
		//get path through appdata to get to storage folder for our app. Main uses electron.app and renderer uses
		//	electron.remote.app to get the path
		const userDataPath = (electron.app || electron.remote.app).getPath('userData');
		
		//path to storage folder
		this.path = path.join(userDataPath, options.configName + '.json');
		this.data = parseDataFile(this.path, options.defaults);
	}
	
	//get a data object
	get(key) {
		return this.data[key];
	}
	
	//set a key
	set(key, value) {
		this.data[key] = value;
		//this needs to be sync
		fs.writeFileSync(this.path, JSON.stringify(this.data));
	}
}

function parseDataFile(filePath, defaults) {
	// We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
	// `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
	try {
		return JSON.parse(fs.readFileSync(filePath));
	} catch(error) {
		// if there was some kind of error, return the passed in defaults instead.
		return defaults;
	}
}

// expose the class
module.exports = Storage;