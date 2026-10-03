const menuBtn = document.querySelector(".menu-btn");
const sidebar = document.querySelector("#sidebar");

let isOpen = false;

let totalStudyMinutes =

    parseInt(
        localStorage.getItem("studyMinutes")
    ) || 0;
let completedSessions =

    parseInt(
        localStorage.getItem("completedSessions")
    ) || 0;
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
let subjects = [];
const addSubjectBtn =
    document.querySelector("#add-subject-btn");

const subjectName =
    document.querySelector("#subject-name");

const priority =
    document.querySelector("#priority");

if(addSubjectBtn){
addSubjectBtn.addEventListener("click", () => {

    if(subjectName.value.trim() === ""){
    return;
    }

    const subject = {

        name: subjectName.value,

        priority: parseInt(priority.value),

        active: true

    };

    subjects.push(subject);
    fetch("/save-subject", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            subject: subject.name,

            priority: subject.priority,

            active: 1

        })

});
    const subjectItem =
        document.createElement("div");

    subjectItem.classList.add("subject-item");

    subjectItem.innerHTML = `

        <span>
            ${subject.name}
            -
            Priority ${subject.priority}
        </span>

        <div class="subject-actions">

            <button class="toggle-btn">
                ON
            </button>

            <button class="delete-subject-btn">
                Delete
            </button>

        </div>

    `;
    subjectList.appendChild(subjectItem);

    console.log(subjects);

    subjectName.value = "";

});
}
const subjectList =
    document.querySelector("#subject-list");
const generateBtn =
    document.querySelector("#generate-btn");

const studyHours =
    document.querySelector("#study-hours");

const scheduleOutput =
    document.querySelector("#schedule-output");

if(addSubjectBtn){
generateBtn.addEventListener("click", () => {

    scheduleOutput.innerHTML = "";
    fetch("/save-settings", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            study_hours: studyHours.value,

            start_time: startTime.value,

            end_time: endTime.value,

            break_time: breakTime.value

        })

    });
    const [startHour, startMinute] =
        startTime.value.split(":").map(Number);

        let currentHour = startHour;
        let currentMinute = startMinute;

        const breakMinutes =
            parseInt(breakTime.value);
    const [endHourLimit, endMinuteLimit] =
        endTime.value.split(":").map(Number);

    const availableMinutes =

        ((endHourLimit * 60 + endMinuteLimit)
        -
        (startHour * 60 + startMinute));

    const activeSubjects =

        subjects.filter(subject => subject.active);

    let totalPriority = 0;

    activeSubjects.forEach(subject => {

        totalPriority += subject.priority;

    });

    let totalStudyMinutes =
        parseInt(studyHours.value) * 60;

    if(totalStudyMinutes > availableMinutes){

        totalStudyMinutes = availableMinutes;

    }


    activeSubjects.forEach((subject, index) => {

        const subjectMinutes =
            (subject.priority / totalPriority)
            * totalStudyMinutes;

        const scheduleItem =
            document.createElement("div");

        scheduleItem.classList.add("schedule-item");

        const endTotalMinutes =
            (currentHour * 60 + currentMinute)
            + Math.round(subjectMinutes);

        const endHour =
            Math.floor(endTotalMinutes / 60);

        const endMinute =
            endTotalMinutes % 60;

        scheduleItem.innerHTML = `

            <span>

                ${formatTime(currentHour, currentMinute)}
                -
                ${formatTime(endHour, endMinute)}
                →
                ${subject.name}

            </span>

            <button class="session-done-btn">

                Done

            </button>

        `;
        scheduleItem.dataset.minutes =
            Math.round(subjectMinutes);

        scheduleOutput.appendChild(scheduleItem);
        const doneBtn =
            scheduleItem.querySelector(".session-done-btn");

        doneBtn.addEventListener("click", () => {
            
            const minutes =
                parseInt(scheduleItem.dataset.minutes);

            totalStudyMinutes += minutes;

            completedSessions++;

            localStorage.setItem(
                "completedSessions",
                completedSessions
            );

            localStorage.setItem(
                "studyMinutes",
                totalStudyMinutes
            );

            console.log(
                "Study Minutes:",
                totalStudyMinutes
            );

            if(scheduleItem.dataset.completed){
                return;
            }

            scheduleItem.dataset.completed = true;

            scheduleItem.style.background = "#d4edda";

            scheduleItem.style.borderLeft =
                "6px solid #28a745";

            doneBtn.textContent = "Completed";

            doneBtn.disabled = true;

        });

        currentHour = endHour;
        currentMinute = endMinute;
        if(index !== activeSubjects.length - 1){
            const breakEndTotalMinutes =

                (currentHour * 60 + currentMinute)
                + breakMinutes;

            const breakEndHour =
                Math.floor(breakEndTotalMinutes / 60);

            const breakEndMinute =
                breakEndTotalMinutes % 60;

            const breakItem =
                document.createElement("div");

            breakItem.classList.add("break-item");

            breakItem.textContent =

                `${formatTime(currentHour, currentMinute)}
                -
                 ${formatTime(breakEndHour, breakEndMinute)}
                 → Break`;

            scheduleOutput.appendChild(breakItem);

            currentHour = breakEndHour;
            currentMinute = breakEndMinute;
        }
    });

});
}
const startTime =
    document.querySelector("#start-time");

