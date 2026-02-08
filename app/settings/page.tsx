import Settings from './settings'
import {Metadata} from 'next'

export const metadata: Metadata = {
    title: 'Settings',
    description: 'Settings',
}

export default function Page() {
    return <Settings/>
}