'use client'

import {CARD_CLASS, FIELD_CLASS, SAVE_CLASS} from './settingsTypes'
import usePassword, {PASSWORD_FIELDS} from './usePassword'
import {Field, FieldLabel} from '@/components/ui/field'
import {AnimatePresence, motion} from 'framer-motion'
import {Loader, Pencil, Save, X} from 'lucide-react'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {useMemo} from 'react'

export default function PasswordCard({password, loading}: {password: ReturnType<typeof usePassword>; loading: boolean}) {
    const {state, empty, registerField, setEdit, setValue, save} = password

    // the header icon swaps between three mutually exclusive states, so it animates as one slot
    const toggle = useMemo(() => {
        if (loading) return {key: 'loader', Component: Loader, props: {className: 'text-[#959dab] animate-spin'}}
        if (state.edit) return {key: 'cancel', Component: X, props: {className: 'w-8 h-8 group-focus-within:text-white outline-none text-[#99a1af] cursor-pointer hover:text-white focus:text-white transition-colors duration-300', onClick: () => setEdit(false)}}
        return {key: 'edit', Component: Pencil, props: {className: 'group-focus-within:text-white outline-none ml-1 text-[#99a1af] cursor-pointer hover:text-white focus:text-white transition-colors duration-300', onClick: () => setEdit(true)}}
    }, [loading, state.edit, setEdit])

    return (
        <div className={CARD_CLASS}>
            <div className='flex items-center pb-4'>
                <h2 className='text-white text-2xl pr-1'>Change password</h2>
                <AnimatePresence mode='wait'>
                    <motion.div
                        initial={loading ? undefined : {opacity: 0, scale: 0.5}}
                        tabIndex={loading ? -1 : 0}
                        animate={{opacity: 1, scale: 1, rotate: 0}}
                        exit={{opacity: 0, scale: 0.5, rotate: 45}}
                        className='group outline-none'
                        transition={{duration: 0.15}}
                        key={toggle.key}
                    >
                        <toggle.Component {...toggle.props}/>
                    </motion.div>
                </AnimatePresence>
            </div>

            {PASSWORD_FIELDS.map(({field, title, placeholder}) => (
                <Field key={field} className='gap-0 pb-3'>
                    <FieldLabel className='text-[#959dab] capitalize pb-3' htmlFor={`input-field-${field}`}>{title}</FieldLabel>
                    <Input
                        ref={registerField(field)}
                        disabled={!state.edit}
                        id={`input-field-${field}`}
                        type='password'
                        placeholder={placeholder}
                        value={state[field]}
                        onChange={(e) => setValue(field, e.target.value)}
                        className={FIELD_CLASS}
                    />
                    <SlideDown visibility={Boolean(state[`${field}Error`])}>
                        <span role='alert' className='text-red-700 pt-2 block'>{state[`${field}Error`]}</span>
                    </SlideDown>
                </Field>
            ))}

            <SlideDown visibility={state.edit}>
                <Button onClick={save} className={SAVE_CLASS} disabled={empty || state.saving} type='button'>
                    <SlideLeft visibility={state.saving}>
                        <Loader className='mr-2 w-4 h-4 text-[#99a1af] cursor-wait animate-spin'/>
                    </SlideLeft>
                    <SlideLeft visibility={!state.saving}>
                        <Save className='mr-2 w-4 h-4 text-[#99a1af]'/>
                    </SlideLeft>
                    Save changes
                </Button>
            </SlideDown>
        </div>
    )
}
