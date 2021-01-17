$(document).ready(function() {
  var uEmail, uPw;


  $("#login-form").submit(function(event) {
    console.log("form submited");
    uEmail = $("#uEmail").val();
    uPw = $("#uPw").val();
    event.preventDefault();
    firebase.auth().signInWithEmailAndPassword(uEmail, uPw)
      .then((user) => {
        alert("user signed in");
        window.location.replace("cus");
      })
      .catch((error) => {
        alert("user not signed in");
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("login error code " + error.code + " message:" + error.message);
        console.log("email: " + uEmail + " pw: " + uPw);
      });
  });
});
