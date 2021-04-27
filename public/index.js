import { hideDialogCloseBut, initFire } from "./sharedFunction.js";
import { redirector } from "./sessionManager.js";
$(document).ready(function () {  
  initFire();
  //check if usr logged in
  mainFunc();
});

function mainFunc() {
  var uEmail, uPw;
  $("#login-form").submit(function (event) {
    event.preventDefault();
    uEmail = $("#uEmail").val();
    uPw = $("#uPw").val();
    firebase
      .auth()
      .signInWithEmailAndPassword(uEmail, uPw)
      .then((user) => {
        hideDialogCloseBut();
        $("#messageDialog").modal({ backdrop: "static", keyboard: false });
        $("#messageContent").html("Login success <br> Please Wait for redirect");
        //redirect func
        redirector();
      })
      .catch((error) => {
        $("#messageDialog").modal();
        $("#messageContent").text("Login failed");
        console.error("login error code " + error.code + " \nmessage:" + error.message);
      });
  });
}
