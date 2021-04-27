function checkLoginSatus() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      return true;
    } else {
      return false;
    }
  });
}

function redirector() {
  window.location.replace("/co");
}

export {checkLoginSatus,redirector};
