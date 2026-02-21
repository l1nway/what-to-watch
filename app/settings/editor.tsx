import {ref, getDownloadURL, uploadBytes} from 'firebase/storage'
import {useCallback, useEffect, useRef, useState} from 'react'
import ShowClarify from '../components/showClarify'
import SlideDown from '../components/slideDown'
import AvatarEditor from 'react-avatar-editor'
import {doc, setDoc} from 'firebase/firestore'
import {Button} from '@/components/ui/button'
import {updateProfile} from 'firebase/auth'
import {db, storage} from '@/lib/firebase'
import {Loader} from 'lucide-react'
import SlideLeft from '../components/slideLeft'
import {Slider} from '@/components/ui/slider'
import {useGesture} from '@use-gesture/react'
import { updateActivity } from '@/lib/presence'

export default function Editor({visibility, onClose, user}: any) {

    const editor = useRef<AvatarEditor>(null)

    const [rotation, setRotation] = useState<number>(0)
    const [zoom, setZoom] = useState<number>(1)
    const [loaded, setLoaded] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        if (!visibility) {
            setLoaded(false)
        } else {
            updateActivity('changing_avatar')
        }

        return () => {
            updateActivity('in_settings')
        }
    }, [visibility])

    const reset = useCallback(() => {
        setRotation(0)
        setZoom(1)
        onClose()
    }, [])

    const fileUpload = useCallback(async () => {
        if (!editor.current) return

        try {
            setLoading(true)

            const canvas = editor.current.getImageScaledToCanvas()

            const blob = await new Promise<Blob | null>((resolve) => 
                canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9)
            )

            if (!blob) throw new Error('Failed to create blob')

            const fileRef = ref(storage, `avatars/${user.uid}/avatar.jpg`)

            const snapshot = await uploadBytes(fileRef, blob, {
                contentType: 'image/jpeg',
            })

            const downloadURL = await getDownloadURL(snapshot.ref)

            await updateProfile(user, {photoURL: downloadURL})

            const userDocRef = doc(db, 'users', user.uid)
            await setDoc(userDocRef, {
                photoURL: downloadURL,
                updatedAt: new Date()
            }, {merge: true})

            onClose()
        } catch (e) {
            console.error('Upload error:', e)
        } finally {
            setLoading(false)
        }
    }, [user, onClose, storage, db])

    const MIN_ZOOM = 1
    const MAX_ZOOM = 3

    const editorContainer = useRef(null)

    const startZoom = useRef(zoom)
    const startRotation = useRef(rotation)

    useGesture({
        onPinch: ({movement: [ms, mr], memo}) => {
        if (!memo) {
            startZoom.current = zoom
            startRotation.current = rotation
            return true
        }
            setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, startZoom.current * ms)))
            setRotation(Math.min(180, Math.max(-180, startRotation.current + mr)))
            return memo
        }
    }, {
        target: editorContainer,
        pinch: {scaleBounds: {min: MIN_ZOOM, max: MAX_ZOOM}, rubberband: false}
    })

    return (
        <ShowClarify
            parentClassName='flex min-md:min-w-fit min-md:max-h-full'
            className='max-md:h-auto w-full items-center overflow-y-auto [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#641aca_#1e2939]'
            visibility={visibility}
            onClose={reset}
        >
            <SlideDown
                className='flex justify-center'
                visibility={!loaded}
            >
                <Loader className='h-15 w-15 text-white animate-spin'/>
            </SlideDown>
            <div
                className='relative touch-none [&>canvas]:!w-full [&>canvas]:!h-full canvas-container'
                ref={editorContainer}
            >
                <AvatarEditor
                    onLoadSuccess={() => setLoaded(true)}
                    crossOrigin='anonymous'
                    backgroundColor='gray'
                    borderRadius={500}
                    image={visibility}
                    rotate={rotation}
                    height={512}
                    scale={zoom}
                    ref={editor}
                    width={512}
                    border={0}
                />
            </div>
            <div className='w-full flex flex-col gap-3 pt-3 pb-2'>
                <label className='flex flex-col gap-3'>
                    <span className='text-white'>
                        Zoom
                    </span>
                    <Slider
                        onValueChange={([v]) => setZoom(v)}
                        min={MIN_ZOOM}
                        max={MAX_ZOOM}
                        value={[zoom]}
                        step={0.01}
                    />
                </label>
                <label className='flex flex-col gap-3'>
                <span className='text-white'>
                    Rotate
                </span>
                    <Slider
                        onValueChange={([v]) => setRotation(v)}
                        value={[rotation]}
                        step={0.01}
                        min={-180}
                        max={180}
                    />
                </label>
            </div>
            <div className='flex gap-2 w-full justify-between pt-4'>
                <Button className={`w-[48%] bg-[#1e2939] hover:bg-[#303844] cursor-pointer`} onClick={reset}>
                    Cancel
                </Button>
                <Button
                    className={`gap-0 w-[48%] bg-[#7f22fe] hover:bg-[#641aca] cursor-pointer`}
                    disabled={loading || !loaded}
                    onClick={fileUpload}
                >
                    <SlideLeft visibility={loading || !loaded}>
                        <Loader className='mr-1 text-white animate-spin'/>
                    </SlideLeft> Save changes
                </Button>
            </div>
        </ShowClarify>
    )
}