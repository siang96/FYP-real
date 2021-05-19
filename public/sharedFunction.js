function hideDialogCloseBut() {
  $("#messageDialogCloseBut").hide();
  $("#messageDialogFooter").hide();
}

function showDialogCloseBut() {
  $("#messageDialogCloseBut").show();
  $("#messageDialogFooter").show();
}

function initFire() {
  var firebaseConfig = {
    apiKey: "AIzaSyClxeFYJNbZFSnvrigNumSDqIDNnAbI-xI",
    authDomain: "psmis-webapp.firebaseapp.com",
    databaseURL:
      "https://psmis-webapp-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "psmis-webapp",
    storageBucket: "psmis-webapp.appspot.com",
    messagingSenderId: "444178708470",
    appId: "1:444178708470:web:777d2c0bf38e6b84a1b9d7",
  };
  firebase.initializeApp(firebaseConfig);
}

function initFireDb() {
  return firebase.firestore();
}

export {
  hideDialogCloseBut,
  initFire,
  initFireDb,
  showDialogCloseBut,
};
