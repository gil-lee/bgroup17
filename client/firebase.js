import * as firebase from "firebase"

const firebaseConfig = {
  apiKey: "AIzaSyCjnwssmjf0V7fQJf0PAlor7I_1oq3t86Y",
  authDomain: "swish-s.firebaseapp.com",
  projectId: "swish-s",
  storageBucket: "swish-s.appspot.com",
  messagingSenderId: "530086356514",
  appId: "1:530086356514:web:5a22dcb1c3af1413eccc7b",
  measurementId: "G-K6B2TB98K6"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


export { firebase }