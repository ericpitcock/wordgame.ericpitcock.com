<template>
  <div
    class="word-game"
    @keypress="handleKeyPress"
    tabindex="0"
  >
    <transition name="fade">
      <wg-loading v-show="!ready" />
    </transition>
    <wg-title />
    <div class="progress-container">
      <div class="stage-labels">
        {{ currentLevel }}
      </div>
      <div class="progress-bar">
        <div
          class="progress-bar__fill"
          :style="progressBarFill"
        />
      </div>
    </div>
    <div class="definition-container">
      <div class="definition">
        <p v-if="ready">{{ definition }}</p>
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
    </div>
  </div>
</template>

<script>
  import WgLoading from '@/components/WgLoading.vue'
  import WgTitle from '@/components/WgTitle.vue'
  import data from './data.yaml'

  export default {
    name: 'app',
    components: {
      WgLoading,
      WgTitle
    },
    data() {
      return {
        correctLetters: [],
        currentLevel: 'Level 1',
        currentStage: 0,
        data,
        definition: '',
        firstRun: true,
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
      // attemptedLetters() { return [...this.correctLetters, ...this.incorrectLetters] },
      progressBarFill() {
        return {
          width: this.currentStage === 0
            ? '0%'
            : `${(this.currentStage) / this.data[this.currentLevel].length * 100}%`
        }
      },
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
      uniqueLettersCount() { return [...new Set(this.secretWordArray)].length },
      uniqueLettersArray() { return [...new Set(this.secretWordArray)] },
    },
    methods: {
      animateWord(type, duration = '1000') {
        this[`${type}Word`] = true
        setTimeout(() => { this[`${type}Word`] = false }, duration)
      },
      checkWordForLetter(charCode) {
        var letter = this.getLetter(charCode)

        if (this.secretWordArray.includes(letter)) {
          // if word contains letter
          this.correctLetters.push(letter)
          this.processInput(charCode)
        } else {
          this.animateWord('shake', 500)
          this.removeLetter(letter)
        }
      },
      displayCharacter(letter) {
        return (this.correctLetters.includes(letter)) ? letter : '●'
      },
      filterSecretWord(word) {
        // eslint-disable-next-line no-undef
        const badlist = import.meta.env.VITE_APP_BAD_WORDS.split(',')
        return badlist.includes(word)
      },
      getCharacterCode(letter) {
        return letter.charCodeAt()
      },
      getLetter(charCode) {
        return String.fromCharCode(charCode)
      },
      handleKeyPress(event) {
        this.handleInput(event.key.charCodeAt(0))
      },
      handleInput(charCode) {
        if (!this.inputAllowed) return
        // if it's a letter, continue
        if (charCode >= 97 && charCode <= 122) {
          this.checkWordForLetter(charCode)
          // this.processInput(charCode)
        }
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
      processInput(charCode) {
        // remove it from array
        this.secretWordArrayClone = this.secretWordArrayClone
          .filter(letter => { return letter !== this.getLetter(charCode) })
      },
      removeLetter(letter) {
        this.incorrectLetters.push(letter)
        setTimeout(() => {
          document.getElementById(letter + '-letter').classList.add('hidden')
        }, 600)
      },
      restartGame() {
        setTimeout(() => {
          console.clear()
          this.correctLetters = []
          this.definition = ''
          this.incorrectLetters = []
          this.inputAllowed = false
          this.isWin = false
          this.ready = false
          this.pulseWord = false
          this.secretWord = ''
          this.secretWordArrayClone = []
          this.secretWordEntrance = false
          this.shakeWord = false
          this.tadaWord = false
          this.startGame()
        }, 1300)
      },
      // skip() {
      //   this.secretWordArrayClone.forEach(letter => this.correctLetters.push(letter))
      //   this.restartGame()
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
        this.secretWord = this.data[this.currentLevel][this.currentStage].word
        this.definition = this.data[this.currentLevel][this.currentStage].definition

        this.secretWordArrayClone = [...this.secretWordArray]

        setTimeout(() => {
          this.ready = true
        }, 1000)
        this.secretWordEntrance = true

        setTimeout(() => {
          this.inputAllowed = true

          // give two freebie letters
          this.handleInput(this.getCharacterCode(this.secretWord[1]))
          this.handleInput(this.getCharacterCode(this.secretWord[3]))

          // filter uniqueLetters from alphabet
          // Shuffle function to randomize array elements
          function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [array[i], array[j]] = [array[j], array[i]]
            }
            return array
          }

          const filteredAlphabet = this.alphabet
            .filter(letter => !this.uniqueLettersArray.includes(letter))
            .filter(letter => !this.incorrectLetters.includes(letter))

          // console.log('filteredAlphabet', filteredAlphabet)

          // Shuffle the filtered alphabet
          const shuffledAlphabet = shuffleArray(filteredAlphabet)

          // Remove letters until only 10 remain
          while (shuffledAlphabet.length > 10 - this.uniqueLettersCount) {
            const removedLetter = shuffledAlphabet.pop() // Remove the last letter
            this.removeLetter(removedLetter)
          }

          console.log('this.secretWordArray', this.secretWordArray)
          console.log('this.secretWordArrayClone', this.secretWordArrayClone)
          console.log('this.secretWord', this.secretWord)

          // console.log('incorrectLetters', this.incorrectLetters)
        }, 800)
      },
      winner() {
        console.log('YOU WIN')
        this.isWin = true
        this.currentStage++
        // if currentStage is the last stage, change Level to the next one
        if (this.currentStage === this.data[this.currentLevel].length) {
          this.currentLevel = `Level ${parseInt(this.currentLevel.split(' ')[1]) + 1}`
          this.currentStage = 0
        }
        this.animateWord('tada')
        this.restartGame()
      }
    },
    watch: {
      ready() {
        if (this.ready) console.log('ready')
      },
      secretWordArrayClone(newVal) {
        if (newVal.length === 0) {
          this.winner()
        }
      },
    },
    mounted() {
      console.log(this.data)
      this.startGame()

      // if (localStorage.getItem('firstRun') === 'false') {
      //   this.startGame()
      //   this.firstRun = false
      //   return
      // }

      // if (localStorage.getItem('firstRun') === null && this.firstRun) {
      //   this.secretWord = 'happy'
      //   this.definition = 'Enjoying or characterized by well-being and contentment'
      //   this.secretWordArrayClone = [...this.secretWordArray]
      //   this.startGame()
      //   this.firstRun = false
      //   // set local storage
      //   localStorage.setItem('firstRun', 'false')
      //   return
      // }

      // if (localStorage.getItem('firstRun') === 'false' && !this.firstRun) {
      //   this.getSecretWord()
      // }
    }
  }
