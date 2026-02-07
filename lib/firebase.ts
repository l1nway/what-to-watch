import {initializeApp, getApps} from 'firebase/app'
import {getFunctions} from 'firebase/functions'
import {getFirestore} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'

const firebaseConfig = {
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  storageBucket: 'filmdecider.firebasestorage.app',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  messagingSenderId: '518177667998',
  measurementId: 'G-M8KHZ5K1M9'
}

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0]

export const functions = getFunctions(app, 'europe-central2')
export const db = getFirestore(app)
export const auth = getAuth(app)