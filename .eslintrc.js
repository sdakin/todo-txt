module.exports = {
    "env": {
        "browser": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
	"indent": "off",
	"no-console": "off"
    },
    "globals": {
    	"define": false,
	"require": false,
	"requirejs": false,
	"$": false,
	"process": false
    }
};