</script>

<style lang="scss">
  @import '../node_modules/the-new-css-reset/css/reset.css';
  @import '../node_modules/animate.css/animate.min.css';
  @import './assets/scss/fonts.scss';

  :root {
    --black: hsl(0 0% 0%);
    --green: hsl(86 42% 61%);
    --red-orange: hsl(13, 63%, 57%);
    --white: hsl(0 0% 100%);
    --yellow-light: hsl(43 81% 75%);
    --yellow: hsl(43, 63%, 52%);
    --yellow-dark: hsl(43, 63%, 42%);
  }

  html,
  body,
  #app {
    height: 100%;
  }

  body,
  input,
  button {
    font-family: 'AstridGroteskExtraBold', sans-serif;
  }

  body {
    background: var(--yellow);
    text-align: center;
    font-size: 14px;
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
    padding: 2%;
    overflow: hidden;
    transition: background-color 0.5s ease;
  }

  .progress-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    z-index: 3;
  }

  .progress-bar {
    position: relative;
    width: 200px;
    height: 10px;
    background: var(--yellow-light);
    border: 1px solid var(--black);
    border-radius: 4px;
    box-shadow: -2px 2px 0 var(--black);
    overflow: hidden;

    &__fill {
      height: 100%;
      background: var(--green);
      transition: width 0.5s ease;
    }
  }

  .secret-word-container {
    flex: 2;
    display: flex;
    justify-content: center;
    position: relative;

    .secret-word {
      display: flex;

      &--win {
        .secret-word__letter {
          color: var(--white) !important;
        }
      }

      &--loss {
        color: var(--red-orange);
      }

      &__letter {
        position: relative;
        align-self: center;
        font-size: 50px;
        // letter-spacing: 12px;
        transition: all .4s cubic-bezier(0.29, 0.74, 0.04, 1.04);

        &:first-child {
          text-transform: uppercase;
        }

        &.highlight {
          font-family: 'HouseMovements-Sign';
          font-size: 150px;
          letter-spacing: 0;
          color: var(--yellow-light);
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
    flex: 2;
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
      background: var(--yellow);
      border: 1px solid var(--black);
      border-radius: 4px;
      box-shadow: -2px 2px 0 var(--black);
      transition: position .2s ease-in-out;
      cursor: pointer;

      &.correct {
        background: var(--yellow-light);
        cursor: default;
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
    display: flex;
    flex: 2;
    justify-content: center;

    &::-webkit-scrollbar {
      display: none;
    }

    .definition {
      align-self: center;
      width: 50%;
      max-width: 800px;

      p {
        font-size: 32px;
        line-height: 36px;

        &:first-letter {
          text-transform: capitalize;
        }
      }
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
</style>
