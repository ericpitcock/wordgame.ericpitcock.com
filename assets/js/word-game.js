var secretWord = "",
    secretWordCharacterCodes = [],
    characterCount = "",
    definition = "",
    correctLetters = [],
    incorrectLetters = [],
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
        "darky", // ep additions being here
        "hooker",
        "honky",
        "coolie",
        "bastard",
        "douche",
        "penis",
        "vagina",
        "blowjob",
        "popery"
    ],
    backgroundColors = ["ee9494", "eeaa94", "eec194", "eed794", "eeee94", "c1de9d", "8fcba1", "95bcb1", "9fb2c6", "aea1c2", "b98cb9", "d390a7"];

// display intro, get and set score
if (wordGameScore === null) {
    
    scoreValue = "0";
    localStorage.setItem("word-game-score", 0);
    
    // only nag the first timers with the intro
    $(".hello-overlay").show();
    
} else {
    // set their previous score
    scoreValue = localStorage.getItem("word-game-score");
}
// display score
$(".score-value").text(scoreValue);

function initializeWordGame() {
    
    // a reusable, self-executing function to get the secret word
    var getSecretWord = (function getSecretWord() {
        $.ajax({
            async: false,
            type: "GET",
            url: "http://api.wordnik.com:80/v4/words.json/randomWord", 
            data: {
                hasDictionaryDef: true,
                //includePartOfSpeech: "noun",
                //noun
                //adjective
                //verb
                //adverb
                //interjection
                //pronoun
                //preposition
                //abbreviation
                //affix
                //article
                //auxiliary-verb
                //conjunction
                //definite-article
                //family-name
                //given-name
                //idiom
                //imperative
                //noun-plural
                //noun-posessive
                //past-participle
                //phrasal-prefix
                //proper-noun
                //proper-noun-plural
                //proper-noun-posessive
                //suffix
                //verb-intransitive
                //verb-transitive
                excludePartOfSpeech: "family-name, given-name, noun-plural, proper-noun, proper-noun-plural, proper-noun-posessive, suffix",
                minCorpusCount: 1000,
                maxCorpusCount: -1,
                minDictionaryCount: 3,
                maxDictionaryCount: -1,
                minLength: 3,
                maxLength: 7,
                api_key: "65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a"
            },
            success: function(data) {
                //console.log(data);
                secretWord = data.word.toLowerCase().replace("é", "e");
            }
        });
        return getSecretWord;
    }());
    
    // get and display definition
    var getDefinition = (function getDefinition() {
        $.ajax({
            async: false,
            type: "GET",
            url: "http://api.wordnik.com:80/v4/word.json/" + secretWord + "/definitions",
            data: {
                limit: 2,
                //partOfSpeech: "noun",
                includeRelated: false,
                //sourceDictionaries: "all",
                useCanonical: true,
                includeTags: false,
                api_key: "65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a"
            },
            success: function(data) {
                console.log(data);
                definition = data[0].text;
                if (data.length > 1) {
                    console.log(data[1].text);
                    alternateDefinition = data[1].text;
                }
            }
        });
        return getDefinition;
    }());
    
    // if the word is naughty, run it again
    if ($.inArray(secretWord, naughtyWords) > -1) {
        console.log(secretWord + " is naughty, running again");
        initializeWordGame();
    
    // if the word is in the defintion, run it again
    } else if (definition.indexOf(secretWord) != -1) {
        console.log(secretWord + " is in '" + definition + "', running again");
        initializeWordGame();
    
    // secret word contains a hypen
    } else if (secretWord.indexOf('-') != -1) {
        console.log(secretWord + " has a hypen, running again");
        initializeWordGame();
    
    // if they pass, play on
    } else {
        console.log(secretWord);
        console.log(definition);
        processSecretWord();
        
        // set background color
        var randomColor = "#" + backgroundColors[Math.floor(Math.random()*backgroundColors.length)];
        $("body").animate({ backgroundColor: randomColor }, { duration: 2000 });
    }
}

initializeWordGame();

function processSecretWord() {
    // get the character count of secret word
    characterCount = secretWord.length;
    
    // container width based on character count
    $(".word-palette").css("width", characterCount * 90 - 10);
    
    // create character code array and letter holders
    for (var index = 0; index < characterCount; index++) {
        var charCodes = secretWord.charCodeAt(index);
        secretWordCharacterCodes.push(charCodes);
        
        $(".word-palette")
            .css("width", characterCount * 90 - 10)
            .append('<input class="letter-holder" readonly type="text" value="' + secretWordCharacterCodes[index] + '" />');
    }
    
    // animate in
    $(".word-palette").addClass("animated bounceInRight");
    $(".word-palette").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
        function() {
            $(".word-palette").removeClass("animated bounceInRight");
        });
    
    // display chracter count
    $(".attempts-left").html(characterCount * 2);
    
    // display definition
    $(".definition").append("<p>" + definition + "</p>");
    
    // display alternate definition button
    if (typeof alternateDefinition != "undefined") {
    //if (alternateDefinition) {
        $(".show-alternate-definition").css("visibility", "visible");
    }
}

// when a key is pressed
$(document).keypress(function(e) {
    // get letter pressed
    var characterCode = e.which;
    
    // if it's return
    if (characterCode == 13) {
        exposeSecretWord();
        setTimeout("proceed()", 1000);    
    // if it's a-z
    } else if (characterCode >= 97 && characterCode <= 122) {
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
        // run letterMatcher
        letterMatcher($(this).data("character-code"));
    }
});

