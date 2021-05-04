import { initFireDb } from "./sharedFunction.js";

function checkLoginSatus() {
  firebase.auth().onAuthStateChanged(async function (user) {
    var currPage = window.location.pathname;
    if (user) {
      var uidPass = user.uid;
      var profileGot = await getProfile(uidPass);
      if (
        currPage == "/" ||
        currPage == "/register/" ||
        currPage == "/index.html"
      ) {
        redirector(profileGot);
      } else {
        //addtional access level redirector
        profileSetter(profileGot);
      }
    } else {
      if (
        currPage != "/" &&
        currPage != "/register/" &&
        currPage != "/index.html"
      ) {
        window.location.replace("/");
      }
    }
  });
}

function profileSetter(uProfile) {
  var welTextDiv = document.getElementById("usrNameDisplay");
  welTextDiv.innerHTML += uProfile.name;
  //add nav controls
}

function redirector(uProfile) {
  if (uProfile.usrType == "cust") {
    window.location.replace("/viewAndUp");
  } else {
    window.location.replace("/orderManager");
  }
}

function signOut() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      hideDialogCloseBut();
      $("#messageDialog").modal({ backdrop: "static", keyboard: false });
      $("#messageContent").html("Logout success <br> Please Wait for redirect");
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
      console.error("profile not exists");
    }
  } catch (error) {
    console.error("got error: " + err);
  }
}

export { checkLoginSatus, redirector, signOut, getProfile };
