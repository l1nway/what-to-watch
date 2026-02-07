export interface FirestoreList {
    id: string
    title: string
}

export interface FirestoreGroup {
    id: string
    name: string
    lists?: string[]
    members: string[]
}

export interface FirestoreInvite {
    id: string
    role: string
    email: string
    groupId: string
    status: 'pending' | 'accepted' | 'rejected'
}

export interface EnrichedGroup extends Omit<FirestoreGroup, 'lists'> {
    lists: FirestoreList[]
}

export interface FullInvite extends FirestoreInvite {
    groupData: EnrichedGroup | null
    token?: string
}

export interface PasswordField {
    password: 'old' | 'new' | 'confirm'
    title: string
    placeholder: string
    error: boolean
    message: string
    value: string
}