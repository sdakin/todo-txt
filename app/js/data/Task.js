"use strict";

define(["data/TaskTokenizer"], function(TaskTokenizer) {

    function Task(initData) {
        // published properties
        this.rawData = initData;
    }

    Task.prototype.getCompletedDate = function() {
        var re = /^x ([0-9]{4}-[0-9]{2}-[0-9]{2}).*/;
        var match = re.exec(this.rawData);
        if (match && match.length > 1)
            return match[1];
        return null;
    };

    Task.prototype.getCreatedDate = function() {
        var result = null;
        var tokenizer = new TaskTokenizer();
        tokenizer.tokenize(this.rawData, function(token, tokenType) {
            if (tokenType == TaskTokenizer.CREATED_DATE_TOKEN) {
                result = token;
                return true;
            }
        });
        return result;
    };

    Task.prototype.getPriority = function() {
        var result = null;
        var pattern = (this.isComplete() ? / prio:([A-Z])/ : /^\(([A-Z])\)/ );
        var match = pattern.exec(this.rawData);
        if (match && match.length > 1)
            result = match[1];
        return result;
    };

    Task.prototype.getTitle = function() {
        var title = this.rawData;

        // skip over the completed info
        if (this.isComplete()) {
            title = title.substr(2);
            var compDate = this.getCompletedDate();
            if (compDate)
                title = title.substr(compDate.length).trim();
        }

        // skip over the priority
        var priorityRE = /^(\([A-Z]\)).*/;
        var match = priorityRE.exec(title);
        if (match && match.length > 1) {
            title = title.substr(4);
        }

        // skip over the created date
        var re = /^([0-9]{4}-[0-9]{2}-[0-9]{2}).*/;
        match = re.exec(title);
        if (match && match.length > 1)
            title = title.substr(match[1].length);

        return title.trim().replace(/ prio:[A-Z]/, "");
    };

    Task.prototype.isComplete = function() {
        return this.rawData.startsWith("x ");
    };

    Task.prototype.isPastDue = function() {
        var dueRE = / due:([0-9]{4}-[0-9]{2}-[0-9]{2})/;
        var match = dueRE.exec(this.rawData);
        if (match && match.length > 1) {
            var due = new Date(match[1]), now = new Date();
            return (due.getTime() < now.getTime());
        }
        return false;
    };

    Task.prototype.hasStar = function() {
        return this.isStar();
    };

    Task.prototype.isStar = function() {
        return this.getPriority() === "A";
    };

    Task.prototype.setStar = function(flag) {
        if (flag) {
            if (!this.hasStar())
                this.rawData = "(A) " + this.rawData;
        } else {
            if (this.hasStar())
                this.rawData = this.rawData.substr(4);
        }
    };

    Task.prototype.compare = function(rhs) {
        // first sort order item is completed status
        if (this.isComplete() && !rhs.isComplete()) return 1;
        else if (rhs.isComplete() && !this.isComplete()) return -1;
        else if (this.isComplete() && rhs.isComplete()) {
            // if both tasks are complete then next sort on completed date
            var compDate = this.getCompletedDate(), rhsCompDate = rhs.getCompletedDate();
            if (compDate && rhsCompDate) {
                // reverse chronological date (most recently completed first)
                return rhsCompDate.localeCompare(compDate);
            }
            else
                console.error("invalid completed date");
        }
        
        // move starred tasks to the top
        if (this.isStar() && !rhs.isStar()) return -1;
        else if (rhs.isStar() && !this.isStar()) return 1;

        // sort on priority
        var prio = this.getPriority(), rhsPrio = rhs.getPriority();
        if (prio !== null && rhsPrio !== null) return prio.localeCompare(rhsPrio);
        else if (prio !== null && rhsPrio === null) return -1;
        else if (prio === null && rhsPrio !== null) return 1;

        // TODO: sort on due date

        // last is alphabetical by title
        return this.getTitle().localeCompare(rhs.getTitle());
    };

    Task.prototype.setComplete = function(flag, completedDate) {
        var rawData, prio, createdDate;
        if (flag) {
            if (!this.isComplete()) {
                if (!completedDate) {
                    var now = new Date();
                    completedDate = String(now.getFullYear()) + "-";
                    var month = now.getMonth() + 1, day = now.getDate();
                    completedDate += (month < 10 ? "0" : "") + month + "-";
                    completedDate += (day < 10 ? "0" : "") + day;
                }
                rawData = "x " + completedDate;
                createdDate = this.getCreatedDate();
                if (createdDate) rawData += " " + createdDate;
                rawData += " " + this.getTitle();
                prio = this.getPriority();
                if (prio) rawData += " prio:" + prio;
                this.rawData = rawData;
            }
        } else {
            if (this.isComplete()) {
                var compDate = this.getCompletedDate();
                prio = this.getPriority();
                this.rawData = this.rawData.substr(2);
                if (compDate) {
                    this.rawData = this.rawData.substr(compDate.length).trim();
                    rawData = "";
                    if (prio) rawData = "(" + prio + ")";
                    createdDate = this.getCreatedDate();
                    if (createdDate) rawData += " " + createdDate;
                    rawData += " " + this.getTitle();
                    this.rawData = rawData;
                }
            }
        }
    };

    return Task;
});
