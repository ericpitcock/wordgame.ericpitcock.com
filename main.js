var secretWord = "",
    secretWordCharacterArray = [],
    characterCount = "",
    definition = "",
    entryArray = [],
    wordGameScore = localStorage.getItem("word-game-score"),
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

// set score
if (wordGameScore === null) {
    scoreValue = "0";
} else {
    scoreValue = localStorage.getItem("word-game-score");
}
$(".score-value").text(scoreValue);


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
    // get secret word from object, make it lowercase, and replace any accented characters
    secretWord = data.word.toLowerCase().replace("é", "e");
    
    // if it's naughty
    if ($.inArray(secretWord, naughtyWords) > -1) {
    
        // run that shit again
        console.log("the word was naughty, running again");
        getSecretWord();
    
    } else {
        
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
        e.preventDefault();
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
            
            // it's there, but how many times does it occur?
            var occurrences = secretWord.split(String.fromCharCode(characterCode)).length - 1;
            // for each occurence, add it to the entryArray
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
            /*
            if ($("#auto-proceed").prop("checked")) {
                setTimeout("proceed()", 1000);
            } else {
                alert("OH SNAP! YOU GUESSED THE WORD!");
            }
            */
            
            setTimeout("proceed()", 1000);
            
            // add points
            $(".score-value").text(function(i, v){ return +v + 10;});
            // store points
            if (localStorage.getItem("word-game-score") === null) {
                localStorage.setItem("word-game-score", 10);
            } else {
                //var currentScore = localStorage.getItem("word-game-score");
                var newScore = parseInt(localStorage.getItem("word-game-score")) + 10;
                localStorage.setItem("word-game-score", newScore);
            }
            $(".surrender").attr("disabled", "disabled");
        }
    
    } else {
        //return false;
        console.log("match, but already in the array");
    }
}

// expose the secret word
function exposeSecretWord() {
    $("input.letter-holder:not(.highlight)").each(function() {
        $(this).val(String.fromCharCode($(this).val())).addClass("highlight"); 
    })
}

// clear display and start again
function proceed() {
    console.clear();
    //$("body").hide();
    
    // empty all variables
    secretWord = "";
    secretWordCharacterArray = [];
    characterCount = "";
    definition = "";
    entryArray = [];
    // and reset all stuffs
    $(".word-palette").addClass("animated bounceOutLeft");
    
    $(".word-palette").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
        function() {
            $(".word-palette, .definition").empty();
            $(".word-palette").removeClass("bounceOutLeft").addClass("bounceInRight");
            getSecretWord();
        });
    
    $(".alphabet li").removeClass();
    $(".surrender").removeAttr("disabled", "disabled");
    
    
    //$("body").fadeIn(700);
}

// when the refresh button is clicked
$(".proceed").click(function() {
    proceed();
});

$(".surrender").click(function() {
    exposeSecretWord();
    $(this).attr("disabled", "disabled");
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
        exposeSecretWord()
        setTimeout("proceed()", 1000);    
    }
});

/* browser refresh warning
window.onbeforeunload = function() {
    return "You will so lose errrything if you refresh";
}
*/