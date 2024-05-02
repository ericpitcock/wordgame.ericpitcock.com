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

<script setup>
  import { computed, ref, watch, onMounted } from 'vue'
  import WgLoading from '@/components/WgLoading.vue'
  import WgTitle from '@/components/WgTitle.vue'
  import data from './data.yaml'

  const correctLetters = ref([])

  const currentLevel = ref('Level 1')
  watch(currentLevel, () => localStorage.setItem('currentLevel', currentLevel.value))

  const currentStage = ref(0)
  watch(currentStage, () => localStorage.setItem('currentStage', currentStage.value.toString()))

  const definition = ref('')
  // const firstRun = ref(true)
  const incorrectLetters = ref([])
  const inputAllowed = ref(false)
  const isWin = ref(false)

  const ready = ref(false)
  watch(ready, () => { if (ready.value) console.log('ready') })

  const pulseWord = ref(false)
  const secretWord = ref('')

  const secretWordArray = computed(() => [...secretWord.value])
  // clone for comparison
  const secretWordArrayClone = ref([])
  watch(secretWordArrayClone, (newVal) => {
    if (newVal.length === 0) {
      winner()
    }
  })

  const secretWordEntrance = ref(false)
  const shakeWord = ref(false)
  const tadaWord = ref(false)

  const alphabet = [...'abcdefghijklmnopqrstuvwxyz']
  // const attemptedLetters = [...correctLetters.value, ...incorrectLetters.value];

  const progressBarFill = computed(() => ({
    width: currentStage.value === 0 ? '0%' : `${(currentStage.value) / data[currentLevel.value].length * 100}%`
  }))

  const secretWordClasses = computed(() => [
    'secret-word',
    'animate__animated',
    {
      'secret-word--win': isWin.value,
      'animate__heartBeat animate__faster': pulseWord.value,
      'animate__shakeX animate__faster': shakeWord.value,
      'animate__tada': tadaWord.value
    }
  ])

  const uniqueLettersCount = computed(() => [...new Set(secretWordArray.value)].length)
  const uniqueLettersArray = computed(() => [...new Set(secretWordArray.value)])

  const animateWord = (type, duration = 1000) => {
    eval(`${type}Word.value = true`)
    setTimeout(() => { eval(`${type}Word.value = false`) }, duration)
  }

  const checkWordForLetter = (charCode) => {
    const letter = getLetter(charCode)

    if (correctLetters.value.includes(letter)) {
      animateWord('pulse')
      return
    }

    if (secretWordArray.value.includes(letter)) {
      correctLetters.value.push(letter)
      processInput(charCode)
    } else {
      animateWord('shake', 500)
      removeLetter(letter)
    }
  }

  const displayCharacter = (letter) => (correctLetters.value.includes(letter) ? letter : '●')

  const getCharacterCode = (letter) => letter.charCodeAt()

  const getLetter = (charCode) => String.fromCharCode(charCode)

  const handleKeyPress = (event) => {
    handleInput(event.key.charCodeAt(0))
  }

  const handleInput = (charCode) => {
    if (!inputAllowed.value) return

    if (charCode >= 97 && charCode <= 122) {
      checkWordForLetter(charCode)
    }
  }

  const letterClasses = (letter) => [
    'selections__letter',
    'animate__animated',
    'animate__faster',
    {
      'correct': correctLetters.value.includes(letter),
      'animate__fadeOutDown': incorrectLetters.value.includes(letter)
    }
  ]

  const processInput = (charCode) => {
    secretWordArrayClone.value = secretWordArrayClone.value.filter(letter => letter !== getLetter(charCode))
  }

  const removeLetter = (letter) => {
    incorrectLetters.value.push(letter)
    setTimeout(() => {
      document.getElementById(letter + '-letter').classList.add('hidden')
    }, 600)
  }

  const restartGame = () => {
    setTimeout(() => {
      console.clear()
      correctLetters.value = []
      definition.value = ''
      incorrectLetters.value = []
      inputAllowed.value = false
      isWin.value = false
      ready.value = false
      pulseWord.value = false
      secretWord.value = ''
      secretWordArrayClone.value = []
      secretWordEntrance.value = false
      shakeWord.value = false
      tadaWord.value = false
      startGame()
    }, 1300)
  }

  const secretWordLetterClasses = (letter) => [
    'secret-word__letter',
    'animate__animated',
    {
      'highlight': correctLetters.value.includes(letter),
      'animate__bounceInUp': secretWordEntrance.value
    }
  ]

  const startGame = () => {
    secretWord.value = data[currentLevel.value][currentStage.value].word
    definition.value = data[currentLevel.value][currentStage.value].definition
    secretWordArrayClone.value = [...secretWordArray.value]
    ready.value = true
    secretWordEntrance.value = true

    setTimeout(() => {
      inputAllowed.value = true
      handleInput(getCharacterCode(secretWord.value[1]))
      handleInput(getCharacterCode(secretWord.value[3]))

      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]]
        }
        return array
      }

      const filteredAlphabet = alphabet.filter(letter => !uniqueLettersArray.value.includes(letter))
        .filter(letter => !incorrectLetters.value.includes(letter))

      const shuffledAlphabet = shuffleArray(filteredAlphabet)

      while (shuffledAlphabet.length > 10 - uniqueLettersCount.value) {
        const removedLetter = shuffledAlphabet.pop()
        removeLetter(removedLetter)
      }

      console.log(secretWord.value)
    }, 800)
  }

  const winner = () => {
    console.log('YOU WIN')
    isWin.value = true
    currentStage.value++
    if (currentStage.value === data[currentLevel.value].length) {
      currentLevel.value = `Level ${parseInt(currentLevel.value.split(' ')[1]) + 1}`
      currentStage.value = 0
    }
    animateWord('tada')
    restartGame()
  }

  onMounted(() => {
    // console.log(data)
    if (localStorage.getItem('currentLevel')) {
      currentLevel.value = localStorage.getItem('currentLevel')
    }

    if (localStorage.getItem('currentStage')) {
      currentStage.value = parseInt(localStorage.getItem('currentStage'))
    }
    startGame()
  })
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
