"use strict";

requirejs.config({
    "baseUrl": "js",

    // jquery and its plugins are not require modules: this is the way to mimic that.
    // See <https://github.com/requirejs/example-jquery-shim/blob/master/www/js/app.js>
    "shim": {
      "jquery": [],
      "jq.textchange": ["jquery"],
      "bootstrap": ["jquery"]
    },

    "paths": {
      "jquery": "xlib/jq/jquery2.0.3.min",
      "jq.textchange": "xlib/jq/jquery.textchange.min",
      "bootstrap": "xlib/tbs/js/bootstrap.min"
    }
});

// The one and only Expenses app
var gApp;

define(["jquery", "app/TodoApp"], function($, TodoApp) {
	gApp = new TodoApp();
	gApp.init();
});
