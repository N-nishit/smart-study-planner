const menuBtn = document.querySelector(".menu-btn");
const sidebar = document.querySelector("#sidebar");

let isOpen = false;

menuBtn.addEventListener("click", () => {

    if(isOpen){
        sidebar.style.left = "-300px";
        isOpen = false;
    }

    else{
        sidebar.style.left = "0px";
        isOpen = true;
    }

});