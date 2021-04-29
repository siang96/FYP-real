import { hideDialogCloseBut, initFire } from "./sharedFunction.js";
import { checkLoginSatus, redirector,getProfile } from "./sessionManager.js";
$(document).ready(function () {  
  initFire();
  checkLoginSatus();
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
      .then(async function(user){
        hideDialogCloseBut();
        $("#messageDialog").modal({ backdrop: "static", keyboard: false });
        $("#messageContent").html("Login success <br> Please Wait for redirect");
        var profile=await getProfile(user.id);
        redirector(profile);        
      })
      .catch((error) => {
        $("#messageDialog").modal();
        $("#messageContent").text("Login failed");
        console.error("login error code " + error.code + " \nmessage:" + error.message);
      });
  });
}
