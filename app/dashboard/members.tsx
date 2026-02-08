import {X, UserStar, UserPen, User, Trash2, Image, Loader, BadgeInfo} from 'lucide-react'
import {animationProps, stylesProps} from '../components/motionProps'
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import {AnimatePresence, motion} from 'framer-motion'
import ShowClarify from '../components/showClarify'
import SlideLeft from '../components/slideLeft'
import {MembersTypes, Member} from './dashboardTypes'

export default function Members({visibility, onClose, group, user, toggleRole, kickMember, fetchMembers, loading, members, processingId, deletingId, delay}: MembersTypes) {
    
    const memberRef = useRef<HTMLDivElement | null>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    const [height, setHeight] = useState<number>(0)

    useEffect(() => {
        if (!group || !visibility) return
        fetchMembers()
    }, [visibility, group?.editors, group?.members, fetchMembers])

    const editor = useMemo(() => group?.editors?.includes(user?.uid ?? ''), [user?.uid, group?.editors])
    const owner = useMemo(() => user?.uid === group?.ownerId, [user?.uid, group?.ownerId])
    const admin = useMemo(() => owner || editor, [owner, editor])

    const roleClass = 'h-10 w-10 cursor-pointer outline-none text-[#959dab] hover:text-white focus:text-white transition-colors duration-300'

    const renderMembers = (members as Member[]).map((member: Member, index: number) => {
        const isCurrentlyAdmin = member.role === 'admin'

        const role = member.role === 'owner' ? (
            <UserStar className={roleClass}/>
        ) : member.role === 'admin' ? (
            <UserPen className={roleClass}/>
        ) : (
            <User className={roleClass}/>
        )
        return (
            <motion.div
                {...animationProps('vertical', true, delay, index)}
                className='flex gap-2 text-white justify-between items-center'
                style={{...stylesProps, overflow: 'hidden'}}
                layoutId={member?.id}
                key={member?.id}
                ref={memberRef}
                tabIndex={0}
            >
                <div className='flex gap-4 items-center'>
                    {member.avatar ?
                            <img
                                className='min-h-12 min-w-12 max-h-12 max-w-12 aspect-square object-cover rounded-full block flex-shrink-0'
                                alt={`${member.name} avatar`}
                                key={`${member.name} avatar`}
                                src={`${member.avatar}`}
                                crossOrigin='anonymous'
                                decoding='async'
                                loading='lazy'
                            />
                        :
                            <Image className='min-h-12 min-w-12 max-h-12 max-w-12 text-[#99a1af] hover:text-white transition-colors duration-300'/>
                    }
                    
                    <span className='text-2xl'>{member.name}</span>
                </div>
                <div className='flex gap-2'>
                    <AnimatePresence mode='wait'>
                        {processingId === member.id
                            ? 
                                <motion.div
                                    initial={{opacity: 0, scale: 0.5}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0.5}}
                                    transition={{duration: 0.15}}
                                    key={`loader-${member.id}`}
                                >
                                    <Loader className='h-10 w-10 text-[#959dab] animate-spin'/>
                                </motion.div>
                            :
                                <motion.div
                                    onClick={() => member.role === 'owner' ? null : toggleRole(group?.id, member.id, isCurrentlyAdmin)}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0.5}}
                                    initial={{opacity: 0, scale: 0.5}}
                                    transition={{duration: 0.15}}
                                    key={`role-${member.id}`}
                                    tabIndex={0}
                                >
                                    {role}
                                </motion.div>
                        }
                    </AnimatePresence>
                    {(admin && member.id !== user?.uid && member.id !== group?.ownerId) ?
                        <AnimatePresence mode='wait'>
                            {deletingId === member.id
                                ? 
                                    <motion.div
                                        initial={{opacity: 0, scale: 0.5}}
                                        animate={{opacity: 1, scale: 1}}
                                        exit={{opacity: 0, scale: 0.5}}
                                        transition={{duration: 0.15}}
                                        key={`loader-${member.id}`}
                                    >
                                        <Loader className='h-10 w-10 text-[#959dab] animate-spin'/>
                                    </motion.div>
                                :
                                    <motion.div
                                        onClick={() => kickMember(group?.id, member.id)}
                                        initial={{opacity: 0, scale: 0.5}}
                                        animate={{opacity: 1, scale: 1}}
                                        exit={{opacity: 0, scale: 0.5}}
                                        transition={{duration: 0.15}}
                                        key={`role-${member.id}`}
                                        tabIndex={0}
                                    >
                                        <Trash2
                                            className='h-10 w-10 text-[#959dab] hover:text-red-700 cursor-pointer transition-colors duration-300'
                                        />
                                    </motion.div>
                            }
                        </AnimatePresence>
                    : null}
                </div>
                
            </motion.div>
        )
    })

    const measureHeight = useCallback(() => {
        if (!contentRef.current) return
        if (!members.length) {
            setHeight(0)
            return
        }
        // using requestAnimationFrame twice ensures that height animation is calculated correctly; using just one can sometimes get stuck if there's a lag
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const MAX_HEIGHT = 150 * 4
                const nextHeight = Math.min(
                    contentRef.current!.scrollHeight,
                    MAX_HEIGHT
                )

                setHeight(nextHeight)
            })
        })
    }, [setHeight, members.length])

    useLayoutEffect(() => {
        measureHeight()
    }, [members.length, visibility])

    // needed to force height to be reset to zero if the user clears the search field and immediately exits without waiting for the animation to play; otherwise, the height gets stuck
    useEffect(() => {
        if (!visibility && !members.length) {
            setHeight(0)
        }
    }, [visibility])

    return (
        <ShowClarify visibility={visibility} onClose={onClose}>
            <div className='text-white flex justify-between border-b border-[#1e2939] pb-4'>
                <div className='flex'>
                    <h1>Members</h1>
                    <SlideLeft
                        visibility={loading}
                        className='pl-2'
                    >
                        <Loader className='text-[#959dab] animate-spin'/>
                    </SlideLeft>
                </div>
            <X className='text-[#99a1af] hover:text-white cursor-pointer transition-colors duration-300' onClick={onClose}/>
            </div>
            <div className='pt-2 flex justify-between items-center'>
                <span className='text-[#99a1af] text-sm'>
                    By clicking on the user's icon, you can change their rights.<br/>
                    <span className='inline'>
                        <UserPen className='w-4 h-4 mr-1 inline' />
                    </span>can edit the group,{''}
                    <span className='inline'>
                        <User className='w-4 h-4 mx-1 inline' />
                    </span>{''}
                    — can only view.
                    <br/>
                    <span className='inline'>
                        <Trash2 className='w-4 h-4 mr-1 inline' />
                    </span>{''}
                    will remove the user from group.
                </span>
                <BadgeInfo className='text-[#99a1af] hover:text-white transition-colors duration-300'/>
            </div>
            <motion.div
                className='overflow-hidden'
                transition={{duration: 0.3, ease: 'easeInOut'}}
                animate={{height}}
            >
                <div
                    className='flex flex-col gap-2 pt-4'
                    ref={contentRef}
                >
                    <AnimatePresence
                        onExitComplete={measureHeight}
                        mode='popLayout'
                        initial={false}
                    >
                        {renderMembers}
                    </AnimatePresence>
                </div>
            </motion.div>
        </ShowClarify>
    )
}