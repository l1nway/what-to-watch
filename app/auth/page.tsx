import Auth from './auth'
import {Metadata} from 'next'

export const metadata: Metadata = {
    title: 'Authorization',
    description: 'Authorization',
}

export default function Page() {
    return <Auth />
}