const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { user } = require("firebase-functions/lib/providers/auth");
admin.initializeApp();

exports.removeUser = functions
  .region("asia-southeast2")
  .https.onCall((data, context) => {
    var uid = data;
    if (!(typeof uid === "string") || uid.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with " +
          'one arguments "text" containing the message text to add.'
      );
    }
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    return admin
      .auth()
      .deleteUser(uid)
      .then(() => {
        return { stats: "success" };
      })
      .catch((error) => {
        throw new functions.https.HttpsError("unknown", error.message, error);
      });
  });

exports.updateUser = functions
  .region("asia-southeast2")
  .https.onCall((data, context) => {
    if (!(typeof data === "object")) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with " +
          'one arguments "object" containing the user data to update.'
      );
    }
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    var updateStuff = {};
    updateStuff.email = data.email;
    if (data.password != "") {
      updateStuff.password = data.password;
    }
    return admin
      .auth()
      .updateUser(data.userId, updateStuff)
      .then(() => {
        return { stats: "success" };
      })
      .catch((error) => {
        throw new functions.https.HttpsError("unknown", error.message, error);
      });
  });

exports.newUser = functions
  .region("asia-southeast2")
  .https.onCall((data, context) => {
    if (!(typeof data === "object")) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with " +
          'one arguments "object" containing the user data to update.'
      );
    }
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }
    var newData = {};
    newData.email = data.email;
    newData.password = data.password;
    return admin
      .auth()
      .createUser(newData) //new user
      .then((userData) => {
        return { stats: "success",userId:userData.uid };
      })
      .catch((error) => {
        throw new functions.https.HttpsError("unknown", error.message, error);
      });
  });
