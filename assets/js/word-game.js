//=============================================================================
// VARIABLES
//=============================================================================

var secretWord = "",
    secretWordObject = {},
    uniqueLetters = 0,
    attemptsAllowed = 0,
    attempts = 0,
    attemptedLetters = [],
    moreOccurancesThanAttempts = false,
    
    //old
    secretWordCharacterCodes = [],
    characterCount = 0,
    characterFrequency = {},
    definition = "",
    alternateDefinition = "",
    
    //correctLetters = [],
    correctLetterCount = 0,
    
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
        "darky", // ep additions begin here
        "hooker",
        "honky",
        "coolie",
        "bastard",
        "douche",
        "penis",
        "vagina",
        "blowjob",
        "popery",
        "fuck",
        "mulatto",
        "faggot"
    ],
    backgroundColors = ["#9CC0CF", "#9ABCC5", "#98B8BB", "#9AB8B4", "#9EBAB0", "#A3BDAD", "#A7BFA8", "#ABC1A4", "#B0C4A1", "#B4C69C"];

//=============================================================================
// HELPER FUNCTIONS
//=============================================================================

// count something that I forgot
function sum(obj) {
    var summ = 0;
    for(var el in obj) {
        if(obj.hasOwnProperty(el)) {
            summ += parseFloat(obj[el]);
        }
    }
    return summ;
}

// test for letters only
function isLettersOnly(str) {
    return (/^[a-z]+$/).test(str);
}

//=============================================================================
// GAME
//=============================================================================

