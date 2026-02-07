export const shake = (el: HTMLElement | null) => {
  if (!el) return

  el.classList.remove('--animated-error')
  void el.offsetWidth
  el.classList.add('--animated-error')
}

export const clearShake = (el: HTMLElement | null) => {
  el?.classList.remove('--animated-error')
}