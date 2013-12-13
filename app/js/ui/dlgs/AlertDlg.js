"use strict";

define(
	["ui/dlgs/BaseDlg"],
	function(BaseDlg)
{

	function AlertDlg(title, message, buttonTitles) {
		var self = this;
		BaseDlg.call(self);
		self.dlg = $("#dlgAlert").clone();
		self.dlg.find(".modal-header h2").text(title);
		self.dlg.find(".modal-body").text(message);
		buttonTitles.forEach(function(btnTitle) {
			var $btn = null;
			if (typeof btnTitle == "string")
				$btn = $('<a class="btn">' + btnTitle + '</a>');
			else {
				$btn = $('<a class="btn">' + btnTitle.title + '</a>');
				btnTitle.classes.forEach(function(className) {
					$btn.addClass(className);
				});
			}
			if ($btn)
				self.dlg.find(".modal-footer").append($btn);
		});
		self.dlg.find(".modal-footer a").click(function(e) {
			if (self.hasListeners())
				self.fire({type:AlertDlg.BUTTON_CLICKED, buttonTitle:$(e.currentTarget).text()});
			else
				self.hide();
		});
	}

	AlertDlg.prototype = new BaseDlg();
	AlertDlg.prototype.constructor = AlertDlg;

	// events fired by this object
	AlertDlg.BUTTON_CLICKED = "ButtonClicked";

	AlertDlg.prototype.hide = function() {
		this.dlg.modal("hide");
	};

	AlertDlg.prototype.show = function() {
		$("#app-alert-hook").empty();
		$("#app-alert-hook").append(this.dlg);
		this.dlg.modal("show");
	};

	return AlertDlg;
});
