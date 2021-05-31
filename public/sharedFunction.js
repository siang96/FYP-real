function hideDialogCloseBut() {
  $("#messageDialogCloseBut").hide();
  $("#messageDialogFooter").hide();
}

function showDialogCloseBut() {
  $("#messageDialogCloseBut").show();
  $("#messageDialogFooter").show();
}

function initFire() {
  var firebaseConfig = {
    apiKey: "AIzaSyClxeFYJNbZFSnvrigNumSDqIDNnAbI-xI",
    authDomain: "psmis-webapp.firebaseapp.com",
    databaseURL:
      "https://psmis-webapp-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "psmis-webapp",
    storageBucket: "psmis-webapp.appspot.com",
    messagingSenderId: "444178708470",
    appId: "1:444178708470:web:777d2c0bf38e6b84a1b9d7",
  };
  firebase.initializeApp(firebaseConfig);
}

function initFireDb() {
  return firebase.firestore();
}

function bigDiaglog() {
  if (!$("#messageDialog").children().hasClass("modal-lg")) {
    $("#messageDialog").children().addClass("modal-lg");
  }
}

function mediumDiaglog() {
  if ($("#messageDialog").children().hasClass("modal-lg")) {
    $("#messageDialog").children().removeClass("modal-lg");
  }
}

async function loadForm(orderIdObtained, buttonType) {
  var order = await getOrder(orderIdObtained);
  if (order.statusDetail.deisgnServiceStatus == "Not Requested") {
    var fileRef = order.statusDetail.fileId;
  }

  bigDiaglog();
  $("#messageDialog").modal({ backdrop: "static", keyboard: false });
  $("#messageContent").load(
    "../assets/html/orderForm.html",
    function (response, status, xhr) {
      if (status == "success") {
        $("#orderId").val(orderIdObtained);
        $("#formOption").val(order.orderDetail.formOption);
        loadPInfo(order.personalDetail, buttonType);
        loadOAddInfo(order.orderDetail, buttonType);
        $("#downButArea").hide();
        $("#progressBarArea").hide();
        if (buttonType == "view") {
          loadOrderStats(order.statusDetail, buttonType);
          showDialogCloseBut();
          $("#messageTitle").html("View Order");
          $("#formOption").prop("disabled", true);
          $("#submitButton").hide();
          if (order.statusDetail.deisgnServiceStatus == "Not Requested") {
            $("#downButArea").show();
            $("#downButArea").click(function (event) {
              event.preventDefault();
              downloadFile(fileRef);
            });
          }
        }
        if (buttonType.match(/update/gi)) {
          $("#messageDialogCloseBut").show();
          //bind co events
          console.log("called");
          //bind other stuff
        }
        if (buttonType == "updateAdmin") {
          loadOrderStats(order.statusDetail, buttonType);
          //bind o stats events
          //bind sumnit
          //based on users
        }
        if (buttonType == "updateUser") {
          //bind sumnit
          //based on users
        }
      }
    }
  );

  //if (functype) is edit, show orderfile area bind show submit but
  //=> delete replace file on submit
}

function downloadFile(fileRefProvided) {
  var fileName = fileRefProvided.split("/");
  var storeRef = firebase.storage().ref(fileRefProvided);
  storeRef
    .getDownloadURL()
    .then((url) => {
      var link = document.createElement("a");
      link.download = fileName[1];
      link.href = url;
      link.target = "_blank";
      link.click();
    })
    .catch((error) => {
      console.error("unable to download " + error);
    });
}

function loadPInfo(pDetailRecieve, buttonCaller) {
  $("#personalInfoArea").load(
    "../assets/html/personalInfo.html",
    function (response, status, xhr) {
      if (status == "success") {
        setData(pDetailRecieve, "pInfo", buttonCaller);
        if (buttonCaller == "view") {
          $("#personalInfoArea :input").prop("disabled", true);
        }
      }
    }
  );
}

function loadOAddInfo(detailRecieve, callerTypeGet) {
  var selectedForm = detailRecieve.formOption;
  if (selectedForm.match(/Flyers/gi)) {
    $("#orderAddInfoArea").load(
      "../assets/html/flyer.html",
      function (response, status, xhr) {
        if (status == "success") {
          setData(detailRecieve, "flyer", callerTypeGet);
          fieldDisabler(callerTypeGet);
        }
      }
    );
  }
  if (selectedForm.match(/Hardcover/gi)) {
    $("#orderAddInfoArea").load(
      "../assets/html/hardcover.html",
      function (response, status, xhr) {
        if (status == "success") {
          setData(detailRecieve, "hard", callerTypeGet);
          fieldDisabler(callerTypeGet);
        }
      }
    );
  }
  if (selectedForm.match(/businessCard/gi)) {
    $("#orderAddInfoArea").load(
      "../assets/html/businessCard.html",
      function (response, status, xhr) {
        if (status == "success") {
          setData(detailRecieve, "bcard", callerTypeGet);
          fieldDisabler(callerTypeGet);
        }
      }
    );
  }
  if (selectedForm.match(/banner/gi)) {
    $("#orderAddInfoArea").load(
      "../assets/html/bunting.html",
      function (response, status, xhr) {
        if (status == "success") {
          setData(detailRecieve, "bunting", callerTypeGet);
          fieldDisabler(callerTypeGet);
        }
      }
    );
  }
}

