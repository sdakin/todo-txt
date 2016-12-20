"use strict";

define(
    ["xlib/EventTarget", "data/Task", "data/TaskTokenizer", "bootstrap"],
    function(EventTarget, Task, TaskTokenizer /*, bootstrap */)
{

    function EditTaskDlg(task) {
        EventTarget.call(this);
        this.mode = (task) ? EditTaskDlg.EDIT_MODE : EditTaskDlg.ADD_MODE;
        if (task) {
            this.task = task;
            if (task.hasStar())
                $(".btn-star img").attr("src", "img/star.png");
        } else {
            this.task = new Task();
            $("#dlgEditTask h2").text("New Task");
        }
        var self = this;
        this.cancelBtn().unbind("click").bind("click", function() { self.hide(); });
        this.saveBtn().unbind("click").bind("click", function() { self.saveData(); });
        $(".btn-star").unbind("click").bind("click", function() { self.toggleStar(); });

        // $("#acct-type-selector .dropdown-menu li").unbind("click").bind("click", function(e) {
        //     var acctType = $(e.currentTarget).text();
        //     $("#acct-type-selector .acct-type-dropdown-label").text(acctType);
        // });
        // $("#fldAcctName").unbind("textchange").bind("textchange", function(e) {
        //     self.updateUI();
        // });

        // parse the pre-content values from the task before extracting the title
        var tokenizer = new TaskTokenizer();
        tokenizer.tokenize(task.rawData, function(token, tokenType) {
            switch (tokenType) {
                case TaskTokenizer.COMPLETED_FLAG_TOKEN:
                    self.isComplete = true;
                    break;
                case TaskTokenizer.COMPLETED_DATE_TOKEN:
                    self.completedDate = token;
                    break;
                case TaskTokenizer.PRIORITY_TOKEN:
                    self.setPriority(token);
                    break;
                case TaskTokenizer.CREATED_DATE_TOKEN:
                    self.createdDate = token;
                    break;
            }
        });
        $("#fldTitle").val(task.getTitle());
        if (self.isComplete)
            $("#dlgEditTask .btn-complete img").attr("src", "img/completed.png");
        $("#fldCompletedDate").val(self.completedDate);
    }

    EditTaskDlg.prototype = new EventTarget();
    EditTaskDlg.prototype.constructor = EditTaskDlg;

    // events fired by this object
    EditTaskDlg.SAVE_TASK = "SaveTask";

    EditTaskDlg.EDIT_MODE = "Mode-Edit";
    EditTaskDlg.ADD_MODE = "Mode-Add";

    EditTaskDlg.prototype.cancelBtn = function() { return $($("#dlgEditTask .modal-footer a")[0]); };
    EditTaskDlg.prototype.saveBtn = function() { return $($("#dlgEditTask .modal-footer a")[1]); };

    EditTaskDlg.prototype.hide = function() {
        $("#dlgEditTask").modal("hide");
    };

    EditTaskDlg.prototype.show = function() {
        $("#dlgEditTask").modal("show");
        $("#fldAcctName").focus();
    };

    EditTaskDlg.prototype.saveData = function() {
        var tokenizer = new TaskTokenizer();
        var result = tokenizer.tokenize($("#fldTitle").val(), function(token, tokenType) {
            console.log(tokenType + ": " + token);
        });
        if (!result) {
            console.error("ERROR: invalid task format.");
        } else {
            var $imgStar = $(".btn-star img");
            this.task.setStar($imgStar.attr("src") == "img/star.png");
            this.fire(EditTaskDlg.SAVE_TASK);
        }
    };

    EditTaskDlg.prototype.setPriority = function(prio) {
        var $items = $(".priority-menu li");
        this.priority = prio;
        $items.removeClass("active");
        $items.each(function(index, item) {
            var label = item.children[0].textContent;
            if (label == prio) {
                $(item).addClass("active");
                return true;
            }
        });
    };

    EditTaskDlg.prototype.toggleStar = function() {
        var $imgStar = $(".btn-star img");
        if ($imgStar.attr("src") == "img/staroff.png")
            $imgStar.attr("src", "img/star.png");
        else
            $imgStar.attr("src", "img/staroff.png");
    };

    EditTaskDlg.prototype.updateUI = function() {
    };

    return EditTaskDlg;
});
