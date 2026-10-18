// CONFIGURAÇÃO DO FIREBASE DO EPA
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBRm9AcF8zrGl2F5MPk53LD96w9aIpxJH0",
  authDomain: "epa-1ds-91ded.firebaseapp.com",
  databaseURL: "https://epa-1ds-91ded-default-rtdb.firebaseio.com",
  projectId: "epa-1ds-91ded",
  storageBucket: "epa-1ds-91ded.firebasestorage.app",
  messagingSenderId: "912883583483",
  appId: "1:912883583483:web:5bdaa61ffee5d7d619235e",
  measurementId: "G-W0L3CFS9GQ"
};

if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}