(function() {
    var WordGame = {
        
        getSecretWord: function() {
            
            // if debug word present
            if (window.location.search) {
                
                // GOOD TEST WORDS: wattage
                debugWord = window.location.search;
                secretWord = debugWord.replace("?", "");
                WordGame.filterSecretWord();
                console.log("DEBUG: " + secretWord);
            
            } else {
            
                // get the secret word
                $.ajax({
                    //async: false,
                    type: "GET",
                    url: "http://api.wordnik.com:80/v4/words.json/randomWord", 
                    data: {
                        hasDictionaryDef: true,
                        /*includePartOfSpeech: "noun",
                        noun
                        adjective
                        verb
                        adverb
                        interjection
                        pronoun
                        preposition
                        abbreviation
                        affix
                        article
                        auxiliary-verb
                        conjunction
                        definite-article
                        family-name
                        given-name
                        idiom
                        imperative
                        noun-plural
                        noun-posessive
                        past-participle
                        phrasal-prefix
                        proper-noun
                        proper-noun-plural
                        proper-noun-posessive
                        suffix
                        verb-intransitive
                        verb-transitive*/
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
                        // FILTER WORD FOR CHARACTERS AT THIS POINT
                        // IF IT PASSES, THEN GET THE DEF
                        secretWord = data.word.toLowerCase().replace("é", "e");
                        WordGame.filterSecretWord();
                    }
                });
            
            }
        },
        
        filterSecretWord: function() {
            // secret word is naughty, run it again
            if ($.inArray(secretWord, naughtyWords) > -1) {
                
                console.log(secretWord + " is naughty, running again");
                WordGame.getSecretWord();
            
            // secret word has bad characters, run it again
            } else if (isLettersOnly(secretWord) === false) {       
                
                console.log(secretWord + " has bad characters, running again");
                WordGame.getSecretWord();
            
            // secret word is good to go, get definition
            } else {
                
                WordGame.getDefinition();
            
            }
        },
        
        getDefinition: function() {
            // get definition(s)
            $.ajax({
                //async: false,
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
                    //console.log(data);
                    definition = data[0].text;
                    if (data[1]) {
                        //console.log(data[1].text);
                        alternateDefinition = data[1].text;
                    }
                    // filter the definition
                    WordGame.filterDefinition();
                }
            });
        },
        
        filterDefinition: function() {
            
            // the word is in the defintion, run it again
            if (definition.toUpperCase().indexOf(secretWord.toUpperCase()) != -1) {
                
                console.log(secretWord + " is in '" + definition + "'(main def), running again");
                WordGame.getSecretWord();
            
            // the word is in the alternate defintion, run it again
            } else if (alternateDefinition !== "" && alternateDefinition.toUpperCase().indexOf(secretWord.toUpperCase()) != -1) {
                
                console.log(secretWord + " is in '" + alternateDefinition + "'(alt def), running again");
                WordGame.getSecretWord();
            
            // they passed, play on
            } else {
                
                // log secret word and definition(s)
                console.log("secret word: " + secretWord);
                console.log("main definition: " + definition);
                if (alternateDefinition) {
                    console.log("alt definition: " + alternateDefinition);
                } else {
                    console.log("alt definition: UNAVAILABLE");
                }
                // process the secret word
                WordGame.processSecretWord();
                
                // set background color
                var randomColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
                $("body").animate({ backgroundColor: randomColor }, { duration: 2000 });
                
                //backgroundColorsIndex = 0;
                //$("body").animate({ backgroundColor: backgroundColors[backgroundColorsIndex++ % backgroundColors.length] }, { duration: 2000 });
                
            }
        },
        
        // process the secret word into a pulp
        processSecretWord: function() {
            
            // get the character count of secret word
            characterCount = secretWord.length;
            
            // populate secret word object: {97: 2, 101: 1, 103: 1, 116: 2, 119: 1} (wattage)
            for (var index = 0; index < characterCount; index++) {
                var character = secretWord.charCodeAt(index);
                if (secretWordObject[character]) {
                   secretWordObject[character]++;
                } else {
                   secretWordObject[character] = 1;
                }
            }
        
            console.log(secretWordObject);
            
            // set attempts allowed based on keys (unique letters) in the secretWordObject
            //attemptsAllowed = characterCount * 2;
            uniqueLetters = Object.keys(secretWordObject).length;
            attemptsAllowed = uniqueLetters * 2;
            
            WordGame.renderUI();
            
        },
        
        renderUI: function() {
            
            // container width based on character count
            //$(".secret-word").css("width", characterCount * 90 - 10);
            
            // create character code array and letter holders
            for (var index = 0; index < characterCount; index++) {
                var charCodes = secretWord.charCodeAt(index);
                secretWordCharacterCodes.push(charCodes);
                
                $(".secret-word")
                    .append('<input class="letter-holder" readonly type="text" value="' + secretWordCharacterCodes[index] + '" />');
            }
            
            // animate in
            $(".secret-word").addClass("animated bounceInRight");
            $(".secret-word").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
                function() {
                    $(".secret-word").removeClass("animated bounceInRight");
                });
            
            // display attempts count
            $(".attempts-left").html(attemptsAllowed);
            
            // display definition
            $(".definition p").html(definition);
            
            // display alternate definition button
            if (alternateDefinition === "") {
                $(".show-alternate-definition").css("visibility", "hidden");
            } else {
                $(".show-alternate-definition").css("visibility", "visible");
            }
            
            // set defintion font-size based on word count - http://stackoverflow.com/questions/14885452/set-font-size-based-on-word-count-jquery
            /*$(".question p").css('font-size',function(){
                var $numWords = $(this).text().length; // get length of text for current p element
                if (($numWords >= 1) && ($numWords < 20)) {
                    return "2.2em";
                }
                else if (($numWords >= 20) && ($numWords < 60)) {
                    return "1.8em";
                }
                else if (($numWords >= 60) && ($numWords < 100)) {
                    return "1.2em";
                }
                else if (($numWords >= 100) && ($numWords < 140)) {
                    return "0.9em";
                }
                else {
                    return "0.8em";
                }           
            });*/
            
        },
        
        letterMatcher: function(characterCode, attempt) {
    
            // letter hasn't been tried, run the shiz
            if ($.inArray(characterCode, attemptedLetters) == -1) {
            
                // chalk up an attempt
                if (attempt === true) { attempts++; }
                
                // add it to attempted letters, which will need to be renamed
                attemptedLetters.push(characterCode);
                
                // letter in secret word
                if (characterCode in secretWordObject) {
                    
                    // I GUESS I DONT NEED THIS?
                    // how many times does the letter occur?
                    if (secretWordObject[characterCode] > 1) {
                        // run code for multiple occurances
                        //console.log("this letter occurs multiple times");
                    } else {
                        // run code for single occurances
                        //console.log("this letter occurs once");
                    }
                    
                    //light up the letter
                    $("input.letter-holder[value=" + characterCode + "]").val(String.fromCharCode(characterCode)).addClass("highlight");
                    
                    console.log(String.fromCharCode(characterCode) + " is a match, and appears " + secretWordObject[characterCode] + " time(s)");
                    
                    // delete the letter from the object
                    delete secretWordObject[characterCode];
                    
                    console.log(secretWordObject);
                    
                // letter is NOT in secret word  
                } else {
                    
                    console.log(String.fromCharCode(characterCode) + " is NOT a match");
                    
                    // animate shake
                    $(".secret-word").addClass("animated shake");
                    $(".secret-word").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
                        function() {
                        $(".secret-word").removeClass("animated shake");
                    });
    
                }
                
                console.log("attempted letters: " + attemptedLetters);
            
            // letter was already tried, doing nothing
            } else {
                console.log("letter was already tried, doing nothing");
            }
            
            // mark the letter as used
            $("div[data-character-code=" + characterCode + "]").addClass("letter-selected");
                
            var attemptsLeft = attemptsAllowed - attempts,
                lettersLeft = Object.keys(secretWordObject).length;
            
            // update attempts value
            $(".attempts-left").html(attemptsLeft);
            
            // determine if there's one letter left with multiple slots open
            if (Object.keys(secretWordObject).length === 1 && lettersLeft > 1 && attemptsLeft === 1) {
                // set a flag that the last letter occurs twice
                console.log("the last letter occurs more than once and this is the last attempt");
                moreOccurancesThanAttempts = true;
            }
            
            // need to set a flag if any remaining letters occur more than once.
            
            // check for winner or nah and score
            // WIN
            if ($.isEmptyObject(secretWordObject)) {
                
                // animate and proceed
                $(".secret-word").addClass("animated flash");
                $(".secret-word").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
                    function() {
                    $(".secret-word").removeClass("animated flash");
                });
                WordGame.proceed();
                
                // get current score
                var currentScore;
                // if a score exists in local storage, use it
                if (localStorage.getItem("word-game-score")) {
                    currentScore = parseInt(localStorage.getItem("word-game-score"));
                } else {
                    currentScore = 0;
                }
                
                // determine new score
                var updatedScore;
                // if the freebie was used, don't add bonus points
                if ($(".freebie-button").is("[disabled=disabled]")) {
                    updatedScore = characterCount * 10 + attemptsLeft * 5 + currentScore;
                // if the freebie wasn't used, add 5 boner points
                } else if (!$(".freebie-button").is("[disabled=disabled]")) {
                    updatedScore = characterCount * 10 + attemptsLeft * 5 + 5 + currentScore;
                }
                
                // store score value
                localStorage.setItem("word-game-score", updatedScore);
                
                // update score display
                $(".score-value").html(updatedScore);
                
                console.log("YOU WIN");
            
            // LOSE
            //moreOccurancesThanAttempts = true
            } else if (moreOccurancesThanAttempts === false && lettersLeft > attemptsLeft || attempts == attemptsAllowed) {
                
                WordGame.exposeSecretWord();
                WordGame.proceed();
                
                console.log("YOU LOSE");
                alert("YOU LOSE");
                
            }
                
            // log a bunch of shit
            console.log("attempts: " + attempts + " / attempts left: " + attemptsLeft + " / unique letters left: " + lettersLeft);
        },
        
        exposeSecretWord: function() {
            $("input.letter-holder:not(.highlight)").each(function() {
                $(this).val(String.fromCharCode($(this).val())).addClass("highlight"); 
            });
        },
        
        proceed: function() {
            setTimeout(function() {
                console.clear();
                
                // empty all variables
                secretWord = "";
                secretWordCharacterCodes = [];
                characterCount = 0;
                definition = "";
                alternateDefinition = "";
                correctLetters = [];
                correctLetterCount = 0;
                attemptedLetters = [];
                attemptsAllowed = 0;
                attempts = 0;
                attemptsLeft = 0;
                lettersLeft = 0;
                moreOccurancesThanAttempts = false;
                secretWordObject = {};
                
                // animate out
                $(".secret-word").addClass("animated bounceOutLeft");
                
                // empty and reload
                $(".secret-word").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
                    function() {
                        $(".secret-word, .definition p").empty();
                        $(".secret-word").removeClass("animated bounceOutLeft");
                        WordGame.getSecretWord();
                    });
                
                // remove classes from letters
                $(".keys div").removeClass().removeAttr("class");
                
                // reenable freebie button
                $(".freebie-button").removeAttr("disabled");
            }, 1000);
        }
    };
    
    WordGame.getSecretWord();
    
    //=============================================================================
    // ALL THE OTHER SHIZ
    //=============================================================================
    
    // fast button action
    $(function() {
        FastClick.attach(document.body);
    });
    
    // prevent native scrolling
    document.body.addEventListener("touchmove", function(e) {
        e.preventDefault();
    }, false);
    
    // determine score
    if (wordGameScore === null) {
        
        scoreValue = "0";
        localStorage.setItem("word-game-score", 0);
        
        // only nag the first timers with the intro
        //$(".hello-overlay").show();
        
    } else {
        // set their previous score
        scoreValue = localStorage.getItem("word-game-score");
    }
    
    // display score
    $(".score-value").text(scoreValue);
    
    // click the enter icon
    $(".skip-button").click(function() {
        WordGame.exposeSecretWord();
        WordGame.proceed();
    });
    
    // freebie function
    $(".freebie-button").click(function() {
        // find the unused letters
        var unusedLetters = Object.keys(secretWordObject);
        
        // get a random one
        var randomUnusedLetter = unusedLetters[Math.floor(Math.random() * unusedLetters.length)];
        
        // show freebie
        WordGame.letterMatcher(randomUnusedLetter, false);
        
        // disable freebie button
        $(this).attr("disabled", "disabled");
    });
    
    // alternate definition
    /*$(".show-alternate-definition").click(function() {
        $(this).html($(this).text() == "ALTERNATE DEFINITION" ? "MAIN DEFINITION" : "ALTERNATE DEFINITION");
        $(".definition p").html(alternateDefinition);
    });*/
    
    
    // when a key is pressed
    $(document).keypress(function(e) {
        // get letter pressed
        var characterCode = e.which;
        
        // if it's return
        if (characterCode == 13) {
            WordGame.exposeSecretWord();
            WordGame.proceed();   
        // if it's a-z
        } else if (characterCode >= 97 && characterCode <= 122) {
            // run letterMatcher
            WordGame.letterMatcher(characterCode, true);
        } else {
            // do nah
            e.preventDefault();
        }
    });
    
    // when a letter is clicked
    $(".keys div").click(function(e) {
        // if it's aleady been used, do nah
        if ($(this).hasClass("letter-selected") ) {
            e.preventDefault();
        } else {
            // run letterMatcher
            WordGame.letterMatcher($(this).data("character-code"), true);
        }
    });

})();