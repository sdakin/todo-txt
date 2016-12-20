define(["jquery"], function($) {

	function Preferences() {
	}

	function getPrefsPath() {
		var path = require("path");
		var prefsPath = path.join(process.cwd(), "prefs.json");
		return prefsPath;
	}

	Preferences.prototype.load = function() {
		var prefsPath = getPrefsPath(), prefsStr;
		try {
			var fs = require("fs");
			prefsStr = fs.readFileSync(prefsPath, {encoding:"utf8"});
		} catch (e) {
			console.log(e);
		}
		if (prefsStr) {
			var prefs = JSON.parse(prefsStr);
			$.extend(this, prefs);
		}
		return true;
	};

	Preferences.prototype.save = function() {
		var fs = require("fs"), prefsPath = getPrefsPath();
		fs.writeFileSync(prefsPath, JSON.stringify(this), {encoding:"utf8"});
	};

	return Preferences;
});
