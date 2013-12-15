"use strict";

define([], function() {

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

    Task.prototype.getTitle = function() {
        var title = this.rawData;

        // skip over the completed info
        if (this.isComplete()) {
            title = title.substr(2);
            var compDate = this.getCompletedDate();
            if (compDate)
                title = title.substr(compDate.length).trim();
        }

        // skip over the created date
        var re = /^([0-9]{4}-[0-9]{2}-[0-9]{2}).*/;
        var match = re.exec(title);
        if (match && match.length > 1)
            title = title.substr(match[1].length);

        return title.trim();
    };

    Task.prototype.isComplete = function() {
        return this.rawData.startsWith("x ");
    };

    Task.prototype.compare = function(rhs) {
        if (this.isComplete() && !rhs.isComplete()) return 1;
        else if (rhs.isComplete() && !this.isComplete()) return -1;
        else if (this.isComplete() && rhs.isComplete()) {
            var compDate = this.getCompletedDate(), rhsCompDate = rhs.getCompletedDate();
            if (compDate && rhsCompDate)
                return compDate.localeCompare(rhsCompDate);
            else
                console.error("invalid completed date");
        }
        return 0;
    };

    Task.prototype.setComplete = function(flag, completedDate) {
        if (flag) {
            if (!this.isComplete()) {
                if (!completedDate) {
                    var now = new Date();
                    completedDate = String(now.getFullYear()) + "-";
                    var month = now.getMonth() + 1, day = now.getDate();
                    completedDate += (month < 10 ? "0" : "") + month + "-";
                    completedDate += (day < 10 ? "0" : "") + day;
                }
                this.rawData = "x " + completedDate + " " + this.rawData;
            }
        } else {
            if (this.isComplete()) {
                var compDate = this.getCompletedDate();
                this.rawData = this.rawData.substr(2);
                if (compDate)
                    this.rawData = this.rawData.substr(compDate.length).trim();
            }
        }
    };

    return Task;
});
