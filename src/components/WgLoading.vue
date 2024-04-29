<template>
  <div class="loading">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 100"
      width="600"
      height="100"
    >
      <path
        fill="none"
        stroke="black"
        stroke-width="10"
        d="M0 50 
          C 100 20, 200 80, 300 50 
          S 500 20, 600 50 
          S 700 80, 800 50
          S 900 20, 1000 50"
      >
        <animate
          attributeName="d"
          dur="1s"
          repeatCount="indefinite"
          values="
        M0 50 
        C 100 40, 200 60, 300 50 
        S 500 40, 600 50 
        S 700 60, 800 50
        S 900 40, 1000 50;
        M0 50 
        C 100 80, 200 20, 300 50 
        S 500 80, 600 50 
        S 700 20, 800 50
        S 900 80, 1000 50;
        M0 50 
        C 100 40, 200 60, 300 50 
        S 500 40, 600 50 
        S 700 60, 800 50
        S 900 40, 1000 50;
      "
        />
      </path>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
  .loading {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--yellow);
    z-index: 2;
  }
</style>