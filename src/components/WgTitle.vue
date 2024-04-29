<template>
  <div class="title">
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
    >
      <path
        fill="black"
        d="M0,0V20H20V0H0ZM14,6H7V9h4v2H7v3h7v2H5V4h9V6Z"
      />
    </svg>
    <span>Word Game</span>
  </div>
</template>

<style lang="scss" scoped>
  .title {
    position: absolute;
    top: 20px;
    left: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 3;
  }
</style>