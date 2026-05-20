const firebaseConfig = {
    apiKey: "AIzaSyCZWiegR4RIMLoki-yBUjYcklc6S8XxTx0",
    authDomain: "budgettotale.firebaseapp.com",
    projectId: "budgettotale",
    storageBucket: "budgettotale.firebasestorage.app",
    messagingSenderId: "759504915756",
    appId: "1:759504915756:web:46b557fec3502a445a3089"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();