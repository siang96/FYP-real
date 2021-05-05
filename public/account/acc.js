import { initSession, signOut } from "../sessionManager.js";
import { initFire } from "../sharedFunction.js";

$(document).ready(function () {
    initFire();
    initSession();
    main();
});

function main() {
    $("#logoutButton").click(function (e) { 
        e.preventDefault();
        signOut();
    });
}