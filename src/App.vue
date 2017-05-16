<template>
  <div id="app" :style="{ background: 'hsla(140, 40%, ' + backgroundLightness + '%, 1)' }">
    <div class="title">
      <svg width="20" height="20" viewBox="0 0 20 20"><path d="M0,0V20H20V0H0ZM14,6H7V9h4v2H7v3h7v2H5V4h9V6Z"/></svg>
      <span>Word Game</span>
    </div>
    <div class="game-score">Score: <span class="score-value">{{ gameScore }}</span></div>
    <div class="secret-word-container">
      <div class="secret-word" :class="{ 'secret-word--win': isWin }">
        <span class="secret-word__letter" v-if="ready" v-for="letter in secretWord.array" v-bind:data-character-code="getCharacterCode(letter)">&bull;</span>
      </div>
    </div>
    <div class="definition-container">
      <div class="definition">
        <transition name="bounce">
          <p v-if="ready">{{ definition }}</p>
        </transition>
      </div>
    </div>
    <div class="selections">
      <div class="no" v-for="letter in incorrectLetters">{{ letter }}</div>
    </div>
  </div>
</template>

<script>
  import $ from 'jquery'
  import _ from 'lodash'

  export default {
    name: 'app',
    data: function() {
      return {
        attemptedLetters: [],
        backgroundLightness: 100,
        blacklist: [
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
        ],
        definition: '',
        gameScore: 0,
        incorrectLetters: [],
        inputAllowed: false,
        isWin: false,
        ready: false,
        secretWord: {
          string: '',
          array: []
        },
        secretWordArray: [],
        wins: 0,
        wordScore: 0,
      }
    },
    methods: {
      uniqueLetters: function() {
        return _.uniq(this.secretWord.array).length;
      },
      updateBackgroundLightness: function() {
          this.backgroundLightness -= 40 / this.uniqueLetters();
          // console.log(this.backgroundLightness);
      },
      calculatePotentialWordScore: function() {
        this.potentialWordScore = this.uniqueLetters() * 10;
        console.log('Unique letters: ' + this.uniqueLetters());
      },
      filterDefinition: function() {
        switch (true) {
          case (this.definition.toUpperCase().indexOf(this.secretWord.string.toUpperCase()) != -1):
            console.log(this.secretWord.string + ' is in definition. \n ' + this.definition);
            this.getSecretWord();
          case (this.definition.length > 150):
            console.log('Definition is over 150 characters.');
            this.getSecretWord();
            break;
          default:
            // remove category, if present. Splitting at three spaces '   ' and returning the end portion
            this.definition = this.definition.split(/ {3,}/).pop();
            // this.requestCount = 0;
            this.processSecretWord();
        }
      },
      filterSecretWord: function() {
        // console.log('Filtering secret word…');
        switch (true) {
          case ($.inArray(this.secretWord.string, this.blacklist) > -1):
            console.log('Word filter: Blacklisted');
            this.getSecretWord();
            break;
          case (this.secretWord.string.search(/\W/g) != -1):
            console.log('Word filter: Special characters');
            this.getSecretWord();
            break;
          default:
            this.getDefinition();
        }
      },
      getDefinition: function() {
        // console.log('Getting definition…');
        var self = this;
        self.$http.get('http://api.wordnik.com:80/v4/word.json/' + self.secretWord.string + '/definitions', {
          params: {
            api_key: '65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a',
            limit: 2,
            includeRelated: false,
            useCanonical: true,
            includeTags: false
          }
        })
        .then(function(response) {
          self.definition = '';
          if (response.data[0].text == 'undefined') {
            self.handleError('Definition undefined');
          } else {
            self.definition = response.data[0].text;
            // console.log(self.definition);
            self.filterDefinition();
          }
        })
        .catch(function(error) {
          self.handleError(error);
        });
      },
      getSecretWord: function() {
        // console.log('Getting secret word…');
        var self = this;
        self.$http.get('http://api.wordnik.com:80/v4/words.json/randomWord', {
          params: {
            api_key: '65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a',
            hasDictionaryDef: true,
            excludePartOfSpeech: 'family-name, given-name, noun-plural, proper-noun, proper-noun-plural, proper-noun-posessive, suffix',
            minCorpusCount: 2000,
            maxCorpusCount: -1,
            minDictionaryCount: 3,
            maxDictionaryCount: -1,
            minLength: 3,
            maxLength: 7
          }
        })
        .then(function(response) {
          self.secretWord.string = response.data.word.toLowerCase();
          // console.log(self.secretWord.string);
          self.filterSecretWord();
        })
        .catch(function(error) {
          self.handleError(error);
        });
      },
      getCharacterCode: function(letter) {
        return letter.charCodeAt();
      },
      getLetter: function(code) {
        return String.fromCharCode(code);
      },
      validateInput: function(code) {
        if (this.inputAllowed === true) {
          this.inputAllowed = false;
          if (code >= 97 && code <= 122) {
            this.registerAttempt(code);
          } else {
            console.log('input not alphabetical');
            this.inputAllowed = true;
          }
        }
      },
      registerAttempt: function(code) {
        if (this.attemptedLetters.includes(code)) {
          console.log('this letter has been tried');
          this.inputAllowed = true;
        } else {
          this.attemptedLetters.push(code);
          this.checkWordForLetter(code);
        }
      },
      checkWordForLetter: function(code) {
        var letter = this.getLetter(code);
        if (this.secretWord.array.includes(letter)) {
          this.processInput(code);
        } else {
          console.log('this letter is not in the word');
          this.inputAllowed = true;
        }
      },
      handleError: function(error) {
        console.log(error);
      },
      init: function() {
        console.clear();
        this.attemptedLetters = [];
        this.backgroundLightness = 100;
        this.incorrectLetters = [];
        this.inputAllowed = false;
        this.isWin = false;
        this.ready = false;
        this.secretWord.array = [];
        this.secretWord.string = '';
        this.secretWordArray = [];
        this.getSecretWord();
      },
      processInput: function(code) {
        var self = this;
        // remove it from array
        this.secretWordArray = this.secretWordArray.filter(function(a) { return a !== self.getLetter(code) });
        // console.log(this.secretWordArray);
        this.attemptedLetters.push(code);
        this.revealLetters(code);
        this.updateBackgroundLightness();
        this.inputAllowed = true;

        // if it's a win
        if (this.secretWordArray.length == 0) {
          console.log('YOU WIN');
          this.isWin = true;

          var self = this;
          setTimeout(function() { self.init() }, 1300);
        }
      },
      processSecretWord: function() {
        // console.log('Processing secret word…');
        this.secretWord.array = this.secretWord.string.split('');
        // populate worker array
        this.secretWordArray = this.secretWord.array;
        this.start();
      },
      revealLetters: function(code) {
        var self = this;
        $('.secret-word span[data-character-code="' + code + '"]').each(function() {
          $(this).html(self.getLetter(code)).addClass('highlight');
        });
      },
      start: function() {
        // console.log('Ready');
        this.ready = true;
        var self = this;
        setTimeout(function() {
          self.inputAllowed = true;
          console.log('input allowed');
        }, 800);
        console.log(this.secretWord.string);
      }
    },
    created: function() {
      var self = this;
      window.addEventListener('keypress', function(e) {
        self.validateInput(e.which);
      });
    },
    mounted: function() {
      this.init();
    }
  }
