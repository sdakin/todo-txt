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
        var result = true;
        var tokens = taskData.split(" ");
        var curToken = TaskTokenizer.PRE_TOKEN;
        var tokenIndex = 0;
        var title = "", titleStarted = false, titleDone = false;

        for (var tokenIndex = 0 ; tokenIndex < tokens.length ; tokenIndex++) {
            var token = tokens[tokenIndex];
            if (token.length > 0) {
                switch (curToken) {
                    case TaskTokenizer.PRE_TOKEN:
                        if (token == "x")
                            processToken(token, TaskTokenizer.COMPLETED_FLAG_TOKEN);
                        else if (isPriorityToken(token))
                            processToken(token, TaskTokenizer.PRIORITY_TOKEN);
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
                            processToken(token, TaskTokenizer.PRIORITY_TOKEN);
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
            var re = /\([A-Z]\)/;
            return re.test(token);
        }

        function isProjectToken(token) {
            return token.charAt(0) == "+";
        }

        function processToken(token, tokenType) {
            curToken = tokenType;
            var result = callback(token, tokenType);
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
    }

    return TaskTokenizer;
});
