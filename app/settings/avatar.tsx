
import {useCallback, useRef} from 'react'
import {User} from 'lucide-react'

export default function Avatar({user, setFile}: any) {
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback((uploaded: any) => {
        if (!uploaded || !uploaded.type || !uploaded.type.startsWith('image/')) {
            return
        }
        setFile(uploaded)
    }, [])

    return (
        <div
            className='bg-[#101828] flex flex-col gap-2 p-4 m-4 rounded-[10px] h-fit'
        >
            <label
                className='cursor-pointer flex group flex-col items-center gap-2'
            >
                {user?.photoURL
                    ?
                        <img
                            src={`${user.photoURL}`}
                            className='min-w-100 max-w-100 max-lg:min-w-90 max-lg:max-w-90 aspect-square object-cover rounded-full block flex-shrink-0'
                            alt='avatar'
                        />
                    :
                        <User
                            className='w-100 h-100 max-lg:w-90 max-lg:h-90 outline-none text-[#959dab] group-hover:text-white focus:text-white transition-colors duration-300'
                        />
                }
                <div className='flex'>
                    <span
                        className='text-[#959dab] group-hover:text-white transition-colors duration-300'
                    >
                        Click to change avatar
                    </span>
                </div>
                <input 
                    onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleFile(file)
                    }}
                    ref={fileRef}
                    className='hidden'
                    accept='image/*'
                    type='file'
                />
            </label>
        </div>
    )
}