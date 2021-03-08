$(document).ready(function () {
  var uEmail, uPw;

  $("#login-form").submit(function (event) {
    uEmail = $("#uEmail").val();
    uPw = $("#uPw").val();
    event.preventDefault();
    firebase
      .auth()
      .signInWithEmailAndPassword(uEmail, uPw)
      .then((user) => {
        $("#messageDialog").modal();
        $("#messageContent").text("Login success");
      })
      .catch((error) => {
        $("#messageDialog").modal();
        $("#messageContent").text("Login failed");
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error(
          "login error code " + error.code + " \nmessage:" + error.message
        );
      });
  });
});
