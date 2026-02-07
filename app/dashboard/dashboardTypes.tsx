import {AppRouterInstance} from 'next/dist/shared/lib/app-router-context.shared-runtime'

export interface NewProps {
    setGroupLists?: (value: any) => void
    setTextarea: (value: string) => void
    setInput: (value: string) => void
    ref: React.RefObject<HTMLInputElement | null>
    groupLists?: string[]
    visibility: boolean
    onClose: () => void
    create: () => void
    textarea: string
    input: string
    page: string
    lists: any
}

export interface DeleteProps {
    action: boolean | 'delete' | 'leave'
    onClose: () => void
    deleteGroup: () => void
}

export interface ListItem {
    groupId?: string | null
    amount?: number
    movies?: any[]
    name: string
    desc: string
    id: string
}

export interface Group {
    members: string[]
    lists: ListItem[]
    editors: string[]
    tempName: string
    ownerId: string
    edit: boolean
    name: string
    id: string
}

export type Data = boolean | {
    id: number | string
    name: string
}

export interface GroupCardProps {
    updateGroups?: (groupId: string, originalOptions: any[], selectedIds: string[]) => void
    updateGroup?: (id: string, name: string | undefined) => void
    setGroups?: React.Dispatch<React.SetStateAction<Group[]>>
    setDelClarify?: (val: boolean | 'delete' | 'leave') => void
    setSelectedGroup?: (id: string) => void
    setInvite?: (data: any) => void
    accept?: () => void
    reject?: () => void
    lists?: ListItem[]
    invite?: boolean
    delay?: boolean
    index: number
    group: Group
    router: any
    user: any
}

export interface ListCardProps {
  router: AppRouterInstance
  delay: boolean
  list: ListItem
  index: number
}

export interface GroupSkeletonProps {
    onClick: (boolean: boolean) => void
    lists?: {length: number}
    loading: boolean
}

export interface InviteProps {
    setInput: (value: string) => void
    onClose: () => void
    input: string
    data: Data
}