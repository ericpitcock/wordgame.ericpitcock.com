var secretWord = "";
var characterCount = "";

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
    secretWord = data.word;
    characterCount = secretWord.length;
    console.log(secretWord, characterCount);

    // output letter boxes
    for (var i = 0; i < characterCount; i++) {
        $(".word-palette")
            .css("width", characterCount * 90 - 10)
            .append('<div class="letter-box"><input type="text" /></div>');
    }
    
    //fill in placeholder shiz
    $("input.guess").attr("placeholder", characterCount + " characters");
    //$("h3").append(secretWord);
}

var letterArray = [];
        
$("input").keydown(function(e) {
    var letter = e.which;
    //console.log(e.which);
    
    letterArray.push(e.which);
    console.log(letterArray);
    
    //var secretWordArray = secretWord.split('');
    console.log(secretWord);
    
    // allow only letters
    if ((letter >= 58 && letter <= 90) || letter == 8) {
        //console.log("a letter or delete!");
        
        // it's a letter, let's see if it matches
        if (secretWord.indexOf(letterArray) > -1 ) {
            // if match, put it in the array
            //letterArray.push(this.value);
            console.log("match");
        }
    
    } else {
        e.preventDefault();
    }
});

// the refresh button
$(".refresh").click(function() {
    console.clear();
    $(".word-palette").empty();
    getSecretWord();
});