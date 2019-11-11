<template>
  <div id="app">
    <div class="title">
      <svg width="20" height="20" viewBox="0 0 20 20"><path d="M0,0V20H20V0H0ZM14,6H7V9h4v2H7v3h7v2H5V4h9V6Z"/></svg>
      <span>Word Game</span>
    </div>
    <div class="definition-container">
      <div class="definition">
        <transition name="bounce">
          <p v-if="ready">{{ definition }}</p>
        </transition>
      </div>
    </div>
    <div class="secret-word-container">
      <div class="secret-word" :class="{ 'secret-word--win': isWin }">
        <span class="secret-word__letter"
              v-if="ready"
              v-for="(letter, index) in secretWordArray"
              :key="index"
              :data-character-code="getCharacterCode(letter)"
              v-html="'&bull;'"
        >
        </span>
      </div>
    </div>
    <div class="selections">
      <!-- <div v-for="letter in incorrectLetters">{{ letter }}</div> -->
      <div v-for="(letter, index) in alphabet"
           :key="index"
           :class=""
      >
        {{ letter }}
      </div>
    </div>
  </div>
</template>

<script>
  import blacklist from '../static/blacklist'
  import { deburr } from 'lodash'

  export default {
    name: 'app',
    data() {
      return {
        // alphabet: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        attemptedLetters: [],
        // blacklist,
        definition: '',
        incorrectLetters: [],
        inputAllowed: false,
        isWin: false,
        // qwerty: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'],
        ready: false,
        secretWord: {
          string: '',
          // array: [],
          arrayClone: []
        },
        wins: 0
      }
    },
    computed: {
      alphabet() { return [...'abcdefghijklmnopqrstuvwxyz'] },
      qwerty() { return [...'qwertyuiopasdfghjklzxcvbnm'] },
      secretWordArray() { return [...this.secretWord.string] }
    },
    methods: {
      uniqueLetters() {
        // return _.uniq(this.secretWord.array).length
        return [...new Set(this.secretWord.array)].length
      },
      filterSecretWord() {
        return blacklist.includes(this.secretWord.string)
      },
      getSecretWord() {
        //^[a-z]+$ encodes to %5E%5Ba-z%5D%2B%24
        // https://www.url-encode-decode.com/
        fetch('https://wordsapiv1.p.rapidapi.com/words/?random=true&partOfSpeech=noun&letterPattern=%5E%5Ba-z%5D%2B%24&lettersMin=3&lettersMax=7&hasDetails=definitions', {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
            'x-rapidapi-key': 'bdd437dd2fmsh2e329e4673b085cp1bbabfjsnff92e1c4f99e'
          }
        })
        .then(response => {
          response.json().then(data => {
            // console.log(data.word)
            this.secretWord.string = _.deburr(data.word.toLowerCase())
            // console.log(data.results[0].definition)
            this.definition = data.results[0].definition
            this.processSecretWord()
          });
        })
        .catch(err => {
          // console.log(err);
          this.handleError('Whoa!', 'The most unknown error has occurred')
        });
      },
      getCharacterCode(letter) {
        return letter.charCodeAt()
      },
      getLetter(code) {
        return String.fromCharCode(code)
      },
      validateInput(code) {
        if (this.inputAllowed === true) {
          this.inputAllowed = false
          if (code >= 97 && code <= 122) {
            this.registerAttempt(code)
          } else {
            console.log('input not alphabetical')
            this.inputAllowed = true
          }
        }
      },
      registerAttempt(code) {
        if (this.attemptedLetters.includes(code)) {
          console.log('this letter has been tried')
          this.inputAllowed = true
        } else {
          this.attemptedLetters.push(code)
          this.checkWordForLetter(code)
        }
      },
      checkWordForLetter(code) {
        var letter = this.getLetter(code)
        if (this.secretWordArray.includes(letter)) {
          this.processInput(code)
        } else {
          console.log('this letter is not in the word')
          this.incorrectLetters.push(this.getLetter(code))
          this.inputAllowed = true
        }
      },
      handleError(error) {
        console.log(error)
      },
      init() {
        // console.log(config.apiKey)
        // console.clear()
        this.attemptedLetters = []
        this.backgroundLightness = 100
        this.incorrectLetters = []
        this.isWin = false
        this.ready = false
        // this.secretWord.array = []
        this.secretWord.string = ''
        this.secretWord.arrayClone = []
        this.getSecretWord()
      },
      processInput(code) {
        // remove it from array
        this.secretWord.arrayClone = this.secretWord.arrayClone.filter(a => { return a !== this.getLetter(code) })
        // console.log(this.secretWord.arrayClone)
        this.attemptedLetters.push(code)
        this.revealLetters(code)
        this.inputAllowed = true

        // if it's a win
        if (this.secretWord.arrayClone.length == 0) {
          console.log('YOU WIN')
          this.isWin = true
          this.inputAllowed = false
          setTimeout(() => { this.init() }, 1300)
        }
      },
      processSecretWord() {
        // console.log('Processing secret word…')
        // this.secretWord.array = this.secretWord.string.split('')
        // populate worker array
        this.secretWord.arrayClone = this.secretWordArray
        this.start()
      },
      revealLetters(code) {
        var spans = document.querySelectorAll('.secret-word span[data-character-code="' + code + '"]')
        Array.prototype.forEach.call(spans, span => {
          // div.style.color = "red"
          span.innerHTML = this.getLetter(code)
          span.className += ' highlight'
        })
      },
      start() {
        // console.log('Ready')
        console.log('Ready: ' + this.secretWord.string)
        this.ready = true
        setTimeout(() => {
          this.inputAllowed = true
          // console.log('Ready: Input allowed')
        }, 800)
      }
    },
    watch: {
      inputAllowed() {
        console.log(`Input allowed: ${this.inputAllowed}`)
      },
      // secretWord() {
      // }
    },
    created() {
      window.addEventListener('keypress', event => {
        this.validateInput(event.which)
      })
    },
    mounted() {
      this.init()
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

  .secret-word-container {
    flex: 1;
    display: flex;
    justify-content: center;
    position: relative;
    z-index: 10;
    width: 100%;
    .secret-word {
      display: flex;
      align-self: flex-start;
      // &--win {
      //   transform: scale(1.5);
      // }
      &__letter {
        position: relative;
        align-self: center;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 50px;
        letter-spacing: 12px;
        transition: all .15s cubic-bezier(0.29, 0.74, 0.04, 1.04);
        &:first-child {
          text-transform: uppercase;
        }
        &.highlight {
          font-family: 'HouseMovements-Sign';
          font-size: 150px;
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
    height: 60px;
    right: 0;
    bottom: 0;
    left: 0;
    padding-top: 14px;
    background: rgba(0,0,0,0.05);
    border-top: 1px solid rgba(0,0,0,0.05);
    display: flex;
    justify-content: center;
    div {
      width: 30px;
      height: 30px;
      line-height: 28px;
      text-transform: uppercase;
      color: $white;
      font-weight: 600;
      background: $error-red;
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
      align-self: center;
      max-width: 600px;
      p {
        padding-top: 30px;
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
