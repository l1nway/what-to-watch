import {initializeApp, getApps} from "firebase/app"
import {getFirestore} from 'firebase/firestore'
import {getAuth} from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: "filmdecider.firebasestorage.app",
  messagingSenderId: "518177667998",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: "G-M8KHZ5K1M9"
}

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)