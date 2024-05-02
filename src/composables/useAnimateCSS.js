const useAnimateCSS = (element, animation, faster) => {
  return new Promise((resolve, reject) => {
    const animationName = `animate__${animation}`
    const node = document.querySelector(element)

    if (!node) {
      reject('Element not found')
      return
    }

    node.classList.add('animate__animated', animationName)

    if (faster) {
      node.style.setProperty('--animate-duration', '0.5s')
    }

    function handleAnimationEnd(event) {
      event.stopPropagation()
      node.classList.remove('animate__animated', animationName)
      resolve('Animation ended')
    }

    node.addEventListener('animationend', handleAnimationEnd, { once: true })
  })
}

export default useAnimateCSS
