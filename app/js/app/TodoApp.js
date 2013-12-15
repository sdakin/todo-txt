"use strict";

/**
The main application module for Todo.txt.

@module app
@class TodoApp
@extends EventTarget
**/
define(
    ["xlib/EventTarget", "lib/util", "ui/dlgs/AlertDlg", "data/Task", "data/TaskList"],
    function(EventTarget, util, AlertDlg, Task, TaskList)
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

        // an unsightly kludge to get the bottom border to show up properly
        $("html").height($("html").height() - 2);

        // load the alert dialogs
        $("#app-alert-templates .alerts").load("ui/dlgs/alerts.html", function() {
            initQ.resolve();
        });

        initQ.done(function() {
            self.getTodoFile().then(function() {
                self.loadTodoFile();
            });
        });
    };

    TodoApp.prototype.getTodoFile = function(subDir) {
        var self = this;
        var resultQ = $.Deferred();
        var getTodoFileQ = $.Deferred();

        chrome.storage.local.get("todoFileID", function(result) {
            if (!("todoFileID" in result)) {
                var alert = new AlertDlg("Specify todo.txt File", "You have not specified the todo.txt file to use. Would you like to browse for one now?", ["Later", "Now"]);
                alert.addListener(AlertDlg.BUTTON_CLICKED, function(e) {
                    alert.hide();
                    if (e.buttonTitle == "Now") {
                        chrome.fileSystem.chooseEntry({type:"openWritableFile"}, function(entry) {
                            chrome.fileSystem.getDisplayPath(entry, function(displayPath) {
                                var settings = {
                                    todoFilePath: displayPath,
                                    todoFileID: chrome.fileSystem.retainEntry(entry)
                                };
                                chrome.storage.local.set(settings, function() {
                                    getTodoFileQ.resolve(entry);
                                });
                            });
                        });
                    } else
                        getTodoFileQ.reject("todo.txt file not defined");
                });
                alert.show();
            } else {
                chrome.fileSystem.restoreEntry(result.todoFileID, function(entry) {
                    getTodoFileQ.resolve(entry);
                });
            }
        });
        
        getTodoFileQ.done(function(fileEntry) {
            self.todoFile = fileEntry;
            resultQ.resolve();
        }).fail(function(err) {
            resultQ.reject(err);
        });

        return resultQ.promise();
    };

    TodoApp.prototype.loadTodoFile = function() {
        var self = this;
        self.taskList = new TaskList();
        self.todoFile.file(function(file) {
            var reader = new FileReader();
            reader.onerror = function(e) {
                console.error("error reading file: " + e);
            };
            reader.onloadend = function(e) {
                var lines = e.target.result.split("\n");
                lines.forEach(function(line) {
                    if (line && line.length > 0)
                        self.taskList.addTask(new Task(line));
                });
                self.reloadTasks();
            };

            reader.readAsText(file);
        });
    };

    TodoApp.prototype.reloadTasks = function() {
        var self = this;
        var $taskList = $("#tasks");
        $taskList.empty();
        var sortedTasks = self.taskList.sortTasks();
        sortedTasks.forEach(function(task) {
            var $taskItem = $("#ui-templates .task-item").clone();
            setTaskItemCompletedState($taskItem, task);
            var $star = $taskItem.find(".tag-star");
            if (task.isStar()) $star.css("display", "inline-block");
            else $star.hide();
            $taskItem.attr("data-index", task.index);
            var $title = $taskItem.find(".task-title");
            $title.text(task.getTitle());
            if (task.isComplete()) $title.css("color", "darkgray");
            else if (task.isPastDue()) $title.css("color", "red");
            $taskList.append($taskItem);
        });
        $taskList.find(".tag-checkbox").click(function(e) {
            self.toggleComplete($(e.target).parents(".task-item"));
        });
    };

    TodoApp.prototype.toggleComplete = function($taskItem) {
        var task = this.taskList.getTaskFromIndex(Number($taskItem.attr("data-index")));
        if (task.isComplete()) {
            // when uncompleting a task we save the completed date so we can set it back
            // if the user marks the same task as complete in this app session
            $taskItem.attr("data-completedDate", task.getCompletedDate());
            task.setComplete(false);
        } else {
            task.setComplete(true, $taskItem.attr("data-completedDate"));
        }
        this.reloadTasks();
    };

    function setTaskItemCompletedState($taskItem, task) {
        var imgSrc = "img/" + (task.isComplete() ? "completed.png" : "incomplete.png");
        var $img = $taskItem.find(".tag-checkbox");
        $img.attr("src", imgSrc);
        if (task.isComplete()) $img.attr("title", task.getCompletedDate());
    }

    return TodoApp;
});
