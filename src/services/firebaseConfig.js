// src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBd4NHePpveaDYj4RyQo7OyEyC8Wf8scos",
  authDomain: "observatorio-laboral-cr.firebaseapp.com",
  projectId: "observatorio-laboral-cr",
  storageBucket: "observatorio-laboral-cr.firebasestorage.app",
  messagingSenderId: "86857815411",
  appId: "1:86857815411:web:01387493f7b247b572a106"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios para usarlos en toda la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;