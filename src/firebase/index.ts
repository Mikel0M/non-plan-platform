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
  // Final sanitization - remove any undefined values that might have slipped through
  const sanitizedData = JSON.parse(JSON.stringify(data, (key, value) => {
    return value === undefined ? null : value;
  }));
  
  // Remove null values too to be extra safe
  const cleanData = Object.fromEntries(
    Object.entries(sanitizedData).filter(([_, value]) => value !== null && value !== undefined)
  );
  
  const doc = Firestore.doc(firestoreDB, `${path}/${id}`)
  return await Firestore.updateDoc(doc, cleanData)
}

export async function addDocument<T extends Record<string, any>>(path: string, data: T, id?: string) {
  // Final sanitization - remove any undefined values that might have slipped through
  const sanitizedData = JSON.parse(JSON.stringify(data, (key, value) => {
    return value === undefined ? null : value;
  }));
  
  // Remove null values too to be extra safe
  const cleanData = Object.fromEntries(
    Object.entries(sanitizedData).filter(([_, value]) => value !== null && value !== undefined)
  );
  
  if (id) {
    // If ID is provided, use setDoc to create document with specific ID
    const doc = Firestore.doc(firestoreDB, `${path}/${id}`)
    return await Firestore.setDoc(doc, cleanData)
  } else {
    // If no ID is provided, use addDoc to create document with auto-generated ID
    const collection = Firestore.collection(firestoreDB, path)
    return await Firestore.addDoc(collection, cleanData)
  }
}

