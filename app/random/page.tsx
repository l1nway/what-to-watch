import Random from './random'
import {Metadata} from 'next'

export const metadata: Metadata = {
    title: 'Movie picker',
    description: 'Movie picker',
}

export default function Page() {
    return <Random/>
}