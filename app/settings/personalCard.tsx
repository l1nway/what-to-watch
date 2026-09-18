'use client'

import {CARD_CLASS, FIELD_CLASS, PersonalField, SAVE_CLASS} from './settingsTypes'
import {Loader, Pencil, Save, TriangleAlert, X} from 'lucide-react'
import {Field, FieldLabel} from '@/components/ui/field'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import useProfile from './useProfile'
import {ReactNode} from 'react'

const ICON_CLASS = 'w-4 h-4 ml-1 text-[#99a1af] cursor-pointer hover:text-white transition-colors duration-300'

type RowProps = {
    field: PersonalField
    label: string
    value: string
    edit: boolean
    busy: boolean
    failed: boolean
    disabled: boolean
    inputRef: (el: HTMLInputElement | null) => void
    onChange: (value: string) => void
    onToggle: () => void
    aside?: ReactNode
    children?: ReactNode
}

function Row({field, label, value, edit, busy, failed, disabled, inputRef, onChange, onToggle, aside, children}: RowProps) {
    return (
        <Field className='gap-0 pb-2'>
            <div className='flex items-center pb-2'>
                <FieldLabel className='text-[#959dab] capitalize' htmlFor={`input-field-${field}`}>{label}</FieldLabel>
                <SlideLeft visibility={busy}>
                    <Loader className='w-4 h-4 ml-1 text-[#99a1af] cursor-wait animate-spin'/>
                </SlideLeft>
                <SlideLeft visibility={!busy && !edit && !failed}>
                    <Pencil className={ICON_CLASS} onClick={onToggle}/>
                </SlideLeft>
                <SlideLeft visibility={!busy && !edit && failed}>
                    <TriangleAlert className={`${ICON_CLASS} text-[#a60000] hover:text-[#ff5555]`} onClick={onToggle}/>
                </SlideLeft>
                <SlideLeft visibility={!busy && edit}>
                    <X className={ICON_CLASS} onClick={onToggle}/>
                </SlideLeft>
                {aside}
            </div>
            <Input
                ref={inputRef}
                id={`input-field-${field}`}
                type={field === 'email' ? 'email' : 'text'}
                placeholder={`Enter your ${field}`}
                disabled={!edit || disabled}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={FIELD_CLASS}
            />
            {children}
        </Field>
    )
}

export default function PersonalCard({profile, loading}: {profile: ReturnType<typeof useProfile>; loading: boolean}) {
    const {state, notice, emailPending, changed, registerField, setValue, toggleEdit, save, confirmEmail} = profile

    return (
        <div className={CARD_CLASS}>
            <h2 className='text-white text-2xl pb-2'>Personal data</h2>

            <Row
                field='name'
                label='name'
                value={loading ? 'Loading…' : state.name}
                edit={state.nameEdit}
                busy={state.nameSaving || loading}
                failed={false}
                disabled={loading}
                inputRef={registerField('name')}
                onChange={(value) => setValue('name', value)}
                onToggle={() => toggleEdit('name')}
            />

            <Row
                field='email'
                label='email'
                value={loading ? 'Loading…' : state.email}
                edit={state.emailEdit}
                busy={emailPending || loading}
                failed={Boolean(state.error)}
                disabled={loading || emailPending}
                inputRef={registerField('email')}
                onChange={(value) => setValue('email', value)}
                onToggle={() => toggleEdit('email')}
                aside={
                    // [DOC: #confirm-button]
                    <SlideLeft className='ml-auto' visibility={!loading && state.emailStatus !== 'verified' && !state.pendingEmail}>
                        <Button
                            className='h-5 px-2 py-0 gap-0 text-[11px] leading-none bg-[#7f22fe] hover:bg-[#641aca] transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
                            disabled={state.cooldown > 0}
                            onClick={confirmEmail}
                            type='button'
                        >
                            {state.cooldown > 0 ? `Wait ${state.cooldown}s` : 'Confirm'}
                        </Button>
                    </SlideLeft>
                }
            >
                <SlideDown visibility={Boolean(state.error)}>
                    <span role='alert' className='text-[#a60000] pt-2 block'>{state.error}</span>
                </SlideDown>
                <SlideDown visibility={Boolean(notice) && !state.error}>
                    <span className='text-[#959dab] pt-2 block'>{notice}</span>
                </SlideDown>
            </Row>

            <SlideDown visibility={changed}>
                <Button className={SAVE_CLASS} onClick={save} type='button'>
                    <SlideLeft visibility={state.nameSaving || state.emailSaving}>
                        <Loader className='mr-2 w-4 h-4 text-[#99a1af] cursor-wait animate-spin'/>
                    </SlideLeft>
                    <SlideLeft visibility={!state.nameSaving && !state.emailSaving}>
                        <Save className='mr-2 w-4 h-4 text-[#99a1af]'/>
                    </SlideLeft>
                    Save changes
                </Button>
            </SlideDown>
        </div>
    )
}
