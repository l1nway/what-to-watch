export const shake = (el: HTMLInputElement | null) => {
  if (!el) return

  el.classList.remove('--animated-error')
  void el.offsetWidth
  el.classList.add('--animated-error')
}

export const clearShake = (el: HTMLInputElement | null) => {
  el?.classList.remove('--animated-error')
}