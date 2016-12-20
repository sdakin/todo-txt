"use strict";

define(
	["xlib/EventTarget", "bootstrap"],
	function(EventTarget /*, bootstrap */)
{

	function BaseDlg() {
		EventTarget.call(this);
	}

	BaseDlg.prototype = new EventTarget();
	BaseDlg.prototype.constructor = BaseDlg;

	BaseDlg.prototype.hide = function() {
		$("#" + this.dlgID).modal("hide");
	};

	BaseDlg.prototype.show = function() {
		$("#" + this.dlgID).modal("show");
	};

	BaseDlg.prototype.load = function(uiPath, callback) {
		var self = this;
		$("#main-dlg-hook").load(uiPath, function() {
			self.dlg = $("#main-dlg-hook >div.modal");
			self.dlgID = self.dlg.attr("id");
			self.show();
			if (callback)
				callback();
		});
	};

	return BaseDlg;
});