function fieldDisabler(caller) {
  if (caller == "view") {
    $("#orderFileArea").hide();
    $("#orderAddInfoArea :input").prop("disabled", true);
  }
}

function loadOrderStats(data, callRecieved) {
  $("#orderStatsArea").load(
    "../assets/html/orderStats.html",
    function (response, status, xhr) {
      if (status == "success") {
        setData(data, "oStats", callRecieved);
        if (callRecieved == "view") {
          $("#orderStatsArea :input").prop("disabled", true);
        }
      }
    }
  );
}

function setData(data, formType, caller) {
  if (formType == "pInfo") {
    $("#OrderName").val(data.OrderName);
    $("#orderContactNum").val(data.orderContactNum);
    $("#orderContactMail").val(data.orderContactMail);
    $("#orderQuantity").val(data.orderQuantity);
  }
  if (caller == "view") {
    if (formType == "flyer") {
      $("label[for='paperType']").html("Selected paper type");
      $("label[for='paperSize']").html("Selected paper size");
      $("#orderDesignServiceText").html("Design Service");
    }
    if (formType == "hard") {
      $("label[for='hardMaterial']").html("Choosen Material");
      $("label[for='hardColor']").html("Choosen color");
      $("#fileAddInfo").hide();
    }
    if (formType == "bcard") {
      $("label[for='orderQuantity']").append(" (boxes) 100 pieces/box");
      $("#orderDesignServiceText").html("Design Service");
    }
    if (formType == "bunting") {
      $("#orderDesignServiceText").html("Design Service");
      $("label[for='orderFinishType']").append("Finish choosen");
      $("label[for='orderSizeHeight']").append("Height (Foot)");
      $("label[for='orderSizeWidth']").append("Width (Foot)");
    }
  }
  //caller if edit update status field

  if (formType == "flyer") {
    $("#orderPaperType").val(data.orderPaperType);
    $("#orderPaperSize").val(data.orderPaperSize);
  }
  if (formType == "hard") {
    bindHardEvent(data.hardMaterial);
    $("#hardMaterial").val(data.hardMaterial);
    $("#hardColor").val(data.hardColor);
  }
  if (formType == "bunting") {
    $("#orderFinishType").val(data.orderFinishType);
    $("#orderSizeHeight").val(data.orderSizeHeight);
    $("#orderSizeWidth").val(data.orderSizeWidth);
  }
  if (formType == "bunting" || formType == "bcard" || formType == "flyer") {
    if (data.orderDesignService == "on") {
      $("#orderDesignService").prop("checked", true);
    }
    if (data.orderDoubleSide == "on") {
      $("#orderDoubleSide").prop("checked", true);
    }
  }
  if (formType == "oStats") {
    $("#orderStatus").val(data.orderStatus);
    $("#deisgnServiceStatus").val(data.deisgnServiceStatus);
    $("#orderDate").val(toIsoString(data.orderDate.toDate()));
    $("#orderEstPrice").val(data.orderEstPrice);
    $("#paymentstat").val(data.paymentstat);
    if (data.problem == "") {
      $("#problem").val("No problems");
    } else {
      $("#problem").val(data.problem);
    }
  }
}

function bindHardEvent(materialGot) {
  $("#hardColor").empty();
  $("#hardColor").append(
    `<option disabled selected value="">Choose color...</option>`
  );
  if (materialGot == "buckram") {
    var optionsColor = { 550: "Blue", 557: "Green", 567: "Maroon" };
    var hashColor = ["#363490", "#0d693f", "#ac252c"];
  }
  if (materialGot == "arcylic") {
    var optionsColor = { 2624: "Maroon", 2633: "Black", 2622: "Dark blue" };
    var hashColor = ["#261f63", "#ac252c", "#000000"];
  }
  var hashColorIndex = 0;
  $.each(optionsColor, function (key, text) {
    $("#hardColor").append(
      $("<option>", { value: key }).text(text).css({
        "background-color": hashColor[hashColorIndex],
        color: "white",
      })
    );
    hashColorIndex++;
  });
}

function toIsoString(date) {
  var pad = function (num) {
    var norm = Math.floor(Math.abs(num));
    return (norm < 10 ? "0" : "") + norm;
  };

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

async function getOrder(oid) {
  var fireDB = initFireDb();
  var orderDoc = oid;
  var docLoc = fireDB.collection("order").doc(orderDoc);
  try {
    var orderDoc = await docLoc.get();
    if (orderDoc.exists) {
      return orderDoc.data();
    } else {
      console.error("order not exists");
    }
  } catch (error) {
    console.error("got error: " + error);
  }
}

export {
  mediumDiaglog,
  bindHardEvent,
  hideDialogCloseBut,
  initFire,
  initFireDb,
  showDialogCloseBut,
  loadForm,
};
