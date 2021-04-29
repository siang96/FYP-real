import { initFireDb } from "./sharedFunction.js";

function checkLoginSatus() {
  firebase.auth().onAuthStateChanged(async function (user) {
    var currPage = window.location.pathname;
    if (user) {      
      var uidPass = user.uid;
      console.log(uidPass);
      var profileGot = await getProfile(uidPass);
      console.log(currPage);
      if ((currPage == "/") ||( currPage == "/register/")||(currPage=="/index.html")) {
        redirector(profileGot);
      }
      else{
        profileSetter(profileGot);
      }
    } else {
      window.location.replace("/");
    }
  });
}

function profileSetter(uProfile) {
  // var welTextDiv = document.getElementById("usrNameDisplay");
  // welTextDiv.innerHTML += profileGot.name;
  console.log("hi fromsetter");
}

function redirector(uProfile) {
  if (uProfile.usrType == "cust") {
    window.location.replace("/viewAndUp");
  }
  else{
    window.location.replace("/orderManager");
  }
}

function signOut() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      window.location.replace("/");
    })
    .catch((error) => {
      // An error happened.
    });
}

async function getProfile(uid) {
  var fireDB = initFireDb();
  var profieDoc = uid;
  var docLoc = fireDB.collection("user").doc(profieDoc);
  try {
    var profileDoc = await docLoc.get();
    if (profileDoc.exists) {
      return profileDoc.data();
    } else {
      console.log("profile not exists");
    }
  } catch (error) {
    console.error("got error: " + err);
  }
}

export { checkLoginSatus, redirector, signOut, getProfile };
