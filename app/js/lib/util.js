"use strict";

define(['jquery', 'exports'], function($, exports) {
    // see: http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
    //
    // example: $('#elem').selectRange(3,5);
    $.fn.selectRange = function(start, end) {
        return this.each(function() {
            if (this.setSelectionRange) {
                this.focus();
                this.setSelectionRange(start, end);
            } else if (this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };

    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.substring(0, str.length) == str;
        };
    }

    if (typeof String.prototype.endsWith != 'function') {
        String.prototype.endsWith = function (str){
            return this.slice(-str.length) == str;
        };
    }

	// see: http://stackoverflow.com/questions/5577756/selection-position-of-selected-text-of-div-using-javascript
	exports.getSelectedText = function() {
		if(window.getSelection){ 
			return window.getSelection().toString(); 
		} 
		else if(document.getSelection){ 
			return document.getSelection(); 
		} 
		else if(document.selection){ 
		
			return document.selection.createRange().text; 
		} 
	};
});
