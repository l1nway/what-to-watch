'use client'

import {Film, Settings, LogOut, List, Users, Loader} from 'lucide-react'
import {ReactNode, useCallback} from 'react'
import {Button} from '@/components/ui/button'

import Invite from './invite'
import New from './new'
import Delete from './delete'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {ListSkeleton} from './listSkeleton'
import {GroupSkeleton} from './groupSkeleton'

import useDashboard from './useDashboard'

import {GroupCard} from './groupCard'
import {ListCard} from './listCard'

export default function Dashboard() {
    const dashboardLogic = useDashboard()

    const {logout, delay, leaveGroup, newGroupRef, newListRef, setGroups, updateGroup, delClarify, setDelClarify, selectedGroup, setSelectedGroup, deleteGroup, router, lists, groups, user, loading, list, setList, group, setGroup, invite, setInvite, listName, setListName, listDesc, setListDesc, groupName, setGroupName, groupDesc, setGroupDesc, inviteEmail, setInviteEmail, groupLists, setGroupLists, createList, createGroup, updateGroups} = dashboardLogic

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
                    className='
                        bg-[#7f22fe]
                        hover:bg-[#641aca]
                        transition-colors
                        duration-300
                        cursor-pointer
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    '
                >
                    + {button}
                </Button>
            </div>
        )
    }, [loading])

    return (
        <div
            className='bg-[#030712] h-screen flex flex-col'
        >
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
                visibility={list}
                onClose={() => setList(false)}
                page='List'
                input={listName}
                textarea={listDesc}
                setInput={setListName}
                setTextarea={setListDesc}
                create={() => createList()}
                ref={newListRef}
                lists={lists}
            />
            <Invite
                data={invite}
                onClose={() => setInvite(false)}
                input={inviteEmail}
                setInput={setInviteEmail}
            />
            <Delete
                action={delClarify}
                onClose={() => setDelClarify(false)}
                deleteGroup={delClarify == 'delete' ? () => deleteGroup(selectedGroup) : () => leaveGroup(selectedGroup)}
            />
            <div
                className='bg-[#101828] flex justify-between items-center border-b border-b-[#1e2939] p-4'
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
                <div className='flex gap-5 pr-5'>
                    <Settings
                        className='cursor-pointer text-[#959dab] hover:text-white transition-colors duration-300'
                        onClick={() => router.push('/settings')}
                    />
                    <LogOut
                        onClick={() => logout()}
                        className='cursor-pointer text-[#959dab] hover:text-white transition-colors duration-300'
                    />
                </div>
            </div>
            <div className='flex-1 overflow-y-auto  gap-4 p-4 overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939]'>
                <div className='flex gap-4 flex-col'>
                    <h1
                        className='text-white text-[2em] flex whitespace-nowrap max-md:hidden'
                    >
                        Welcome back<SlideLeft visibility={!loading}>, {user?.displayName ? user?.displayName : user?.email}</SlideLeft>
                    </h1>
                    <h1
                        className='text-white text-[2em] flex min-md:hidden flex-col'
                    >
                        <span className='whitespace-nowrap'>Welcome back,</span>
                        <SlideDown
                            className='whitespace-nowrap'
                            visibility={!loading}
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
                <SlideDown visibility={loading || lists.length == 0}>
                    <ListSkeleton
                        onClick={setList}
                        loading={loading}
                    />
                </SlideDown>
                <SlideDown className='flex gap-4 flex-wrap' visibility={lists.length > 0}>
                    {lists.map((list, index) => 
                        <ListCard
                            delay={delay}
                            router={router}
                            index={index}
                            key={list.id}
                            list={list}
                        />
                    )}
                </SlideDown>
                {listHeader('My groups', 'New group', <Users className='text-[#7f22fe]'/>, () => setGroup(true))}
                <SlideDown visibility={loading || groups.length == 0}>
                    <GroupSkeleton
                        lists={lists}
                        onClick={setGroup}
                        loading={loading}
                    />
                </SlideDown>
                <SlideDown className='flex flex-col gap-4' visibility={groups.length > 0}>
                    {groups.map((group, index) => (
                        <GroupCard
                            delay={delay}
                            key={group.id}
                            group={group}
                            index={index}
                            user={user}
                            lists={lists}
                            setGroups={setGroups}
                            updateGroup={updateGroup}
                            setInvite={setInvite}
                            setSelectedGroup={setSelectedGroup}
                            setDelClarify={setDelClarify}
                            updateGroups={updateGroups}
                            router={router}
                        />
                    ))}
                </SlideDown>
            </div>
        </div>
    )
}