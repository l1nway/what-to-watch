import {AppRouterInstance} from 'next/dist/shared/lib/app-router-context.shared-runtime'
import {ReactNode} from 'react'

export type MovieClarifyProps = {
  delWarning: boolean
  setDelWarning: (delWarning: boolean) => void
  visibility: boolean
  deleteMovie: (
      e: React.MouseEvent<HTMLButtonElement>,
      id: string | number | undefined
  ) => void
  onClose: () => void
  onRefresh: () => void
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
  setSelected: (selected: TMDBMovie[]) => void
  setDelWarning: (warning: boolean) => void
  setFilm: (film: boolean) => void
  router: AppRouterInstance
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