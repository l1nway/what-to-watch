'use client'

import {X, UserRoundPlus, UserStar, UserPen, User, BadgeInfo} from 'lucide-react'
import {collection, writeBatch, doc} from 'firebase/firestore'
import {Field, FieldLabel} from '@/components/ui/field'
import {TransitionGroup} from 'react-transition-group'
import {validateEmail} from '../components/validation'
import {shake, clearShake} from '../components/shake'
import {useState, useCallback, useRef} from 'react'
import ShowClarify from '../components/showClarify'
import {useAuth} from '../components/authProvider'
import SlideDown from '../components/slideDown'
import {Button} from '@/components/ui/button'
import {Select} from 'react-animated-select'
import {InviteProps} from './dashboardTypes'
import {Input} from '@/components/ui/input'
import {db} from '@/lib/firebase'

const generateToken = () => crypto.randomUUID()

const getExpirationDate = (durationStr: string) => {
    const now = new Date()
    const [amount, unit] = durationStr.split(' ')
    const val = parseInt(amount)
    
    if (unit.includes('min')) now.setMinutes(now.getMinutes() + val)
    if (unit.includes('hour')) now.setHours(now.getHours() + val)
    if (unit.includes('day')) now.setDate(now.getDate() + val)
    if (unit.includes('week')) now.setDate(now.getDate() + val * 7)
    if (unit.includes('month')) now.setMonth(now.getMonth() + val)
    
    return now
}

