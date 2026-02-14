import Privacy from './privacy'
import {Metadata} from 'next'

export const metadata: Metadata = {
    title: 'Privacy policy',
    description: 'Privacy policy',
}

export default function Page() {
    return <Privacy />
}