<template>
  <div id="app">
    <div class="header">
      <div class="title">Word Game</div>
      <div class="score">Score:<span class="score-value"></span></div>
    </div>
    <div class="definition-container">
      <div class="definition">
        <transition name="bounce">
          <p v-if="ready">{{ definition }}</p>
        </transition>
      </div>
    </div>
    <div class="secret-word">
      <span class="letter-holder" v-if="ready" v-for="letter in secretWord.split('')" v-bind:data-character-code="getCharacterCode(letter)">&bull;</span>
    </div>
    <div ref="selections" class="selections">
      <div class="alpha" v-for="(code, letter) in alpha" v-bind:data-character-code="code">{{ letter }}</div>
    </div>
    <div class="buttons">
      <button @click="getSecretWord" type="button" name="button">GET WORD</button>
      <button @click="" type="button" name="button">FREEBIE</button>
      <button @click="" type="button" name="button">SKIP</button>
    </div>
  </div>
</template>

<script>
  import $ from 'jquery'

  export default {
    name: 'app',
    config: {
      keyCodes: {

      }
    },
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
        debug: false,
        definition: '',
        errors: 0,
        excludeWords: [
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
        inputAllow: false,
        qwerty: true,
        ready: false,
        secretWord: '',
        score: 0
      }
    },
    methods: {
      getDefinition: function() {
        var self = this;
        self.$http.get('http://api.wordnik.com:80/v4/word.json/' + self.secretWord + '/definitions', {
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
          console.log(self.definition);
          self.filterDefinition();
        })
        .catch(function(error) {
          console.log(error);
        });
      },
      getSecretWord: function() {
        var self = this;
        self.ready = false;
        self.secretWord = '';
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
          self.secretWord = response.data.word;
          console.log(self.secretWord);
          self.filterSecretWord();
        })
        .catch(function(error) {
          console.log(error);
        });
      },
      filterDefinition: function() {
        // the word is in the defintion, run it again
        if (this.definition.toUpperCase().indexOf(this.secretWord.toUpperCase()) != -1) {
          this.getSecretWord();
        } else if (this.definition.length > 150) {
        this.getSecretWord();
        // they passed, play on
        } else {
          // remove category, if present. Splitting at three spaces '   ' and returning the end portion
          this.definition = this.definition.split(/ {3,}/).pop();
          this.requestCount = 0;
          this.ready = true;
        }
      },
      filterSecretWord: function() {
        // secret word is naughty, run it again
        if ($.inArray(this.secretWord, this.excludeWords) > -1) {
          this.getSecretWord();
        // secret word has bad characters, run it again
        } else if (this.secretWord.search(/^[a-z]+$/)) {
          this.getSecretWord();
        // secret word is good to go, get definition
        } else {
          this.getDefinition();
        }
      },
      processSecretWord: function() {
        // this.secretWord.object = {};
        // populate secret word object: {97: 2, 101: 1, 103: 1, 116: 2, 119: 1} (wattage)
        // for (var index = 0; index < this.secretWord.string.length; index++) {
        //   var character = this.secretWord.string.charCodeAt(index);
        //   if (this.secretWord.object[character]) {
        //     this.secretWord.object[character]++;
        //   } else {
        //     this.secretWord.object[character] = 1;
        //   }
        // }
        // populate secretWordArray
        // this.secretWord.array = this.secretWord.string.split('');
        // console.log('processSecretWord');
        // console.log(this.secretWord);
        // console.log('array ' + this.secretWord.array);
        // console.log('object ' + JSON.stringify(this.secretWord.object));
      },
      getCharacterCode: function(letter) {
        return letter.charCodeAt();
      },
      handleInput: function(code) {
        // check if it's a-z
        if (code >= 97 && code <= 122) {
          // check if the letter is in the word
          var letter = String.fromCharCode(code);
          if (this.secretWord.indexOf(letter) > -1) {
            $('.secret-word span[data-character-code="' + code + '"]').each(function() {
              $(this).html(letter).addClass('highlight');
            });
          } else {
            console.log(letter + ' not in word');
          }
        }
      }
    },
    // computed: {
    //   secretWordObject: function() {
    //     //
    //   }
    // },
    watch: {
      secretWord: function() {
        // this.processSecretWord();
      },
      definition: function() {
        // do stuff
        // console.log('definition recevied');
      }
    },
    mounted: function() {
      this.getSecretWord();
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
    // display: flex;
    // flex-direction: column;
    // flex-wrap: wrap;
    // justify-content: space-between;
    height: 100%;

    transform: translateZ(0);
    -webkit-transform: translate3d(0, 0, 0);

    background: $black;
    text-align: center;
    font-size: 14px;
    color: $gray;
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

  .header {
    height: 30px;
    padding-top: 8px;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 600;

    .title, .score {
      float: left;
      width: 50%;
    }

    .title {
      text-align: right;
      padding-right: 20px;
    }

    .score {
      text-align: left;
      padding-left: 21px;
      border-left: 1px solid $subtle-gray;
      transition: all 1s ease-in-out;

      .score-value.updating {
        color: $white;
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
      align-self: center;
      max-width: 760px;

      p {
        text-align: center;
        font-size: 26px;
        line-height: 32px;
        font-family: 'News Cycle', sans-serif;
        font-weight: 400;

        &:first-letter {
          text-transform: capitalize;
        }
      }
    }
  }

  .secret-word {
    flex: 1;
    display: flex;
    justify-content: center;
    line-height: 0;
    position: relative;
    z-index: 10;
    width: 100%;

    span.letter-holder {
      position: relative;
      align-self: center;
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
        font-size: 15vh;

        // custom kerning for T* (except l and i)
        &:first-child[dataCharacterCode="116"] + *:not([dataCharacterCode="104"]):not([dataCharacterCode="105"]) {
          margin-left: -9px;
        }
      }
    }

    &.win {
      span.letter-holder /* , &:after  */{
        color: $green;
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
    display: flex;
    justify-content: center;
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

  @media (min-width: 375px) {
    .header {
      padding-top: 20px;
    }
  }

  @media (min-width: 769px) {

      .definition-container {
          .definition {
              p {
                  font-size: 36px;
                  line-height: 42px;
              }
          }
      }

      .secret-word {
          span.letter-holder {
              &.highlight {
                  // custom kerning for T* (except l and i)
                  &:first-child[dataCharacterCode="116"] + *:not([dataCharacterCode="104"]):not([dataCharacterCode="105"]) {
                      margin-left: -21px;
                  }

                  // custom kerning for P*
                  &:first-child[dataCharacterCode="112"] + * {
                      margin-left: -4px;
                  }
              }
          }
      }

      .keys {
          position: relative;
          bottom: auto;
          height: 60px;
          max-width: 1140px;
          padding: 12px 0 0 0;
          border-top: 1px solid $subtle-gray;
          margin: 80px auto 20px auto;

          div {
              width: 3.3333333333%;
              border: none;
              margin: 0;
              cursor: pointer;

              &.disabled {
                  cursor: default;
              }

              &.freebie-button {
                  position: relative;
                  top: 3px;
                  height: 28px;
                  text-align: right;
                  margin-left: 10px;
                  padding-right: 8px;
                  border-radius: 0;
                  border-left: 1px solid $subtle-gray;
              }
          }
      }

      .attempts {
          position: relative;
      }
  }
</style>
