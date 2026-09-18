'use client'

import {GroupCardProps} from '../dashboard/dashboardTypes'
import {TransitionGroup} from 'react-transition-group'
import {useAuth} from '../components/authProvider'
import {GroupCard} from '../dashboard/groupCard'
import SlideDown from '../components/slideDown'
import {useEffect, useMemo, useState} from 'react'
import {useRouter} from 'next/navigation'
import {updateActivity} from '@/lib/presence'
import SettingsHeader from './settingsHeader'
import PersonalCard from './personalCard'
import PasswordCard from './passwordCard'
import usePassword from './usePassword'
import useProfile from './useProfile'
import useInvites from './useInvites'
import Editor from './editor'
import Avatar from './avatar'

export default function Settings() {
    const {user, loading} = useAuth()
    const {fullInvites, acceptInvite, rejectInvite} = useInvites(user)
    const password = usePassword(user)
    const profile = useProfile(user, loading)
    const router = useRouter()

    const [file, setFile] = useState<File | null>(null)

    useEffect(() => {if (user) updateActivity('in_settings')}, [user])

    // cards of groups the user is invited to
    const invites = useMemo(() => fullInvites.map((invite, index) => invite.groupData && (
        <SlideDown key={invite.id}>
            <div className='pb-2'>
                <GroupCard
                    reject={() => rejectInvite(invite.id)}
                    accept={() => acceptInvite(invite)}
                    group={invite.groupData as unknown as GroupCardProps['group']}
                    router={router}
                    index={index}
                    user={user}
                    invite
                />
            </div>
        </SlideDown>
    )), [fullInvites, user, router, acceptInvite, rejectInvite])

    return (
        <div className='h-screen flex flex-col bg-gradient-to-br from-[#030712] to-[#2f0d68]'>
            <Editor onClose={() => setFile(null)} visibility={file} user={user}/>
            <SettingsHeader/>
            <div className='flex-1 overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939]'>
                <div className='flex max-lg:flex-col'>
                    <Avatar setFile={setFile} user={user}/>
                    <div className='flex w-full max-xl:flex-col'>
                        <PersonalCard profile={profile} loading={loading}/>
                        <PasswordCard password={password} loading={loading}/>
                    </div>
                </div>
                <SlideDown visibility={fullInvites.length}>
                    <div className='flex flex-col px-4 pt-2'>
                        <h2 className='text-white text-2xl pb-2'>Invites</h2>
                        <TransitionGroup component={null}>
                            {invites}
                        </TransitionGroup>
                    </div>
                </SlideDown>
            </div>
        </div>
    )
}
