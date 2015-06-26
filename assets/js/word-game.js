//=============================================================================
// VARIABLES
//=============================================================================

var alertSound = new Audio('bleep.wav'),
    timeout = 0,
    secretWord = '',
    characterCount = 0,
    secretWordCharacterCodes = [],
    secretWordObject = {},
    uniqueLetters = 0,
    definition = '',
    alternateDefinition = '',
    attemptsAllowed = 0,
    attempts = 0,
    attemptedLetters = [],
    storedScore = localStorage.getItem('word-game-score'),
    naughtyWords = [
        'skank',
        'wetback',
        'bitch',
        'cunt',
        'dick',
        'douchebag',
        'dyke',
        'fag',
        'nigger',
        'tranny',
        'trannies',
        'paki',
        'pussy',
        'retard',
        'slut',
        'titt',
        'tits',
        'wop',
        'whore',
        'chink',
        'fatass',
        'shemale',
        'daygo',
        'dego',
        'dago',
        'gook',
        'kike',
        'kraut',
        'spic',
        'twat',
        'lesbo',
        'homo',
        'fatso',
        'lardass',
        'jap',
        'biatch',
        'tard',
        'gimp',
        'gyp',
        'chinaman',
        'chinamen',
        'golliwog',
        'crip',
        'raghead',
        'negro',
        'darky', // ep additions begin here
        'hooker',
        'honky',
        'coolie',
        'bastard',
        'douche',
        'penis',
        'vagina',
        'blowjob',
        'popery',
        'fuck',
        'mulatto',
        'faggot'
    ];

//=============================================================================
// HELPER FUNCTIONS
//=============================================================================

// test for letters only
function isLettersOnly(str) {
    return (/^[a-z]+$/).test(str);
}

var mobileKeys = false;
var desktopKeys = false;

// keys magic
var renderKeys = (function renderKeys() {
    
    var keysContainer = $('.keys');
    
    // sort function
    function keySort(order) {
        
        keysContainer.find('div').sort(function(a, b) {
            return +a.getAttribute(order) - +b.getAttribute(order);
        })
        .appendTo(keysContainer);
    }
    
    if (Modernizr.mq('(max-width: 768px)')) {
       
        if (desktopKeys === true) {
            
            keySort('data-qwerty-order');
            
            //if ($('.keys').not(':has(span)')) 
            if ($('div[data-qwerty-order="10"] > span.break').length === 0) {
                $('div[data-qwerty-order="10"], div[data-qwerty-order="19"]').after('<span class="break"></span>');
            }
            
            if (desktopKeys === true) {
                $('.freebie-button').insertBefore('div[data-qwerty-order="20"]');
                $('.skip-button').insertAfter('div[data-qwerty-order="26"]');
            }
            
            mobileKeys = true;
            desktopKeys = false;
        
        }
        
    } else if (Modernizr.mq('(min-width: 769px)')) {
        if (desktopKeys === false) {
            keySort('data-character-code');
            // remove break spans
            keysContainer.find('span.break').remove();
            
            $('.freebie-button').appendTo('.keys');
            $('.skip-button').appendTo('.keys');
        }
        mobileKeys = false;
        desktopKeys = true;
    }
    return renderKeys;
}());

//resize mobile keys
var resizeMobileKeys = (function resizeMobileKeys() {
    $('.keys div:not(.special)').each(function() { 
        $(this).css({'line-height': $(this).height() + 'px'});
    });
    return resizeMobileKeys;
}());

// call again after window resize
$(window).resize(function() {
    renderKeys();
    resizeMobileKeys();
});

//=============================================================================
// GAME
//=============================================================================

