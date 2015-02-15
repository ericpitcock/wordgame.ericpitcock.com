// get secret word
$.ajax({
    type: "GET",
    url: "http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=10&api_key=65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a",
    success: function(data) {
        runGuessTheWord(data);
    } 
});

// run guess the word
function runGuessTheWord(data) {
    // clean the secret word
    var secretWord = data.word.replace(/[^a-zA-Z 0-9]+/g, "");
    console.log(secretWord);
    
    // get character count of secret word
    var characterCount = secretWord.length;
    //console.log(characterCount);
    
    // output letter boxes
    for (var i = 0; i < characterCount; i++) {
        $(".word-palette")
                          .css("width", characterCount * 90 - 10)
                          .append('<div class="letter-box"><input type="text" /></div>');
    }
    
    $("input.guess").attr("placeholder", characterCount + " characters");
    //$("h3").append(secretWord);
    
    var letterArray = [];
    
    $("input").keydown(function(e) {
        var letter = e.which;
        //console.log(e.which);
        
        // allow only letters
        if ((letter >= 58 && letter <= 90) || letter == 8) {
            console.log("a letter or delete!");
        } else {
            e.preventDefault();
        }
        
        if (secretWord.indexOf(e.keyCode) > -1 ) {
            // if match, put it in the array
            //letterArray.push(this.value);
            console.log("match");
        }
    });

}