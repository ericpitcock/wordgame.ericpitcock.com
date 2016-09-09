//=============================================================================
// WORD GAME
//=============================================================================

var WordGame = {

    errorCount: 0,
    firstRun: true,
    debug: false,
    requestCount: 0,
    keysState: 'mobile',
    inputAllowed: false,
    timeout: 0,
    secretWord: '',
    characterCount: 0,
    secretWordCharacterCodes: [],
    secretWordObject: {},
    uniqueLetters: 0,
    definition: '',
    attemptsAllowed: 0,
    attempts: 0,
    attemptedLetters: [],
    attemptsLeft: 0,
    lettersLeft: 0,
    highlightFontSize: 0,
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

        if (Modernizr.mq('(max-width: 768px)') && WordGame.keysState === 'desktop') {

            keySort('data-qwerty-order');

            if ($('div[data-qwerty-order="10"] > br').length === 0) {
                $('div[data-qwerty-order="10"], div[data-qwerty-order="19"]').after('<br>');
            }

            $('.freebie-button').insertBefore('div[data-qwerty-order="20"]');
            $('.skip-button').insertAfter('div[data-qwerty-order="26"]');

            WordGame.keysState = 'mobile';

        } else if (Modernizr.mq('(min-width: 769px)') && WordGame.keysState === 'mobile') {

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
        var updatedScore = WordGame.uniqueLetters * 10 + WordGame.attemptsLeft * 5 + currentScore;

        // if the freebie wasn't used, add 5 bonus points
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

        // prevent native scrolling if not in an iframe.
        if (window == window.top) {
            $('body').on('touchmove', function(e) {
                e.preventDefault();
            }, false);
        }

        // click events
        $(document).on('click', this.handleClick);

        // move into handleClick
        $('.error button').on('click', function() {
            $('.error').hide();
            WordGame.initialize();
            //location.reload();
        });

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
        definition = 'A source of enjoyment, amusement, or pleasure.';
        WordGame.processSecretWord();
    },

    getSecretWord: function() {

        if (WordGame.requestCount < 10) {

            // keep track of requests so we can stop in case of drama
            WordGame.requestCount++;

            // if debug word present
            if (window.location.search) {

                // GOOD TEST WORDS: wattage
                WordGame.debug = true;
                debugWord = window.location.search;
                secretWord = debugWord.replace('?', '');
                WordGame.filterSecretWord();

            } else {

                // get the secret word
                $.ajax({
                    type: 'GET',
                    url: 'http://api.wordnik.com:80/v4/words.json/randomWord',
                    data: {
                        hasDictionaryDef: true,
                        excludePartOfSpeech: 'family-name, given-name, noun-plural, proper-noun, proper-noun-plural, proper-noun-posessive, suffix',
                        minCorpusCount: 2000,
                        maxCorpusCount: -1,
                        minDictionaryCount: 3,
                        maxDictionaryCount: -1,
                        minLength: 3,
                        maxLength: 7,
                        api_key: 'XXXXXXXXXXXXXXXXX'
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
                        WordGame.handleError('Noooooooooo!', 'There was an error grabbing the word');
                    }
                });
            }
        // throw error
        } else {
            WordGame.handleError('Whoa!', 'Too many requests');
        }
    },

    handleError: function(mainMessage, secondaryMessage) {

        if (WordGame.errorCount > 3) {
            $('.error h1').html('It doesn&rsquo;t seem to be working');
            $('.error p').html('Please try again in a few minutes');
            WordGame.errorCount = 0;
        } else {
            $('.error h1').html(mainMessage);
            $('.error p').html(secondaryMessage);
            WordGame.errorCount++;
        }
        $('.error').show();
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
            'darky',
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
            'semen',
            'sodomy',
            'dildo'
        ];

        // secret word is naughty, run it again
        if ($.inArray(secretWord, naughtyWords) > -1) {

            WordGame.getSecretWord();

        // secret word has bad characters, run it again
        } else if (secretWord.search(/^[a-z]+$/)) {

            WordGame.getSecretWord();

        // secret word is good to go, get definition
        } else {
            WordGame.getDefinition();
        }
    },

    getDefinition: function() {
        // get definition(s)
        $.ajax({
            type: 'GET',
            url: 'http://api.wordnik.com:80/v4/word.json/' + secretWord + '/definitions',
            data: {
                limit: 2,
                includeRelated: false,
                useCanonical: true,
                includeTags: false,
                api_key: 'XXXXXXXXXXXXXXXXX'
            },
            success: function(data) {
                if (data[0].text === undefined) {
                    WordGame.getSecretWord();
                } else {
                    definition = data[0].text;
                    WordGame.filterDefinition();
                }
            },
            error: function() {
                WordGame.handleError('Noooooooooo!', 'There was an error grabbing the definition');
            }
        });
    },

    filterDefinition: function() {

        // the word is in the defintion, run it again
        if (definition.toUpperCase().indexOf(secretWord.toUpperCase()) != -1) {

            WordGame.getSecretWord();

        } else if (definition.length > 150) {

            WordGame.getSecretWord();

        // they passed, play on
        } else {

            // remove category, if present. Splitting at three spaces '   ' and returning the end portion
            definition = definition.split(/ {3,}/).pop();

            // process the secret word
            WordGame.processSecretWord();

            WordGame.requestCount = 0;

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

        // set attempts allowed based on keys (unique letters) in the secretWordObject
        WordGame.uniqueLetters = Object.keys(WordGame.secretWordObject).length;
        WordGame.attemptsAllowed = WordGame.uniqueLetters * 2;

        WordGame.renderUI();

    },

    renderUI: function() {

        // clear previous stuff
        // remove animation classes
        $('.secret-word').removeClass('win lose').empty();

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

        WordGame.inputAllowed = true;

    },

    handleClick: function(e) {
        e.preventDefault();

        var $target = $(e.target);

        if (WordGame.inputAllowed === true) {

            // letter clicks
            if ($target.hasClass('alpha')) {

                // if it's aleady been used, do nah
                if ($target.hasClass('disabled')) {
                    return;
                } else {
                    // run handleInput
                    WordGame.handleInput($target.data('character-code'));
                }


            // skip
            } else if ($target.hasClass('skip-button')) {

                WordGame.proceed('skip');
                WordGame.inputAllowed = false;

            // freebie
            } else if ($target.hasClass('freebie-button')) {

                if ($target.hasClass('used')) {
                    return;
                } else {
                    // find the unused letters
                    var unusedLetters = Object.keys(WordGame.secretWordObject);

                    // get a random one
                    var randomUnusedLetter = unusedLetters[Math.floor(Math.random() * unusedLetters.length)];

                    // show freebie
                    WordGame.handleInput(randomUnusedLetter, true);

                    // disable freebie button
                    $target.addClass('disabled used');
                }
            }
        }
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

    handleInput: function(characterCode, freebie) {

        // if letter hasn't been tried, run the shiz
        if ($.inArray(characterCode, WordGame.attemptedLetters) == -1) {

            WordGame.inputAllowed = false;

            freebie = freebie || false;

            // chalk up an attempt
            if (freebie === false) { WordGame.attempts++; }

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

                // delete the letter from the object
                delete WordGame.secretWordObject[characterCode];

                // define letters left
                WordGame.lettersLeft = Object.keys(WordGame.secretWordObject).length;

                // if the secretWordObject is now empty, that's a win!
                if ($.isEmptyObject(WordGame.secretWordObject)) {

                    // gray out all letters
                    $('.keys div').addClass('disabled');

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

            // letter is NOT in secret word
            } else {

                // define letters left
                WordGame.lettersLeft = Object.keys(WordGame.secretWordObject).length;

                // if you lost
                if (WordGame.lettersLeft > WordGame.attemptsLeft || WordGame.attempts == WordGame.attemptsAllowed) {

                    // disable input
                    WordGame.inputAllowed = false;

                    // gray out all letters
                    $('.keys div').addClass('disabled');

                    $('.secret-word').addClass('lose');
                    WordGame.proceed('lose');

                // just got the letter wrong
                } else {
                    WordGame.animate('.secret-word', 'shake');
                    // enable input
                    WordGame.inputAllowed = true;
                }
            }

        // letter was already tried, do nothing
        } else {
            //console.log('letter was already tried, doing nothing');
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
