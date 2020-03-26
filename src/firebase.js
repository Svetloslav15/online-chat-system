import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBisev8t2wXMItyF_Q7nRjiDytqSf5hWw0",
    authDomain: "chat-app-34960.firebaseapp.com",
    databaseURL: "https://chat-app-34960.firebaseio.com",
    projectId: "chat-app-34960",
    storageBucket: "chat-app-34960.appspot.com",
    messagingSenderId: "326460974730",
    appId: "1:326460974730:web:ad7b9a2ca66c98f9d06f73"
  };
  firebase.initializeApp(firebaseConfig);

  export default firebase;