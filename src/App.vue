<template>
  <div class="word-game">
    <wg-loading v-if="!ready" />
    <wg-title />
    <div class="definition-container">
      <div class="definition">
        <transition name="bounce">
          <p v-if="ready">{{ definition }}</p>
        </transition>
      </div>
    </div>
    <div class="secret-word-container">
      <div
        v-if="ready"
        :class="secretWordClasses"
      >
        <span
          v-for="(letter, index) in secretWordArray"
          :key="index"
          :class="secretWordLetterClasses(letter)"
          :data-character-code="getCharacterCode(letter)"
          v-html="displayCharacter(letter)"
        />
      </div>
    </div>
    <div class="selections">
      <div
        v-for="(letter, index) in alphabet"
        :key="index"
        :id="letter + '-letter'"
        :class="letterClasses(letter)"
        @click="handleInput(getCharacterCode(letter))"
      >
        {{ letter }}
      </div>
      <!-- <div
        v-for="(letter, index) in incorrectLetters"
        :key="index"
      >
        {{ letter }}
      </div> -->
      <!-- <div>slider down here from no points to max points. it gets smaller as you
        choose
        the wrong letters</div> -->
    </div>
  </div>
</template>

<script>
  // import _ from 'lodash'
  import WgLoading from '@/components/WgLoading.vue'
  import WgTitle from '@/components/WgTitle.vue'

  export default {
    name: 'app',
    components: {
      WgLoading,
      WgTitle
    },
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
        secretWordEntrance: false,
        shakeWord: false,
        tadaWord: false
      }
    },
    computed: {
      alphabet() { return [...'abcdefghijklmnopqrstuvwxyz'] },
      qwerty() { return [...'qwertyuiopasdfghjklzxcvbnm'] },
      secretWordArray() { return [...this.secretWord] },
      secretWordClasses() {
        return [
          'secret-word',
          'animate__animated',
          {
            'secret-word--win': this.isWin,
            'animate__heartBeat animate__faster': this.pulseWord,
            'animate__shakeX animate__faster': this.shakeWord,
            'animate__tada': this.tadaWord
          }
        ]
      },
      uniqueLetters() { return [...new Set(this.secretWordArray)].length }
    },
    methods: {
      animateWord(type, duration = '1000') {
        this[`${type}Word`] = true
        setTimeout(() => { this[`${type}Word`] = false }, duration)
      },
      checkWordForLetter(charCode) {
        var letter = this.getLetter(charCode)
        // if word contains letter
        if (this.secretWordArray.includes(letter)) {
          this.correctLetters.push(letter)
          // this.processInput(code)
          // if word doesn't contain letter
        } else {
          // console.log('this letter is not in the word')
          this.animateWord('shake', 500)
          // this.incorrectLetters.push(letter)

          this.removeLetter(letter)
          // // add hidden class to letter
          // setTimeout(() => {
          //   document.getElementById(letter + '-letter').classList.add('hidden')
          // }, 500)

          // this.inputAllowed = true
        }
      },
      displayCharacter(letter) {
        return (this.correctLetters.includes(letter)) ? letter : '&lowbar;'
      },
      filterSecretWord(word) {
        // eslint-disable-next-line no-undef
        const badlist = import.meta.env.VITE_APP_BAD_WORDS.split(',')
        return badlist.includes(word)
      },
      getSecretWord() {
        const apiUrl = 'https://wordsapiv1.p.rapidapi.com/words/'
        const queryParams = {
          random: true,
          partOfSpeech: 'noun',
          letterPattern: '^([a-z]+)$',
          lettersMin: 5,
          lettersMax: 5,
          hasDetails: 'definitions,typeOf'
        }

        const queryString = Object.keys(queryParams)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
          .join('&')

        const url = `${apiUrl}?${queryString}`

        fetch(url, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
            'x-rapidapi-key': import.meta.env.VITE_APP_WORDS_API_KEY
          }
        })
          .then(response => {
            response.json().then(data => {
              this.processFetchedData(data)
            })
          })
          .catch(error => {
            console.log(error)
          })
      },
      getCharacterCode(letter) {
        return letter.charCodeAt()
      },
      getLetter(charCode) {
        return String.fromCharCode(charCode)
      },
      handleInput(charCode) {
        if (!this.inputAllowed) return
        // validate input
        if (!this.validateInput(charCode)) return
        // if valid, go ahead
        this.registerAttempt(charCode)
        this.checkWordForLetter(charCode)
        this.processInput(charCode)
      },
      init() {
        setTimeout(() => {
          console.clear()
          this.attemptedLetters = []
          this.correctLetters = []
          this.definition = ''
          this.freebieAvailable = true
          this.incorrectLetters = []
          this.isWin = false
          this.ready = false
          this.secretWord = ''
          this.secretWordArrayClone = []
          this.getSecretWord()
        }, 1300)
      },
      letterClasses(letter) {
        return [
          'selections__letter',
          'animate__animated',
          'animate__faster',
          {
            'correct': this.correctLetters.includes(letter),
            'animate__fadeOutDown': this.incorrectLetters.includes(letter)
          }
        ]
      },
      processFetchedData(data) {
        if (!data.frequency || data.frequency < 3) {
          console.log('Word frequency is missing or too low. Getting another...')
          this.getSecretWord()
          return
        }

        let secretWord = data.word
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')

        // if the word is in the bad list, get another
        if (this.filterSecretWord(secretWord)) {
          console.log(`Word, ${secretWord}, filtered out. Getting another...`)
          this.getSecretWord()
          return
        }

        this.secretWord = secretWord
        this.definition = data.results[0].definition

        this.secretWordArrayClone = [...this.secretWordArray]
        this.startGame()

        console.log('results', data)
      },
      processInput(charCode) {
        // remove it from array
        this.secretWordArrayClone = this.secretWordArrayClone.filter(letter => { return letter !== this.getLetter(charCode) })
        // this.inputAllowed = true

        // if it's a win
        if (this.secretWordArrayClone.length == 0) {
          this.winner()
        }
      },
      registerAttempt(charCode) {
        // if it's already been tried, animate the word
        if (this.attemptedLetters.includes(charCode)) {
          console.log('this letter has been tried', charCode)
          this.animateWord('pulse', 500)
          return
        }

        this.attemptedLetters.push(charCode)
      },
      removeLetter(letter) {
        this.incorrectLetters.push(letter)
        setTimeout(() => {
          document.getElementById(letter + '-letter').classList.add('hidden')
        }, 500)
      },
      // skip() {
      //   this.secretWordArrayClone.forEach(letter => this.correctLetters.push(letter))
      //   this.init()
      // },
      secretWordLetterClasses(letter) {
        return [
          'secret-word__letter',
          'animate__animated',
          {
            'highlight': this.correctLetters.includes(letter),
            'animate__bounceInUp': this.secretWordEntrance
          }
        ]
      },
      startGame() {
        this.ready = true
        this.secretWordEntrance = true

        setTimeout(() => {
          this.inputAllowed = true

          // give two freebie letters
          this.handleInput(this.getCharacterCode(this.secretWord[1]))
          this.handleInput(this.getCharacterCode(this.secretWord[3]))

          // remove random letters that aren't in the word
          for (let i = 0; i < 20; i++) {
            let randomLetter = this.alphabet[Math.floor(Math.random() * this.alphabet.length)]
            if (!this.secretWordArray.includes(randomLetter)) {
              this.removeLetter(randomLetter)
            }
          }
        }, 800)
      },
      validateInput(charCode) {
        return (charCode >= 97 && charCode <= 122) ? true : false
      },
      winner() {
        console.log('YOU WIN')
        this.isWin = true
        this.animateWord('tada')
        this.inputAllowed = false
        this.init()
      }
    },
    watch: {
      ready() {
        if (this.ready) console.log('ready')
      },
    },
    created() {
      window.addEventListener('keypress', event => {
        this.handleInput(event.key.charCodeAt(0))
      })
    },
    mounted() {
      this.getSecretWord()
    }
  }