const endTime =
    document.querySelector("#end-time");

const breakTime =
    document.querySelector("#break-time");

function formatTime(hours, minutes){

    let period = "AM";

    if(hours >= 12){
        period = "PM";
    }

    if(hours > 12){
        hours -= 12;
    }

    if(hours === 0){
        hours = 12;
    }

    minutes = minutes
        .toString()
        .padStart(2, "0");

    return `${hours}:${minutes} ${period}`;
}
const clearBtn =
    document.querySelector("#clear-btn");
if(addSubjectBtn){
clearBtn.addEventListener("click", () => {

    fetch("/clear-subjects")

        .then(() => {

            subjects = [];

            subjectList.innerHTML = "";

            scheduleOutput.innerHTML = `
                <p>No schedule generated yet.</p>
            `;

        });

});
}
if(subjectList){
fetch("/get-subjects")

    .then(response => response.json())

    .then(data => {

        data.subjects.forEach(item => {

            const subject = {

                name: item[1],

                priority: item[2],
                active: item[3]
            };

            subjects.push(subject);

            const subjectItem =
                document.createElement("div");

            subjectItem.classList.add("subject-item");

            subjectItem.innerHTML = `

                <span>
                    ${subject.name}
                    -
                    Priority ${subject.priority}
                </span>

                <div class="subject-actions">

                    <button class="toggle-btn">
                        ${subject.active ? "ON" : "OFF"}
                    </button>

                    <button class="delete-subject-btn">
                        Delete
                    </button>

                </div>

            `;

            subjectList.appendChild(subjectItem);
            const toggleBtn =
                subjectItem.querySelector(".toggle-btn");

            toggleBtn.addEventListener("click", () => {

                subject.active = !subject.active;

                toggleBtn.textContent =
                    subject.active ? "ON" : "OFF";

                fetch("/toggle-subject", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        subject: subject.name,

                        active: subject.active ? 1 : 0

                    })

                });


            });
            const deleteBtn =
                subjectItem.querySelector(".delete-subject-btn");

            deleteBtn.addEventListener("click", () => {

                fetch("/delete-subject", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        subject: subject.name

                    })

                });

                subjects = subjects.filter(

                    item => item.name !== subject.name

                );

                subjectItem.remove();

            });
        });

    });
}
if(subjectList){
fetch("/get-settings")

    .then(response => response.json())

    .then(data => {

        const settings = data.settings;

        if(settings){

            studyHours.value = settings[1];

            startTime.value = settings[2];

            endTime.value = settings[3];

            breakTime.value = settings[4];

        }

    });
}
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