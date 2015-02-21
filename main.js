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
    
    console.log(secretWord, characterCount);
    
    // container width based on character count
    $(".word-palette").css("width", characterCount * 90 - 10)
    
    // create character code array and letter holders
    for (var index = 0; index < characterCount; index++) {
        var charCodes = secretWord.charCodeAt(index);
        secretWordCharacterArray.push(charCodes);
        
        $(".word-palette")
            .css("width", characterCount * 90 - 10)
            .append('<input class="letter-holder" readonly type="text" value="'+secretWordCharacterArray[index]+'" />');
    }
    
    // display chracter count
    $(".character-count").html(characterCount + " letters");

    // get and display definition
    $.ajax({
        type: "GET",
        url: "http://api.wordnik.com:80/v4/word.json/"+secretWord+"/definitions?limit=1&partOfSpeech=noun&includeRelated=false&sourceDictionaries=webster&useCanonical=true&includeTags=false&api_key=65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a",
        success: function(data) {
            console.log(data);
            definition = data[0].text;
            $(".definition").append("<p>"+definition+"</p>");
        }
    });
}

// do all types of shiz when the typing begins
$(document).keypress(function(e) {
    // get letter pressed
    var letter = e.which;
    
    // first, make sure it's a letter
    if ((letter >= 97 && letter <= 122) || letter == 127) {
        // run letterMatcher
        letterMatcher(letter);
    } else {
        // do nah
        e.preventDefault();
    }
});

function letterMatcher(letter) {
    entryArray.push(letter);
    actualLetter = String.fromCharCode(letter);
    //console.log("secretWordCharacterArray: " + secretWordCharacterArray);
    //console.log("entryArray: " + entryArray);
    
    // mark the letter as used
    $("li[data-letter="+actualLetter+"]").css("color", "#ccc");
    
    // it's a letter, let's see if it matches
    if (secretWordCharacterArray.indexOf(letter) != -1) {
        
        $("input.letter-holder[value="+letter+"]").css("background", "#8dd5bc").val(actualLetter);
        console.log("match");
    } else {
        console.log("NOT match");
        //$("body").addClass("error");
    }
}

$(".alphabet li").click(function(e) {
    // run letter select
    //console.log($(this).text() + " was clicked");
    letterMatcher($(this).text().charCodeAt(0));
})

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
    $(".alphabet li").css("color", "black");
    $(".definition").empty();
    
    $("body").fadeIn(700);
    getSecretWord();
    
}

// the refresh button
$(".skip").click(function() {
    clearEverything();
});

// enter key
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