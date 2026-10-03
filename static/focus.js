const minutesDisplay =
    document.querySelector("#minutes");

const secondsDisplay =
    document.querySelector("#seconds");

const startBtn =
    document.querySelector("#start-btn");


const pauseBtn =
    document.querySelector("#pause-btn");

const resetBtn =
    document.querySelector("#reset-btn");

const customMinutes =
    document.querySelector("#custom-minutes");

const setTimerBtn =
    document.querySelector("#set-timer-btn");

let timer;

let focusLength = 25;

let totalSeconds = focusLength * 60;

function updateTimerDisplay(){

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    minutesDisplay.textContent =
        String(minutes).padStart(2, "0");

    secondsDisplay.textContent =
        String(seconds).padStart(2, "0");
}
if(setTimerBtn){
startBtn.addEventListener("click", () => {

    if(timer){
        return;
    }

    timer = setInterval(() => {

        if(totalSeconds <= 0){

            clearInterval(timer);

            timer = null;

            alert("Focus session complete!");

            return;
        }

        totalSeconds--;

        updateTimerDisplay();

    }, 1000);

});
pauseBtn.addEventListener("click", () => {

    clearInterval(timer);

    timer = null;

});
resetBtn.addEventListener("click", () => {

    clearInterval(timer);

    timer = null;

    totalSeconds = 25 * 60;

    updateTimerDisplay();

});
setTimerBtn.addEventListener("click", () => {

    const minutes =
        parseInt(customMinutes.value);

    if(!minutes || minutes <= 0){
        return;
    }

    focusLength = minutes;

    totalSeconds = minutes * 60;

    updateTimerDisplay();

});
}
if(minutesDisplay && secondsDisplay){

    updateTimerDisplay();

}