define(["lib/Preferences"], function(Preferences) {

	function AppPrefs() {
		Preferences.call(this);
	}

	AppPrefs.prototype = new Preferences();
	AppPrefs.prototype.constructor = AppPrefs;

	return AppPrefs;
});
