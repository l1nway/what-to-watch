'use client'

import ShowClarify from '../components/showClarify'
import {X} from 'lucide-react'
import {Input} from '@/components/ui/input'
import {Field, FieldLabel} from '@/components/ui/field'
import {Textarea} from '@/components/ui/textarea'
import {Button} from '@/components/ui/button'
import {Select} from 'react-animated-select'
import {NewProps} from './dashboardTypes'
import {clearShake} from '../components/shake'
import { useState } from 'react'

export default function New({visibility, onClose, page, input, setInput, textarea, setTextarea, create, groupLists, setGroupLists, lists, ref}: NewProps) {
    const [value, setValue] = useState([])
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
                    htmlFor={`input-${page}`}
                    className='text-[#d1d5dc]'
                >
                    {page} name
                </FieldLabel>
                <Input
                    ref={ref}
                    value={input}
                    onChange={(e: {target: {value: string}}) => {setInput(e.target.value); clearShake(ref.current)}}
                    id={`input-${page}`}
                    type='text'
                    placeholder={page == 'List' ? 'e.g., Action Movies, Date Night Picks' : 'e.g., Movie Night Crew, Family'}
                    className='
                        bg-[#1e2939]
                        text-white
                        border-[#364153]
                        placeholder:text-[#4b5563]

                        hover:border-[#7f22fe]

                        focus:border-[#7f22fe]
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
            </Field>
            <Field
                className='text-[#d1d5dc]'
            >
                <FieldLabel
                    htmlFor={`textarea-${page}`}
                >
                    Description (Optional)
                </FieldLabel>
                <Textarea
                    value={textarea}
                    onChange={(e: {target: {value: string}}) => setTextarea(e.target.value)}
                    id={`textarea-${page}`}
                    placeholder={page == 'List' ? 'Add a description for your list…' : `What's this group about…`}
                    className='
                        bg-[#1e2939]
                        text-white
                        border-[#364153]
                        placeholder:text-[#4b5563]

                        hover:border-[#7f22fe]

                        focus:border-[#7f22fe]
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
            </Field>
            {page == 'Group' ?
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
                        multiple
                        className='mt-4 hover:border-[#7f22fe!important] w-full mt-1 rounded-md bg-[#1e2939!important] !border-[1px] !border-solid !border-[#364153] !text-white'
                        placeholder='Choose lists'
                        options={lists}
                        value={value}
                        onChange={(element, id) => {setValue(element); setGroupLists?.(id)}}
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
            : null}
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