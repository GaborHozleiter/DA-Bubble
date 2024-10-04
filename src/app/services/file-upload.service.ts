import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

@Injectable({
  providedIn: 'root',
})
export class FileUploadeService {
  constructor() {}

  async uploadFile(file: File, source: any): Promise<string> {
    const storage = getStorage();

    // Erstelle einen eindeutigen Namen für die Datei
    const uniqueFileName = Date.now();

    const storageRef = ref(storage, `${source}/${uniqueFileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {},
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: any) => {
            resolve(downloadURL);
          });
        }
      );
    });
  }

  async deleteFile(fileUrl: string, source: any): Promise<void> {
    const storage = getStorage();
    const fileRef = ref(storage, `${source}/${fileUrl}`);

    deleteObject(fileRef)
      .then(() => {
        console.log('File deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting file:', error);
      });
  }
}
