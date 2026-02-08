import Invite from './invite'
import {Metadata} from 'next'

export const metadata: Metadata = {
    title: 'Accepting invite…',
    description: 'Accepting invite…',
}

export default function Page() {
    return <Invite />
}