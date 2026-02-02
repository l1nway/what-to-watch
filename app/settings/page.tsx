'use client'

import {Film, Settings, LogOut, X, Save, Pencil, Loader} from 'lucide-react'
import {Field, FieldLabel} from '@/components/ui/field'
import {TransitionGroup} from 'react-transition-group'
import {GroupCard} from '../dashboard/groupCard'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import useSettings from './useSettings'
import {useAuth} from '../components/authProvider'
import useInvites from './useInvites'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {useMemo} from 'react'

export default function settings() {
    const {user, loading} = useAuth()
    const {saveName, savePassword, router, personal, onChange, inputRefs, passwordsRefs, toggleEdit, passwords, onPasswordChange, setPasswordEdit, passwordEdit, passwordSaving, logout} = useSettings(user, loading)
    const {fullInvites, acceptInvite, rejectInvite} = useInvites(user)

    // cards of groups to which are invited
    const renderInvites = useMemo(() =>
        fullInvites.map((invite, index) => {
            if (!invite.groupData) return null

        return (
            <SlideDown key={invite.id}>
                <GroupCard
                    reject={() => rejectInvite(invite.id)}
                    accept={() => acceptInvite(invite)}
                    group={invite.groupData}
                    key={invite.id}
                    router={router}
                    index={index}
                    user={user}
                    invite
                />
            </SlideDown>
        )
    }), [fullInvites, user, loading])

    const renderPersonal = useMemo(() =>
        personal.map((element, index) => {
        let value = loading ? 'Loading…' : element.value
        let initial = (element.field == 'name' ? user?.displayName : user?.email) || ''
        let changed = !loading && element.value !== initial
            return (
                <Field key={element.field}>
                    <div className='flex'>
                        <FieldLabel
                            className='text-[#959dab] capitalize mr-2'
                            htmlFor={`input-field-${element.field}`}
                        >
                            {element.field}
                        </FieldLabel>
                        <SlideLeft visibility={element.loading || loading}>
                            <Loader className='w-4 h-4 text-[#99a1af] cursor-wait animate-spin'/>
                        </SlideLeft>
                        <SlideLeft visibility={!element.edited && !loading && element.field == 'name'}>
                            <Pencil
                                className='w-4 h-4 text-[#99a1af] cursor-pointer hover:text-white transition-colors duration-300'
                                onClick={() => toggleEdit(index)}
                            />
                        </SlideLeft>
                        <SlideLeft visibility={element.edited && !loading}>
                            <X
                                className='w-4 h-4 text-[#99a1af] cursor-pointer hover:text-white transition-colors duration-300'
                                onClick={() => toggleEdit(index)}
                            />
                        </SlideLeft>
                    </div>
                    <div className='flex'>
                        <Input
                            ref={(el) => (inputRefs.current[element.field] = el)}
                            id={`input-field-${element.field}`}
                            type={element.field}
                            placeholder={`Enter your ${element.field}`}
                            disabled={!element.edited || loading}
                            value={value}
                            onChange={(e) => onChange(index, e.target.value)}
                            className='
                                disabled:border-[#364153]
                                disabled:opacity-100
                                bg-[#1e2939]
                                text-[#6a7282]
                                placeholder:text-[#4b5563]

                                border-[#7f22fe]

                                focus:outline-none
                                focus:ring-0
                                focus:ring-offset-0

                                focus-visible:outline-none
                                focus-visible:border-[#7f22fe]
                                focus-visible:ring-0
                                focus-visible:ring-offset-0

                                transition-colors
                                duration-300
                            '
                        />
                        <SlideLeft visibility={changed}>
                            <Button
                                className='gap-0 mx-5 bg-[#7f22fe] hover:bg-[#641aca] transition-colors duration-300 cursor-pointer'
                                onClick={() => saveName()}
                            >
                                <SlideLeft visibility={element.loading}>
                                    <Loader className='mr-2 w-4 h-4 text-[#99a1af] cursor-wait animate-spin'/>
                                </SlideLeft>
                                <SlideLeft visibility={!element.loading}>
                                    <Save className='mr-2 w-4 h-4 text-[#99a1af] cursor-wait'/>
                                </SlideLeft>
                                    Save changes
                            </Button>
                        </SlideLeft>
                    </div>
                </Field>
            )
    }), [personal, user, loading])

    const renderPasswords = useMemo(() =>
        passwords.map((element, index) => {
            return (
                <Field
                    key={element.password}
                    className='gap-0'
                >
                    <FieldLabel
                        className='text-[#959dab] capitalize pb-3'
                        htmlFor={`input-field-${element.password}`}
                    >
                        {element.title}
                    </FieldLabel>
                    <Input
                        ref={(el) => (passwordsRefs.current[element.password] = el)}
                        disabled={!passwordEdit}
                        id={`input-field-${element.password}`}
                        type='password'
                        placeholder={element.placeholder}
                        value={element.value} 
                        onChange={(e) => onPasswordChange(index, e.target.value)}
                        className='
                            disabled:opacity-100
                            bg-[#1e2939]
                            text-[#6a7282]
                            disabled:border-[#364153]
                            placeholder:text-[#4b5563]

                            border-[#7f22fe]
                            focus:outline-none
                            focus:ring-0
                            focus:ring-offset-0

                            focus-visible:outline-none
                            focus-visible:border-[#7f22fe]
                            focus-visible:ring-0
                            focus-visible:ring-offset-0

                            transition-colors
                            duration-300
                        '
                    />
                    <SlideDown visibility={element.error}>
                        <span className='text-red-700'>{element.message}</span>
                    </SlideDown>
                </Field>
            )
    }), [passwords, user, loading, passwordEdit])

    const emptyPassword = passwords.some(p => p.value.trim() === '')

    return (
        <div>
            <header
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
                    <Settings className='text-white hover:text-white transition-colors duration-300'/>
                    <LogOut
                        className='cursor-pointer text-[#959dab] hover:text-red-500 transition-colors duration-300'
                        onClick={logout}
                    />
                </div>
            </header>
            <SlideDown
                visibility={fullInvites.length}
            >
                <div
                    className='flex flex-col gap-2 p-4'
                >
                    <h2
                        className='text-white text-2xl pb-2'
                    >
                        Invites
                    </h2>
                    <TransitionGroup component={null}>
                        {renderInvites}
                    </TransitionGroup>
                </div>
            </SlideDown>
            <div
                className='flex flex-col gap-2 p-4'
            >
                <h2
                    className='text-white text-2xl pb-2'
                >
                    Personal data
                </h2>
                {renderPersonal}
            </div>
            <div
                className='flex flex-col gap-2 px-4'
            >
                <div className='flex items-center'>
                    <h2
                        className='text-white text-2xl pb-2'
                    >
                        Change password
                    </h2>
                    <SlideLeft visibility={loading}>
                        <Loader className='ml-2 w-5 h-5 text-[#99a1af] cursor-wait animate-spin'/>
                    </SlideLeft>
                    <SlideLeft visibility={!passwordEdit && !loading}>
                        <Pencil
                            className='ml-2 w-5 h-5 text-[#99a1af] cursor-pointer hover:text-white transition-colors duration-300'
                            onClick={() => setPasswordEdit(true)}
                        />
                    </SlideLeft>
                    <SlideLeft visibility={passwordEdit && !loading}>
                        <X
                            className='ml-2 w-5 h-5 text-[#99a1af] cursor-pointer hover:text-white transition-colors duration-300'
                            onClick={() => setPasswordEdit(false)}
                        />
                    </SlideLeft>
                </div>
                {renderPasswords}
                <SlideDown visibility={passwordEdit}>
                    <Button
                        onClick={savePassword}
                        className='mt-4 w-full gap-0 bg-[#7f22fe] hover:bg-[#641aca] transition-[colors, opacity] duration-300 cursor-pointer
                        '
                        disabled={emptyPassword}
                    >
                        <SlideLeft visibility={passwordSaving}>
                            <Loader className='mr-2 w-4 h-4 text-[#99a1af] cursor-wait animate-spin'/>
                        </SlideLeft>
                        <SlideLeft visibility={!passwordSaving}>
                            <Save className='mr-2 w-4 h-4 text-[#99a1af] cursor-wait'/>
                        </SlideLeft>
                            Save changes
                    </Button>
                </SlideDown>
            </div>
        </div>
    )
}