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
        "douche"
    ],
    backgroundColors = ["ee9494", "eeaa94", "eec194", "eed794", "eeee94", "c1de9d", "8fcba1", "95bcb1", "9fb2c6", "aea1c2", "b98cb9", "d390a7"];

// set score
if (wordGameScore === null) {
    scoreValue = "0";
} else {
    scoreValue = localStorage.getItem("word-game-score");
}
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
                console.log(data);
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
                limit: 1,
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
            }
        });
        return getDefinition;
    }());
    
    // filter out naughty words and words with definitions that contain the word
    if ($.inArray(secretWord, naughtyWords) > -1) {
        console.log(secretWord + " is naughty, running again");
        initializeWordGame();
    } else if (definition.indexOf(secretWord) != -1) {
        console.log(secretWord + " is in '" + definition + "' running again");
        initializeWordGame();
    } else {
        console.log(secretWord);
        console.log(definition);
        processSecretWord();
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
    
    // display chracter count
    $(".character-count").html(characterCount + " letters");
    $(".attempts-left").html(characterCount * 2);
    // display definition
    $(".definition").append("<p>" + definition + "</p>");
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
        }
        
        // check attempts
        if (correctLetters.length + incorrectLetters.length == characterCount * 2) {
            alert("You lose, ya bish");
            proceed();
        }
        
        // check for winner or nah
        if (correctLetters.length === characterCount) {
            
            setTimeout("proceed()", 1000);
            
            // add points
            $(".score-value").html(function(i, v) { return +v + 10; });
            // store points
            if (localStorage.getItem("word-game-score") === null) {
                localStorage.setItem("word-game-score", 10);
            } else {
                //var currentScore = localStorage.getItem("word-game-score");
                var updatedScore = parseInt(localStorage.getItem("word-game-score")) + 10;
                localStorage.setItem("word-game-score", updatedScore);
            }
        }
        
        $(".attempts-left").html(function(i, v) { return +v-1 });
    
    } else {
        console.log("letter was already tried");
    }
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
    correctLetters = [];
    incorrectLetters = [];
    // and reset all stuffs
    $(".word-palette").addClass("animated bounceOutLeft");
    
    $(".word-palette").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
        function() {
            $(".word-palette, .definition").empty();
            
            //var randomColor = '#'+ Math.random(backgroundColors);
            var randomColor = "#" + backgroundColors[Math.floor(Math.random()*backgroundColors.length)];
            $("body").animate({ backgroundColor: randomColor }, { duration: 2000 });
            
            $(".word-palette").removeClass("bounceOutLeft").addClass("bounceInRight");
            initializeWordGame();
        });
    
    $(".alphabet li").removeClass();
}