(function() {
    var WordGame = {
        
        settings: {
            sound: false,
        },
        
        initialize: function() {
            // is there a stored score to display?
            // if no, setup local storage at 0
            if (storedScore === null) {
                
                scoreValue = '0';
                localStorage.setItem('word-game-score', 0);
            
            // if yes, set their previous score  
            } else {
                scoreValue = localStorage.getItem('word-game-score');
            }
            
            // display score
            $('.score-value').text(scoreValue);
            
            WordGame.getSecretWord();
        },
        
        getSecretWord: function() {
            
            // if debug word present
            if (window.location.search) {
                
                // GOOD TEST WORDS: wattage
                debugWord = window.location.search;
                secretWord = debugWord.replace('?', '');
                WordGame.filterSecretWord();
                console.log('DEBUG: ' + secretWord);
            
            } else {
                
                // get the secret word
                $.ajax({
                    //async: false,
                    type: 'GET',
                    url: 'http://api.wordnik.com:80/v4/words.json/randomWord', 
                    data: {
                        hasDictionaryDef: true,
                        /*includePartOfSpeech: 'noun',
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
                        excludePartOfSpeech: 'family-name, given-name, noun-plural, proper-noun, proper-noun-plural, proper-noun-posessive, suffix',
                        minCorpusCount: 2000,
                        maxCorpusCount: -1,
                        minDictionaryCount: 3,
                        maxDictionaryCount: -1,
                        minLength: 3,
                        maxLength: 7,
                        api_key: '65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a'
                    },
                    success: function(data) {
                        if (data.word === undefined) {
                            WordGame.getSecretWord();
                        } else {
                            secretWord = data.word;
                            WordGame.filterSecretWord();
                        }
                    }
                });
            }
        },
        
        filterSecretWord: function() {
            // secret word is naughty, run it again
            if ($.inArray(secretWord, naughtyWords) > -1) {
                
                console.log(secretWord + ' is naughty, running again');
                WordGame.getSecretWord();
            
            // secret word has bad characters, run it again
            } else if (isLettersOnly(secretWord) === false) {       
                
                console.log(secretWord + ' has bad characters, running again');
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
                type: 'GET',
                url: 'http://api.wordnik.com:80/v4/word.json/' + secretWord + '/definitions',
                data: {
                    limit: 2,
                    //partOfSpeech: 'noun',
                    includeRelated: false,
                    //sourceDictionaries: 'all',
                    useCanonical: true,
                    includeTags: false,
                    api_key: '65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a'
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
                
                console.log(secretWord + ' is in ' + definition + ' (main def), running again');
                WordGame.getSecretWord();
            
            // the word is in the alternate defintion, run it again
            } else if (alternateDefinition !== '' && alternateDefinition.toUpperCase().indexOf(secretWord.toUpperCase()) != -1) {
                
                console.log(secretWord + ' is in ' + alternateDefinition + '(alt def), running again');
                WordGame.getSecretWord();
            
            // they passed, play on
            } else {
                
                // log secret word and definition(s)
                console.log('secret word: ' + secretWord);
                console.log('main definition: ' + definition);
                if (alternateDefinition) {
                    console.log('alt definition: ' + alternateDefinition);
                } else {
                    console.log('alt definition: UNAVAILABLE');
                }
                // process the secret word
                WordGame.processSecretWord();
                
            }
        },
        
        // process the secret word in to a pulp
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
            uniqueLetters = Object.keys(secretWordObject).length;
            attemptsAllowed = uniqueLetters * 2;
            
            WordGame.renderUI();
            
        },
        
        renderUI: function() {
            
            // create character code array and letter holders
            for (var index = 0; index < characterCount; index++) {
                var charCodes = secretWord.charCodeAt(index);
                secretWordCharacterCodes.push(charCodes);
                
                $('.secret-word').append('<input class="letter-holder" readonly type="text" value="' + secretWordCharacterCodes[index] + '" />');
            }
            
            // animate in
            $('.secret-word').addClass('animated bounceInRight');
            $('.secret-word').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                function() {
                    $('.secret-word').removeClass('animated bounceInRight');
                });
            
            // display attempts count
            $('.attempts-left').html(attemptsAllowed);
            
            // display definition
            $('.definition p').html(definition);
            
            // display alternate definition button
            if (alternateDefinition === '') {
                $('.show-alternate-definition').css('visibility', 'hidden');
            } else {
                $('.show-alternate-definition').css('visibility', 'visible');
            }
        },
        
        letterMatcher: function(characterCode, attempt) {
    
            // if letter hasn't been tried, run the shiz
            if ($.inArray(characterCode, attemptedLetters) == -1) {
            
                // chalk up an attempt
                if (attempt === true) { attempts++; }
                
                // add it to attempted letters array
                attemptedLetters.push(characterCode);
                
                // display the letter as used
                $('div[data-character-code="' + characterCode + '"]').addClass('letter-selected');
                    
                // calculate attempts left and letters left
                var attemptsLeft = attemptsAllowed - attempts,
                    lettersLeft = Object.keys(secretWordObject).length;
                
                // update attempts left value
                $('.attempts-left').html(attemptsLeft);
                
                // if letter's in secret word
                if (characterCode in secretWordObject) {
                    
                    // display the letter
                    $('input.letter-holder[value="' + characterCode + '"]').val(String.fromCharCode(characterCode)).addClass('highlight');
                    
                    console.log(String.fromCharCode(characterCode) + ' is a match, and appears ' + secretWordObject[characterCode] + ' time(s)');
                    
                    // delete the letter from the object
                    delete secretWordObject[characterCode];
                    
                    // if the secretWordObject is now empty, that's a win!
                    if ($.isEmptyObject(secretWordObject)) {
                        
                        // animate
                        $('.secret-word').addClass('animated flash');
                        $('.secret-word').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                            function() {
                            $('.secret-word').removeClass('animated flash');
                        });
                        
                        // was it dude perfect?
                        if (attempts == uniqueLetters) {
                            console.log('DUDE PERFECT!');
                        }
                        
                        // get current score
                        var currentScore;
                        // if a score exists in local storage, use it
                        if (storedScore) {
                            currentScore = parseInt(storedScore);
                        } else {
                            currentScore = 0;
                        }
                        
                        // determine new score
                        var updatedScore;
                        // if the freebie was used, don't add bonus points
                        if ($('.freebie-button').is('[disabled=disabled]')) {
                            updatedScore = characterCount * 10 + attemptsLeft * 5 + currentScore;
                        // if the freebie wasn't used, add 5 boner points
                        } else if (!$('.freebie-button').is('[disabled=disabled]')) {
                            updatedScore = characterCount * 10 + attemptsLeft * 5 + 5 + currentScore;
                        }
                        
                        // store score value
                        localStorage.setItem('word-game-score', updatedScore);
                        
                        // update score display
                        //$('.score-value').html(updatedScore);
                        $('.score-value').animateNumbers(updatedScore, false, 2000, 'linear');
                        
                        WordGame.proceed();
                        
                        console.log('YOU WIN');
                    } else if (!$.isEmptyObject(secretWordObject) && this.settings.sound === true) {
                        // just play sound if sound setting is on
                        alertSound.play();
                    }
                    
                    console.log(secretWordObject);
                    
                // letter is NOT in secret word  
                } else {
                    
                    console.log(String.fromCharCode(characterCode) + ' is NOT a match');
                    
                    // animate shake
                    $('.secret-word').addClass('animated shake');
                    $('.secret-word').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                        function() {
                        $('.secret-word').removeClass('animated shake');
                    });
                    
                    // did ya lose?
                    if (lettersLeft > attemptsLeft || attempts == attemptsAllowed) {
                        
                        WordGame.exposeSecretWord();
                        WordGame.proceed();
                        
                        console.log('YOU LOSE');
                    }
                }
                
                // log a bunch of shit
                console.log('attempted letters: ' + attemptedLetters);
                console.log('attempts: ' + attempts + ' / attempts left: ' + attemptsLeft + ' / unique letters left: ' + lettersLeft);
            
            // letter was already tried, doing nothing
            } else {
                console.log('letter was already tried, doing nothing');
            }
                
            
        },
        
        exposeSecretWord: function() {
            $('input.letter-holder:not(.highlight)').each(function() {
                $(this).val(String.fromCharCode($(this).val())).addClass('highlight'); 
            });
        },
        
        proceed: function() {
            setTimeout(function() {
                console.clear();
                
                secretWord = '';
                characterCount = 0;
                secretWordCharacterCodes = [];
                secretWordObject = {};
                uniqueLetters = 0;
                definition = '';
                alternateDefinition = '';
                attemptsAllowed = 0;
                attempts = 0;
                attemptedLetters = [];
                attemptsLeft = 0;
                lettersLeft = 0;

                // animate out
                $('.secret-word').addClass('animated bounceOutLeft');
                
                // empty and reload
                $('.secret-word').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                    function() {
                        $('.secret-word, .definition p').empty();
                        $('.secret-word').removeClass('animated bounceOutLeft');
                        WordGame.getSecretWord();
                    });
                
                // remove classes from letters
                $('.keys div.letter-selected').removeClass('letter-selected');
                $('.keys div.letter-selected:not(.special)').removeAttr('class');
                
                // reenable freebie button
                //$('.freebie-button').removeAttr('disabled');
            }, 1000);
        }
    };
    
    WordGame.initialize();
    
    //=============================================================================
    // ALL THE OTHER SHIZ
    //=============================================================================
    
    // fast button action
    $(function() {
        FastClick.attach(document.body);
    });
    
    // prevent native scrolling
    document.body.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, false);
    
    // click the enter icon
    $('.skip-button').click(function() {
        WordGame.exposeSecretWord();
        WordGame.proceed();
    });
    
    // freebie function
    $('.freebie-button').click(function() {
        if ($(this).hasClass('letter-selected')) {
            return;
        } else {
            // find the unused letters
            var unusedLetters = Object.keys(secretWordObject);
            
            // get a random one
            var randomUnusedLetter = unusedLetters[Math.floor(Math.random() * unusedLetters.length)];
            
            // show freebie
            WordGame.letterMatcher(randomUnusedLetter, false);
            
            // disable freebie button
            $(this).addClass('letter-selected');
        }
    });
    
    // alternate definition
    /*$('.show-alternate-definition').click(function() {
        $(this).html($(this).text() == 'ALTERNATE DEFINITION' ? 'MAIN DEFINITION' : 'ALTERNATE DEFINITION');
        $('.definition p').html(alternateDefinition);
    });*/
    
    // when a key is pressed
    $(document).keypress(function(e) {
        clearTimeout(timeout);
        timeout = setTimeout(keyPressed, 100);
        
        function keyPressed() {
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
        }
    });
    
    // when a letter is clicked
    $('.keys div:not(.special)').click(function(e) {
        // if it's aleady been used, do nah
        if ($(this).hasClass('letter-selected') ) {
            e.preventDefault();
        } else {
            // run letterMatcher
            WordGame.letterMatcher($(this).data('character-code'), true);
        }
    });
    
    // sound control
    $('input[name=sound]:radio').change(function () {
        if (this.value == 'on') {
            WordGame.settings.sound = true;
        } else if (this.value == 'off') {
            WordGame.settings.sound = false;
        }
    });

})();