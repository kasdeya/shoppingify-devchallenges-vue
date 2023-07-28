import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection } from 'firebase/firestore'
// ... other firebase imports
const apiKey = import.meta.env.VITE_API_KEY
const authDomain = import.meta.env.VITE_AUTH_DOMAIN
const projectId = import.meta.env.VITE_PROJECT_ID
const storageBucket = import.meta.env.VITE_STORAGE_BUCKET
const messagingSenderId = import.meta.env.VITE_MESSAGING_SENDER_ID
const appId = import.meta.env.VITE_APP_ID
const measurementId = import.meta.env.VITE_MEASUREMENT_ID

export const firebaseApp = initializeApp({
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
    measurementId: measurementId
})
const analytics = getAnalytics(firebaseApp);

// used for the firestore refs
const db = getFirestore(firebaseApp)

// here we can export reusable database references
// export const todosRef = collection(db, 'todos')