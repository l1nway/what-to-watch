import {X, UserStar, UserPen, User, Trash2, Image, Loader, BadgeInfo} from 'lucide-react'
import {animationProps, stylesProps} from '../components/motionProps'
import {useDynamicHeight} from '../components/useDynamicHeight'
import {AnimatePresence, motion} from 'framer-motion'
import {MembersTypes, Member} from './dashboardTypes'
import ShowClarify from '../components/showClarify'
import {useEffect, useMemo, useRef} from 'react'
import SlideLeft from '../components/slideLeft'
import SlideDown from '../components/slideDown'

export default function Members({visibility, onClose, group, user, toggleRole, kickMember, fetchMembers, loading, members, processingId, deletingId, delay}: MembersTypes) {
    
    const memberRef = useRef<HTMLDivElement | null>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    const {height, measureHeight} = useDynamicHeight({contentRef, dependency: members, visibility, staticOffsets: 280})

    useEffect(() => {
        if (!group || !visibility) return
        fetchMembers()
    }, [visibility, group?.editors, group?.members, fetchMembers])

    const editor = useMemo(() => group?.editors?.includes(user?.uid ?? ''), [user?.uid, group?.editors])
    const owner = useMemo(() => user?.uid === group?.ownerId, [user?.uid, group?.ownerId])
    const admin = useMemo(() => owner || editor, [owner, editor])

    const roleClass = 'h-10 w-10 outline-none text-[#959dab] hover:text-white focus:text-white transition-colors duration-300'
    const editorClass = 'cursor-pointer'

    const renderMembers = (members as Member[]).map((member: Member, index: number) => {
        const isCurrentlyAdmin = member.role === 'admin'

        const role = member.role === 'owner' ? (
            <UserStar className={roleClass}/>
        ) : member.role === 'admin' ? (
            <UserPen className={`${roleClass} ${editorClass}`}/>
        ) : (
            <User className={roleClass}/>
        )
        return (
            <motion.div
                {...animationProps('vertical', true, delay, index)}
                className='flex gap-2 text-white justify-between items-center hover:bg-[#121e37] rounded-[5px] p-2 transition-colors duration-300'
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
                                    onClick={() => (member.role === 'owner' || !owner) ? null : toggleRole(group?.id, member.id, isCurrentlyAdmin)}
                                    initial={{opacity: 0, scale: 0.5}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0.5}}
                                    transition={{duration: 0.15}}
                                    key={`role-${member.id}`}
                                    tabIndex={0}
                                >
                                    {role}
                                </motion.div>
                        }
                    </AnimatePresence>
                    {(owner && member.id !== user?.uid && member.id !== group?.ownerId) ?
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

    return (
        <ShowClarify
            parentClassName='max-h-full overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939]'
            visibility={visibility}
            onClose={onClose}
            className='!mb-0'
        >
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
            <SlideDown visibility={owner}>
                <div className='pt-2 flex justify-between items-center border-b border-[#1e2939] pb-4'>
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
            </SlideDown>
            <motion.div
                className='overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939] mt-2'
                transition={{duration: 0.3, ease: 'easeInOut'}}
                animate={{height}}
            >
                <div className='flex flex-col gap-2' ref={contentRef}>
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