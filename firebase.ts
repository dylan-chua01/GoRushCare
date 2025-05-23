// firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCLiqZsEQM0R4nVudLOOlHHWHmGU8l34p4",
  authDomain: "gorush-care.firebaseapp.com",
  projectId: "gorush-care",
  storageBucket: "gorush-care.firebasestorage.app",
  messagingSenderId: "461329646551",
  appId: "1:461329646551:web:b0b9f3c5584e793d2e4192",
  measurementId: "G-ZDNJ3Y84BY"
};

  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

export { storage };
