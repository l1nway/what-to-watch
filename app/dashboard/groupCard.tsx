import {Save, Film, UserRoundPlus, Trash2, Pencil, CircleCheck, X, DoorOpen} from 'lucide-react'
import {useEffect, useRef, useLayoutEffect, useState, useCallback, useMemo} from 'react'
import {animationProps, stylesProps} from '../components/motionProps'
import {DeleteProps, GroupCardProps} from './dashboardTypes'
import {shake, clearShake} from '../components/shake'
import {motion, AnimatePresence} from 'framer-motion'
import {CSSTransition} from 'react-transition-group'
import SlideLeft from '../components/slideLeft'
import {Button} from '@/components/ui/button'
import {Select} from 'react-animated-select'

export function GroupCard({setMembersClarify, setSelectedGroup, setDelClarify, updateGroups, updateGroup, setGroups, setInvite, accept, reject, router, invite, group, index, lists, user, delay}: GroupCardProps) {
    const [inputWidth, setInputWidth] = useState<number | string>('auto')

    const inputRef = useRef<HTMLInputElement | null>(null)
    const cardRef = useRef<HTMLDivElement | null>(null)
    const spanRef = useRef<HTMLSpanElement>(null)
    const editRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<HTMLDivElement>(null)

    const owner = useMemo(() => user?.uid === group?.ownerId, [user?.uid, group?.ownerId])
    const editor = useMemo(() => group?.editors?.includes(user?.uid ?? ''), [user?.uid, group?.editors])
    const admin = useMemo(() => owner || editor, [owner, editor])

    const del = useCallback((type: DeleteProps['action']) => {
        setSelectedGroup?.(group)
        setDelClarify?.(type)
    }, [group, setSelectedGroup, setDelClarify])

    const members = useCallback(() => {
        setSelectedGroup?.(group)
        setMembersClarify?.(true)
    }, [group, setSelectedGroup, setMembersClarify])

    const onChange = useCallback((e: {target: {value: string}}) => {
        setGroups?.(prev => prev.map(g => 
            g.id === group?.id ? {...g, tempName: e.target.value} : g
        ))
        clearShake(inputRef.current)
    }, [group, setGroups])

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
    return (
        <motion.div
            className='outline-none focus:border-[#7f22fe] min-h-50 flex bg-[#101828] border border-[#1e2939] rounded-[10px] p-6 w-full justify-between hover:border-[#7f22fe] transition-colors duration-300 mb-3'
            {...animationProps('vertical', true, delay, index)}
            style={{...stylesProps, overflow: 'hidden'}}
            layoutId={group?.id}
            ref={cardRef}
            tabIndex={0}
        >
            <div className={`flex flex-col ${(admin || invite) ? 'min-md:min-w-[85%] max-md:min-w-[70%]' : 'min-md:w-full max-md:w-full'}`}>
                <div className='mb-2 flex justify-between w-full'>
                    <div className='w-full'>
                        <div className='relative flex items-center h-10 w-full'>
                            <div className='absolute flex top-0 items-center h-10 w-full'>
                                <span
                                    className={`text-ellipsis max-md:max-w-[90%] absolute invisible whitespace-pre text-xl py-2
                                        ${group?.edit ? 'pl-2 pr-2' : 'pr-1'}`
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
                                    onChange={onChange}  
                                    className={`text-ellipsis max-md:max-w-[90%] py-2 text-left whitespace-nowrap border border-[#7f22fe] text-xl rounded-[10px] outline-none bg-[#7f22fe] text-white disabled:bg-[#101828] disabled:border-[#101828] duration-300
                                        ${group?.edit ? 'pl-2 pr-2' : 'pr-1'} 
                                    `}
                                />
                                {admin ?
                                    <div className='relative w-6 h-6'>
                                        <CSSTransition
                                            classNames='icon-fade'
                                            nodeRef={editRef}
                                            in={group?.edit}
                                            timeout={700}
                                            unmountOnExit
                                        >
                                            <div
                                                ref={editRef}
                                            >
                                            <Save
                                                className='absolute top-0 left-0 ml-1 text-[#99a1af] cursor-pointer hover:text-white transition-colors duration-300'
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
                                            classNames='icon-fade'
                                            in={!group?.edit}
                                            nodeRef={viewRef}
                                            timeout={700}
                                            unmountOnExit
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
                        <div 
                            className='cursor-pointer text-[#99a1af] relative w-fit block hover:text-[#a684ff] transition-colors duration-300'
                            onClick={members}
                        >
                            <span>
                                {group?.members?.length} members
                            </span>
                        </div>
                    </div>
                    {!admin && !invite ?
                        <DoorOpen
                            className='cursor-pointer outline-none w-9 h-9 text-[#959dab] hover:text-white focus:text-white transition-colors duration-300'
                            onClick={() => del('leave')}
                            tabIndex={0}
                        />
                    : null}
                </div>
                <div
                    className={`flex overflow-x-auto [scrollbar-width:thin] [scrollbar-gutter:stable] [scrollbar-color:#641aca_#1e2939] min-h-20 pb-2 w-full
                    ${(admin || invite) ? '[mask-image:linear-gradient(to_right,black_calc(100%-60px),transparent)] [-webkit-mask-image:linear-gradient(to_right,black_calc(100%-60px),transparent)]' : ''}`}
                    
                    tabIndex={-1}
                >
                    <AnimatePresence initial={false}>
                        {group?.lists?.map((list) => (
                            <motion.div
                                key={list.id}
                                layout
                                initial={{width: 0, opacity: 0, x: 20}}
                                animate={{ 
                                    width: 'auto', 
                                    opacity: 1, 
                                    x: 0,
                                    transition: {
                                        width: {duration: 0.3},
                                        opacity: {duration: 0.2},
                                        x: {duration: 0.3}
                                    }
                                }}
                                exit={{ 
                                    width: 0, 
                                    opacity: 0, 
                                    x: -20,
                                    transition: {duration: 0.3} 
                                }}
                                style={{overflow: 'visible'}}
                                className='min-h-20'
                            >
                                <div
                                    className='cursor-pointer hover:border-[#7f22fe] transition-colors duration-300 mr-4 min-w-25 max-w-25 min-h-20 rounded-[5px] border border-[#1e2939] bg-[#101828] p-2 flex flex-col justify-between'
                                    onClick={() => router.push(`/list?id=${encodeURIComponent(list.id)}`)}
                                >
                                    <div className='flex justify-between items-start'>
                                    <Film className='w-7 h-7 text-[#a684ff]' />
                                    <div className='w-6 text-[#6a7282] flex justify-center'>
                                        {list?.movies?.length}
                                    </div>
                                    </div>
                                    <div className='w-full text-white text-nowrap overflow-hidden text-ellipsis'>
                                        {list.name}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <SlideLeft visibility={!group?.lists?.length}>
                        <div className={`
                            min-w-25 min-h-20 rounded-[5px] border border-[#1e2939] bg-[#101828] p-2 flex flex-col justify-between
                        `}>
                            <div className='flex justify-between items-start'>
                            <Film className='w-7 h-7 text-[#364153]'/>
                            <div className='h-3 w-6 bg-[#1e2939] rounded-[10px]'/>
                            </div>
                            <div className='h-3 w-full bg-[#1e2939] rounded-[10px]'/>
                        </div>
                    </SlideLeft>
                </div>
            </div>
            {admin && !invite ?
                <div className='flex flex-col gap-4 max-md:w-fit min-md:w-full'>
                    <Button
                        className='outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#1e2939] rounded-[10px] p-4 cursor-pointer hover:bg-[#303844] focus:bg-[#303844] transition-colors duration-300'
                        onClick={() => setInvite?.({id: group?.id, name: group?.name, ownerId: group?.ownerId})}
                        disabled={!admin}
                    >
                        <UserRoundPlus/> Invite
                    </Button>
                    <Select
                        className='outline-none !justify-center [&_.rac-select-buttons]:!hidden text-white hover:!bg-[#641aca] rounded-[10px] p-4 cursor-pointer !transition-colors duration-300 min-h-9! items-center'
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
                        onChange={(fullObjects, ids) => updateGroups?.(group?.id, fullObjects, ids as unknown as string[])}
                        optionsClassName='list-select-list max-md:w-[50%]! max-md:left-[40%]!'
                        disabled={!admin || !lists?.length}
                        value={group?.lists?.map(l => l)}
                        selectedText='+ Add list'
                        placeholder='+ Add list'
                        disabledText='No lists'
                        options={lists}
                        offset={2}
                        multiple
                    />
                    <Button
                        className={`outline-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[10px] p-4 cursor-pointer
                        ${owner ? 'bg-red-500 hover:bg-red-700 focus:bg-red-700' : 'bg-[#1e2939] hover:bg-[#303844] focus:bg-[#303844]'}
                        transition-colors duration-300`}
                        onClick={() => del(owner ? 'delete' : 'leave')}
                    >
                        {owner ? <><Trash2/> Delete</> : <><DoorOpen/> Leave</>}
                    </Button>
                </div>
            : null}
            {invite ?
                <div className='flex flex-col gap-4 justify-center'>
                    <Button
                        className='h-fit text-xl bg-[#7f22fe] rounded-[10px] p-2 cursor-pointer hover:bg-[#641aca] transition-colors duration-300'
                        onClick={() => accept?.()}
                    >
                        <CircleCheck className='w-5! h-5!'/> Accept
                    </Button>
                    <Button
                        className='h-fit text-xl bg-red-500 rounded-[10px] p-2 cursor-pointer hover:bg-red-700 transition-colors duration-300'
                        onClick={() => reject?.()}
                    >
                        <X className='w-5! h-5!'/> Reject
                    </Button>
                </div>
            : null}
        </motion.div>
    )
}