export default function Invite({data, onClose, input, setInput}: InviteProps) {
    const {user} = useAuth()

    const group = typeof data === 'object' ? data : null

    const emailRef = useRef<HTMLInputElement | null>(null)
    const adminRef = useRef<HTMLButtonElement | null>(null)
    const memberRef = useRef<HTMLButtonElement | null>(null)

    const [error, setError] = useState<boolean>(false)
    
    const [duration, setDuration] = useState<string>('30 min')
    const durations = ['5 min', '30 min', '1 hour', '2 hours', '6 hours', '12 hours', '1 day', '1 week', '1 month']

    type Pending = {
        email: string
        admin: boolean
    }

    const [pendings, setPendings] = useState<Pending[]>([])

    const sendInvite = useCallback(async () => {
        if ((!validateEmail(input) || input == '') && pendings.length === 0) {
            shake(emailRef.current)
            setError(true)
            return
        }

        if (pendings.length === 0) {
            shake(memberRef.current)
            shake(adminRef.current)
            return
        }

        try {
            const batch = writeBatch(db)
            const expiresAt = getExpirationDate(duration)

            for (const {email, admin} of pendings) {
                const token = generateToken()
                const cleanEmail = email.toLowerCase()
                const customInviteId = `${cleanEmail}_${group?.id}`
                const inviteRef = doc(db, 'invites', customInviteId)
                
                batch.set(inviteRef, {
                    email: cleanEmail,
                    groupId: group?.id,
                    groupName: group?.name,
                    token: token,
                    expiresAt: expiresAt,
                    status: 'pending',
                    senderId: user?.uid,
                    senderName: user?.displayName || 'Someone',
                    createdAt: new Date(),
                    role: admin ? 'editor' : 'member'
                })

                const mailRef = doc(collection(db, 'mail'))
                batch.set(mailRef, {
                    to: email,
                    message: {
                        subject: `You've been invited to join ${group?.name}!`,
                        html: `
                            <p>Hello! You have been invited to join the group <strong>${group?.name}</strong>.</p>
                            <p>Click the link below to accept the invitation:</p>
                            <a href='${window.location.origin}/invite?token=${token}'>Accept Invitation</a>
                            <p>This link will expire on ${expiresAt.toLocaleString()}.</p>
                        `
                    }
                })
            }

            await batch.commit()
            setPendings([])
            onClose()
        } catch (e) {
            console.error('Error sending invites: ', e)
        }
    }, [data, pendings, duration, onClose, user])

    const renderPendings = pendings.map((element, index) => {
        return (
            <SlideDown key={element.email}>
                <div className='text-white mt-3 bg-[#1e2939] prose prose-invert p-2 rounded-[10px] border border-[#364153] hover:border-[#7f22fe] transition-colors duration-300 flex justify-between w-full'>
                    <label className='flex gap-2 items-center'>
                        {element.admin ? <UserPen className='w-4 h-4'/> : <User className='w-4 h-4'/>}
                        <span>
                            {element.email}
                        </span>
                    </label>
                    <X onClick={() => setPendings(prev => prev.filter(e => e !== element))} className='text-[#99a1af] hover:text-red-500 cursor-pointer transition-colors duration-300'/>
                </div>
            </SlideDown>
        )
    })

    const addEmail = useCallback((role: boolean) => {
        if (!validateEmail(input) || input === '') {
            shake(emailRef.current)
            setError(true)
            return
        }
        clearShake(memberRef.current)
        clearShake(adminRef.current)
        const cleanEmail = input.trim().toLowerCase()

        setPendings(prev => {
            const exists = prev.find(p => p.email.toLowerCase() === cleanEmail)

            if (exists) {
                return prev.map(p =>
                    p.email.toLowerCase() === cleanEmail ? {...p, admin: role} : p
                )
            }

            return [...prev, {email: cleanEmail, admin: role}]
        })

        setInput('')
    }, [input])

    const close = useCallback(() => {
        setPendings([])
        setError(false)
        onClose()
    }, [])

    const onChange = useCallback((e: {target: {value: string}}) => {
        clearShake(emailRef.current)
        setInput(e.target.value)
        setError(false)
    }, [])

    return (
        <ShowClarify
            visibility={group}
            onClose={onClose}
        >
            <div className='text-white flex justify-between border-b border-[#1e2939] pb-4 items-center'>
                <div className='flex flex-col gap-2 whitespace-nowrap'>
                    <h1 className='text-white'>
                        Invite members
                    </h1>
                    <h2 className='text-[#99a1af]'>
                        {group?.name ? group?.name : 'name'}
                    </h2>
                </div>
            <X
                onClick={close}
                className='text-[#99a1af] hover:text-white cursor-pointer transition-colors duration-300'
            />
            </div>
            
            <div className='pt-2 flex justify-between'>
                <span className='text-[#99a1af] text-sm'>
                    By inviting user with admin{''}
                    <span className='inline'>
                        <UserStar className='w-4 h-4 mx-1 inline' />
                    </span>{''}
                    rights, he will be able to edit group.
                    </span>
                <BadgeInfo className='text-[#99a1af] hover:text-white cursor-pointer transition-colors duration-300'/>
            </div>

            <Field className='pb-4 pt-2 min-w-97 w-full'>
                <FieldLabel
                    className='text-[#d1d5dc]'
                    htmlFor='input-email'
                >
                    Email Adress
                </FieldLabel>
                <div className='flex gap-2 w-full'>
                    <Input
                        ref={emailRef}
                        onChange={onChange}
                        value={input}
                        id='input-email'
                        type='email'
                        placeholder='friend@email.com'
                        className='max-md:w-[65%] bg-[#1e2939] text-white border-[#364153] placeholder:text-[#4b5563] hover:border-[#7f22fe] focus:border-[#7f22fe] focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:border-[#7f22fe] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-300'
                    />
                    <Button
                        className='max-md:w-[10%] bg-[#7f22fe] hover:bg-[#641aca] cursor-pointer'
                        onClick={() => addEmail(true)}
                        ref={adminRef}
                    >
                        <UserStar/>
                    </Button>
                    <Button
                        className='max-md:w-[10%] bg-[#7f22fe] hover:bg-[#641aca] cursor-pointer'
                        onClick={() => addEmail(false)}
                        ref={memberRef}
                    >
                        <UserRoundPlus/>
                    </Button>
                </div>
            </Field>
            <SlideDown visibility={error}>
                <span className='text-[#a60000] w-full text-center block mb-4'>Email was entered incorrectly</span>
            </SlideDown>
            <label>
                <span className='text-[#d1d5dc]'>
                    Choose invitation validity period
                </span>
                <Select
                    offset={1}
                    optionsClassName='options'
                    className='items-center mt-2 mb-2 rac-select-cancel:hover:text-red-500 h-10 hover:border-[#7f22fe!important] w-full mt-1 rounded-md bg-[#1e2939!important] !border-[1px] !border-solid !border-[#364153] !text-white min-h-9!'
                    style={{
                        '--rac-arrow-height' : '2em',
                        '--rac-arrow-width' : '2em',
                        '--rac-cancel-height': '0',
                        '--rac-cancel-width': '0',
                        '--rac-list-background': '#1e2939',
                        '--rac-list-color': 'white',
                        '--rac-option-highlight': '#7f22fe',
                        '--rac-option-hover': '#641aca',
                        '--rac-option-selected': '#641aca',
                        '--rac-scroll-color': '#7f22fe',
                        '--rac-scroll-track': '#1e2939'
                    } as React.CSSProperties}
                    placeholder='Choose invitation validity period'
                    value={duration}
                    onChange={setDuration}
                    options={durations}
                />
            </label>
            <SlideDown visibility={pendings.length > 0}>
                <div className='flex flex-col'>
                    <span className='text-[#d1d5dc]'>
                        Pending Invitations
                    </span>
                    <div className='flex flex-col overflow-y-auto'>
                        <TransitionGroup component={null} className='flex flex-col'>
                            {renderPendings}
                        </TransitionGroup>
                    </div>
                </div>
            </SlideDown>
            <div className='mt-4 text-[#c4b4ff] mt-1 bg-[#1b183d] prose prose-invert p-4 rounded-[10px] border border-[#381a77] hover:border-[#7f22fe] transition-colors duration-300 w-max max-md:w-[100%] text-wrap'>
                Invited members will receive an email with a link to join your group.
            </div>
            <div className='flex gap-2 w-full justify-between pt-4'>
                <Button
                    className='w-[49%] bg-[#1e2939] hover:bg-[#303844] cursor-pointer'
                    onClick={close}
                >
                    Cancel
                </Button>
                <Button
                    className={`
                        w-[49%] hover:bg-[#641aca] cursor-pointer
                        ${(pendings.length == 0) ? 'bg-[#641aca]' : 'bg-[#7f22fe]'}    
                    `}
                    onClick={sendInvite}
                >
                    Send invites ({pendings.length})
                </Button>
            </div>
        </ShowClarify>
)}