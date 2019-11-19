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
      <div v-if="ready"
           :class="[
           'secret-word',
           { 'secret-word--win': isWin,
             'animated pulse faster': pulseWord,
             'animated shake faster': shakeWord,
             'animated tada': tadaWord
           }]"
      >
        <span :class="[
              'secret-word__letter',
              { 'highlight': correctLetters.includes(letter),
                'animated bounceInUp': secretWordEntrace
              }]"
              v-for="(letter, index) in secretWordArray"
              :key="index"
              :data-character-code="getCharacterCode(letter)"
              v-html="displayCharacter(letter)"
        />
      </div>
    </div>
    <div class="selections">
      <!-- <div v-for="letter in incorrectLetters">{{ letter }}</div> -->
      <div v-for="(letter, index) in alphabet"
           :key="index"
           :class="getLetterClass(letter)"
           @click="registerAttempt(getCharacterCode(letter))"
      >
        {{ letter }}
      </div>
      <div @click="checkWordForLetter(getCharacterCode(getRandomLetter()))">freebie</div>
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
        attemptedLetters: [],
        correctLetters: [],
        definition: '',
        incorrectLetters: [],
        inputAllowed: false,
        isWin: false,
        ready: false,
        pulseWord: false,
        secretWord: '',
        secretWordArrayClone: [],
        secretWordEntrace: false,
        shakeWord: false,
        tadaWord: false
      }
    },
    computed: {
      alphabet() { return [...'abcdefghijklmnopqrstuvwxyz'] },
      qwerty() { return [...'qwertyuiopasdfghjklzxcvbnm'] },
      secretWordArray() { return [...this.secretWord] },
      uniqueLetters() { return [...new Set(this.secretWordArray)].length }
    },
    methods: {
      animateWord(type, duration='1000') {
        switch(type) {
          case 'pulse':
            this.pulseWord = true
            setTimeout(() => { this.pulseWord = false }, duration)
            break
          case 'shake':
            this.shakeWord = true
            setTimeout(() => { this.shakeWord = false }, duration)
            break
          case 'tada':
            this.tadaWord = true
            setTimeout(() => { this.tadaWord = false }, duration)
            break
          default:
            break
        }
      },
      checkWordForLetter(code) {
        var letter = this.getLetter(code)
        // if word contains letter
        if (this.secretWordArray.includes(letter)) {
          this.correctLetters.push(letter)
          // this.processInput(code)
        // if word doesn't contain letter
        } else {
          // console.log('this letter is not in the word')
          this.animateWord('shake', 500)
          this.incorrectLetters.push(letter)
          this.inputAllowed = true
        }
      },
      displayCharacter(letter) {
        return (this.correctLetters.includes(letter)) ? letter : '&bull;'
      },
      filterSecretWord(word) {
        // console.log('filtering secret word')
        return blacklist.includes(word)
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
            let secretWord = _.deburr(data.word.toLowerCase())
            // if not in blacklist, proceed
            if (!this.filterSecretWord(secretWord)) {
              this.secretWord = secretWord
              this.definition = data.results[0].definition
            } else {
              console.log(`Word, ${secretWord}, blacklisted`)
              this.getSecretWord
            }
          });
        })
        .catch(err => {
          this.handleError('Whoa!', 'The most unknown error has occurred')
        });
      },
      getCharacterCode(letter) {
        return letter.charCodeAt()
      },
      getLetter(code) {
        return String.fromCharCode(code)
      },
      getLetterClass(letter) {
        if (this.correctLetters.includes(letter)) {
          return 'correct'
        } else if (this.incorrectLetters.includes(letter)) {
          return 'incorrect'
        }
      },
      getRandomLetter() {
        return this.secretWordArrayClone[Math.floor(Math.random() * this.secretWordArrayClone.length)]
      },
      handleError(error) {
        console.log(error)
      },
      handleKeypress(code) {
        // validate input
        if (!this.validateInput(code)) return
        // if valid, go ahead
        this.registerAttempt(code)
        this.checkWordForLetter(code)
        this.processInput(code)
      },
      init() {
        console.clear()
        this.attemptedLetters = []
        this.correctLetters = []
        this.definition = ''
        this.incorrectLetters = []
        this.isWin = false
        this.ready = false
        this.secretWord = ''
        this.secretWordArrayClone = []
        this.getSecretWord()
      },
      processInput(code) {
        // remove it from array
        this.secretWordArrayClone = this.secretWordArrayClone.filter(letter => { return letter !== this.getLetter(code) })
        this.inputAllowed = true

        // if it's a win
        if (this.secretWordArrayClone.length == 0) {
          console.log('YOU WIN')
          this.isWin = true
          this.animateWord('tada')
          this.inputAllowed = false
          setTimeout(() => { this.init() }, 1300)
        }
      },
      registerAttempt(code) {
        // if it's already been tried, do nothing
        if (this.attemptedLetters.includes(code)) {
          console.log('this letter has been tried')
          this.animateWord('pulse', 500)
          this.inputAllowed = true
        // if this is the first try, register the attempt and check the word
        } else {
          this.attemptedLetters.push(code)
          // console.log('attemptedLetters registerAttempt')
          this.checkWordForLetter(code)
        }
      },
      start() {
        // console.log('Ready')
        console.log(`Ready: ${this.secretWord}`)
        this.ready = true
        this.secretWordEntrace = true
        setTimeout(() => {
          this.inputAllowed = true
          // console.log('Ready: Input allowed')
        }, 800)
      },
      validateInput(code) {
        return (code >= 97 && code <= 122) ? true : false
      }
    },
    watch: {
      inputAllowed() {
        console.log(`Input allowed: ${this.inputAllowed}`)
      },
      // attemptedLetters() {
      //   if (this.attemptedLetters) console.log(`Attempted: ${this.attemptedLetters}`)
      // },
      // correctLetters() {
      //   if (this.correctLetters) console.log(`Correct: ${this.correctLetters}`)
      // },
      // incorrectLetters() {
      //   if (this.incorrectLetters) console.log(`Incorrect: ${this.incorrectLetters}`)
      // },
      secretWord() {
        this.secretWordArrayClone = this.secretWordArray
        this.start()
      }
    },
    created() {
      window.addEventListener('keypress', event => {
        this.handleKeypress(event.which)
      })
    },
    mounted() {
      this.getSecretWord()
    }
  }
