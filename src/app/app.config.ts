import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';

const firebaseConfig = {
        projectId: 'dabubble-3c5b0',
        appId: '1:904297976039:web:5a55b686aa74fb7763d242',
        storageBucket: 'dabubble-3c5b0.appspot.com',
        apiKey: 'AIzaSyC9dPnMg7uyONz8kydSLvm_zg6iLfp4NmM',
        authDomain: 'dabubble-3c5b0.firebaseapp.com',
        messagingSenderId: '904297976039',
        measurementId: 'G-Z5QGG7XBD0'
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideFirebaseApp(() =>
      initializeApp(firebaseConfig)
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
  ],
};
