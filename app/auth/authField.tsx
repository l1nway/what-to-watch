'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {Field, FieldLabel} from '@/components/ui/field'
import {Input} from '@/components/ui/input'
import {EyeOff, Eye} from 'lucide-react'
import {memo, Ref} from 'react'

type AuthFieldProps = {
    label: string
    placeholder: string
    type: string
    value: string
    autoComplete: string
    inputRef: Ref<HTMLInputElement>
    onChange: (value: string) => void
    visible?: boolean
    onToggle?: () => void
}

const icon = 'text-[#6a7282] hover:text-white transition-colors duration-300 cursor-pointer'
const motionProps = {initial: {opacity: 0, scale: 0.5}, animate: {opacity: 1, scale: 1, rotate: 0}, exit: {opacity: 0, scale: 0.5, rotate: 45}, transition: {duration: 0.15}}

const AuthField = memo(function AuthField({label, placeholder, type, value, autoComplete, inputRef, onChange, visible, onToggle}: AuthFieldProps) {
    const id = `fieldgroup-${label}`

    return (
        <Field className='pb-6'>
            <FieldLabel htmlFor={id} className='text-[#d1d5dc]'>{label}</FieldLabel>
            <div className='flex gap-2 items-center'>
                <Input
                    className='bg-[#1e2939] text-[#6a7282] border-[#364153] placeholder:text-[#4b5563] hover:border-[#7f22fe] focus:border-[#7f22fe] focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:border-[#7f22fe] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-300'
                    type={type === 'password' && visible ? 'text' : type}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    value={value}
                    ref={inputRef}
                    id={id}
                />
                {type === 'password' && onToggle &&
                    <AnimatePresence mode='wait'>
                        <motion.button
                            key={visible ? 'hide' : 'show'}
                            aria-label={visible ? 'Hide password' : 'Show password'}
                            onClick={onToggle}
                            type='button'
                            {...motionProps}
                        >
                            {visible ? <EyeOff className={icon}/> : <Eye className={icon}/>}
                        </motion.button>
                    </AnimatePresence>
                }
            </div>
        </Field>
    )
})

export default AuthField
