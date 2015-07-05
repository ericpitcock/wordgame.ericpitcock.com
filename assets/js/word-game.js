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
    
    if (Modernizr.mq('(max-width: 767px)')) {
       
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
        
    } else if (Modernizr.mq('(min-width: 768px)')) {
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
/*
var resizeMobileKeys = (function resizeMobileKeys() {
    $('.keys div:not(.special)').each(function() { 
        $(this).css({'line-height': $(this).height() + 'px'});
    });
    return resizeMobileKeys;
}());
*/

// call again after window resize
$(window).resize(function() {
    renderKeys();
    //resizeMobileKeys();
});

//=============================================================================
// GAME
//=============================================================================

(function() {
    var WordGame = {

        alertSound: new Audio('bleep.wav'),
        timeout: 0,
        secretWord: '',
        characterCount: 0,
        secretWordCharacterCodes: [],
        secretWordObject: {},
        uniqueLetters: 0,
        definition: '',
        //alternateDefinition: '',
        attemptsAllowed: 0,
        attempts: 0,
        attemptedLetters: [],
        attemptsLeft: 0,
        lettersLeft: 0,
        storedScore: window.localStorage.getItem('word-game-score'),
        naughtyWords: [
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
            'faggot',
            'jew'
        ],
        
        settings: {
            sound: false,
        },
        
        animate: function(animation) {
            //second = second || false;
            $('.secret-word').addClass('animated ' + animation);
            $('.secret-word').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                function() {
                    $('.secret-word').removeClass('animated ' + animation);
            });
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
            if ($.inArray(secretWord, this.naughtyWords) > -1) {
                
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
                    /*if (data[1]) {
                        //console.log(data[1].text);
                        this.alternateDefinition = data[1].text;
                    }*/
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
            
            /* the word is in the alternate defintion, run it again
            } else if (this.alternateDefinition !== '' && this.alternateDefinition.toUpperCase().indexOf(secretWord.toUpperCase()) != -1) {
                
                console.log(secretWord + ' is in ' + this.alternateDefinition + '(alt def), running again');
                WordGame.getSecretWord();
            */
            
            // they passed, play on
            } else {
                
                // log secret word and definition(s)
                console.log('secret word: ' + secretWord);
                console.log('main definition: ' + definition);
                /*if (this.alternateDefinition) {
                    console.log('alt definition: ' + this.alternateDefinition);
                } else {
                    console.log('alt definition: UNAVAILABLE');
                }*/
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
                if (this.secretWordObject[character]) {
                   this.secretWordObject[character]++;
                } else {
                   this.secretWordObject[character] = 1;
                }
            }
        
            console.log(this.secretWordObject);
            
            // set attempts allowed based on keys (unique letters) in the secretWordObject
            uniqueLetters = Object.keys(this.secretWordObject).length;
            attemptsAllowed = uniqueLetters * 2;
            
            WordGame.renderUI();
            
        },
        
        renderUI: function() {
            
            // create character code array and letter holders
            for (var index = 0; index < characterCount; index++) {
                var charCodes = secretWord.charCodeAt(index);
                this.secretWordCharacterCodes.push(charCodes);
                
                $('.secret-word').append('<input class="letter-holder" readonly type="text" value="' + this.secretWordCharacterCodes[index] + '" />');
            }
            
            // animate in
            /*$('.secret-word').addClass('animated bounceInRight');
            $('.secret-word').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                function() {
                    $('.secret-word').removeClass('animated bounceInRight');
                });*/
                
            WordGame.animate('bounceInRight');
            
            // display attempts count
            $('.attempts-left').html(attemptsAllowed);
            
            // display definition
            $('.definition p').html(definition);
            
            // determine score
            var scoreValue;
            if (window.localStorage.getItem('word-game-score') === null) {
                
                scoreValue = "0";
                window.localStorage.setItem("word-game-score", 0);
                
            } else {
                // set their previous score
                scoreValue = window.localStorage.getItem('word-game-score');
            }
            
            // display score
            $(".score-value").text(scoreValue);
            
            /* display alternate definition button
            if (this.alternateDefinition === '') {
                $('.show-alternate-definition').css('visibility', 'hidden');
            } else {
                $('.show-alternate-definition').css('visibility', 'visible');
            }*/
        },
        
        handleInput: function(characterCode, attempt) {
    
            // if letter hasn't been tried, run the shiz
            if ($.inArray(characterCode, this.attemptedLetters) == -1) {
            
                // chalk up an attempt
                if (attempt === true) { this.attempts++; }
                
                // add it to attempted letters array
                this.attemptedLetters.push(characterCode);
                
                // display the letter as used
                $('div[data-character-code="' + characterCode + '"]').addClass('letter-selected');
                    
                // calculate attempts left and letters left
                var attemptsLeft = attemptsAllowed - this.attempts,
                    lettersLeft = Object.keys(this.secretWordObject).length;
                
                // update attempts left value
                $('.attempts-left').html(attemptsLeft);
                
                // if letter's in secret word
                if (characterCode in this.secretWordObject) {
                    
                    // display the letter
                    $('input.letter-holder[value="' + characterCode + '"]').val(String.fromCharCode(characterCode)).addClass('highlight');
                    
                    console.log(String.fromCharCode(characterCode) + ' is a match, and appears ' + this.secretWordObject[characterCode] + ' time(s)');
                    
                    // delete the letter from the object
                    delete this.secretWordObject[characterCode];
                    
                    // if the secretWordObject is now empty, that's a win!
                    if ($.isEmptyObject(this.secretWordObject)) {
                        
                        console.log('YOU WIN');
                        
                        // animate
                        WordGame.animate('flash');
                        
                        // was it dude perfect?
                        if (this.attempts == uniqueLetters) {
                            console.log('DUDE PERFECT!');
                        }
                        
                        // get current score
                        var currentScore = parseInt(window.localStorage.getItem('word-game-score')) || 0;
                        
                        // determine new score
                        var updatedScore;
                        // if the freebie was used, don't add bonus points
                        if ($('.freebie-button').hasClass('letter-selected')) {
                            updatedScore = characterCount * 10 + attemptsLeft * 5 + currentScore;
                        // if the freebie wasn't used, add 5 boner points
                        } else {
                            updatedScore = characterCount * 10 + attemptsLeft * 5 + 5 + currentScore;
                        }
                        
                        // store new value
                        localStorage.setItem('word-game-score', updatedScore);
                        
                        // animate score update
                        //$('.score-value').animateNumbers(updatedScore, false, 2000, 'linear');
                        $('.score-value').prop('number', currentScore).animateNumber({ number: updatedScore });
                        
                        // play on
                        WordGame.proceed('win');
                        
                    } else if (!$.isEmptyObject(this.secretWordObject) && this.settings.sound === true) {
                        // just play sound if sound setting is on
                        this.alertSound.play();
                    }
                    
                    console.log(this.secretWordObject);
                    
                // letter is NOT in secret word  
                } else {
                    
                    console.log(String.fromCharCode(characterCode) + ' is NOT a match');
                    
                    WordGame.animate('shake');
                    
                    // did ya lose?
                    if (lettersLeft > attemptsLeft || this.attempts == attemptsAllowed) {
                        
                        console.log('YOU LOSE');
                        WordGame.proceed('lose');
                        
                    }
                }
                
                // log a bunch of shit
                console.log('attempted letters: ' + this.attemptedLetters);
                console.log('attempts: ' + this.attempts + ' / attempts left: ' + attemptsLeft + ' / unique letters left: ' + lettersLeft);
            
            // letter was already tried, doing nothing
            } else {
                console.log('letter was already tried, doing nothing');
            }
        },
        
        proceed: function(type) {
            
            if (type != 'win') {
                // expose secret word for losers and skippers
                $('input.letter-holder:not(.highlight)').each(function() {
                    $(this).val(String.fromCharCode($(this).val())).addClass('highlight'); 
                });
            }
            
            setTimeout(function() {
                console.clear();
                
                // animate out
                $('.secret-word').addClass('animated bounceOutLeft');
                
                // reset everything after animation completes
                $('.secret-word').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                    function() {
                        // remove animation classes
                        $('.secret-word').removeClass('animated bounceOutLeft');
                        
                        // empty secret word and definition
                        $('.secret-word, .definition p').empty();
                        
                        // remove letter-selected class from buttons
                        $('.keys div.alpha, .freebie-button').removeClass('letter-selected');
                        
                        // reset game properties
                        WordGame.secretWord = '';
                        WordGame.characterCount = 0;
                        WordGame.secretWordCharacterCodes = [];
                        WordGame.secretWordObject = {};
                        WordGame.uniqueLetters = 0;
                        WordGame.definition = '';
                        //WordGame.alternateDefinition = '';
                        WordGame.attemptsAllowed = 0;
                        WordGame.attempts = 0;
                        WordGame.attemptedLetters = [];
                        WordGame.attemptsLeft = 0;
                        WordGame.lettersLeft = 0;
            
                        // run again!
                        WordGame.getSecretWord();
                    });
            }, 1300);
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
    document.body.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, false);
    
    // click the enter icon
    $('.skip-button').click(function() {
        WordGame.proceed('skip');
    });
    
    // freebie function
    $('.freebie-button').click(function() {
        if ($(this).hasClass('letter-selected')) {
            return;
        } else {
            // find the unused letters
            var unusedLetters = Object.keys(WordGame.secretWordObject);
            
            // get a random one
            var randomUnusedLetter = unusedLetters[Math.floor(Math.random() * unusedLetters.length)];
            
            // show freebie
            WordGame.handleInput(randomUnusedLetter, false);
            
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
        e.preventDefault();
        
        clearTimeout(WordGame.timeout);
        WordGame.timeout = setTimeout(keyPressed, 50);
        
        function keyPressed() {
            // get letter pressed
            var characterCode = e.which;
            
            // if it's return
            if (characterCode == 13) {
                WordGame.proceed('skip');   
            // if it's a-z
            } else if (characterCode >= 97 && characterCode <= 122) {
                // run handleInput
                WordGame.handleInput(characterCode, true);
            } else {
                // do nah
                return;
            }
        }
    });
    
    // when a letter is clicked
    $('.keys div.alpha').click(function(e) {
        e.preventDefault();
        // if it's aleady been used, do nah
        if ($(this).hasClass('letter-selected')) {
            return;
        } else {
            // run handleInput
            WordGame.handleInput($(this).data('character-code'), true);
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