</script>

<style lang="scss">
  @import '/assets/sass/_reset';
  @import '/assets/sass/_variables';
  @import '/assets/sass/_animation';

  @import url('https://fonts.googleapis.com/css?family=News+Cycle|Source+Sans+Pro:400,600');

  @font-face {
    font-family: 'HouseMovements-Sign';
    src: url('/static/fonts/HouseMovements-Sign.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
  }

  html {
    height: 100%;
  }

  body, input, button {
    font-family: 'Source Sans Pro', sans-serif;
    font-weight: 400;
  }

  body {
    height: 100%;

    transform: translateZ(0);
    -webkit-transform: translate3d(0, 0, 0);

    background: #fff;
    text-align: center;
    font-size: 14px;
    color: $black;
    // overflow: hidden;
    user-select: none;
    cursor: default;
    -webkit-font-smoothing: antialiased;
  }

  #app {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: background-color 0.5s ease;
  }

  .title {
    position: absolute;
    top: 20px;
    left: 20px;
    height: 20px;
    svg {
      vertical-align: text-top;
      path {
        fill: $black;
      }
    }
    span {
      padding-left: 8px;
    }
  }

  .game-score {
    position: absolute;
    top: 20px;
    right: 20px;
    height: 20px;
    font-weight: 600;
    line-height: 20px;
  }

  .secret-word-container {
    // background: lighten(red, 40%);
    flex: 1;
    display: flex;
    justify-content: center;
    // line-height: 0;
    position: relative;
    z-index: 10;
    width: 100%;
    .secret-word {
      display: flex;
      align-self: flex-end;
      &--win {
        transform: scale(1.5);
      }
      &__letter {
        position: relative;
        align-self: flex-end;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 50px;
        letter-spacing: 12px;
        transition: all .15s cubic-bezier(0.29, 0.74, 0.04, 1.04);
        &:first-child {
          text-transform: uppercase;
        }
        // &:last-child {
        //   margin-right: 0;
        // }
        &.highlight {
          font-family: 'HouseMovements-Sign';
          font-size: 100px;
          letter-spacing: 0;
          // custom kerning for T* (except l and i)
          &:first-child[data-character-code="116"] + *:not([data-character-code="104"]):not([data-character-code="105"]) {
            margin-left: -9px;
          }
        }
      }
    }
    &.animated.shake {
      -webkit-animation-duration: .5s;
    }
  }

  .selections {
    position: absolute;
    width: 100%;
    bottom: 20px;
    padding: 0 20px;
    display: flex;
    justify-content: center;
    div {
      width: 30px;
      height: 30px;
      // border: 1px solid $dark-gray;
      line-height: 28px;
      text-transform: uppercase;
      color: $white;
      font-weight: 600;
      &.yes {
        border-color: $green;
      }
      &.no {
        background: $error-red;
      }
      & + div {
        margin-left: 10px;
      }
    }
  }

  .definition-container {
    height: 200px;
    display: flex;
    flex: 1;
    justify-content: center;
    &::-webkit-scrollbar {
      display: none;
    }
    .definition {
      align-self: flex-start;
      max-width: 600px;
      p {
        padding-top: 30px;
        // text-align: center;
        font-size: 26px;
        line-height: 32px;
        font-family: 'News Cycle', sans-serif;
        font-weight: 400;
        &:first-letter {
          // text-transform: capitalize;
        }
      }
    }
  }

  .error {
    display: none;
    position: absolute;
    width: 340px;
    top: 120px;
    left: 50%;
    padding: 40px 30px 30px;
    border-radius: 3px;
    margin-left: -170px;
    background: $error-red;
    color: $white;
    font-weight: 600;
    h1 {
      font-size: 30px;
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 30px;
    }
    button {
      height: 22px;
      display: inline-block;
      padding: 0 10px 1px 10px;
      border: 0;
      background: #fff;
      color: $dark-gray;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
      text-transform: uppercase;
      white-space: nowrap;
      vertical-align: middle;
      letter-spacing: 1px;
      cursor: pointer;
      user-select: none;
      background-image: none;
      box-shadow: 2px 2px 0 rgb(185, 76, 76);
      -webkit-transition: background .2s ease-in-out;
      transition: background .2s ease-in-out;
      -webkit-tap-highlight-color: rgba(0,0,0,0);
      &:focus, &:active {
        outline: 0;
      }
      &[disabled] {
        opacity: 0.5;
        cursor: default;
        &:hover {
          background: transparent;
        }
      }
    }
  }
</style>
