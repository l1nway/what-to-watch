import {ref, getDownloadURL, uploadBytes} from 'firebase/storage'
import {useCallback, useRef, useState} from 'react'
import SlideLeft from '../components/slideLeft'
import {doc, setDoc} from 'firebase/firestore'
import {updateProfile} from 'firebase/auth'
import {db, storage} from '@/lib/firebase'
import {User, Loader} from 'lucide-react'

export default function Avatar({user}: {user: any}) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [text, setText] = useState('Click to change avatar')

    const fileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        try {
            setLoading(true)
            setText('Loading…')
            
            const fileRef = ref(storage, `avatars/${user.uid}/avatar.jpg`)

            const snapshot = await uploadBytes(fileRef, file)

            const downloadURL = await getDownloadURL(snapshot.ref)

            await updateProfile(user, {photoURL: downloadURL})

            const userDocRef = doc(db, 'users', user.uid)
            await setDoc(userDocRef, {
                photoURL: downloadURL,
                updatedAt: new Date()
            }, {merge: true})

            setText('Click to change avatar')
        } catch (e) {
            console.error('error', e)
            setText(`Error while loading: ${e}`)
        } finally {
            setLoading(false)
        }
    }, [user, setLoading, setText])

    return (
        <div className='bg-[#101828] flex flex-col gap-2 p-4 m-4 rounded-[10px] h-fit'>
            <label
                className='cursor-pointer flex group flex-col items-center gap-2'
                onClick={() => fileRef.current?.click()}    
            >
                {user?.photoURL
                    ?
                        <img
                            src={`${user.photoURL}?t=${Date.now()}`}
                            className='h-50 md:w-220 md:h-full aspect-square object-cover rounded-full block flex-shrink-0'
                            alt='avatar'
                        />
                    :
                        <User
                            className='min-md:w-125 min-md:h-125 max-md:w-40 max-md:h-40 outline-none text-[#959dab] group-hover:text-white focus:text-white transition-colors duration-300'
                        />
                }
                <div className='flex'>
                    <span
                        className='text-[#959dab] group-hover:text-white transition-colors duration-300'
                        key={text}
                    >
                        {text}
                    </span>
                    <SlideLeft
                        visibility={loading}
                        className='pl-1'
                    >
                        <Loader className='text-[#959dab] animate-spin'/>
                    </SlideLeft>
                </div>
                <input 
                    onChange={fileUpload}
                    ref={fileRef}
                    className='hidden'
                    accept='image/*'
                    type='file'
                />
            </label>
        </div>
    )
}