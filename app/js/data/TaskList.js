"use strict";

define([], function() {

    function TaskList() {
        // published properties
        this.tasks = [];
        this.projects = {};
        this.contexts = {};
    }

    TaskList.prototype.addTask = function(newTask) {
        newTask.index = this.tasks.length;
        var projectRE = /\+([^ \n]+)/g, contextRE = /@([^ \n]+)/g;
        var projects, contexts;
        while (projects = projectRE.exec(newTask.rawData)) {
            var proj = projects[1].trim();
            this.projects[proj.toLowerCase()] = proj;
        }
        while (contexts = contextRE.exec(newTask.rawData)) {
            var context = contexts[1].trim();
            this.contexts[context.toLowerCase()] = context;
        }
        this.tasks.push(newTask);
    };

    TaskList.prototype.getTaskFromIndex = function(index) {
        if (index >= 0 && index < this.tasks.length)
            return this.tasks[index];
        return null;
    };
    
    TaskList.prototype.isComplete = function() {
        return this.rawData.startsWith("x ");
    };

    TaskList.prototype.sortTasks = function() {
        var result = [];
        this.tasks.forEach(function(task) {
            result.push(task);
        });
        result.sort(function(lhs, rhs) {
            return lhs.compare(rhs);
        });
        return result;
    };
    
    return TaskList;
});
