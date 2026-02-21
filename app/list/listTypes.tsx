import {ReactNode, RefObject} from 'react'

export type AnimationKeys = 'loading' | 'view' | 'edit'

export interface DropdownProps {
    ref: RefObject<HTMLElement | null>
    className?: string
    toggle: () => void
    visibility: boolean
    children: ReactNode
    duration?: number
    offset?: number
}

export interface DropdownCoords {
  isUpward: boolean
  bottom: number
  right: number
  top: number
}

export interface Status {
  color?: string | undefined
  checked?: boolean
  name: string
  id?: string
}

export type AddMovieCardProps = {
  statusChange: (movie: any, status: Status | null) => void
  toggleFilm: (movie: any) => void
  currentStatus: string
  addedLocally: boolean
  alreadyInDb: boolean
  statuses: Status[]
  delay: boolean
  added: boolean
  index: number
  url: string
  movie: any
}

export type MovieClarifyProps = {
  setSimilar: any
  setMovie: any
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
  onClick?: () => void
  disabled?: boolean
  icon: ReactNode
  color: string
  hover: string
  text: string
}

export interface TMDBMovie {
  genres?: {name: string}[]
  release_date: string
  vote_average: number
  poster_path: string
  runtime?: number
  status?: string
  title: string
  id: number
}

export interface MovieCardProps {
  setSelected: (selected: TMDBMovie) => void
  setDelWarning: (warning: boolean) => void
  setFilm: (film: boolean) => void
  statusColor: string | undefined
  onClick: () => void
  delay: boolean
  index: number
  movie: any
}

export interface FilmItem {
    status: string | null
    poster_path: string
    duration: number
    genre: string
    name: string
    year: number
    desc: string
    id: number
}

export interface MovieSearchProps {
  selected: any
  setMoviesData: React.Dispatch<React.SetStateAction<any[]>>
  onRefresh: () => Promise<void>
  visibility: any
  onClose: () => void
  id: string | null
  similar?: boolean
  delay: boolean
  movies: any
}