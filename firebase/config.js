// firebase/config.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

import { getAuth } from "firebase/auth"; // ✅ Use web version if 'react-native' path fails
// Note: This falls back to memory persistence, which is okay for development.

const firebaseConfig = {
  apiKey: "AIzaSyAL38RxF21hs7Kb6QzHMjFz2Nm7MI9Vcf0",
  authDomain: "sampleapp-6afa9.firebaseapp.com",
  databaseURL: "https://sampleapp-6afa9-default-rtdb.firebaseio.com",
  projectId: "sampleapp-6afa9",
  storageBucket: "sampleapp-6afa9.appspot.com",
  messagingSenderId: "309151820879",
  appId: "1:309151820879:web:0aa1dba916f98608104e3a",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app); // ✅ use getAuth directly

export { db, auth };
