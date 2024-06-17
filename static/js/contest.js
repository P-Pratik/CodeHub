
function getUpcomingContest() {
    fetch("/api/contest/upcoming")
        .then((response) => response.json())
        .then((data) => {
            console.log("Upcoming Contests:", data);
            
            if (data.gfgcontest && Array.isArray(data.gfgcontest)) {
                renderGFGContests(data.gfgcontest);
            }
            
            if (data.lccontest && Array.isArray(data.lccontest)) {
                renderLeetContests(data.lccontest);
            }
        })
        .catch((error) => {
            console.error('Error fetching upcoming contests:', error);
            document.querySelector(".upcoming-contest").innerHTML = `Error fetching upcoming contests: ${error.message}`;
        });
}

function getPastContest(data = {}) {
    const page = document.getElementById("page").innerText;
    fetch("/api/contest/past/" + page, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            // renderPastContest(data);
        })
        .catch((error) => {
            console.error('Error fetching past contests:', error);
        });
}


function calculateTimeDiff(endTime) {
    const now = new Date().getTime();
    const timeRemaining = endTime - now;

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, timeRemaining };
}


function updateTimer() {
    const contestType = 'gfgcontest'; // Assuming you determine contestType somewhere

    if (contestType === 'gfgcontest') {
        const timers = document.querySelectorAll(".timer");
        timers.forEach(timer => {
            const endTime = new Date(timer.dataset.endTime).getTime();
            const timeDiff = calculateTimeDiff(endTime);

            if (timeDiff.timeRemaining > 0) {
                timer.querySelector("#days").innerText = timeDiff.days;
                timer.querySelector("#hours").innerText = timeDiff.hours;
                timer.querySelector("#mins").innerText = timeDiff.minutes;
                timer.querySelector("#secs").innerText = timeDiff.seconds;
            }
        });
    } else if (contestType === 'leetcode') {
        const timers = document.querySelectorAll(".timer");
        timers.forEach(timer => {
            const endTime = new Date(timer.dataset.endTime).getTime();
            const timeDiff = calculateTimeDiff(endTime);

            if (timeDiff.timeRemaining > 0) {
                timer.querySelector("#days").innerText = timeDiff.days;
                timer.querySelector("#hours").innerText = timeDiff.hours;
                timer.querySelector("#mins").innerText = timeDiff.minutes;
                timer.querySelector("#secs").innerText = timeDiff.seconds;
            }
        });
    }
}


function createContestCard(contestName, contestType, bannerUrl, contestLink, timeDiff, endTime) {
    let contestCard = document.createElement("div");
    contestCard.className = "card-wrapper";
    contestCard.innerHTML = `
        <div class="card-body">
            <div class="upcoming-contest card-wrapper">
                <div class="card-title">
                    <h2>${contestName}</h2>
                    <div class="timer" id="gfg-timer" data-end-time="${endTime}">
                        <span id="days" class="timer-box">${timeDiff.days}</span>
                        <span class="timer-colon">:</span>
                        <span id="hours" class="timer-box">${timeDiff.hours}</span>
                        <span class="timer-colon">:</span>
                        <span id="mins" class="timer-box">${timeDiff.minutes}</span>
                        <span class="timer-colon">:</span>
                        <span id="secs" class="timer-box">${timeDiff.seconds}</span>
                    </div>
                </div>
                <div class="upcoming-contest-container card" id="upcoming-contest-container" style="background-image: url('${bannerUrl}')">
                    <div class="button-wrapper">
                        <div class="participateButton-container">
                            <a href="${contestLink}" target="_blank">Participate</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    return contestCard;
}


function renderGFGContests(gfgContests) {
    let contestList = document.querySelector(".upcoming-contest");
    contestList.innerHTML = "";

    gfgContests.forEach((contest) => {
        try {
            let bannerUrl = contest.banner.desktop_url;
            let contestLink = `https://practice.geeksforgeeks.org/contest/${contest.slug}`;
            let endTime = new Date(contest.start_time).getTime(); // Assuming `start_time` is in the format YYYY-MM-DDTHH:MM:SSZ
            let timeDiff = calculateTimeDiff(endTime);
            let contestCard = createContestCard(contest.name, "GFG Contest", bannerUrl, contestLink, timeDiff, contest.start_time);
            contestList.appendChild(contestCard);
        } catch (error) {
            console.error('Error rendering GFG contest:', error);
            contestList.innerHTML += `<div class="error">Error rendering GFG contest: ${JSON.stringify(contest)}</div>`;
        }
    });

    setInterval(updateTimer, 1000);
}

function renderLeetContests(leetContests) {
    let contestList = document.querySelector(".upcoming-contest");

    leetContests.forEach((contest) => {
        try {
            let startTimeEpoch = contest.start_time;
            let endTimeEpoch = startTimeEpoch + contest.duration;
            let startTime = new Date(startTimeEpoch * 1000);
            let endTime = new Date(endTimeEpoch * 1000);
            let timeDiff = calculateTimeDiff(endTime.getTime()); 
            let contestLink = contest.url;

            let bannerUrl = "";
            let contestTitle = contest.title;

            let words = contestTitle.split(" ");

            if (words[0] === "Biweekly") {
                bannerUrl = "/static/svg/leet-biweekly.png";
            } else if(words[0] === "Weekly") {
                bannerUrl = "/static/svg/leet-weekly.png";
            }else{
                bannerUrl = "";
            }

            let contestCard = createContestCard(contest.title, "LeetCode Contest", bannerUrl, contestLink, timeDiff, endTime);
            contestList.appendChild(contestCard);
        } catch (error) {
            console.error('Error rendering LeetCode contest:', error);
            contestList.innerHTML += `<div class="error">Error rendering LeetCode contest: ${JSON.stringify(contest)}</div>`;
        }
    });

    setInterval(updateTimer, 1000);
}

function renderPastContest(data) {
}

function prevPage() {
    let page = document.getElementById("page").innerText;
    if (page > 1) {
        page--;
        document.getElementById("page").innerText = page;
        applyfilter();
    }
}

function nextPage() {
    let page = document.getElementById("page").innerText;
    page++;
    document.getElementById("page").innerText = page;
    applyfilter();
}

function applyfilter() {
    const platform = document.getElementById("platform").value;

    const data = {
        platform: platform,
    };
    getPastContest(data);
}

let filterButton = document.getElementById("applyFilter");
filterButton.addEventListener("click", {
    handleEvent: function () {
        document.getElementById("page").innerText = "1";
        applyfilter();
    },
});

getUpcomingContest();
applyfilter();
