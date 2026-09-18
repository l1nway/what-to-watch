import TokenScreen from '../components/tokenScreen'
import {Suspense} from 'react'
import {Metadata} from 'next'
import Reset from './reset'

export const metadata: Metadata = {
    title: 'Account confirmation',
    description: 'Account confirmation',
    robots: {index: false, follow: false},
}

export default function Page() {
    // the params are read on the client, so the spinner holds the screen until they exist [DOC: #action-modes]
    return <Suspense fallback={<TokenScreen/>}><Reset/></Suspense>
}
