'use client'

import {validateEmail, validatePassword, validateConfirm} from '../components/validation'
import {Field, FieldGroup, FieldLabel} from '@/components/ui/field'
import {ButtonGroup} from '@/components/ui/button-group'
import {useRouter, useSearchParams} from 'next/navigation'
import {Loader, Film, EyeOff, Eye} from 'lucide-react'
import {signIn, signUp, updateUser} from '@/lib/auth'
import {shake, clearShake} from '../components/shake'
import {AnimatePresence, motion} from 'framer-motion'
import {useCallback, useState, useRef} from 'react'
import SlideDown from '../components/slideDown'
import SlideLeft from '../components/slideLeft'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import Footer from '../footer'

export default function Auth() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo')

  const loginRef = useRef<HTMLInputElement | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const confirmRef = useRef<HTMLInputElement | null>(null)

  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirm, setConfirm] = useState<string>('')

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)

  const refs = [loginRef, passwordRef, nameRef, confirmRef]

  const clearAllShakes = () => {
    refs.forEach(ref => {
      if (ref.current) clearShake(ref.current)
    })
  }

  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login'

  const [errorStatus, setErrorStatus] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = useCallback((newMode: 'login' | 'register') => {
    setErrorStatus(false)
    clearAllShakes()
    router.replace(`/auth?mode=${newMode}`, {scroll: false})
  }, [router, mode])

  const auth = useCallback(async () => {
    if (!validateEmail(email)) {
      shake(loginRef.current)
      setMessageError('Email address is entered incorrectly')
      setErrorStatus(true)
      return
    }
    if (!validatePassword(password)) {
      shake(passwordRef.current)
      setMessageError('Password is too simple')
      setErrorStatus(true)
      return
    }
    if (mode === 'register' && !validateConfirm(password, confirm)) {
      shake(confirmRef.current)
      setMessageError('Passwords do not match')
      setErrorStatus(true)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      if (mode === 'register') {
        const userCredential = await signUp(email, password)
        const user = userCredential.user

        await updateUser(name)

        const idToken = await user.getIdToken()
        await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({idToken}),
        })

      } else {
        const userCredential = await signIn(email, password)
        const idToken = await userCredential.user.getIdToken()

        await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({idToken}),
        })
      }

      router.push(returnTo || '/dashboard')
      setLoading(false)
    } catch (e: any) {
  setErrorStatus(true)
  setLoading(false)

  switch (e.code) {
    case 'auth/invalid-credential':
      setMessageError('Incorrect login or password')
      shake(loginRef.current)
      shake(passwordRef.current)
      break

    case 'auth/user-not-found':
      setMessageError('Such user does not exist')
      shake(loginRef.current)
      break

    case 'auth/wrong-password':
      setMessageError('Incorrect password')
      shake(passwordRef.current)
      break

    case 'auth/user-disabled':
      setMessageError('Account was blocked')
      shake(loginRef.current)
      break

    case 'auth/email-already-in-use':
      setMessageError('Email is already in use')
      shake(loginRef.current)
      break

    case 'auth/invalid-email':
      setMessageError('Invalid email')
      shake(loginRef.current)
      break

    case 'auth/weak-password':
      setMessageError('Password is too simple')
      shake(passwordRef.current)
      break

    case 'auth/too-many-requests':
      setMessageError('Too many requests')
      break

    case 'auth/network-request-failed':
      setMessageError('Network error')
      break

    case 'auth/operation-not-allowed':
      setMessageError('Not allowed')
      break

    default:
      setMessageError('Authorization data was entered incorrectly')
      shake(loginRef.current)
      shake(passwordRef.current)
      break
  }
}
  }, [mode, email, password, name, confirm])

  const fieldElement = useCallback((text: string, placeholder: string, type: string, onChange: (value: string) => void, ref?: React.Ref<HTMLInputElement> | null, visible?: boolean, setVisible?: (v: boolean) => void) => {
    return (
    <Field
      style={{paddingBottom: '1.5em'}}
    >
      <FieldLabel
        htmlFor={`fieldgroup-${text}`}
        className='text-[#d1d5dc]'
      >
        {text}
      </FieldLabel>
      <div className='flex gap-2 items-center'>
        <Input
          className='bg-[#1e2939] text-[#6a7282] border-[#364153] placeholder:text-[#4b5563] hover:border-[#7f22fe] focus:border-[#7f22fe] focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:border-[#7f22fe] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-300'
          onChange={(e: {target: {value: string}}) => {
            onChange(e.target.value)
            setErrorStatus(false)
            if (ref && 'current' in ref && ref.current) {
              clearShake(ref.current)
            }
          }}
          placeholder={placeholder}
          id={`fieldgroup-${text}`}
          type={type == 'password' && visible ? 'text' : type}
          ref={ref}
        />
        {type == 'password' && setVisible &&
          <AnimatePresence mode='wait'>
            {visible ?
              <motion.div
                animate={{opacity: 1, scale: 1, rotate: 0}}
                exit={{opacity: 0, scale: 0.5, rotate: 45}}
                initial={{opacity: 0, scale: 0.5}}
                transition={{duration: 0.15}}
                key='!visible'
              >
                <EyeOff
                  className='text-[#6a7282] hover:text-white transition-colors duration-300 cursor-pointer'
                  onClick={() => setVisible(false)}
                />
              </motion.div>
            :
              <motion.div
                animate={{opacity: 1, scale: 1, rotate: 0}}
                exit={{opacity: 0, scale: 0.5, rotate: 45}}
                initial={{opacity: 0, scale: 0.5}}
                transition={{duration: 0.15}}
                key='visible'
              >
                <Eye
                  className='text-[#6a7282] hover:text-white transition-colors duration-300 cursor-pointer'
                  onClick={() => setVisible(true)}
                />
              </motion.div>
            }
          </AnimatePresence>
        }
      </div>
    </Field>
  )}, [])

  return (
    <div className='overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939] h-screen w-full bg-gradient-to-br from-[#030712] to-[#2f0d68] flex justify-center flex-col pb-4'
    >
      <div className='flex flex-grow max-lg:flex-col items-center min-md:justify-center min-lg:gap-24 max-lg:py-8 max-lg:gap-4 w-full'>
        <div className='flex flex-col items-center gap-4 min-lg:pl-12'>
          <div className='cursor-pointer login-logo'>
            <Film className='text-[#a684ff] min-md:h-120 min-md:w-120 max-lg:h-75 max-lg:w-75 hover:scale-[1.05] hover:text-[#ffeafe] transition-[colors, transform] duration-300 cursor-pointer'/>
          </div>
          <h1 className='text-white text-2xl'>What to Watch</h1>
        </div>
        <div className='flex flex-col items-center gap-4 max-lg:w-full min-md:w-180 min-md:pr-12'>
          <form className='max-lg:w-screen min-md:w-full flex justify-center' onSubmit={(e) => {e.preventDefault(); auth()}}>
            <FieldGroup className='min-md:min-w-full bg-[#101828] border-[#1e2939] px-4 py-6 gap-0 rounded-2xl w-[95%] max-w-150'>
                <Field className='pb-4'>
                  <ButtonGroup className='bg-[#1e2939] rounded-[10px] p-[2px] flex justify-center w-[300px]'>
                    <Button
                      onClick={() => switchMode('login')}
                      type='button'
                      className={`
                        flex-1
                        rounded-[10px_0_0_10px]
                        px-4 py-2
                        ${mode === 'login' ? 'bg-[#7f22fe] text-white' : 'bg-[#1e2939] text-[#6a7282]'}
                        transition-colors duration-300
                        ${mode === 'login'
                          ? 'hover:bg-[#641aca]'
                          : 'hover:bg-[#1e2939] hover:text-white'}
                      `}
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => switchMode('register')}
                      type='button'
                      className={`flex-1 rounded-[0_10px_10px_0] px-4 py-2 transition-colors duration-300
                        ${mode === 'register'
                          ? 'bg-[#7f22fe] text-white'
                          : 'bg-[#1e2939] text-[#6a7282]'
                        }
                        ${mode === 'register'
                          ? 'hover:bg-[#641aca]'
                          : 'hover:bg-[#1e2939] hover:text-white'}
                      `}
                    >
                      Register
                    </Button>
                  </ButtonGroup>
                </Field>
                <SlideDown
                  visibility={mode === 'register'}
                >
                  {fieldElement('Name', 'Set your name', 'text', setName, nameRef)}
                </SlideDown>
              {fieldElement('Email', 'name@example.com', 'email', setEmail, loginRef)}
              {fieldElement('Password', 'Set your password', 'password', setPassword, passwordRef, showPassword, setShowPassword)}
              <SlideDown
                visibility={mode === 'register'}
              >
                {fieldElement('Confirm password', 'Confirm your password', 'password', setConfirm, confirmRef, showConfirm, setShowConfirm)}
              </SlideDown>
              <SlideDown visibility={errorStatus}>
                <span className='text-[#a60000] flex items-center justify-center w-full pb-5'>
                  {messageError}
                </span>
              </SlideDown>
              <Field orientation='horizontal'>
                <Button
                  className='gap-0 bg-[#7f22fe] hover:bg-[#641aca] transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 w-full'
                  disabled={loading}
                  onClick={auth}
                  type='submit'
                >
                  {mode === 'login' ? 'Sign in' : 'Create account'} <SlideLeft visibility={loading}><Loader className='ml-2 animate-spin'/></SlideLeft>
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div
            className='flex gap-3'
            onClick={() => switchMode(mode === 'login' ? 'register' :'login')}
          >
            <span
              className='text-white'
            >
              {mode === 'login' ? `Don't have an account?` : 'Already have an account?'}
            </span>
            <span
              className='cursor-pointer'
              style={{color: '#7f22fe'}}
            >
              {mode === 'login' ? 'Register now' : 'Sign in'}
            </span>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}