<template>
  <div id="app">
    <div class="header">
      <div class="title">Word Game</div>
      <div class="score">Score:<span class="score-value"></span></div>
    </div>
    <div class="definition-container">
      <div class="definition">
        <p>{{ definition }}</p>
      </div>
    </div>
    <div class="secret-word">
      <span class="letter-holder" v-for="(count, code) in secretWordObject" v-bind:data-character-code="code">&bull;</span>
    </div>
    <div class="keys">
      <div class="alpha" v-for="letter in alpha" v-bind:data-character-code="letter.dataCharacterCode" v-bind:data-qwerty-order="letter.dataQwertyOrder">{{ letter.letter }}</div>
      <!-- <div class="alpha" dataCharacterCode="122" dataQwertyOrder="20">z</div> -->
    </div>
    <div class="freebie-button special">*</div>
    <div class="skip-button special">⇥</div>
    <div class="attempts"></div>
    <p>Attempts left:<span class="attempts-left"></span></p>
    <button @click="getSecretWord" type="button" name="button">GET WORD</button>
    <!-- <button @click="getSecretWord" type="button" name="button">GET WORD</button> -->
  </div>
</template>

<script>
  // import jQuery from 'jQuery'

  export default {
    name: 'app',
    data() {
      return {
        alpha: [
          {
            "letter": "q",
            "dataCharacterCode": 113,
            "dataQwertyOrder": 1
          },
          {
            "letter": "w",
            "dataCharacterCode": 119,
            "dataQwertyOrder": 2
          },
          {
            "letter": "e",
            "dataCharacterCode": 101,
            "dataQwertyOrder": 3
          },
          {
            "letter": "r",
            "dataCharacterCode": 114,
            "dataQwertyOrder": 4
          },
          {
            "letter": "t",
            "dataCharacterCode": 116,
            "dataQwertyOrder": 5
          },
          {
            "letter": "y",
            "dataCharacterCode": 121,
            "dataQwertyOrder": 6
          },
          {
            "letter": "u",
            "dataCharacterCode": 117,
            "dataQwertyOrder": 7
          },
          {
            "letter": "i",
            "dataCharacterCode": 105,
            "dataQwertyOrder": 8
          },
          {
            "letter": "o",
            "dataCharacterCode": 111,
            "dataQwertyOrder": 9
          },
          {
            "letter": "p",
            "dataCharacterCode": 112,
            "dataQwertyOrder": 10
          },
          {
            "letter": "a",
            "dataCharacterCode": 97,
            "dataQwertyOrder": 11
          },
          {
            "letter": "s",
            "dataCharacterCode": 115,
            "dataQwertyOrder": 12
          },
          {
            "letter": "d",
            "dataCharacterCode": 100,
            "dataQwertyOrder": 13
          },
          {
            "letter": "f",
            "dataCharacterCode": 102,
            "dataQwertyOrder": 14
          },
          {
            "letter": "g",
            "dataCharacterCode": 103,
            "dataQwertyOrder": 15
          },
          {
            "letter": "h",
            "dataCharacterCode": 104,
            "dataQwertyOrder": 16
          },
          {
            "letter": "j",
            "dataCharacterCode": 106,
            "dataQwertyOrder": 17
          },
          {
            "letter": "k",
            "dataCharacterCode": 107,
            "dataQwertyOrder": 18
          },
          {
            "letter": "l",
            "dataCharacterCode": 108,
            "dataQwertyOrder": 19
          },
          {
            "letter": "z",
            "dataCharacterCode": 122,
            "dataQwertyOrder": 20
          },
          {
            "letter": "x",
            "dataCharacterCode": 120,
            "dataQwertyOrder": 21
          },
          {
            "letter": "c",
            "dataCharacterCode": 99,
            "dataQwertyOrder": 22
          },
          {
            "letter": "v",
            "dataCharacterCode": 118,
            "dataQwertyOrder": 23
          },
          {
            "letter": "b",
            "dataCharacterCode": 98,
            "dataQwertyOrder": 24
          },
          {
            "letter": "n",
            "dataCharacterCode": 110,
            "dataQwertyOrder": 25
          },
          {
            "letter": "m",
            "dataCharacterCode": 109,
            "dataQwertyOrder": 26
          }
        ],
        attempts: 0,
        debug: false,
        definition: '',
        errors: 0,
        inputAllow: false,
        qwerty: true,
        secretWord: '',
        secretWordObject: {},
        score: 0
      }
    },
    methods: {
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
          self.secretWord = response.data.word;
          console.log(self.secretWord);
          self.processSecretWord();
        })
        .catch(function(error) {
          console.log(error);
        });
      },
      getDefinition: function() {
        var self = this;
        self.$http.get('http://api.wordnik.com:80/v4/word.json/' + self.secretWord + '/definitions', {
          params: {
            limit: 2,
            includeRelated: false,
            useCanonical: true,
            includeTags: false,
            api_key: '65bc764390b4030e69a110bbfb408a56d163ce85ef94ff62a'
          }
        })
        .then(function(response) {
          console.log(response.data["0"].text);
          self.definition = response.data["0"].text;
        })
        .catch(function(error) {
          console.log(error);
        });
      },
      filterDefinition: function() {

      },
      filterSecretWord: function() {

      },
      processSecretWord: function() {
        this.secretWordObject = {};
        // populate secret word object: {97: 2, 101: 1, 103: 1, 116: 2, 119: 1} (wattage)
        for (var index = 0; index < this.secretWord.length; index++) {
          var character = this.secretWord.charCodeAt(index);
          if (this.secretWordObject[character]) {
            this.secretWordObject[character]++;
          } else {
            this.secretWordObject[character] = 1;
          }
        }
        // console.log('processSecretWord');
        console.log(this.secretWordObject);
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
        console.log('definition recevied');
      }
    },
    mounted() {
      this.getSecretWord();
    }
  }
</script>

<style lang="scss">
  @import '/assets/sass/_variables';
  @import '/assets/sass/_animation';

  @font-face {
    font-family: 'HouseMovements-Sign';
    src: url('/assets/fonts/HouseMovements-Sign.eot');
    src: url('/assets/fonts/HouseMovements-Sign.eot?#iefix') format('embedded-opentype'),
         url('/assets/fonts/HouseMovements-Sign.woff2') format('woff2'),
         url('/assets/fonts/HouseMovements-Sign.woff') format('woff'),
         url('/assets/fonts/HouseMovements-Sign.ttf') format('truetype'),
         url('/assets/fonts/HouseMovements-Sign.svg#HouseMovements-Sign') format('svg');
    font-weight: normal;
    font-style: normal;
  }

  *, *:before, *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  html {
    height: 100%;
  }

  body, input, button {
    font-family: 'Open Sans', sans-serif;
    font-weight: 400;
  }

  body {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: space-between;
    height: 100%;

    transform: translateZ(0);
    -webkit-transform: translate3d(0, 0, 0);

    background: $black;
    text-align: center;
    font-size: 14px;
    color: $gray;
    overflow: hidden;
    user-select: none;
    cursor: default;
    -webkit-font-smoothing: antialiased;
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

  .attempts {
    height: 20px;
    p {
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 12px;
      font-weight: 600;
      .attempts-left {
        display: inline-block;
        width: 15px;
        letter-spacing: 0;
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