</script>

<style lang="scss">
  @import '/assets/sass/_reset';
  @import '/assets/sass/_variables';
  @import '../node_modules/animate.css/animate.min.css';

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
    overflow: hidden;
    // z-index: 1;
    .secret-word {
      display: flex;
      // align-self: flex-start;
      &--win {
        color: $green;
      }
      &--loss {
        color: $red-orange;
      }
      &__letter {
        position: relative;
        align-self: center;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 50px;
        letter-spacing: 12px;
        transition: all .4s cubic-bezier(0.29, 0.74, 0.04, 1.04);
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
    // &.animated.shake {
    //   -webkit-animation-duration: .5s;
    // }
  }

  .selections {
    // height: 60px;
    // right: 0;
    // bottom: 0;
    // left: 0;
    flex: 1;
    padding-top: 14px;
    background: rgba(0,0,0,0.05);
    border-top: 1px solid rgba(0,0,0,0.05);
    display: flex;
    justify-content: center;
    // z-index: 2;
    div {
      width: 30px;
      height: 30px;
      line-height: 28px;
      text-transform: uppercase;
      color: $dark-gray;
      font-weight: 600;
      background: $white;
      border: 1px solid #e6e6e6;
      & + div {
        margin-left: 10px;
      }
      &.correct {
        background: $green;
      }
      &.incorrect {
        background: red;
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
