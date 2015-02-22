var secretWord = "",
    secretWordCharacterArray = [],
    matchingObject = {},
    characterCount = "",
    definition = "",
    entryArray = [],
    naughtyWords = [
        "skank",
        "wetback",
        "bitch",
        "cunt",
        "dick",
        "douchebag",
        "dyke",
        "fag",
        "nigger",
        "tranny",
        "trannies",
        "paki",
        "pussy",
        "retard",
        "slut",
        "titt",
        "tits",
        "wop",
        "whore",
        "chink",
        "fatass",
        "shemale",
        "daygo",
        "dego",
        "dago",
        "gook",
        "kike",
        "kraut",
        "spic",
        "twat",
        "lesbo",
        "homo",
        "fatso",
        "lardass",
        "jap",
        "biatch",
        "tard",
        "gimp",
        "gyp",
        "chinaman",
        "chinamen",
        "golliwog",
        "crip",
        "raghead",
        "negro",
        "darky",
        "hooker"
    ];

// a reusable, self-executing function to get the secret word
var getSecretWord = (function getSecretWord() {
    $.ajax({
        type: "GET",
        url: "http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&minCorpusCount=1000&maxCorpusCount=-1&minDictionaryCount=3&maxDictionaryCount=-1&minLength=3&maxLength=7&api_key=65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a",
        success: function(data) {
            processSecretWord(data);
        }
    });
    return getSecretWord;
}());

function processSecretWord(data) {
    // get secret word from object and make it lowercase
    secretWord = data.word.toLowerCase();
    
    // also have to check for acented characters, like fiancée
    //&& (/([a-z])/.test(secretWord) === false)) 
    
    // check if it's naughty or nice
    if ($.inArray(secretWord, naughtyWords) == -1) {
        
        // get the character count of secret word
        characterCount = secretWord.length;
        
        //console.log(secretWord, characterCount);
        console.log(secretWord);
        
        // container width based on character count
        $(".word-palette").css("width", characterCount * 90 - 10);
        
        // create character code array and letter holders
        for (var index = 0; index < characterCount; index++) {
            var charCodes = secretWord.charCodeAt(index);
            secretWordCharacterArray.push(charCodes);
            
            $(".word-palette")
                .css("width", characterCount * 90 - 10)
                .append('<input class="letter-holder" readonly type="text" value="' + secretWordCharacterArray[index] + '" />');
        }
        
        // display chracter count
        $(".character-count").html(characterCount + " letters");
    
        // get and display definition
        $.ajax({
            type: "GET",
            url: "http://api.wordnik.com:80/v4/word.json/" + secretWord + "/definitions?limit=1&partOfSpeech=noun&includeRelated=true&sourceDictionaries=all&useCanonical=true&includeTags=false&api_key=65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a",
            success: function(data) {
                //console.log(data);
                definition = data[0].text;
                $(".definition").append("<p>" + definition + "</p>");
            }
        });
    
    } else {
        // run that shit again
        console.log("the word was naughty, running again");
        getSecretWord();
    }
}

// when a key is pressed
$(document).keypress(function(e) {
    // get letter pressed
    var characterCode = e.which;
    
    // first, make sure it's a letter
    if ((characterCode >= 97 && characterCode <= 122) || characterCode == 127) {
        // run letterMatcher
        letterMatcher(characterCode);
    } else {
        // do nah
        e.preventDefault();
    }
});

// when a letter is clicked
$(".alphabet li").click(function(e) {
    // if it's aleady been used, do nah
    if ($(this).hasClass("letter-selected") ) {
        return false;
    } else {
        // convert letter to character code and run letterMatcher
        letterMatcher($(this).data("character-code"));
        // add used class
        //$(this).addClass("letter-selected");
    }
});

function letterMatcher(characterCode) {
    
    // if it's not already in the array, run the shiz
    if ($.inArray(characterCode, entryArray) == -1) {
        
        // mark the letter as used
        $("li[data-character-code=" + characterCode + "]").addClass("letter-selected");
        
        // now let's decide if it's in the secret word or not
        if (secretWordCharacterArray.indexOf(characterCode) != -1) {
            
            // it's in the secret word, light up the letter
            $("input.letter-holder[value=" + characterCode + "]").val(String.fromCharCode(characterCode)).addClass("highlight");
            // and give it a class
            $("li[data-character-code=" + characterCode + "]").addClass("used");
            
            // it's there, but how many times does it occur, for each, add it to the entryArray
            var occurrences = secretWord.split(String.fromCharCode(characterCode)).length - 1;
            for (var index = 0; index < occurrences; index++) {
                entryArray.push(characterCode);
            }
            
            console.log("match - that letter appears " + occurrences + " time(s)");
            console.log(entryArray);
        } else {
            console.log("NOT match");
            $("li[data-character-code=" + characterCode + "]").addClass("unused");
        }
        
        //console.log("characterCount" + characterCount, "entryArray" + entryArray.length);
        
        // check for winner or nah
        if (entryArray.length === characterCount) {
            if ($("#auto-proceed").prop("checked")) {
                setTimeout("clearEverything()", 1000);
            } else {
                alert("OH SNAP YOU GUESSED THE WORD!");
            }
        }
    
    } else {
        //return false;
        console.log("match, but already in the array");
    }
}

// clear display and start again
function clearEverything() {
    console.clear();
    
    $("body").hide();
    
    // empty all variables
    secretWord = "";
    secretWordCharacterArray = [];
    characterCount = "";
    definition = "";
    entryArray = [];
    // and reset all stuffs
    $(".word-palette, .definition").empty();
    //$("input.guess").val("");
    $(".alphabet li").removeClass();
    //$(".definition").empty();
    
    $("body").fadeIn(700);
    getSecretWord();
    
}

// when the refresh button is clicked
$(".surrender, .proceed").click(function() {
    clearEverything();
});

/*
$("#auto-proceed").change(validate);

function validate() {
    if ($(".file-checkbox").is(":checked")) {
        $("button.push-internet").prop("disabled", false);
    } else {
        $("button.push-internet").prop("disabled", true);
    }
}
validate();
$(".file-checkbox").change(validate);
*/

// when the enter key is pressed
$(document).keypress(function(e) {
    if (e.which == 13) {
        clearEverything();    
    }
});

/* browser refresh warning
window.onbeforeunload = function() {
    return "You will so lose errrything if you refresh";
}
*/