<template>
  <div id="app" :style="{ background: 'hsla(140, 40%, ' + backgroundLightness + '%, 1)' }">
    <div class="title">
      <svg width="20" height="20" viewBox="0 0 20 20"><path d="M0,0V20H20V0H0ZM14,6H7V9h4v2H7v3h7v2H5V4h9V6Z"/></svg>
      <span>Word Game</span></div>
    <div class="game-score">Score: <span class="score-value">{{ gameScore }}</span></div>
    <div class="secret-word" :class="{ win: isWin }">
      <div>
        <span class="letter-holder" v-if="ready" v-for="letter in secretWord.array" v-bind:data-character-code="getCharacterCode(letter)">&bull;</span>
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
    <!-- <div class="buttons">
      <button @click="init()" type="button" name="button">NEW WORD</button>
    </div> -->
  </div>
</template>

<script>
  import $ from 'jquery'
  import _ from 'lodash'

  export default {
    name: 'app',
    data: function() {
      return {
        alpha: {
          "a": 97,
          "b": 98,
          "c": 99,
          "d": 100,
          "e": 101,
          "f": 102,
          "g": 103,
          "h": 104,
          "i": 105,
          "j": 106,
          "k": 107,
          "l": 108,
          "m": 109,
          "n": 110,
          "o": 111,
          "p": 112,
          "q": 113,
          "r": 114,
          "s": 115,
          "t": 116,
          "u": 117,
          "v": 118,
          "w": 119,
          "x": 120,
          "y": 121,
          "z": 122
        },
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
        debug: false,
        definition: '',
        errors: 0,
        gameScore: 0,
        incorrectLetters: [],
        inputAllowed: true,
        isWin: false,
        qwerty: true,
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
      calculateBackgroundLightness: function() {
        // get unique characters
        // divide 100 / unique to get steps
        // use steps as increment
        var uniqueLetters = _.uniq(this.secretWord.array).length;
        var increment = 100 / (uniqueLetters * 2);

        this.backgroundLightness -= increment;
      },
      calculatePotentialWordScore: function() {
        var uniqueLetters = _.uniq(this.secretWord.array).length;
        this.potentialWordScore = uniqueLetters * 10;
        // 26 letters
        console.log('Unique letters: ' + uniqueLetters);
      },
      filterDefinition: function() {
        // the word is in the defintion, run it again
        if (this.definition.toUpperCase().indexOf(this.secretWord.string.toUpperCase()) != -1) {
          console.log('Definition filter: Word in definition. Getting Again.');
          this.getSecretWord();
        } else if (this.definition.length > 150) {
          console.log('Definition filter: Too long. Getting Again.');
          this.getSecretWord();
        // they passed, play on
        } else {
          // remove category, if present. Splitting at three spaces '   ' and returning the end portion
          this.definition = this.definition.split(/ {3,}/).pop();
          this.requestCount = 0;
          this.ready = true;
          // console.log('definition: ' + this.definition);
        }
      },
      filterSecretWord: function() {
        // secret word is naughty, run it again
        if ($.inArray(this.secretWord.string, this.blacklist) > -1) {
          console.log('Word filter: Naughty. Getting Again.');
          this.getSecretWord();
        // secret word has bad characters, run it again
        } else if (this.secretWord.string.search(/^[a-z]+$/)) {
          console.log('Word filter: Special characters. Getting Again.');
          this.getSecretWord();
        // secret word is good to go, get definition
        } else {
          console.log('secretword: ' + this.secretWord.string);
          this.getDefinition();
        }
      },
      getDefinition: function() {
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
          self.definition = response.data[0].text;
          // console.log(self.definition);
          self.filterDefinition();
        })
        .catch(function(error) {
          console.log(error);
        });
      },
      getSecretWord: function() {
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
          self.secretWord.string = response.data.word;
          // console.log(self.secretWord.string);
          self.processSecretWord();
        })
        .catch(function(error) {
          console.log(error);
        });
      },
      getCharacterCode: function(letter) {
        return letter.charCodeAt();
      },
      handleInput: function(code) {
        if (this.inputAllowed) {
          this.inputAllowed = false;
          // check if it's a-z
          if (code >= 97 && code <= 122) {
            var letter = String.fromCharCode(code);
            // check if the letter is in the word
            if (this.secretWord.string.indexOf(letter) > -1) {
              // show letter(s)
              $('.secret-word span[data-character-code="' + code + '"]').each(function() {
                $(this).html(letter).addClass('highlight');
              });

              // add object to attemptedLetters array
              // this.attemptedLetters.push({ 'letter': letter, 'status': 'yes' });
              // console.log(this.incorrectLetters);
              // $('.selections div[data-character-code="' + code + '"]').addClass('yes');

              // remove it from array
              this.secretWordArray = this.secretWordArray.filter(function(a) { return a !== letter });
              console.log(this.secretWordArray);

              this.calculateBackgroundLightness();

              // determine if it's a win or not
              if (this.secretWordArray.length == 0) {
                console.log('YOU WIN');
                this.isWin = true;
                this.inputAllowed = false;
                var self = this;
                setTimeout(function() { self.init() }, 1300);
              }
            } else {
              if (this.incorrectLetters.indexOf(letter) == -1) {
                this.incorrectLetters.push(letter);
                console.log(letter + ' not in word');
              } else {
                console.log(letter + ' already tried');
              }
            }
          }
        }
        this.inputAllowed = true;
      },
      init: function() {
        console.clear();
        // console.log('Init');
        this.isWin = false;
        this.incorrectLetters = [];
        this.ready = false;
        this.backgroundLightness = 100;
        // this.secretWord.string = '';
        this.getSecretWord();
      },
      processSecretWord: function() {
        this.secretWord.array = this.secretWord.string.split('');
        // populate worker array
        this.secretWordArray = this.secretWord.array;
        this.filterSecretWord();
      }
    },
    watch: {
      ready: function() {
        this.calculatePotentialWordScore();
      }
    },
    mounted: function() {
      this.init();
      var self = this;
      window.addEventListener('keypress', function(e) {
        self.handleInput(e.which);
      });
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

  // *, *:before, *:after {
  //   -webkit-box-sizing: border-box;
  //   -moz-box-sizing: border-box;
  //   box-sizing: border-box;
  // }

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
  }

  .title {
    position: absolute;
    top: 20px;
    left: 20px;
    height: 20px;
    // background: red;
    path {
      fill: $black;
    }
    span {
      padding-left: 8px;
      // font-weight: 600;
      color: $black;
      vertical-align: super;
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

  .secret-word {
    // background: lighten(red, 40%);
    flex: 1;
    display: flex;
    justify-content: center;
    // line-height: 0;
    position: relative;
    z-index: 10;
    width: 100%;
    div {
      display: flex;
      align-self: flex-end;
      span.letter-holder {
        position: relative;
        align-self: flex-end;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 50px;
        transition: all .15s cubic-bezier(0.29, 0.74, 0.04, 1.04);
        &:first-child {
          text-transform: uppercase;
        }
        &:last-child {
          margin-right: 0;
        }
        &.highlight {
          font-family: 'HouseMovements-Sign';
          font-size: 100px;

          // custom kerning for T* (except l and i)
          &:first-child[data-character-code="116"] + *:not([data-character-code="104"]):not([data-character-code="105"]) {
            margin-left: -9px;
          }
        }
      }
    }
    &.win {
      span.letter-holder /* , &:after  */{
        // color: $green;
      }
    }
    &.lose {
      span.letter-holder /* , &:after  */{
        color: $red-orange;
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

  .keys {
    // display: none;
    flex: 1;
    width: 100%;
    div {
      display: inline-block;
      width: 8.125%;
      height: 36px;
      border-radius: 3px;
      border: 1px solid $subtle-gray;
      border-radius: 3px;
      margin: 0 2px 12px 0;
      -webkit-tap-highlight-color: rgba(0,0,0,0);
      font-size: 20px;
      text-transform: uppercase;
      line-height: 36px;
      &[dataQwertyOrder="10"], &[dataQwertyOrder="19"],  {
        margin-right: 0;
      }
      &.disabled {
        opacity: 0;
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

  html.no-touch button:hover {
    background: #efefa7;
  }
</style>
