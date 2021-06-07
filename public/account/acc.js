import { getProfile, getUid, initSession, signOut } from "../sessionManager.js";
import { initFire, initFireDb, forgotPw } from "../sharedFunction.js";

$.ajaxSetup({
  cache: false,
});

$(document).ready(function () {
  initFire();
  initSession();
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      main();
    }
  });
});

function main() {
  $("#logoutButton").click(function (e) {
    e.preventDefault();
    signOut();
  });
  setVal();
  $("#usrPw").change(function () {
    validPw();
  });
  $("#usrConfirmPw").keyup(function () {
    validPw();
  });
  $("#updateForm").submit(function (e) {
    e.preventDefault();
    updateAcc();
  });
}

async function setVal() {
  var uid = getUid();
  var profile = await getProfile(uid);
  $("#usrName").val(profile.name);
  $("#usrContactNum").val(profile.contactNum);
  $("#usrEmail").val(profile.email);
}

function validPw() {
  var password = document.getElementById("usrPw");
  var confirm_password = document.getElementById("usrConfirmPw");
  if (password.value != confirm_password.value) {
    confirm_password.setCustomValidity("Passwords Don't Match");
  } else {
    confirm_password.setCustomValidity("");
  }
}

function updateAcc() {
  const currUser = firebase.auth().currentUser;
  $("#messageDialogCloseBut").show();
  $("#messageTitle").html("Reauthenticate");
  $("#messageDialog").modal({ backdrop: "static", keyboard: false });
  $("#messageContent").load(
    "../assets/html/oldPw.html",
    function (response, status, xhr) {
      if (status == "success") {
        var pwUpdate = $("#usrPw").val();
        var emailUpdate = $("#usrEmail").val();
        var contactNumUpdate = $("#usrContactNum").val();
        var nameUpdate = $("#usrName").val();
        $("#forgotPw").click(function (e) {
          e.preventDefault();
          forgotPw();
        });
        $("#submitButton").click(function (e) {
          $("#submitButton").prop("disabled", true);
          $("#relogForm :input").prop("disabled", true);
          e.preventDefault();
          var oldPw = $("#oldPw").val();
          const credential = firebase.auth.EmailAuthProvider.credential(
            currUser.email,
            oldPw
          );
          currUser
            .reauthenticateWithCredential(credential)
            .then(() => {
              if (emailUpdate != currUser.email) {
                currUser
                  .updateEmail(emailUpdate)
                  .then(() =>
                    $("#messageContent").append("<br>Email update success")
                  )
                  .catch((error) => {
                    $("#messageContent").append(error);
                    console.error("update auth email error " + error);
                  });
              }
              if (pwUpdate) {
                currUser
                  .updatePassword(pwUpdate)
                  .then(() =>
                    $("#messageContent").append("<br>Password update success")
                  )
                  .catch((error) => {
                    $("#messageContent").append(error);
                    console.error("update auth pw error " + error);
                  });
              }
              var fireDB = initFireDb();
              fireDB
                .collection("user")
                .doc(currUser.uid)
                .update({
                  email: emailUpdate,
                  name: nameUpdate,
                  contactNum: contactNumUpdate,
                })
                .then(() => {
                  $("#messageContent").append(
                    "<br>Record Update Success!<br> Please Wait for reload"
                  );
                  setTimeout(() => {
                    location.reload();
                  }, 2000);
                })
                .catch((error) => {
                  console.error("update user error " + error);
                });
            })
            .catch((error) => {
              if (
                error.code == "auth/wrong-password" ||
                error.code == "auth/too-many-requests"
              ) {
                $("#messageContent").append(error.message);
              }
              console.error("reauth error" + error);
            });
        });
      }
    }
  );
}
