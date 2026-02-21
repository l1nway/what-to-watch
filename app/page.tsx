import Intro from './intro'
import {Metadata} from 'next'

export const metadata: Metadata = {
    title: 'Introduction',
    description: 'Introduction',
}

export default function Page() {
    return <Intro/>
}