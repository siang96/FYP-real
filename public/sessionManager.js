import {
  hideDialogCloseBut,
  initFireDb,
  mediumDiaglog,
} from "./sharedFunction.js";

let isSignOut = false;
let currPage = window.location.pathname;
function initSession() {
  hideDialogCloseBut();
  $("#messageDialog").modal({ backdrop: "static", keyboard: false });
  $("#messageContent").html("Loading");
  firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
      var uidPass = user.uid;
      var profileGot = await getProfile(uidPass);
      if (
        currPage == "/" ||
        currPage.match(/register/gi) ||
        currPage == "/index.html"
      ) {
        $("#messageContent").html("Logged in and redirecting");
        setTimeout(() => {
          redirector(profileGot);
        }, 800);
      } else {
        accessRedirector(profileGot);
        profileSetter(profileGot);
        setTimeout(() => {
          $("#messageDialog").modal("hide");
        }, 1000);
      }
    } else {
      if (
        currPage != "/" &&
        !currPage.match(/register/gi) &&
        currPage != "/index.html"
      ) {
        if (isSignOut != true) {
          $("#messageContent").html("Redirecting");
        }
        setTimeout(() => {
          window.location.replace("/");
        }, 800);
      } else {
        setTimeout(() => {
          $("#messageDialog").modal("hide");
        }, 1000);
      }
    }
  });
}

function accessRedirector(uProfile) {
  $("#messageContent").html("Verifying");
  if (uProfile.usrType == "admin") {
    if (currPage.match(/orderViewer/gi) || currPage.match(/relogger/gi)) {
      $("#messageContent").html("You're not supposed here<br>Redirecting");
      setTimeout(() => {
        redirector(uProfile);
      }, 800);
    }
  }
  if (uProfile.usrType == "staff") {
    if (
      currPage.match(/orderViewer/gi) ||
      currPage.match(/userManager/gi) ||
      currPage.match(/report/gi) ||
      currPage.match(/relogger/gi)
    ) {
      $("#messageContent").html("You're not supposed here<br>Redirecting");
      setTimeout(() => {
        redirector(uProfile);
      }, 800);
    }
  }
  if (uProfile.usrType == "cust") {
    if (
      currPage.match(/orderManager/gi) ||
      currPage.match(/userManager/gi) ||
      currPage.match(/report/gi) ||
      currPage.match(/relogger/gi)
    ) {
      $("#messageContent").html("You're not supposed here<br>Redirecting");
      setTimeout(() => {
        redirector(uProfile);
      }, 800);
    }
  }
}

function profileSetter(uProfile) {
  var welTextDiv = document.getElementById("usrNameDisplay");
  welTextDiv.innerHTML += uProfile.name;
  if (uProfile.usrType == "admin") {
    $("#viewAndUpLink").hide();
  }
  if (uProfile.usrType == "staff") {
    $("#viewAndUpLink,#reptLink,#userManageLink").hide();
  }
  if (uProfile.usrType == "cust") {
    $("#orderManageLink,#reptLink,#userManageLink").hide();
  }
}

function redirector(uProfile) {
  if (uProfile.usrType == "cust") {
    window.location.replace("/orderViewer");
  } else {
    window.location.replace("/orderManager");
  }
}

function signOut() {
  $("#messageTitle").html("Logout");
  mediumDiaglog();
  firebase
    .auth()
    .signOut()
    .then(() => {
      hideDialogCloseBut();
      $("#messageDialog").modal({ backdrop: "static", keyboard: false });
      $("#messageContent").html("Loging out <br> Please Wait for redirect");
      isSignOut = true;
    })
    .catch((error) => {
      console.error("unable to signout");
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
    console.error("got error: " + error);
  }
}

function getUid() {
  var currUser = firebase.auth().currentUser;
  if (currUser) {
    return currUser.uid;
  }
}

export { initSession, signOut, getProfile, getUid, redirector };
