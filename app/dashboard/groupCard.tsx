import {Save, Film, UserRoundPlus, Trash2, Pencil, CircleCheck, X, DoorOpen} from 'lucide-react'
import {TransitionGroup, CSSTransition} from 'react-transition-group'
import {useEffect, useRef, useLayoutEffect, useState} from 'react'
import {GroupCardProps} from './dashboardTypes'
import {Button} from '@/components/ui/button'
import {Select} from 'react-animated-select'
import {shake, clearShake} from '../components/shake'
import {motion} from 'framer-motion'

import SlideLeft from '../components/slideLeft'

export function GroupCard({setSelectedGroup, setDelClarify, updateGroups, updateGroup, setGroups, setInvite, accept, reject, router, invite, group, index, lists, user, delay}: GroupCardProps) {
    const [inputWidth, setInputWidth] = useState<number | string>('auto')

    const cardRef = useRef<HTMLDivElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const spanRef = useRef<HTMLSpanElement>(null)
    const editRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if (!spanRef.current) return
        const span = spanRef.current

        const computedStyle = window.getComputedStyle(span)
        const width = span.offsetWidth + parseInt(computedStyle.paddingLeft) + parseInt(computedStyle.paddingRight)
        setInputWidth(width)
    }, [group?.name, group?.tempName, group?.edit])

    useEffect(() => {
        if (group?.edit && inputRef.current) {
            inputRef.current.focus()
            const val = inputRef.current.value
            inputRef.current.value = ''
            inputRef.current.value = val
        }
    }, [group?.edit])

    const owner = user?.uid === group?.ownerId
    return (
        <motion.div
            className='min-h-50 flex bg-[#101828] border border-[#1e2939] rounded-[10px] p-6 w-full justify-between cursor-pointer hover:border-[#7f22fe] transition-colors duration-300'
            tabIndex={0}
            key={group?.id}
            style={{ 
                willChange: 'transform, opacity, height',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
            }}
            ref={cardRef}
            layoutId={group?.id}
            layout='position'
            viewport={{once: false, amount: 'some', margin: '-10px 0px -10px 0px'}}
            initial={{opacity: 0, scale: 0.9}}
            whileInView={{opacity: 1, scale: 1}}
            transition={{
                layout: { 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 30
                },
                default: { 
                    duration: 0.3, 
                    ease: 'easeInOut',
                    delay: delay ? index * 0.08 : undefined
                },
                opacity: {
                    duration: 0.3,
                    delay: delay ? index * 0.08 : undefined
                }
            }}
            exit={{opacity: 0, scale: 0.8, transition: {duration: 0.3}}}
        >
            <div className='flex flex-col'>
                <div className='relative h-full flex items-center'>
                    <div className='absolute h-full flex top-0 items-center'>
                        <span
                            className={`
                                absolute invisible whitespace-pre text-xl py-2 ${group?.edit ? 'pl-2 pr-2' : 'pr-1'}`
                            }
                            ref={spanRef}
                        >
                            {group?.tempName ?? group?.name ?? ''}
                        </span>
                        <input
                            style={{
                                transition: 'width 150ms, padding 300ms, background-color 300ms, border-color 300ms',
                                width: inputWidth
                            }}
                            ref={inputRef}
                            disabled={!group?.edit}
                            value={group?.tempName ?? group?.name ?? ''}
                            onChange={(e) => {
                                setGroups?.(prev => prev.map(g => 
                                    g.id === group?.id ? {...g, tempName: e.target.value} : g
                                ))
                                clearShake(inputRef.current)
                            }}
                            className={`text-left whitespace-nowrap overflow-hidden border border-[#7f22fe] text-xl py-2 rounded-[10px] outline-none bg-[#7f22fe] text-white disabled:bg-[#101828] disabled:border-[#101828] duration-300
                                ${group?.edit ? 'pl-2 pr-2' : 'pr-1'} 
                                `}
                        />
                        {owner ?
                            <div className='relative h-[65%] flex items-center'>
                                <CSSTransition
                                    in={group?.edit}
                                    timeout={700}
                                    classNames='icon-fade'
                                    unmountOnExit
                                    nodeRef={editRef}
                                >
                                    <div
                                        ref={editRef}
                                        className='absolute top-0 left-0 flex items-center justify-center'
                                    >
                                    <Save
                                        className='ml-1 text-[#99a1af] cursor-pointer hover:text-white transition-colors duration-300'
                                        onClick={() => {
                                        if (!group?.id || !group?.tempName.trim()) {
                                            shake(inputRef.current)
                                            return
                                        }
                                        if (group?.tempName.trim() === group?.name) {
                                            setGroups?.(prev => prev.map(g => g.id === group?.id ? {...g, edit: false} : g))
                                            return
                                        }
                                        updateGroup?.(group?.id, group?.tempName)
                                        }}
                                    />
                                    </div>
                                </CSSTransition>
                                <CSSTransition
                                    in={!group?.edit}
                                    timeout={700}
                                    classNames='icon-fade'
                                    unmountOnExit
                                    nodeRef={viewRef}
                                >
                                    <div
                                    ref={viewRef}
                                    className='absolute top-0 left-0 flex items-center justify-center'
                                    >
                                    <Pencil
                                        className='ml-1 text-[#99a1af] cursor-pointer hover:text-white transition-colors duration-300'
                                        onClick={() =>
                                        setGroups?.(prev => prev.map(g =>
                                            g.id === group?.id ? {...g, edit: true, tempName: g.name} : g
                                        ))
                                        }
                                    />
                                    </div>
                                </CSSTransition>
                             </div>
                        : null}
                    </div>
                </div>
                <span className='text-[#99a1af] mb-2'>
                    {group?.members?.length} members
                </span>
                <div className='flex overflow-y-hidden overflow-x-auto [scrollbar-width:thin] [scrollbar-gutter:stable] min-h-20'>
                    <TransitionGroup component={null}>
                        {group?.lists?.map((list) => (
                            <SlideLeft className='min-h-20' key={list.id}>
                                <div
                                    className='hover:border-[#7f22fe] transition-colors duration-300 flex min-w-25 min-h-20 justify-between bg-[#1e2939] border border-[#364153] rounded-[5px] px-2 pt-2 mr-4 mb-2'
                                    onClick={() => router.push(`/list?id=${encodeURIComponent(list.id)}`)}
                                >
                                    <div
                                        className='bg-[#1e2939] rounded-[10px] w-min p-2'
                                    >
                                        <Film className='text-[#a684ff]'/>
                                        <span className='text-white whitespace-nowrap max-w-50 overflow-hidden text-ellipsis block'>
                                            {list.name}
                                        </span>
                                    </div>
                                    <span className='text-[#6a7282]'>
                                        {list?.movies?.length}
                                    </span>
                                </div>
                            </SlideLeft>
                        ))}
                    </TransitionGroup>
                    <SlideLeft visibility={!group?.lists?.length}>
                        <div className={`
                            min-w-25 min-h-20 rounded-[5px] border border-[#1e2939] bg-[#101828] p-2 flex flex-col justify-between
                        `}>
                            <div className='flex justify-between items-start'>
                            <Film className='w-7 h-7 text-[#364153]' />
                            <div className='h-3 w-6 bg-[#1e2939] rounded-[10px]' />
                            </div>
                            <div className='h-3 w-full bg-[#1e2939] rounded-[10px]' />
                        </div>
                    </SlideLeft>
                </div>
            </div>
            {!owner && !invite ?
                <DoorOpen
                    onClick={() => {setSelectedGroup?.(group?.id); setDelClarify?.('leave')}}
                    className='w-9 h-9 text-[#959dab] hover:text-white transition-colors duration-300'/>
                : null}
            {owner && !invite ?
                <div className='flex flex-col gap-4'>
                    <Button
                        className='bg-[#1e2939] rounded-[10px] p-4 cursor-pointer hover:bg-[#303844] transition-colors duration-300'
                        onClick={() => setInvite?.({id: group?.id, name: group?.name})}
                        disabled={!owner}
                    >
                        <UserRoundPlus/> Invite
                    </Button>
                    <Select
                        offset={2}
                        disabled={!owner}
                        disabledText='Not available'
                        selectedText='+ Add list'
                        optionsClassName='list-select-list'
                        style={{
                            '--rac-select-border': 'none',
                            '--rac-select-background': '#7f22fe',
                            '--rac-select-color' : 'white',
                            '--rac-list-color': 'white',
                            '--rac-list-background': '#1e2939',
                            '--rac-option-highlight': '#7f22fe',
                            '--rac-option-hover': '#641aca',
                            '--rac-option-selected': '#641aca',
                            '--rac-arrow-width': '0',
                            '--rac-cancel-height': '0',
                            '--rac-scroll-color': '#7f22fe',
                            '--rac-scroll-track': '#1e2939'
                        } as React.CSSProperties}
                        multiple
                        placeholder='+ Add list'
                        options={lists}
                        value={group?.lists?.map(l => l)}
                        onChange={(fullObjects, ids) => updateGroups?.(group?.id, fullObjects, ids as unknown as string[])}
                        className='!justify-center min-w-40 [&_.rac-select-buttons]:!hidden text-white hover:!bg-[#641aca] rounded-[10px] p-4 cursor-pointer !transition-colors duration-300'
                    />
                    <Button
                        className='bg-red-500 rounded-[10px] p-4 cursor-pointer hover:bg-red-700 transition-colors duration-300'
                        onClick={() => {setSelectedGroup?.(group?.id); setDelClarify?.('delete')}}
                    >
                        <Trash2/> Delete
                    </Button>
                </div>
            : null}
            {invite ?
                <div className='flex flex-col gap-4'>
                    <Button
                        className='h-fit text-2xl bg-[#7f22fe] rounded-[10px] p-4 cursor-pointer hover:bg-[#641aca] transition-colors duration-300'
                        onClick={() => accept?.()}
                    >
                        <CircleCheck
                            className='w-8! h-8!'
                        /> Accept
                    </Button>
                    <Button
                        className='h-fit text-2xl bg-red-500 rounded-[10px] p-4 cursor-pointer hover:bg-red-700 transition-colors duration-300'
                        onClick={() => reject?.()}
                    >
                        <X className='w-8! h-8!'/> Reject
                    </Button>
                </div>
            : null}
        </motion.div>
    )
}