function letterMatcher(characterCode) {
    
    // if it hasn't been tried, run the shiz
    if ($.inArray(characterCode, correctLetters) == -1 && $.inArray(characterCode, incorrectLetters) == -1) {
        
        // mark the letter as used
        $("li[data-character-code=" + characterCode + "]").addClass("letter-selected");
        
        // now let's decide if it's in the secret word or not
        if (secretWordCharacterCodes.indexOf(characterCode) != -1) {
            // it's in the secret word, light up the letter
            $("input.letter-holder[value=" + characterCode + "]").val(String.fromCharCode(characterCode)).addClass("highlight");
            
            // and give it a class
            $("li[data-character-code=" + characterCode + "]").addClass("used");
            
            // if it's hinted and used, remove hint
            $("li[data-character-code=" + characterCode + "]").children("span.hint").remove();
            
            // it's there, but how many times does it occur?
            var occurrences = secretWord.split(String.fromCharCode(characterCode)).length - 1;
            // for each occurence, add it to the correctLetters
            for (var index = 0; index < occurrences; index++) {
                correctLetters.push(characterCode);
            }
            console.log(String.fromCharCode(characterCode) + " is a match, and appears " + occurrences + " time(s)");
            //console.log(correctLetters);
            
        } else {
            // it's not in the secret word
            $("li[data-character-code=" + characterCode + "]").addClass("unused");
            incorrectLetters.push(characterCode);
            console.log(String.fromCharCode(characterCode) + " is NOT a match");
            $(".word-palette").addClass("animated shake");
            $(".word-palette").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
                function() {
                $(".word-palette, .definition").removeClass("animated shake");
            });
        }
        
        // check for winner or nah
        var currentScore = 0;
        var attemptsAllowed = characterCount * 2;
        var attempts = correctLetters.length + incorrectLetters.length;
        var attemptsLeft = attemptsAllowed - attempts;
        var lettersLeft = characterCount - correctLetters.length;
        //console.log("attempts: " + attempts + " / attempts left: " + attemptsLeft + " / letters left: " + lettersLeft);
        if (correctLetters.length === characterCount) {
            console.log("YOU WIN");
            $(".word-palette").addClass("animated flash");
            $(".word-palette").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
                function() {
                $(".word-palette, .definition").removeClass("animated flash");
            });
            setTimeout("proceed()", 1300);
            
            // set the score
            if (localStorage.getItem("word-game-score")) {
                currentScore = parseInt(localStorage.getItem("word-game-score"));
            }
            var updatedScore = characterCount * 10 + attemptsLeft * 5 + currentScore;
            localStorage.setItem("word-game-score", updatedScore);
            
            $(".score-value").html(updatedScore);
            
        } else if (correctLetters.length != characterCount && lettersLeft > attemptsLeft || attempts == attemptsAllowed) {
            console.log("YOU LOSE");
            alert("YOU LOSE");
            exposeSecretWord();
            setTimeout("proceed()", 1000);
        }
        
        $(".attempts-left").html(attemptsLeft);
    
    } else {
        console.log("letter was already tried, doing nothing");
    }
    
    console.log("attempts: " + attempts + " / attempts left: " + attemptsLeft + " / letters left: " + lettersLeft);
}

// expose the secret word
function exposeSecretWord() {
    $("input.letter-holder:not(.highlight)").each(function() {
        $(this).val(String.fromCharCode($(this).val())).addClass("highlight"); 
    });
}

// clear display and start again
function proceed() {
    console.clear();
    
    // empty all variables
    secretWord = "";
    secretWordCharacterCodes = [];
    characterCount = "";
    definition = "";
    alternateDefinition = undefined;
    correctLetters = [];
    incorrectLetters = [];
    attemptsAllowed = 0;
    attempts = 0;
    attemptsLeft = 0;
    lettersLeft = 0;
    // and reset all stuffs
    $(".word-palette").addClass("animated bounceOutLeft");
    
    $(".word-palette").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
        function() {
            $(".word-palette, .definition").empty();
            
            $(".word-palette").removeClass("animated bounceOutLeft");
            initializeWordGame();
        });
    
    // remove classes from alphabet and hint
    $(".alphabet li").removeClass().children("span.hint").remove();
    
    // reenable hint button
    $(".hint").removeAttr("disabled");
}

// close the hello modal
$(".close-hello").click(function() {
    $(".hello-overlay").hide();
});

// clicking the enter icon
$(".enter-key").click(function() {
    exposeSecretWord();
    setTimeout("proceed()", 1000);
});

// hint function
$(".hint").click(function() {
    // find the unused letters
    var unusedLetters = $(secretWordCharacterCodes).not(correctLetters).get();
    // get a random one
    var randomUnusedLetter = unusedLetters[Math.floor(Math.random()*unusedLetters.length)];
    // slap the arrow above it
    $("li[data-character-code=" + randomUnusedLetter + "]").prepend('<span class="hint animated bounce">↓</span>');
    $(this).attr("disabled", "disabled");
});

// alternate definition
$(".show-alternate-definition").click(function() {
    $(this).css("visibility", "hidden");
    $(".definition p").html(alternateDefinition);
});