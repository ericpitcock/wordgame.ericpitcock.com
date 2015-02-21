var secretWord = "",
    secretWordCharacterArray = [],
    characterCount = "",
    definition = "",
    entryArray = [];

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
    // get the character count of secret word
    characterCount = secretWord.length;
    
    //console.log(secretWord, characterCount);
    console.log(secretWord);
    
    // container width based on character count
    $(".word-palette").css("width", characterCount * 90 - 10)
    
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
        url: "http://api.wordnik.com:80/v4/word.json/" + secretWord + "/definitions?limit=1&partOfSpeech=noun&includeRelated=false&sourceDictionaries=webster&useCanonical=true&includeTags=false&api_key=65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a",
        success: function(data) {
            //console.log(data);
            definition = data[0].text;
            $(".definition").append("<p>" + definition + "</p>");
        }
    });
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
    if ($(this).hasClass("letter-used") ) {
        return false;
    } else {
        // convert letter to character code and run letterMatcher
        letterMatcher($(this).data("character-code"));
        // add used class
        //$(this).addClass("letter-used");
    }
})

function letterMatcher(characterCode) {
    // letterMatcher works with character codes, let's convert it to the actual letter
    actualLetter = String.fromCharCode(characterCode);
    
    //console.log("secretWordCharacterArray: " + secretWordCharacterArray);
    //console.log("entryArray: " + entryArray);
    
    // mark the letter as used
    $("li[data-character-code=" + characterCode + "]").addClass("letter-used");
    
    // it's a letter, let's see if it matches
    if (secretWordCharacterArray.indexOf(characterCode) != -1) {
        // if it matches, light up the letter
        $("input.letter-holder[value=" + characterCode + "]").css("background", "#8dd5bc").val(actualLetter);
        // and give it a class
        $("li[data-character-code=" + characterCode + "]").addClass("in-word");
        entryArray.push(characterCode);
        console.log("match");
    } else {
        console.log("NOT match");
        $("li[data-character-code=" + characterCode + "]").addClass("not-in-word");
    }
    
    //console.log("characterCount" + characterCount, "entryArray" + entryArray.length);
    
    // check for winner or nah
    if (characterCount === entryArray.length) {
        alert("OH SNAP YOU GUESSED THE WORD!");
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
    definition = "",
    entryArray = [];
    // and reset all stuffs
    $(".word-palette").empty();
    $("input.guess").val("");
    $(".alphabet li").removeClass();
    $(".definition").empty();
    
    $("body").fadeIn(700);
    getSecretWord();
    
}

// when the refresh button is clicked
$(".skip").click(function() {
    clearEverything();
});

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