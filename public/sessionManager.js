function checkLoginSatus() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      return true;
    } else {
      return false;
    }
  });
}

export {checkLoginSatus};
