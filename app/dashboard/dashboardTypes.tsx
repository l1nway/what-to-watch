import {AppRouterInstance} from 'next/dist/shared/lib/app-router-context.shared-runtime'
import {Timestamp} from 'firebase/firestore'
import {User} from 'firebase/auth'

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

export type Member = {
    role: 'owner' | 'admin' | 'member'
    updatedAt?: Timestamp
    last_seen?: string
    activity?: string
    online?: boolean
    length?: number
    avatar: string
    name: string
    id: string
}

export interface MembersTypes {
    toggleRole: (group: string | undefined, member: string | undefined, admin: boolean) => void
    kickMember: (group: string | undefined, member: string) => void
    processingId: string | null
    deletingId: string | null
    group: Group | undefined
    fetchMembers: () => void
    setMembers: any
    visibility: boolean
    onClose: () => void
    members: Member[]
    user: User | null
    loading: boolean
    delay: boolean
}

export type Data = boolean | {
    id: number | string
    ownerId: string
    name: string
}

export interface GroupCardProps {
    updateGroups?: (groupId: string, originalOptions: any[], selectedIds: string[]) => void
    updateGroup?: (id: string, name: string | undefined) => void
    setDelClarify?: (val: boolean | 'delete' | 'leave') => void
    setGroups?: React.Dispatch<React.SetStateAction<Group[]>>
    setMembersClarify?: (val: boolean) => void
    setSelectedGroup?: (group: Group | undefined) => void
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