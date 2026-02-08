import List from './list'
import {Metadata} from 'next'

export const metadata: Metadata = {
    title: 'List',
    description: 'List',
}

export default function Page() {
    return <List />
}