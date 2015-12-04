//=============================================================================
// WORD GAME
//=============================================================================

(function() {
    var WordGame = {
    
        errorCount: 0,
        firstRun: true,
        debug: false,
        filterCount: 0,
        keysState: 'mobile',
        inputAllowed: false,
        timeout: 0,
        secretWord: '',
        characterCount: 0,
        secretWordCharacterCodes: [],
        secretWordObject: {},
        uniqueLetters: 0,
        definition: '',
        // alternateDefinition: '',
        attemptsAllowed: 0,
        attempts: 0,
        attemptedLetters: [],
        attemptsLeft: 0,
        lettersLeft: 0,
        // constants
        // alertSound: new Audio('bleep.wav'),
        storedScore: window.localStorage.getItem('word-game-score'),
        commaSeparatorNumberStep: $.animateNumber.numberStepFactories.separator(','),
        
        settings: {
            sound: false,
        },
        
        animate: function(element, animation) {
            WordGame.inputAllowed = false;
            $(element).addClass('animated ' + animation);
            $(element).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                function() {
                    $(element).removeClass('animated ' + animation);
                    WordGame.inputAllowed = true;
            });
        },
        
        renderKeys: function() {
            
            var $keys = $('.keys');
            
            // sort function
            function keySort(order) {
                
                $keys.find('div').sort(function(a, b) {
                    return +a.getAttribute(order) - +b.getAttribute(order);
                })
                .appendTo($keys);
            }
            
            if (Modernizr.mq('(max-width: 767px)') && WordGame.keysState === 'desktop') {
                    
                keySort('data-qwerty-order');
                
                if ($('div[data-qwerty-order="10"] > br').length === 0) {
                    $('div[data-qwerty-order="10"], div[data-qwerty-order="19"]').after('<br>');
                }
                
                $('.freebie-button').insertBefore('div[data-qwerty-order="20"]');
                $('.skip-button').insertAfter('div[data-qwerty-order="26"]');
                
                WordGame.keysState = 'mobile';
            
            } else if (Modernizr.mq('(min-width: 768px)') && WordGame.keysState === 'mobile') {
                    
                keySort('data-character-code');
                
                // remove break spans
                $keys.find('br').remove();
                
                $('.freebie-button').appendTo('.keys');
                $('.skip-button').appendTo('.keys');
                
                WordGame.keysState = 'desktop';
            
            }
            
            $keys.show();
        
        },
        
        updateScore: function() {
            
            var currentScore = parseInt(window.localStorage.getItem('word-game-score')) || 0;
            
            // determine new score
            var updatedScore = WordGame.characterCount * 10 + WordGame.attemptsLeft * 5 + currentScore;
            
            // if the freebie wasn't used, add 5 boner points
            if (!$('.freebie-button').hasClass('used')) {
                updatedScore = updatedScore + 5;
            }
            
            // store new value
            localStorage.setItem('word-game-score', updatedScore);
            
            $('.score-value').addClass('updating').prop('number', currentScore).animateNumber({
                number: updatedScore,
                numberStep: WordGame.commaSeparatorNumberStep
            }, 1000, function() {
                $('.score-value').removeClass('updating');
            });
        },
        
        initialize: function() {
            
            // fast button action
            $(function() {
                FastClick.attach(document.body);
            });
            
            // prevent native scrolling
            document.body.addEventListener('touchmove', function(e) {
                e.preventDefault();
            }, false);
            
            /* click events
            document.body.addEventListener('click', this.handleClick, false);
            
            // key events
            window.addEventListener('keydown', this.handleKeyDown, false);
            window.addEventListener('keypress', this.handleKeyPress, false);
            
            //window resize
            window.addEventListener('resize', this.renderKeys, false);
            */
            
            // click events
            $(document).on('click', this.handleClick);
            
            // key events
            $(document).on('keydown', this.handleKeyDown);
            $(document).on('keypress', this.handleKeyPress);
            
            //window resize
            $(window).on('resize', this.renderKeys);
            
            WordGame.renderKeys();
            
            // show intro if first run and not returning user
            if (WordGame.firstRun === true && window.localStorage.getItem('word-game-score') === null) {
                WordGame.introduction();
            } else {
                WordGame.getSecretWord();
            }
            
            // set score
            if (WordGame.storedScore === null) {
                $('.score-value').text('0');
            // you're back, animate your previous score in
            } else {
                $('.score-value').prop('number', 0).animateNumber({
                    number: WordGame.storedScore,
                    numberStep: WordGame.commaSeparatorNumberStep
                }, 1000);
            }
        },
        
        introduction: function() {
            WordGame.firstRun = false;
            secretWord = 'fun';
            WordGame.getDefinition();
        },
        
        getSecretWord: function() {
            
            // if debug word present
            if (window.location.search) {
                
                // GOOD TEST WORDS: wattage
                WordGame.debug = true;
                debugWord = window.location.search;
                secretWord = debugWord.replace('?', '');
                WordGame.filterSecretWord();
                console.log('%cDEBUG: ' + secretWord.toUpperCase(), 'color: red');
            
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
                    },
                    error: function() {
                        WordGame.handleError();
                    }
                });
            }
        },
        
        handleError: function() {
            
            if (WordGame.errorCount > 3) {
                $('.error p').html('Please try again in a few minutes.');
                $('.error').show();
            } else {
                $('.error').show();
                WordGame.errorCount++;
                console.log(WordGame.errorCount);
            }
        },
        
        filterSecretWord: function() {
            
            var naughtyWords = [
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
                'jew',
                'femme',
                'nads',
                'semen'
            ];
            
            // secret word is naughty, run it again
            if ($.inArray(secretWord, naughtyWords) > -1) {
                
                WordGame.filterCount++;
                
                if (WordGame.filterCount < 10) {
                    console.log(secretWord + ' is naughty, running again');
                    WordGame.getSecretWord();
                } else {
                    console.log('Filtering stopped');
                }
            
            // secret word has bad characters, run it again
            } else if (secretWord.search(/^[a-z]+$/)) {
                
                WordGame.filterCount++;
                
                if (WordGame.filterCount < 10) {
                    console.log(secretWord + ' has bad characters, running again (' + WordGame.filterCount + ')');
                    WordGame.getSecretWord();
                } else {
                    console.log('Filtering stopped');
                }
            
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
                    if (data[0].text === undefined) {
                        WordGame.getSecretWord();
                    } else {
                        definition = data[0].text;
                        WordGame.filterDefinition();
                    }
                }
            });
        },
        
        filterDefinition: function() {
            
            // the word is in the defintion, run it again
            if (definition.toUpperCase().indexOf(secretWord.toUpperCase()) != -1) {
                
                console.log(secretWord + ' is in ' + definition + ' (main def), running again');
                WordGame.getSecretWord();
            
            /* the word is in the alternate defintion, run it again
            } else if (WordGame.alternateDefinition !== '' && WordGame.alternateDefinition.toUpperCase().indexOf(secretWord.toUpperCase()) != -1) {
                
                console.log(secretWord + ' is in ' + WordGame.alternateDefinition + '(alt def), running again');
                WordGame.getSecretWord();
            */
            
            } else if (definition.length > 150) {
                
                console.log('the definition for' + secretWord + ' had ' + definition.length + ' characters, running again');
                WordGame.getSecretWord();
            
            // they passed, play on
            } else {
                
                // log secret word and definition(s)
                if (WordGame.debug === false) { console.log('%csecret word: ' + secretWord, 'color: red'); }
                
                /*if (WordGame.alternateDefinition) {
                    console.log('alt definition: ' + WordGame.alternateDefinition);
                } else {
                    console.log('alt definition: UNAVAILABLE');
                }*/
                
                // remove category, if present. Splitting at three spaces '   ' and returning the end portion
                definition = definition.split(/ {3,}/).pop();
                
                console.log('main definition: ' + definition);
                
                // process the secret word
                WordGame.processSecretWord();
                
            }
        },
        
        processSecretWord: function() {
            
            // get the character count of secret word
            WordGame.characterCount = secretWord.length;
            
            // populate secret word object: {97: 2, 101: 1, 103: 1, 116: 2, 119: 1} (wattage)
            for (var index = 0; index < WordGame.characterCount; index++) {
                var character = secretWord.charCodeAt(index);
                if (WordGame.secretWordObject[character]) {
                   WordGame.secretWordObject[character]++;
                } else {
                   WordGame.secretWordObject[character] = 1;
                }
            }
        
            console.log(WordGame.secretWordObject);
            
            // set attempts allowed based on keys (unique letters) in the secretWordObject
            WordGame.uniqueLetters = Object.keys(WordGame.secretWordObject).length;
            WordGame.attemptsAllowed = WordGame.uniqueLetters * 2;
            
            WordGame.renderUI();
            
        },
        
        renderUI: function() {
            
            // clear previous stuff
            // remove animation classes
            $('.secret-word').removeClass('win lose').empty();;
            
            // empty secret word and definition
            //$('.secret-word').empty();
            
            // remove disabled class from buttons
            $('.keys div').removeClass('disabled used');
            
            // create character code array and letter holders
            for (var index = 0; index < WordGame.characterCount; index++) {
                var charCodes = secretWord.charCodeAt(index);
                WordGame.secretWordCharacterCodes.push(charCodes);
                
                $('.secret-word').append('<span class="letter-holder" data-character-code="' + WordGame.secretWordCharacterCodes[index] + '">&bull;</span>');
            }
            
            WordGame.animate('.secret-word', 'bounceInRight');
            
            // display attempts count
            $('.attempts-left').empty().html(WordGame.attemptsAllowed);
            
            // display definition
            $('.definition p').empty().html(definition);
            
            $('.definition p').widowFix();
            
/*
            // determine score
            var scoreValue;
            if (window.localStorage.getItem('word-game-score') === null) {
                
                scoreValue = '0';
                window.localStorage.setItem('word-game-score', 0);
                
            } else {
                // set their previous score
                scoreValue = window.localStorage.getItem('word-game-score');
            }
            
            // display score
            $('.score-value').text(scoreValue);
*/
            
            WordGame.inputAllowed = true;
            
            /* display alternate definition button
            if (WordGame.alternateDefinition === '') {
                $('.show-alternate-definition').css('visibility', 'hidden');
            } else {
                $('.show-alternate-definition').css('visibility', 'visible');
            }*/
            
        },
        
        handleClick: function(e) {
            e.preventDefault();
            //console.log(e);
            
            if (WordGame.inputAllowed === true) {
            
                // letter clicks
                if ($(e.target).hasClass('alpha')) {
                
                    // if it's aleady been used, do nah
                    if ($(e.target).hasClass('disabled')) {
                        return;
                    } else {
                        // run handleInput
                        WordGame.handleInput($(e.target).data('character-code'));
                    }
                    
                
                // skip
                } else if ($(e.target).hasClass('skip-button')) {
                
                    WordGame.proceed('skip');
                    WordGame.inputAllowed = false;
                
                // freebie
                } else if ($(e.target).hasClass('freebie-button')) {
                    
                    if ($(e.target).hasClass('used')) {
                        return;
                    } else {
                        // find the unused letters
                        var unusedLetters = Object.keys(WordGame.secretWordObject);
                        
                        // get a random one
                        var randomUnusedLetter = unusedLetters[Math.floor(Math.random() * unusedLetters.length)];
                        
                        // show freebie
                        WordGame.handleInput(randomUnusedLetter);
                        
                        // disable freebie button
                        $(e.target).addClass('disabled used');
                    }
                }
            }
            
            /* sound control
            $('input[name=sound]:radio').change(function() {
                if (this.value == 'on') {
                    WordGame.settings.sound = true;
                } else if (this.value == 'off') {
                    WordGame.settings.sound = false;
                }
            });
            */
            
        },
        
        handleKeyDown: function(e) {
            // get letter pressed
            var characterCode = e.keyCode;
            
            if (WordGame.inputAllowed === true) {
                // make sure it's a-z
                if (characterCode === 27) {
                    WordGame.proceed('skip');
                } else {
                    return;
                }
            }
            
            // disable input
            //WordGame.inputAllowed = false;
        },
        
        handleKeyPress: function(e) {
            e.preventDefault();
            
            if (WordGame.inputAllowed === true) {
                // get letter pressed
                var characterCode = e.which;
                
                // make sure it's a-z
                if (characterCode >= 97 && characterCode <= 122) {
                    WordGame.handleInput(characterCode);
                } else {
                    return;
                }
            } else {
                return;
            }
        },
        
        handleInput: function(characterCode) {
            
            // if letter hasn't been tried, run the shiz
            if ($.inArray(characterCode, WordGame.attemptedLetters) == -1) {
                
                WordGame.inputAllowed = false;
            
                // chalk up an attempt
                WordGame.attempts++;
                
                // add it to attempted letters array
                WordGame.attemptedLetters.push(characterCode);
                
                // display the letter as used
                $('div[data-character-code="' + characterCode + '"]').addClass('disabled');
                    
                // calculate attempts left
                WordGame.attemptsLeft = WordGame.attemptsAllowed - WordGame.attempts;
                //lettersLeft = Object.keys(WordGame.secretWordObject).length;
                
                // update attempts left value
                $('.attempts-left').html(WordGame.attemptsLeft);
                
                // if letter's in secret word
                if (characterCode in WordGame.secretWordObject) {
                    
                    // display the letter
                    $('span.letter-holder[data-character-code="' + characterCode + '"]').text(String.fromCharCode(characterCode)).addClass('highlight');
                    
                    //console.log(String.fromCharCode(characterCode) + ' is a match, and appears ' + WordGame.secretWordObject[characterCode] + ' time(s)');
                    
                    // delete the letter from the object
                    delete WordGame.secretWordObject[characterCode];
                    
                    // define letters left
                    WordGame.lettersLeft = Object.keys(WordGame.secretWordObject).length;
                    
                    // if the secretWordObject is now empty, that's a win!
                    if ($.isEmptyObject(WordGame.secretWordObject)) {
                        
                        // disable input
                        //WordGame.inputAllowed = false;
                        
                        // gray out all letters
                        $('.keys div').addClass('disabled');
                        
                        console.log('YOU WIN');
                        
                        // animate
                        //WordGame.animate('flash');
                        
                        // was it dude perfect?
                        if (WordGame.attempts === WordGame.uniqueLetters) {
                            console.log('DUDE PERFECT!');
                        }
                        
/*
                        // get current score
                        var currentScore = parseInt(window.localStorage.getItem('word-game-score')) || 0;
                        
                        // determine new score
                        var updatedScore;
                        // if the freebie was used, don't add bonus points
                        if ($('.freebie-button').hasClass('disabled')) {
                            updatedScore = characterCount * 10 + attemptsLeft * 5 + currentScore;
                        // if the freebie wasn't used, add 5 boner points
                        } else {
                            updatedScore = characterCount * 10 + attemptsLeft * 5 + 5 + currentScore;
                        }
                        
                        // store new value
                        localStorage.setItem('word-game-score', updatedScore);
                        
                        // animate score update
                        //$('.score-value').animateNumbers(updatedScore, false, 2000, 'linear');
                        var commaSeparatorNumberStep = $.animateNumber.numberStepFactories.separator(',')
                        $('.score-value').prop('number', currentScore).animateNumber({
                            number: updatedScore,
                            numberStep: commaSeparatorNumberStep
                        });
*/

                        WordGame.updateScore();
                        
                        $('.secret-word').addClass('win');
                        
                        // play on
                        WordGame.proceed('win');
                        
                    } else if (!$.isEmptyObject(WordGame.secretWordObject)) {
                        // play sound
                        if (WordGame.settings.sound === true) { WordGame.alertSound.play(); }
                        // enable input
                        WordGame.inputAllowed = true;
                    }
                    
                    console.log(WordGame.secretWordObject);
                    
                // letter is NOT in secret word  
                } else {
                    
                    console.log(String.fromCharCode(characterCode) + ' is NOT a match');
                    
                    // define letters left
                    WordGame.lettersLeft = Object.keys(WordGame.secretWordObject).length;
                    
                    // if you lost
                    if (WordGame.lettersLeft > WordGame.attemptsLeft || WordGame.attempts == WordGame.attemptsAllowed) {
                        
                        // disable input
                        WordGame.inputAllowed = false;
                        
                        // gray out all letters
                        $('.keys div').addClass('disabled');
                        
                        console.log('YOU LOSE');
                        $('.secret-word').addClass('lose');
                        WordGame.proceed('lose');
                    
                    // just got the letter wrong  
                    } else {
                        WordGame.animate('.secret-word', 'shake');
                        // enable input
                        WordGame.inputAllowed = true;
                    }
                }
                
                // log a bunch of shit
                //console.log('attempted letters: ' + WordGame.attemptedLetters);
                console.log('attempts: ' + WordGame.attempts + ' / attempts left: ' + WordGame.attemptsLeft + ' / unique letters left: ' + WordGame.lettersLeft);
            
            // letter was already tried, doing nothing
            } else {
                console.log('letter was already tried, doing nothing');
            }
        },
        
        proceed: function(type) {
            
            if (type != 'win') {
                // expose secret word for losers and skippers
                $('span.letter-holder:not(.highlight)').each(function() {
                    $(this).text(String.fromCharCode($(this).data('character-code'))).addClass('highlight'); 
                });
            }
            
            setTimeout(function() {
                console.clear();
                
                WordGame.animate('.secret-word', 'bounceOutLeft');
                
                // reset game properties
                WordGame.firstRun = false;
                WordGame.debug = false;
                WordGame.inputAllowed = false;
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
            }, 1300);
        }
    };
    
    $(document).ready(function() { WordGame.initialize(); });
    
    $('.error button').click(function() {
        $('.error').hide();
        WordGame.initialize();
        //location.reload();
    });
    
})();

