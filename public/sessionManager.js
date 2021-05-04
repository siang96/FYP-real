import { hideDialogCloseBut, initFireDb } from "./sharedFunction.js";
let isSignOut=false;

function checkLoginSatus() {
  hideDialogCloseBut();
  $("#messageDialog").modal({ backdrop: "static", keyboard: false });
  $("#messageContent").html("Loading");
  firebase.auth().onAuthStateChanged(async function (user) {
    var currPage = window.location.pathname;
    if (user) {
      var uidPass = user.uid;
      var profileGot = await getProfile(uidPass);
      $("#messageDialog").modal("hide");
      if (
        currPage == "/" ||
        currPage == "/register/" ||
        currPage == "/index.html"
      ) {
        setTimeout(() => {
          redirector(profileGot);
        }, 500);
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
        if (isSignOut != true) {
          $("#messageContent").html("Redirecting");
        }
        setTimeout(() => {
          window.location.replace("/");
        }, 3000);
      } else {
        $("#messageDialog").on("shown.bs.modal", function (event) {
          setTimeout(() => {
            $("#messageDialog").modal("hide");
          }, 1000);
        });
      }
    }
  });
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
      $("#messageContent").html("Loging out <br> Please Wait for redirect");
      isSignOut=true;
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
    console.error("got error: " + error);
  }
}

export { checkLoginSatus, redirector, signOut, getProfile };
