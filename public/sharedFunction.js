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

function loadForm(/*id,functype*/) {
  //get doc(id)
  //load form in message content
  // =>load select box
  //=>load personal info
  //=>load form based value
  //=>load add detail
  //bind events
  //hide orderfile area
  //set value(doc)
  //if (functype) is view, load downlad but,bind
  //=>set input disabled
  //if (functype) is edit, show orderfile area bind show submit but
  //=> delete replace file on submit
  
}

function setFormValue(/*doc */) {
  //sets val(doc)
}

function cancelOrder() {
  //load confirm
  //bind confirm
}

export { hideDialogCloseBut, initFire, initFireDb, showDialogCloseBut };
