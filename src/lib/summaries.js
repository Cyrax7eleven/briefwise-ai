import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const COLLECTION = 'summaries'

export async function saveSummary({ userId, fileName, summary, length, pageCount }) {
  return addDoc(collection(db, COLLECTION), {
    userId,
    fileName,
    summary,
    length,
    pageCount,
    createdAt: serverTimestamp(),
  })
}

export function subscribeToSummaries(userId, callback, onError) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))), onError)
}

export function deleteSummary(id) {
  return deleteDoc(doc(db, COLLECTION, id))
}

export function updateSummaryLearning(id, learning) {
  return updateDoc(doc(db, COLLECTION, id), { learning, updatedAt: serverTimestamp() })
}
