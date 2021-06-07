import { forgotPw, hideDialogCloseBut, initFire, showDialogCloseBut } from "./sharedFunction.js";
import { initSession } from "./sessionManager.js";
$.ajaxSetup({
  cache: false,
});

$(document).ready(function () {
  initFire();
  initSession();
  mainFunc();
});

function mainFunc() {
  var uEmail, uPw;
  $("#login-form").submit(function (event) {
    $("#messageTitle").html("Message");
    hideDialogCloseBut();
    $("#messageDialog").modal({ backdrop: "static", keyboard: false });
    $("#messageContent").html("Logging in");
    event.preventDefault();
    uEmail = $("#uEmail").val();
    uPw = $("#uPw").val();
    firebase
      .auth()
      .signInWithEmailAndPassword(uEmail, uPw)
      .then(function (user) {
        $("#messageContent").html(
          "Login success <br> Please Wait for redirect"
        );
      })
      .catch((error) => {
        showDialogCloseBut();
        $("#messageContent").html("Login failed");
        console.error(
          "login error code " + error.code + " \nmessage:" + error.message
        );
      });
  });
  $("#forgotPw").click(function (e) { 
    e.preventDefault();
    $("#messageDialog").modal({ backdrop: "static", keyboard: false });
    forgotPw();
    $("#messageDialogCloseBut").show();
  });
}
