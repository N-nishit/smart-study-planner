const studyTimeElement =
    document.querySelector("#progress-study-time");

const completedSessionsElement =
    document.querySelector("#progress-completed-sessions");

const productivityElement =
    document.querySelector("#progress-productivity");

const studyMinutes =
    parseInt(
        localStorage.getItem("studyMinutes")
    ) || 0;

const completedSessions =
    parseInt(
        localStorage.getItem("completedSessions")
    ) || 0;

const hours =
    Math.floor(studyMinutes / 60);

const minutes =
    studyMinutes % 60;

if(studyTimeElement){

    studyTimeElement.textContent =
        `${hours}h ${minutes}m`;

}

if(completedSessionsElement){

    completedSessionsElement.textContent =
        completedSessions;

}

/* Productivity */

const totalTasks =
    parseInt(
        localStorage.getItem("totalTasks")
    ) || 0;

const completedTasks =
    parseInt(
        localStorage.getItem("completedTasks")
    ) || 0;

let productivity = 0;

if(totalTasks > 0){

    productivity =
        Math.round(
            (completedTasks / totalTasks) * 100
        );

}

if(productivityElement){

    productivityElement.textContent =
        `${productivity}%`;

}

/* =========================
   WEEKLY STUDY CHART
========================= */

const weeklyChart =
    document.querySelector("#weeklyStudyChart");

if(weeklyChart){

    new Chart(weeklyChart, {

        type: "bar",

        data: {

            labels: [
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun"
            ],

            datasets: [{

                label: "Study Hours",

                data: [
                    2,
                    3,
                    2.5,
                    4,
                    2,
                    1.5,
                    0.5
                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

/* =========================
   SUBJECT PIE CHART
========================= */

const subjectChart =
    document.querySelector("#subjectChart");

const subjectStats =
    JSON.parse(
        localStorage.getItem("subjectStats")
    ) || {

        Maths: 120,
        Python: 90,
        Chemistry: 60,
        English: 30

    };

if(subjectChart){

    new Chart(subjectChart, {

        type: "pie",

        data: {

            labels:
                Object.keys(subjectStats),

            datasets: [{

                data:
                    Object.values(subjectStats)

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

/* =========================
   TOP SUBJECTS
========================= */

const topSubjectsList =
    document.querySelector(
        "#top-subjects-list"
    );

if(topSubjectsList){

    topSubjectsList.innerHTML = "";

    const sortedSubjects =

        Object.entries(subjectStats)

        .sort(
            (a, b) => b[1] - a[1]
        )

        .slice(0, 5);

    sortedSubjects.forEach(subject => {

        const li =
            document.createElement("li");

        const hours =
            Math.floor(subject[1] / 60);

        const mins =
            subject[1] % 60;

        li.textContent =

            `${subject[0]} - ${hours}h ${mins}m`;

        topSubjectsList.appendChild(li);

    });

}