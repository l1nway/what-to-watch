'use client'

import {Film, Settings, LogOut, List, Users, Loader} from 'lucide-react'
import {ReactNode, useCallback, useState} from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {useSearchParams} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {GroupSkeleton} from './groupSkeleton'
import {ListSkeleton} from './listSkeleton'
import useDashboard from './useDashboard'
import {GroupCard} from './groupCard'
import {ListCard} from './listCard'
import Members from './members'
import Delete from './delete'
import Invite from './invite'
import New from './new'

export default function Dashboard() {
    const searchParams = useSearchParams()
    const groupId = searchParams.get('groupId')

    const dashboardLogic = useDashboard()

    const {deletingId, processingId, members, fetchMembers, toggleRole, kickMember, membersClarify, setMembersClarify, logout, delay, leaveGroup, newGroupRef, newListRef, setGroups, updateGroup, delClarify, setDelClarify, selectedGroup, setSelectedGroup, deleteGroup, router, lists, groups, user, loading, list, setList, group, setGroup, invite, setInvite, listName, setListName, listDesc, setListDesc, groupName, setGroupName, groupDesc, setGroupDesc, inviteEmail, setInviteEmail, groupLists, setGroupLists, createList, createGroup, updateGroups} = dashboardLogic

    const listHeader = useCallback((text: string, button: string, icon: ReactNode, onClick: () => void) => {
        return(
            <div className='flex w-full justify-between py-4'>
                <div className='flex items-center justify-center gap-3'>
                    {icon}
                    <span className='text-white'>
                        {text}
                    </span>
                    <SlideLeft visibility={loading}>
                        <Loader className='text-[#959dab] animate-spin'/>
                    </SlideLeft>
                </div>
                <Button
                    onClick={onClick}
                    className='outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#7f22fe] hover:bg-[#641aca] focus:bg-[#641aca] transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
                >
                    + {button}
                </Button>
            </div>
        )
    }, [loading])

    const [redirect, setRedirect] = useState<boolean>(false)
    const [deauth, setDeauth] = useState<boolean>(false)

    const stng = useCallback(() => {
        router.push('/settings')
        setRedirect(true)
    }, [])
    
    const de_auth = useCallback(() => {
        setDeauth(true)
        logout()
    }, [])

    return (
        <div
            className='bg-[#030712] h-screen flex flex-col relative'
        >
            <Members
                onClose={() => setMembersClarify(false)}
                processingId={processingId}
                visibility={membersClarify}
                fetchMembers={fetchMembers}
                toggleRole={toggleRole}
                kickMember={kickMember}
                deletingId={deletingId}
                group={selectedGroup}
                loading={loading}
                members={members}
                delay={delay}
                user={user}
            />
            <New
                create={() => createGroup(groupName, groupLists)}
                onClose={() => setGroup(false)}
                setGroupLists={setGroupLists}
                setTextarea={setGroupDesc}
                setInput={setGroupName}
                groupLists={groupLists}
                textarea={groupDesc}
                visibility={group}
                input={groupName}
                ref={newGroupRef}
                lists={lists}
                page='Group'
            />
            <New
                onClose={() => setList(false)}
                create={() => createList()}
                setTextarea={setListDesc}
                setInput={setListName}
                textarea={listDesc}
                visibility={list}
                input={listName}
                ref={newListRef}
                lists={lists}
                page='List'
            />
            <Invite
                onClose={() => setInvite(false)}
                setInput={setInviteEmail}
                input={inviteEmail}
                data={invite}
            />
            <Delete
                deleteGroup={
                    delClarify === 'delete'
                        ? () => selectedGroup && deleteGroup(selectedGroup.id)
                        : () => selectedGroup && leaveGroup(selectedGroup.id)
                }
                onClose={() => setDelClarify(false)}
                action={delClarify}
            />
            <header
                className='shrink-0 bg-[#101828] flex justify-between items-center border-b border-b-[#1e2939] p-4'
            >
                <div className='flex gap-5'>
                    <div
                        className='bg-[#7f22fe] rounded-[10px] w-min p-2'
                    >
                        <Film className='text-white'/>
                    </div>
                    <h1
                        className='text-white flex items-center'
                    >
                        What2Watch
                    </h1>
                </div>
                <div className='flex gap-5'>
                    <AnimatePresence mode='wait'>
                        {!redirect ?
                            <motion.div
                                key='settings'
                                animate={{opacity: 1, scale: 1, rotate: 0}}
                                exit={{opacity: 0, scale: 0.5, rotate: 45}}
                                transition={{duration: 0.15}}
                            >
                                <Settings
                                    className='outline-none cursor-pointer text-[#959dab] hover:text-white focus:text-white transition-colors duration-300'
                                    onClick={stng}
                                    tabIndex={0}
                                />
                            </motion.div>
                            :
                            <motion.div
                                key='loader'
                                initial={{opacity: 0, scale: 0.5}}
                                animate={{opacity: 1, scale: 1}}
                                exit={{opacity: 0, scale: 0.5}}
                                transition={{duration: 0.15}}
                            >
                                <Loader
                                    className='text-[#959dab] animate-spin'
                                />
                            </motion.div>
                        }
                    </AnimatePresence>
                    <AnimatePresence mode='wait'>
                        {!deauth ?
                            <motion.div
                                key='settings'
                                animate={{opacity: 1, scale: 1, rotate: 0}}
                                exit={{opacity: 0, scale: 0.5, rotate: 45}}
                                transition={{duration: 0.15}}
                            >
                                <LogOut
                                    className='outline-none cursor-pointer text-[#959dab] hover:text-white focus:text-white transition-colors duration-300'
                                    onClick={de_auth}
                                    tabIndex={0}
                                />
                            </motion.div>
                            :
                            <motion.div
                                key='loader'
                                initial={{opacity: 0, scale: 0.5}}
                                animate={{opacity: 1, scale: 1}}
                                exit={{opacity: 0, scale: 0.5}}
                                transition={{duration: 0.15}}
                            >
                                <Loader
                                    className='text-[#959dab] animate-spin'
                                />
                            </motion.div>
                        }
                    </AnimatePresence>
                </div>
            </header>
            <div
                className='min-h-0 flex-1 flex flex-col overflow-y-auto gap-4 p-4 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939]'
                tabIndex={-1}
            >
                <div className='flex gap-4 flex-col'>
                    <h1
                        className='text-white text-[2em] flex whitespace-nowrap max-md:hidden'
                    >
                        Welcome back<SlideLeft visibility={Boolean(user)}>, {user?.displayName ? user?.displayName : user?.email}</SlideLeft>
                    </h1>
                    <h1
                        className='text-white text-[2em] flex min-md:hidden flex-col'
                    >
                        <span className='whitespace-nowrap'>Welcome back,</span>
                        <SlideDown
                            className='whitespace-nowrap'
                            visibility={Boolean(user)}
                        >
                            {user?.displayName ? user?.displayName : user?.email}
                        </SlideDown>
                    </h1>
                    <h2
                        className='text-white'
                    >
                        Ready to find your next movie?
                    </h2>
                </div>
                {listHeader('My lists', 'New list', <List className='text-[#7f22fe]'/>, () => setList(true))}
                <div className='flex flex-wrap'>
                    <AnimatePresence mode='popLayout'>
                        {!lists.length ?
                            <ListSkeleton
                                onClick={setList}
                                loading={loading}
                            />
                        : null}
                        {lists.map((list, index) => 
                            <ListCard
                                delay={delay}
                                router={router}
                                index={index}
                                key={list.id}
                                list={list}
                            />
                        )}
                    </AnimatePresence>
                </div>
                {listHeader('My groups', 'New group', <Users className='text-[#7f22fe]'/>, () => setGroup(true))}
                <div className='flex flex-wrap'>
                    <AnimatePresence mode='popLayout'>
                        {!groups.length ?
                            <GroupSkeleton
                                lists={lists}
                                onClick={setGroup}
                                loading={loading}
                            /> : null}
                        {groups.map((group, index) => 
                            <GroupCard
                                setMembersClarify={setMembersClarify}
                                setSelectedGroup={setSelectedGroup}
                                setDelClarify={setDelClarify}
                                updateGroups={updateGroups}
                                updateGroup={updateGroup}
                                setGroups={setGroups}
                                setInvite={setInvite}
                                router={router}
                                key={group.id}
                                delay={delay}
                                group={group}
                                index={index}
                                lists={lists}
                                user={user}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}