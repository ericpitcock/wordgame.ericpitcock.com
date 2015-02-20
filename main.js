var secretWord = "",
    secretWordCharacterArray = [],
    characterCount = "",
    entryArray = [];

// a reusable, self-executing function to get the secret word
var getSecretWord = (function getSecretWord() {
    $.ajax({
        type: "GET",
        //url: "http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=10&api_key=65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a",
        url: "http://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=1000&maxCorpusCount=-1&minDictionaryCount=3&maxDictionaryCount=-1&minLength=5&maxLength=10&api_key=65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a",
        success: function(data) {
            processSecretWord(data);
        }
    });
    return getSecretWord;
}());

function processSecretWord(data) {
    secretWord = data.word.toLowerCase();
    characterCount = secretWord.length;
    //secretWordCharacterArray = secretWord.split('');
    
    console.log(secretWord, characterCount);
    
    // make thing as wide as the word
    $(".word-palette").css("width", characterCount * 90 - 10)
    
    //var index;
    //var a = ["a", "b", "c"];
    /*
    for (index = 0; index < secretWordCharacterArray.length; ++index) {
        //entryArray.push(secretWordCharacterArray[index]);
        //console.log(entryArray);
        //$(".word-palette").append('<input class="letter-box">');
        $(".word-palette").append('<input class="letter-box" />');
    }
    */
    
    // for each character in the secret word, do shiz
    for (var index = 0; index < characterCount; index++) {
        // display the boxes
        $(".word-palette").append('<input class="letter-box" />');
        
        // create key code array
        var charCodes = secretWord.charCodeAt(index);
        secretWordCharacterArray.push(charCodes);
    }
    
    // output letter boxes
    /*for (var i = 0; i < characterCount; i++) {
        $(".word-palette")
            .css("width", characterCount * 90 - 10)
            .append('<div class="letter-box"><input type="text" /></div>');
    }*/
    
    //fill in placeholder shiz
    $("input.guess").attr("placeholder", characterCount + " characters");
}

// do all types of shiz when the typing begins
$("input.guess").keypress(function(e) {
    var letter = e.which;
    //console.log(e);
    //var secretWordArray = secretWord.split('');
    //console.log(secretWord);
    
    // if it's a letter, do some shit
    if ((letter >= 97 && letter <= 122) || letter == 127) {
        //console.log("a letter or delete!");
        entryArray.push(letter);
        console.log("secretWordCharacterArray: " + secretWordCharacterArray);
        console.log("entryArray: " + entryArray);
        
        // it's a letter, let's see if it matches
        if (entryArray.indexOf(secretWordCharacterArray)) {
            // if match, put it in the array
            //entryArray.push(this.value);
            console.log("match");
        }
    } else {
        e.preventDefault();
    }
    
    //console.log(entryArray);
    
});

// the refresh button
$(".refresh").click(function() {
    console.clear();
    // empty all arrays
    secretWord = "";
    secretWordCharacterArray = [];
    characterCount = "";
    entryArray = [];
    
    $(".word-palette").empty();
    $("input.guess").val("");
    getSecretWord();
});