import { db } from "./firebaseConfig";
import { ref, set } from "firebase/database";

export function writeUserData(userId, name, email) {
  set(ref(db, 'users/' + userId), {
    username: name,
    email: email,
  });
}
