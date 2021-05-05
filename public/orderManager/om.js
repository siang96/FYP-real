import { initSession, signOut } from "../sessionManager.js";
import { initFire, intitDatatables } from "../sharedFunction.js";

$(document).ready(function () {
    initFire();
    initSession();
    intitDatatables();
    main();
});

function main() {
    $("#logoutButton").click(function (e) { 
        e.preventDefault();
        signOut();
    });
}