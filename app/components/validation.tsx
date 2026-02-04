export const validateName = (value: string): boolean => {
  return value.trim().length > 0
}

export const validateEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export const validatePassword = (value: string): boolean => {
  return value.length > 7
}

export const validateConfirm = (password: string, confirm: string): boolean => {
  return confirm == password
}