import {ReactNode, RefObject} from 'react'

export type AnimationKeys = 'loading' | 'view' | 'edit'

export interface DropdownProps {
    toggle: () => void
    visibility: boolean
    ref: RefObject<HTMLElement | null>
    children: ReactNode
    offset?: number
    duration?: number
    className?: string
}

export interface DropdownCoords {
  top: number
  bottom: number
  right: number
  isUpward: boolean
}

export interface Status {
  name: string
  id?: string
  checked?: boolean
  color?: string | undefined
}

export type AddMovieCardProps = {
  url: string
  currentStatus: string
  toggleFilm: (movie: any) => void
  statusChange: (movie: any, status: Status | null) => void
  delay: boolean
  movie: any
  index: number
  added: boolean
  addedLocally: boolean
  alreadyInDb: boolean
  statuses: Status[]
}

export type MovieClarifyProps = {
  url: string
  delWarning: boolean
  setDelWarning: (delWarning: boolean) => void
  visibility: boolean
  deleteMovie: (
      e: React.MouseEvent<HTMLButtonElement>,
      id: string | number | undefined
  ) => void
  onClose: () => void
  onRefresh?: () => void
  statuses: Array<{
      name: string
  }>
  selected: {
      status: string
      statuses: Array<{
          name: string
          color: string
          checked: boolean
      }>
      id: number
      title: string
      poster_path: string
      release_date: string
      vote_average: string
      overview: string
      genres: {
          name: string
      }[]
  } | null
  listId: string | null
}

export type ButtonItem = {
  icon: ReactNode
  text: string
  color: string
  hover: string
  onClick?: () => void
  disabled?: boolean
}

export interface TMDBMovie {
  id: number
  title: string
  poster_path: string
  release_date: string
  vote_average: number
  runtime?: number
  genres?: {name: string}[]
  status?: string
}

export interface MovieCardProps {
  delay: boolean
  onClick: () => void
  setSelected: (selected: TMDBMovie) => void
  setDelWarning: (warning: boolean) => void
  setFilm: (film: boolean) => void
  statusColor: string | undefined
  index: number
  movie: any
}

export interface FilmItem {
    id: number
    name: string
    year: number
    genre: string
    duration: number
    desc: string
    status: string | null
    poster_path: string
}

export interface MovieSearchProps {
  delay: boolean
  visibility: boolean,
  onClose: () => void,
  id: string | null,
  movies: any,
  setMoviesData: React.Dispatch<React.SetStateAction<any[]>>,
  onRefresh: () => Promise<void>
}