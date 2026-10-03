const studyTimeCard =
    document.querySelector("#study-time-card");
if(studyTimeCard){

    const minutes =

        parseInt(
            localStorage.getItem("studyMinutes")
        ) || 0;

    const hours =
        Math.floor(minutes / 60);

    const remainingMinutes =
        minutes % 60;

    studyTimeCard.textContent =

        `${hours}h ${remainingMinutes}m`;

}  
const plannerStudyTime =
    document.querySelector("#planner-study-time");

const completedSessionsElement =
    document.querySelector("#completed-sessions");

if(plannerStudyTime){

    const minutes =

        parseInt(
            localStorage.getItem("studyMinutes")
        ) || 0;

    const hours =
        Math.floor(minutes / 60);

    const remainingMinutes =
        minutes % 60;

    plannerStudyTime.textContent =

        `${hours}h ${remainingMinutes}m`;

}

if(completedSessionsElement){

    completedSessionsElement.textContent =

        localStorage.getItem(
            "completedSessions"
        ) || 0;

}
const todaySchedule =
    document.querySelector("#today-schedule");

if(todaySchedule){

    const savedSchedule =
        localStorage.getItem(
            "todaySchedule"
        );

    if(savedSchedule){

        todaySchedule.innerHTML =
            savedSchedule;

    }

}