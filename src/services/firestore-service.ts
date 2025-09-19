'use server';

import { ensureDbConnected } from '@/lib/firebase-admin';

type FirestoreDoc<T> = T & { id: string };

export async function createDocumentWithCustomId<T extends object>(
  collectionName: string,
  prefix: string,
  data: T
): Promise<FirestoreDoc<T>> {
  const db = ensureDbConnected();
  const collectionRef = db.collection(collectionName);

  const countQuery = collectionRef.count();
  const snapshot = await countQuery.get();
  let count = snapshot.data().count || 0;

  let newId: string;
  let docExists: boolean;

  do {
    count++;
    newId = `${prefix}-${String(count).padStart(5, '0')}`;
    const doc = await collectionRef.doc(newId).get();
    docExists = doc.exists;
  } while (docExists);

  const newDoc: FirestoreDoc<T> = {
    id: newId,
    ...data,
  };

  await collectionRef.doc(newId).set(newDoc);

  return newDoc;
}
