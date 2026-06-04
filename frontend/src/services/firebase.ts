import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7icgU47VyzT7v0rPBooTzpCR_cCE8r54",
  authDomain: "chillbill-d6cb2.firebaseapp.com",
  projectId: "chillbill-d6cb2",
  storageBucket: "chillbill-d6cb2.firebasestorage.app",
  messagingSenderId: "533971459537",
  appId: "1:533971459537:android:a532aafca8b5b5954914f0",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, type User };

export async function signUp(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
