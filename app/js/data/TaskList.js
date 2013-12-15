"use strict";

define([], function() {

    function TaskList() {
        // published properties
        this.tasks = [];
    }

    TaskList.prototype.addTask = function(newTask) {
        newTask.index = this.tasks.length;
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
