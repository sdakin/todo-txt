"use strict";

/**
The main application module for Todo.txt.

@module app
@class TodoApp
@extends EventTarget
**/
define(
    ["xlib/EventTarget", "ui/dlgs/AlertDlg"],
    function(EventTarget, AlertDlg)
{
    /**
        The TodoApp object.
        @constructor
    */
    function TodoApp() {
        EventTarget.call(this);
    }

    TodoApp.prototype = new EventTarget();
    TodoApp.prototype.constructor = TodoApp;

    // TODO: events fired by this object

    TodoApp.prototype.init = function() {
        var self = this;
        var initQ = $.Deferred();

        // load the alert dialogs
        $("#app-alert-templates .alerts").load("ui/dlgs/alerts.html", function() {
            initQ.resolve();
        });

        initQ.done(function() {
            self.getDataDir();
        });
    };

    TodoApp.prototype.getDataDir = function(subDir) {
        var resultQ = $.Deferred();
        var getDirQ = $.Deferred();

        chrome.storage.local.get("dataDir", function(result) {
            if (!("dataDir" in result)) {
                var alert = new AlertDlg("Data Directory", "You have not chosen a directory for the Todo.txt data files. Would you like to browse for one now?", ["Later", "Now"]);
                alert.addListener(AlertDlg.BUTTON_CLICKED, function(e) {
                    alert.hide();
                    if (e.buttonTitle == "Now") {
                        chrome.fileSystem.chooseEntry({type:"openDirectory"}, function(entry) {
                            chrome.fileSystem.getDisplayPath(entry, function(displayPath) {
                                chrome.storage.local.set({dataDir: displayPath}, function() {
                                    getDirQ.resolve(displayPath);
                                });
                            });
                        });
                    } else
                        getDirQ.reject("dataDir not defined");
                });
                alert.show();
            } else
                getDirQ.resolve(result.dataDir);
        });
        
        getDirQ.done(function(dataDir) {
            if (subDir)
                dataDir += "\\" + subDir;
            resultQ.resolve(dataDir);
        }).fail(function(err) {
            resultQ.reject(err);
        });

        return resultQ.promise();
    };

    return TodoApp;
});
