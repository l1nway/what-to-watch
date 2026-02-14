'use client'

import {Film, Settings, LogOut, X, Save, Pencil, Loader, ArrowLeft, ReceiptText} from 'lucide-react'
import {GroupCardProps} from '../dashboard/dashboardTypes'
import {Field, FieldLabel} from '@/components/ui/field'
import {TransitionGroup} from 'react-transition-group'
import {AnimatePresence, motion} from 'framer-motion'
import {useCallback, useMemo, useState} from 'react'
import {useAuth} from '../components/authProvider'
import {GroupCard} from '../dashboard/groupCard'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {AnimationKeys} from '../list/listTypes'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import useSettings from './useSettings'
import useInvites from './useInvites'
import Editor from './editor'
import Avatar from './avatar'

export default function settings() {
    const {user, loading} = useAuth()
    const {saveName, savePassword, router, personal, onChange, inputRefs, passwordsRefs, toggleEdit, passwords, onPasswordChange, setPasswordEdit, passwordEdit, passwordSaving, logout} = useSettings(user, loading)
    const {fullInvites, acceptInvite, rejectInvite} = useInvites(user)

    const [file, setFile] = useState(null)

    // cards of groups to which are invited
    const renderInvites = useMemo(() =>
        fullInvites.map((invite, index) => {
            if (!invite.groupData) return null

        return (
            <SlideDown key={invite.id}>
                <GroupCard
                    reject={() => rejectInvite(invite.id)}
                    accept={() => acceptInvite(invite)}
                    group={invite.groupData as unknown as GroupCardProps['group']}
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
        let changed = !loading && element.edited && element.value !== initial
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
                    <div className='flex w-full'>
                        <Input
                            ref={(el) => {inputRefs.current[element.field] = el}}
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
                                className='gap-0 ml-5 mr-14 max-md:mr-35 max-lg:mr-10 max-xl:mr-26 bg-[#7f22fe] hover:bg-[#641aca] transition-colors duration-300 cursor-pointer'
                                onClick={saveName}
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
                    className='gap-0 pb-3'
                >
                    <FieldLabel
                        className='text-[#959dab] capitalize pb-3'
                        htmlFor={`input-field-${element.password}`}
                    >
                        {element.title}
                    </FieldLabel>
                    <Input
                        ref={(el) => {passwordsRefs.current[element.password] = el}}
                        disabled={!passwordEdit}
                        id={`input-field-${element.password}`}
                        type='password'
                        placeholder={element.placeholder}
                        value={element.value} 
                        onChange={(e) => onPasswordChange(index, e.target.value)}
                        className='disabled:opacity-100 bg-[#1e2939] text-[#6a7282] disabled:border-[#364153] placeholder:text-[#4b5563] border-[#7f22fe] focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:border-[#7f22fe] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-300'
                    />
                    <SlideDown visibility={element.error}>
                        <span className='text-red-700'>{element.message}</span>
                    </SlideDown>
                </Field>
            )
    }), [passwords, user, loading, passwordEdit])

    const emptyPassword = passwords.some(p => p.value.trim() === '')
    
    const [deauth, setDeauth] = useState<boolean>(false)
    const [privacy, setPrivacy] = useState<boolean>(false)
    const [back, setBack] = useState<boolean>(false)
    
    const bck = useCallback(() => {
        router.back()
        setBack(true)
    }, [])

    const policy = useCallback(() => {
        router.push('/privacy')
        setPrivacy(true)
    }, [])

    const animationMap = useMemo(() => ({
        loading: {
            key: 'loader',
            Component: Loader,
            props: {
                className: 'text-[#959dab] animate-spin'
            }},
        view: {
            key: 'edit',
            Component: Pencil,
            props: {
                className: 'group-focus-within:text-white outline-none ml-1 text-[#99a1af] cursor-pointer hover:text-white focus:text-white transition-colors duration-300',
                onClick: () => setPasswordEdit(true)
            }},
        edit: {
            key: 'cancel',
            Component: X,
            props: {
                className: 'w-8 h-8 group-focus-within:text-white outline-none text-[#99a1af] cursor-pointer hover:text-white focus:text-white transition-colors duration-300',
                onClick: () => setPasswordEdit(false)
            }},
    }), [setPasswordEdit])

    let currentState: AnimationKeys = loading ? 'loading' : passwordEdit ? 'edit' : 'view'
    let {key, Component, props} = animationMap[currentState]

    return (
        <div className='h-screen flex flex-col bg-gradient-to-br from-[#030712] to-[#2f0d68]'>
            <Editor
                onClose={() => setFile(null)}
                visibility={file}
                user={user}
            />
            <header
                className='shrink-0 bg-[#101828] flex justify-between items-center border-b border-b-[#1e2939] p-4'
            >
                <div className='flex gap-5 items-center'>
                    <AnimatePresence mode='wait'>
                        {!back ?
                            <motion.div
                                key='settings'
                                animate={{opacity: 1, scale: 1, rotate: 0}}
                                exit={{opacity: 0, scale: 0.5, rotate: 45}}
                                transition={{duration: 0.15}}
                            >
                                <ArrowLeft
                                    className='cursor-pointer text-[#777f8d] hover:text-white focus:text-white outline-none transition-colors duration-300 w-8 h-8'
                                    onClick={bck}
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
                                    className='text-[#959dab] animate-spin w-8 h-8'
                                />
                            </motion.div>
                        }
                    </AnimatePresence>
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
                    <Settings className='text-white hover:text-white transition-colors duration-300'/>
                    <AnimatePresence mode='wait'>
                        {!privacy ?
                            <motion.div
                                key='privacy'
                                animate={{opacity: 1, scale: 1, rotate: 0}}
                                exit={{opacity: 0, scale: 0.5, rotate: 45}}
                                transition={{duration: 0.15}}
                            >
                                <ReceiptText
                                    className='outline-none cursor-pointer text-[#959dab] hover:text-white focus:text-white transition-colors duration-300'
                                    onClick={policy}
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
                                    onClick={() => {logout(); setDeauth(true)}}
                                    className='cursor-pointer text-[#959dab] hover:text-white transition-colors duration-300'
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
            <div className='flex-1 overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939]'>
                <div className='flex max-lg:flex-col'>
                    <Avatar
                        setFile={setFile}
                        file={file}
                        user={user}
                    />
                    <div className='flex w-full max-xl:flex-col'>
                        <div
                            className='bg-[#101828] flex flex-col gap-2 p-4 m-4 rounded-[10px] max-xl:w-auto w-[50%] h-fit'
                        >
                            <h2
                                className='text-white text-2xl pb-2'
                            >
                                Personal data
                            </h2>
                            {renderPersonal}
                        </div>
                        <div
                            className='bg-[#101828] flex flex-col p-4 m-4 rounded-[10px] max-xl:w-auto w-[50%] h-fit'
                        >
                            <div className='flex items-center pb-4'>
                                <h2
                                    className='text-white text-2xl pr-1'
                                >
                                    Change password
                                </h2>
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        initial={currentState === 'loading' ? undefined : {opacity: 0, scale: 0.5}}
                                        tabIndex={currentState === 'loading' ? -1 : 0}
                                        animate={{opacity: 1, scale: 1, rotate: 0}}
                                        exit={{opacity: 0, scale: 0.5, rotate: 45}}
                                        className='group outline-none'
                                        transition={{duration: 0.15}}
                                        key={key}
                                    >
                                        <Component {...props}/>
                                    </motion.div>
                                </AnimatePresence>
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
                </div>
                <SlideDown
                    visibility={fullInvites.length}
                >
                    <div
                        className='flex flex-col gap-2 px-4 pt-2'
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
            </div>
        </div>
    )
}