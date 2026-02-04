import {ReactNode, RefObject} from 'react'

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
}

export type AddMovieCardProps = {
  currentStatus: string
  toggleFilm: (movie: any) => void
  statusChange: (movie: any, status: Status | null) => void
  movie: any
  index: number
  added: boolean
  addedLocally: boolean
  alreadyInDb: boolean
  statuses: Status[]
  loading: boolean
}

export type MovieClarifyProps = {
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
  onClick: () => void
  setSelected: (selected: TMDBMovie[]) => void
  setDelWarning: (warning: boolean) => void
  setFilm: (film: boolean) => void
  statusColor: string
  loading: boolean
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
  visibility: boolean,
  onClose: () => void,
  id: string | null,
  movies: any,
  setMoviesData: React.Dispatch<React.SetStateAction<any[]>>,
  onRefresh: () => Promise<void>
}