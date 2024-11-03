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

  uploadFile(file: File, source: any): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, `${source}/${file.name}`);
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
      .then(() => {})
      .catch((error) => {});
  }
}
