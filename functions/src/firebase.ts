import {getFirestore} from 'firebase-admin/firestore'
import * as admin from 'firebase-admin'

if (admin.apps.length === 0) {admin.initializeApp()}

export const db = getFirestore()
export const region = 'europe-central2'
