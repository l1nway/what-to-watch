import {initializeAppCheck, ReCaptchaV3Provider} from 'firebase/app-check'
import {initializeApp, getApps, getApp} from 'firebase/app'
import {getFunctions} from 'firebase/functions'
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'
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

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV === 'development') {
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true
    }

    initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!),
        isTokenAutoRefreshEnabled: true
    })
}

export const functions = getFunctions(app, 'europe-central2')
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)