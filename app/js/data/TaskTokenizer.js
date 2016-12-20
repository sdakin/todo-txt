"use strict";

define([], function() {

    function TaskTokenizer() {
    }

    TaskTokenizer.PRE_TOKEN = "PRE_TOKEN";
    TaskTokenizer.COMPLETED_FLAG_TOKEN = "COMPLETED_FLAG_TOKEN";
    TaskTokenizer.COMPLETED_DATE_TOKEN = "COMPLETED_DATE_TOKEN";
    TaskTokenizer.PRIORITY_TOKEN = "PRIORITY_TOKEN";
    TaskTokenizer.CREATED_DATE_TOKEN = "CREATED_DATE_TOKEN";
    TaskTokenizer.CONTENT_TOKEN = "CONTENT_TOKEN";
    TaskTokenizer.TITLE_TOKEN = "TITLE_TOKEN";
    TaskTokenizer.PROJECT_TOKEN = "PROJECT_TOKEN";
    TaskTokenizer.CONTEXT_TOKEN = "CONTEXT_TOKEN";
    TaskTokenizer.CUSTOM_TOKEN = "CUSTOM_TOKEN";

    TaskTokenizer.prototype.tokenize = function(taskData, callback) {
        var self = this, result = true;
        var tokens = taskData.split(" ");
        var curToken = TaskTokenizer.PRE_TOKEN;
        var title = "", titleStarted = false, titleDone = false;

        for (var tokenIndex = 0 ; tokenIndex < tokens.length ; tokenIndex++) {
            var token = tokens[tokenIndex].trim();
            if (token.length > 0) {
                self.parsedToken = token;
                switch (curToken) {
                    case TaskTokenizer.PRE_TOKEN:
                        if (token == "x")
                            processToken(token, TaskTokenizer.COMPLETED_FLAG_TOKEN);
                        else if (isPriorityToken(token))
                            processToken(self.parsedToken, TaskTokenizer.PRIORITY_TOKEN);
                        else if (isDateToken(token))
                            processToken(token, TaskTokenizer.CREATED_DATE_TOKEN);
                        else
                            handleContentToken(token);
                        break;

                    case TaskTokenizer.COMPLETED_FLAG_TOKEN:
                        if (isDateToken(token))
                            processToken(token, TaskTokenizer.COMPLETED_DATE_TOKEN);
                        else
                            invalidToken();
                        break;

                    case TaskTokenizer.COMPLETED_DATE_TOKEN:
                        if (isPriorityToken(token))
                            processToken(self.parsedToken, TaskTokenizer.PRIORITY_TOKEN);
                        else if (isDateToken(token))
                            processToken(token, TaskTokenizer.CREATED_DATE_TOKEN);
                        else
                            handleContentToken(token);
                        break;

                    case TaskTokenizer.CONTENT_TOKEN:
                    default:
                        handleContentToken(token);
                        break;
                }
            }
        }

        // after we tokenized the entire string process the title if we extracted one
        if (result && title.length > 0)
            processToken(title, TaskTokenizer.TITLE_TOKEN);
        return result;

        function addToTitleToken(token) {
            if (!titleDone) {
                if (title.length > 0) title += " ";
                title += token;
            } else {
                result = false;
                tokenIndex = tokens.length;
                titleStarted = true;
            }
        }
        function handleContentToken(token) {
            curToken = TaskTokenizer.CONTENT_TOKEN;
            if (isProjectToken(token))
                processToken(token, TaskTokenizer.PROJECT_TOKEN);
            else if (isContextToken(token))
                processToken(token, TaskTokenizer.CONTEXT_TOKEN);
            else if (isCustomToken(token))
                processToken(token, TaskTokenizer.CUSTOM_TOKEN);
            else if (!titleStarted && isDateToken(token))
                processToken(token, TaskTokenizer.CREATED_DATE_TOKEN);
            else
                addToTitleToken(token);
        }

        function isContextToken(token) {
            return token.charAt(0) == "@";
        }

        function isCustomToken(token) {
            return token.indexOf(":") > 0;
        }

        function isDateToken(token) {
            var re = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
            return re.test(token);
        }

        function isPriorityToken(token) {
            var re = /\(([A-Z])\)/;
            var match = re.exec(token);
            if (match && match.length > 1) {
                self.parsedToken = match[1];
                return true;
            }
            return false;
        }

        function isProjectToken(token) {
            return token.charAt(0) == "+";
        }

        function processToken(token, tokenType) {
            curToken = tokenType;
            if (curToken == TaskTokenizer.CUSTOM_TOKEN) {
                if (token.substr(0, 5) === "prio:") {
                    curToken = TaskTokenizer.PRIORITY_TOKEN;
                    token = token.substr(5);
                }
            }
            var result = callback(token, curToken);
            // if the callback returns true then stop the tokenization
            if (result === true) {
                result = false;
                tokenIndex = tokens.length;
            }
            if (tokenType == TaskTokenizer.PROJECT_TOKEN ||
                tokenType == TaskTokenizer.CONTEXT_TOKEN ||
                tokenType == TaskTokenizer.CUSTOM_TOKEN) {
                    titleDone = true;
            }
        }

        // an unexpected token was encountered - stop tokenization
        function invalidToken() {
            result = false;
            tokenIndex = tokens.length;
        }
    };

    return TaskTokenizer;
});
