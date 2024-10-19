import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyADmfjS2_CYkXCeNHsS5qzjRuGxo1lSKDI",
  authDomain: "communitize-news.firebaseapp.com",
  projectId: "communitize-news",
  storageBucket: "communitize-news.appspot.com",
  messagingSenderId: "258815375248",
  appId: "1:258815375248:web:bae1072f2ecf542c4b2515",
  measurementId: "G-EPHY81E8W9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

export default app;
