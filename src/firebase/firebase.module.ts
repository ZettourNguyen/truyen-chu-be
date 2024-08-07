import { Module } from '@nestjs/common';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { FirebaseStorageService } from './firebase.service';

@Module({
  providers: [
    {
      provide: 'FIREBASE_APP',
      useFactory: (): FirebaseApp => {
        const firebaseConfig = {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID,
          measurementId: process.env.FIREBASE_MEASUREMENT_ID,
        };
        return initializeApp(firebaseConfig);
      },
    },
    {
      provide: 'FIREBASE_STORAGE',
      useFactory: (app: FirebaseApp): FirebaseStorage => {
        return getStorage(app);
      },
      inject: ['FIREBASE_APP'],
    },
    FirebaseStorageService,
  ],
  exports: [FirebaseStorageService, 'FIREBASE_STORAGE'],
})
export class FirebaseModule {}
