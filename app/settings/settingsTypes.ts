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
    expiresAt: any
}

export interface EnrichedGroup extends Omit<FirestoreGroup, 'lists'> {
    lists: FirestoreList[]
}

export interface FullInvite extends FirestoreInvite {
    groupData: EnrichedGroup | null
    token?: string
}

// the only Tailwind combination worth sharing here: every settings input carries it verbatim
export const FIELD_CLASS = 'disabled:border-[#364153] disabled:opacity-100 bg-[#1e2939] text-[#6a7282] placeholder:text-[#4b5563] border-[#7f22fe] focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:border-[#7f22fe] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-300'

export const CARD_CLASS = 'bg-[#101828] flex flex-col p-4 m-4 rounded-[10px] max-xl:w-auto w-[50%] h-fit'

export const SAVE_CLASS = 'mt-4 w-full gap-0 bg-[#7f22fe] hover:bg-[#641aca] transition-[colors,opacity] duration-300 cursor-pointer disabled:cursor-not-allowed'

export type PasswordField = 'old' | 'new' | 'confirm'

export type PersonalField = 'name' | 'email'

// mirrors users/{uid}.emailStatus [DOC: #email-status]
export type EmailStatus = 'unverified' | 'pending' | 'verified'