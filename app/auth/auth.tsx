'use client'

import {FieldName, Mode, SUBMIT_TEXT, useAuthForm} from './useAuthForm'
import {Field, FieldGroup} from '@/components/ui/field'
import {ButtonGroup} from '@/components/ui/button-group'
import {Button} from '@/components/ui/button'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {Loader, Film} from 'lucide-react'
import {memo, useMemo} from 'react'
import AuthField from './authField'
import Footer from '../footer'

type FieldConfig = {name: FieldName; label: string; placeholder: string; type: string; autoComplete: string; toggle?: 'showPassword' | 'showConfirm'}

const FIELDS: FieldConfig[] = [
    {name: 'name', label: 'Name', placeholder: 'Set your name', type: 'text', autoComplete: 'name'},
    {name: 'email', label: 'Email', placeholder: 'name@example.com', type: 'email', autoComplete: 'email'},
    {name: 'password', label: 'Password', placeholder: 'Set your password', type: 'password', autoComplete: 'new-password', toggle: 'showPassword'},
    {name: 'confirm', label: 'Confirm password', placeholder: 'Confirm your password', type: 'password', autoComplete: 'new-password', toggle: 'showConfirm'},
]

const TABS: {target: Mode; label: string; radius: string}[] = [
    {target: 'login', label: 'Login', radius: 'rounded-[10px_0_0_10px]'},
    {target: 'register', label: 'Register', radius: 'rounded-[0_10px_10px_0]'},
]

const Tab = memo(function Tab({target, label, radius, active, pending, onSwitch}: {target: Mode; label: string; radius: string; active: boolean; pending: boolean; onSwitch: (mode: Mode) => void}) {
    return (
        <Button
            className={`flex-1 gap-0 px-4 py-2 transition-colors duration-300 ${radius}
                ${active ? 'bg-[#7f22fe] text-white hover:bg-[#641aca]' : 'bg-[#1e2939] text-[#6a7282] hover:bg-[#1e2939] hover:text-white cursor-pointer'}
                ${pending ? 'cursor-wait' : ''}`}
            onClick={() => {if (!active) onSwitch(target)}}
            aria-pressed={active}
            type='button'
        >
            {label} <SlideLeft visibility={pending}><Loader className='ml-2 animate-spin'/></SlideLeft>
        </Button>
    )
})

export default function Auth({reset}: {reset?: {oobCode: string; email: string}}) {
    const {mode, state, fields, registerField, setField, toggleVisibility, switchMode, submit} = useAuthForm(reset)

    // stable per-field handlers so the memoized AuthField never gets a fresh closure [DOC: #per-field-stable-handlers]
    const changeHandlers = useMemo(() => Object.fromEntries(FIELDS.map((f) => [f.name, (value: string) => setField(f.name, value)])) as Record<FieldName, (value: string) => void>, [setField])
    const toggleHandlers = useMemo(() => Object.fromEntries(FIELDS.filter((f) => f.toggle).map((f) => [f.name, () => toggleVisibility(f.toggle!)])) as Record<FieldName, () => void>, [toggleVisibility])

    const busy = state.loading || state.cooldown > 0

    return (
        <div className='overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939] h-screen w-full bg-gradient-to-br from-[#030712] to-[#2f0d68] flex justify-center flex-col pb-4'>
            <div className='flex flex-grow max-lg:flex-col items-center min-md:justify-center min-lg:gap-24 max-lg:py-8 max-lg:gap-4 w-full'>
                <div className='flex flex-col items-center gap-4 min-lg:pl-12'>
                    <div className='cursor-pointer login-logo'>
                        <Film className='text-[#a684ff] min-md:h-120 min-md:w-120 max-lg:h-75 max-lg:w-75 hover:scale-[1.05] hover:text-[#ffeafe] transition-[colors, transform] duration-300 cursor-pointer'/>
                    </div>
                    <h1 className='text-white text-2xl'>What to Watch</h1>
                </div>
                <div className='flex flex-col items-center max-lg:w-full min-md:w-180 min-md:pr-12'>
                    <form className='max-lg:w-screen min-md:w-full flex justify-center' onSubmit={(e) => {e.preventDefault(); submit()}}>
                        <FieldGroup className='min-md:min-w-full bg-[#101828] border-[#1e2939] px-4 py-6 gap-0 rounded-2xl w-[95%] max-w-150'>
                            <Field className='pb-4'>
                                <ButtonGroup className='bg-[#1e2939] rounded-[10px] p-[2px] flex justify-center w-[300px]'>
                                    {TABS.map((tab) => (
                                        <Tab
                                            key={tab.target}
                                            {...tab}
                                            active={mode === tab.target}
                                            pending={state.switching && mode !== tab.target}
                                            onSwitch={switchMode}
                                        />
                                    ))}
                                </ButtonGroup>
                            </Field>

                            {FIELDS.map((f) => (
                                <SlideDown key={f.name} visibility={fields.includes(f.name)}>
                                    <AuthField
                                        label={f.label}
                                        placeholder={f.placeholder}
                                        type={f.type}
                                        autoComplete={f.name === 'password' && mode === 'login' ? 'current-password' : f.autoComplete}
                                        value={state[f.name]}
                                        inputRef={registerField(f.name)}
                                        onChange={changeHandlers[f.name]}
                                        visible={f.toggle && state[f.toggle]}
                                        onToggle={toggleHandlers[f.name]}
                                    />
                                </SlideDown>
                            ))}

                            <SlideDown visibility={state.errorStatus}>
                                <span role='alert' className='text-[#a60000] flex items-center justify-center w-full pb-5'>{state.errorMessage}</span>
                            </SlideDown>
                            <SlideDown visibility={state.infoStatus}>
                                <span className='text-[#d1d5dc] flex items-center justify-center text-center w-full pb-5'>{state.infoMessage}</span>
                            </SlideDown>

                            <Field orientation='horizontal'>
                                <Button
                                    className='gap-0 bg-[#7f22fe] hover:bg-[#641aca] transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 w-full'
                                    disabled={busy}
                                    type='submit'
                                >
                                    {state.cooldown > 0 ? `Wait ${state.cooldown}s` : SUBMIT_TEXT[mode]}
                                    <SlideLeft visibility={state.loading}><Loader className='ml-2 animate-spin'/></SlideLeft>
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>

                    <SlideDown visibility={mode === 'login' || mode === 'register'}>
                        <button type='button' className='flex gap-3 cursor-pointer pt-4' onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
                            <span className='text-white'>{mode === 'login' ? `Don't have an account?` : 'Already have an account?'}</span>
                            <span className='text-[#7f22fe]'>{mode === 'login' ? 'Register now' : 'Sign in'}</span>
                        </button>
                    </SlideDown>
                    <SlideDown visibility={mode === 'login'}>
                        <button type='button' className='text-[#7f22fe] cursor-pointer pt-4' onClick={() => switchMode('forgot')}>Forgot password?</button>
                    </SlideDown>
                    <SlideDown visibility={mode === 'forgot' || mode === 'reset'}>
                        <button type='button' className='text-[#7f22fe] cursor-pointer pt-4' onClick={() => switchMode('login')}>Back to sign in</button>
                    </SlideDown>
                </div>
            </div>
            <Footer/>
        </div>
    )
}
