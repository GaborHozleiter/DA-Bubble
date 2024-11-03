import { Injectable } from '@angular/core';
import { collection, doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SaveNewUserService {

  constructor(private firestore: Firestore) { }

  userId: string = '';
  userName: string = ''; 
  userMail: string = '';
  userImage: string = ''; 

  async saveUser(uId: string, email: string, name: string, url: string) {
    const userRef = doc(collection(this.firestore, 'Users'), uId);
    await setDoc(
      userRef,
      this.toJSON(uId, email, name, url)
    )
    .catch((err) => {
    })
    .then(() => {
      //console.log('User saved with ID:', uId);
    });
  }

  toJSON(uId: string, email: string, name: string, image: string) {
    return {
      uid: uId,
      name: name,
      email: email,
      image: image
    };
  }
}

