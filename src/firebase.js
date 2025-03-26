import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Tera Firebase config yaha
  apiKey: "AIzaSyBPxmd9PHu6lg6nP0EMnG1_KmiFpx8E2i0",
  authDomain: "team-nexovate-fb.firebaseapp.com",
  projectId: "team-nexovate-fb",
  storageBucket: "team-nexovate-fb.firebasestorage.app",
  messagingSenderId: "408582385641",
  appId: "1:408582385641:web:23cf6256cbd0538d642578"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }