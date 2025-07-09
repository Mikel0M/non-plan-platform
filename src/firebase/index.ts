import * as Firestore from "firebase/firestore";
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHvCu5CFActE5bhC-sz0t0Vw72s1PGu_E",
  authDomain: "non-plan-platform.firebaseapp.com",
  projectId: "non-plan-platform",
  storageBucket: "non-plan-platform.firebasestorage.app",
  messagingSenderId: "714992691322",
  appId: "1:714992691322:web:d5344df62be8c9c8cab3c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestoreDB = Firestore.getFirestore();

export function getCollection<T>(path: string) {
  return Firestore.collection(firestoreDB, path) as Firestore.CollectionReference<T>;
}

export async function deleteDocument(path: string, id: string) {
  const doc = Firestore.doc(firestoreDB, `${path}/${id}`)
  return await Firestore.deleteDoc(doc)
}

export async function updateDocument<T extends Record<string, any>>(path: string, id: string, data: T) {
  const doc = Firestore.doc(firestoreDB, `${path}/${id}`)
  return await Firestore.updateDoc(doc, data)
}

