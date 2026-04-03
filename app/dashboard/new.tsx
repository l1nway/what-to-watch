import {Field, FieldLabel} from '@/components/ui/field'
import ShowClarify from '../components/showClarify'
import {Textarea} from '@/components/ui/textarea'
import {clearShake} from '../components/shake'
import {updateActivity} from '@/lib/presence'
import {Button} from '@/components/ui/button'
import {Select} from 'react-animated-select'
import {Input} from '@/components/ui/input'
import {NewProps} from './dashboardTypes'
import {useEffect, useState} from 'react'
import {X} from 'lucide-react'

export default function New({visibility, onClose, page, input, setInput, textarea, setTextarea, create, setGroupLists, lists, ref}: NewProps) {
    const [value, setValue] = useState([])

     useEffect(() => {
        page === 'Group' && updateActivity('creating_group')
        page === 'List' && updateActivity('creating_list')

        return () => {updateActivity('idle')}
    }, [visibility])

    return (
        <ShowClarify visibility={visibility} onClose={onClose}>
            <div className='text-white flex justify-between border-b border-[#1e2939] pb-4'>
                <h1>
                    Create new {page}
                </h1>
            <X onClick={onClose} className='text-[#99a1af] hover:text-white cursor-pointer transition-colors duration-300'/>
            </div>
            <Field className='pt-4 pb-4'>
                <FieldLabel
                    className='text-[#d1d5dc]'
                    htmlFor={`input-${page}`}
                >
                    {page} name
                </FieldLabel>
                <Input
                    className='bg-[#1e2939] text-white border-[#364153] placeholder:text-[#4b5563] hover:border-[#7f22fe] focus:border-[#7f22fe] focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:border-[#7f22fe] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-300'
                    placeholder={page == 'List' ? 'e.g., Action Movies, Date Night Picks' : 'e.g., Movie Night Crew, Family'}
                    onChange={(e: {target: {value: string}}) => {setInput(e.target.value); clearShake(ref.current)}}
                    id={`input-${page}`}
                    value={input}
                    type='text'
                    ref={ref}
                />
            </Field>
            <Field className='text-[#d1d5dc]'>
                <FieldLabel htmlFor={`textarea-${page}`}>
                    Description (Optional)
                </FieldLabel>
                <Textarea
                    className='bg-[#1e2939] text-white border-[#364153] placeholder:text-[#4b5563] hover:border-[#7f22fe] focus:border-[#7f22fe] focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:border-[#7f22fe] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-300'
                    placeholder={page == 'List' ? 'Add a description for your list…' : `What's this group about…`}
                    onChange={(e: {target: {value: string}}) => setTextarea(e.target.value)}
                    id={`textarea-${page}`}
                    value={textarea}
                />
            </Field>
            {page == 'Group' &&
                <>
                    <Select
                        style={{
                            '--rac-multiple-selected-padding' : '0.3em',
                            '--rac-list-background': '#1e2939',
                            '--rac-list-color': 'white',
                            '--rac-option-highlight': '#7f22fe',
                            '--rac-option-hover': '#641aca',
                            '--rac-option-selected': '#641aca',
                            '--rac-scroll-color': '#7f22fe',
                            '--rac-scroll-track': '#1e2939'
                        } as React.CSSProperties}
                        className='items-center min-h-9! mt-4 hover:border-[#7f22fe!important] w-full mt-1 rounded-md bg-[#1e2939!important] !border-[1px] !border-solid !border-[#364153] !text-white'
                        onChange={(element, id) => {setValue(element); setGroupLists?.(id)}}
                        placeholder='Choose lists'
                        options={lists}
                        value={value}
                        multiple
                    />
                    <div className='text-center w-full mt-4 bg-[#1e2939] prose prose-invert p-4 rounded-[10px] border border-[#364153] hover:border-[#7f22fe] transition-colors duration-300'>
                        <h4 className='text-[#d1d5dc]'>After creating the group, you can:</h4>
                        <ul className='list-disc list-inside text-[#99a1af]'>
                            <li>Invite members via email</li>
                            <li>Create shared movie lists</li>
                            <li>Collaborate on what to watch</li>
                        </ul>
                    </div>
                </>
            }
            <div className='flex gap-2 w-full justify-between pt-4'>
                <Button className={`w-[48%] bg-[#1e2939] hover:bg-[#303844] cursor-pointer`} onClick={onClose}>
                    Cancel
                </Button>
                <Button className={`w-[48%] bg-[#7f22fe] hover:bg-[#641aca] cursor-pointer`} onClick={create}>
                    Create {page}
                </Button>
            </div>
        </ShowClarify>
    )
}