</script>

<style lang="scss">
  @import '../node_modules/the-new-css-reset/css/reset.css';
  @import '../node_modules/animate.css/animate.min.css';

  :root {
    --black: hsl(0 0% 0%);
    --green: hsl(86 42% 61%);
    --red-orange: hsl(13, 63%, 57%);
    --white: hsl(0 0% 100%);
    --yellow: hsl(43, 63%, 52%);
    --yellow-dark: hsl(43, 63%, 42%);
  }

  @font-face {
    font-family: 'HouseMovements-Sign';
    src: url('/fonts/HouseMovements-Sign.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
  }

  // import AstridGrotesk if I use it
  html {
    height: 100%;
  }

  body,
  input,
  button {
    font-family: 'AstridGrotesk-Bd', sans-serif;
  }

  body {
    height: 100%;
    background: var(--yellow);
    text-align: center;
    font-size: 14px;
    // font-family: 'AstridGrotesk-Bd', sans-serif;
    font-family: 'AstridGrotesk-Hv', sans-serif;
    color: var(--black);
    user-select: none;
    cursor: default;
    -webkit-font-smoothing: antialiased;
    // this is supposed to help with the flicker
    transform: translateZ(0);
    -webkit-transform: translate3d(0, 0, 0);
  }

  .word-game {
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

  .secret-word-container {
    flex: 1;
    display: flex;
    justify-content: center;
    position: relative;
    // z-index: 10;
    // width: 100%;
    overflow: hidden;

    .secret-word {
      display: flex;

      &--win {
        .secret-word__letter {
          color: var(--green) !important;
        }
      }

      &--loss {
        color: var(--red-orange);
      }

      &__letter {
        position: relative;
        align-self: center;
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
          color: white;
          text-shadow: -5px 7px 0px black;
          -webkit-text-stroke: 2px black;
          text-stroke: 1px black;

          // custom kerning for T* (except l and i)
          &:first-child[data-character-code="116"] + *:not([data-character-code="104"]):not([data-character-code="105"]) {
            margin-left: -9px;
          }
        }
      }
    }
  }

  .selections {
    flex: 1;
    // padding-top: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;

    &__letter {
      width: 30px;
      height: 30px;
      line-height: 28px;
      text-transform: uppercase;
      color: var(--black);
      font-weight: 600;
      background: var(--white);
      border: 1px solid var(--black);
      border-radius: 4px;
      box-shadow: -2px 2px 0 var(--black);
      transition: position .2s ease-in-out;
      cursor: pointer;

      &.correct {
        background: var(--green);
      }

      &.incorrect {
        // display: none;
        position: relative;
        top: 10px;
        opacity: 0.5;
      }

      &.hidden {
        display: none;
      }
    }

    .freebie {
      &--disabled {
        opacity: 0.25;
      }
    }
  }

  .definition-container {
    // height: 200px;
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
        font-size: 32px;
        line-height: 36px;
        font-weight: 400;

        &:first-letter {
          text-transform: capitalize;
        }
      }
    }
  }
</style>
