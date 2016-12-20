"use strict";

/**
The main application module for Todo.txt.

@module app
@class TodoApp
@extends EventTarget
**/
define(
    ["xlib/EventTarget", "lib/util",
     "ui/dlgs/AlertDlg", "ui/dlgs/EditTaskDlg",
     "data/Task", "data/TaskList",
     "app/AppPrefs"],
    function(EventTarget, util, 
             AlertDlg, EditTaskDlg,
             Task, TaskList,
             AppPrefs)
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
            self.prefs = new AppPrefs();
            self.prefs.load();
            self.loadTodoFile();
        });
    };

    TodoApp.prototype.editTask = function($taskItem) {
        var self = this;
        $("#main-dlg-hook").load("ui/dlgs/editTask.html", function() {
            var task = self.taskList.getTaskFromIndex(Number($taskItem.attr("data-index")));
            self.editTaskDlg = new EditTaskDlg(task);
            self.editTaskDlg.addListener(EditTaskDlg.SAVE_TASK, function() {
                self.editTaskDlg.hide();
                self.saveTasks();
                self.reloadTasks();
            });
            self.editTaskDlg.show();
        });
    };

    TodoApp.prototype.filterTasksByContext = function(context) {
        var self = this;
        var $taskList = $("#tasks");
        if (context == "All") {
            $taskList.children().show();
        } else {
            $taskList.children().each(function(index, taskItem) {
                var $taskItem = $(taskItem);
                var taskIndex = $taskItem.attr("data-index");
                var task = self.taskList.tasks[taskIndex];
                if (task.hasContext(context))
                    $taskItem.show();
                else
                    $taskItem.hide();
            });
        }
    };

    TodoApp.prototype.filterTasksByProject = function(project) {
        var self = this;
        var $taskList = $("#tasks");
        if (project == "All") {
            $taskList.children().show();
        } else {
            $taskList.children().each(function(index, taskItem) {
                var $taskItem = $(taskItem);
                var taskIndex = $taskItem.attr("data-index");
                var task = self.taskList.tasks[taskIndex];
                if (task.hasProject(project))
                    $taskItem.show();
                else
                    $taskItem.hide();
            });
        }
    };

    TodoApp.prototype.handleTaskItemKeydown = function(e) {
        var self = this, index, $newInput;
        if (e.keyCode == 38) {
            index = getActiveItemIndex($(e.target));
            if (index > 0) {
                saveSelectionPos($(e.currentTarget));
                $newInput = $($("#tasks").find(".task-item")[index - 1]).find(".task-title");
                $newInput.focus();
                setTimeout( function() { setSelectionPos($newInput); }, 1);
            } else {
                return false;
            }
        } else if (e.keyCode == 40) {
            index = getActiveItemIndex($(e.target));
            var $tasks = $("#tasks").find(".task-item");
            if (index < $("#tasks").find(".task-item").length - 1) {
                saveSelectionPos($(e.currentTarget));
                $newInput = $($tasks[index + 1]).find(".task-title");
                $newInput.focus();
                setTimeout( function() { setSelectionPos($newInput); }, 1);
            } else {
                return false;
            }
        } else {
            if (e.keyCode == 13) {
                index = getActiveItemIndex($(e.target));
                self.taskList.insertTaskAtIndex(new Task(""), index + 1);
                self.reloadTasks();
            } else if (e.keyCode == 8) {
                if ($(e.target).val().length == 0) {
                    // delete task
                    var $taskItem = $(e.target).parents(".task-item");
                    self.taskList.deleteTaskAtIndex(Number($taskItem.attr("data-index")));
                    self.reloadTasks();
                }
            }
            delete self.savedSelectionPos;
        }

        function getActiveItemIndex($item) {
            var $tasks = $("#tasks").find(".task-item");
            var index = $tasks.index($item.parents(".task-item"));
            return index;
        }

        function getWidthOfText(txt, fontname, fontsize) {
            var c=document.createElement("canvas");
            var ctx=c.getContext("2d");
            ctx.font = fontsize + fontname;
            var width = ctx.measureText(txt).width;
            return width;
        }

        function saveSelectionPos($input) {
            if (!("savedSelectionPos" in self)) {
                var text = $input.val().substr(0, $input[0].selectionStart);
                self.savedSelectionPos = getWidthOfText(text, $input.css("font-family"), $input.css("font-size"));
            }
        }

        function setSelectionPos($input) {
            var curWidth = 0, fontName = $input.css("font-family"), fontSize = $input.css("font-size");
            for (var i = 1 ; i < $input.val().length ; i++) {
                var width = getWidthOfText($input.val().substr(0, i), fontName, fontSize);
                if (width > self.savedSelectionPos) {
                    if (self.savedSelectionPos - curWidth < width - self.savedSelectionPos) i--;
                    $input.selectRange(i);
                    break;
                }
                curWidth = width;
            }
        }
    };

    TodoApp.prototype.loadProjectsAndContexts = function() {
        var self = this;
        var $projects = $("#projects");
        $projects.empty();
        $projects.append($("<li><a href=\"#\">All</a></li>"));
        Object.keys(self.taskList.projects).sort().forEach(function(project) {
            $projects.append($("<li><a href=\"#\">" + project + "</a></li>"));
        });
        $projects.find("a").click(function(e) {
            self.filterTasksByProject(e.target.innerText);
        });

        var $contexts = $("#contexts");
        $contexts.empty();
        $contexts.append($("<li><a href=\"#\">All</a></li>"));
        Object.keys(self.taskList.contexts).sort().forEach(function(context) {
            $contexts.append($("<li><a href=\"#\">" + context + "</a></li>"));
        });
        $contexts.find("a").click(function(e) {
            self.filterTasksByContext(e.target.innerText);
        });
    };


    // test reading file: C:\Users\sdakin.ADOBENET\Dropbox\todo\todo.txt

    TodoApp.prototype.loadTodoFile = function() {
        var self = this;
        var lineReader = require("line-reader");
        self.taskList = new TaskList();
        lineReader.eachLine(self.prefs.todoTxtFile, function(line) {
            if (line && line.length > 0)
                self.taskList.addTask(new Task(line));
        }).then(function () {
            self.loadProjectsAndContexts();
            self.reloadTasks();
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
            else {
                $star.hide();
                var priority = task.getPriority();
                if (priority) {
                    var $prio = $taskItem.find(".task-priority");
                    $prio.text(priority);
                    $prio.css("display", "inline-block");
                    if (task.isComplete()) $prio.css("color", "darkgray");
                }
            }
            $taskItem.attr("data-index", task.index);
            var $title = $taskItem.find(".task-title");
            $title.val(task.getTitle());
            $title.attr("size", $title.val().length);
            if (task.isComplete()) $title.css("color", "darkgray");
            else if (task.isPastDue()) $title.css("color", "red");
            $taskList.append($taskItem);
        });
        $taskList.find(".tag-checkbox").click(function(e) {
            self.toggleComplete($(e.target).parents(".task-item"));
        });
        $taskList.find(".task-contents").click(function(e) {
            self.editTask($(e.target).parents(".task-item"));
        });

        var $taskTitle = $taskList.find(".task-title");
        $taskTitle.click(function() {
            delete self.savedSelectionPos;
            return false;
        });
        $taskTitle.keydown(function(e) {
            self.handleTaskItemKeydown(e);
        });
    };

    TodoApp.prototype.saveTasks = function() {
        console.log("TODO: implement saveTasks()...");
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
