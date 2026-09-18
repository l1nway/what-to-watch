export const merge = <S extends object>(prev: S, next: Partial<S> | ((prev: S) => Partial<S>)): S =>
  ({...prev, ...(typeof next === 'function' ? next(prev) : next)})
