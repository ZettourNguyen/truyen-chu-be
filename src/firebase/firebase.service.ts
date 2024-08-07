// src/firebase/firebase-storage.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { FirebaseStorage } from 'firebase/storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as fs from 'fs';

@Injectable()
export class FirebaseStorageService {
  constructor(
    @Inject('FIREBASE_STORAGE') private readonly storage: FirebaseStorage,
  ) {}

  async uploadFile(localFilePath: string, firebaseFilePath: string): Promise<string> {
    const fileRef = ref(this.storage, firebaseFilePath);
    const fileBuffer = fs.readFileSync(localFilePath);
    await uploadBytes(fileRef, fileBuffer);
    return getDownloadURL(fileRef);
  }
}
