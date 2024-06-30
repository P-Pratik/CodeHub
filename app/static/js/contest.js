let gfgIndex = 0;
let leetIndex = 0;
let gfgContests = [];
let leetContests = [];

function getUpcomingContest() {
    fetch("/api/contest/upcoming")
        .then((response) => response.json())
        .then((data) => {
            console.log("Upcoming Contests:", data);
            
            if (data.gfgcontest && Array.isArray(data.gfgcontest)) {
                gfgContests = data.gfgcontest;
                renderGFGContests();
            }
            
            if (data.lccontest && Array.isArray(data.lccontest)) {
                leetContests = data.lccontest;
                renderLeetContests();
            }
        })
        .catch((error) => {
            console.error('Error fetching upcoming contests:', error);
            document.querySelector(".upcoming-contest").innerHTML = `Error fetching upcoming contests: ${error.message}`;
        });
}

function getPastContest(data = {}) {
    const page = parseInt(document.getElementById("page").innerText, 10);
    fetch(`/api/contest/past/${page}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((data) => {
        console.log("Past Contests:", data);
        renderPast(data);
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
    const contestType = 'gfgcontest';

    if (contestType === 'gfgcontest') {
        const timers = document.querySelectorAll(".contest-timer");
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
                    <div class="contest-timer" id="gfg-contest-timer" data-end-time="${endTime}">
                        <span id="days" class="contest-timer-box">${timeDiff.days}</span>
                        <span class="contest-timer-colon">:</span>
                        <span id="hours" class="contest-timer-box">${timeDiff.hours}</span>
                        <span class="contest-timer-colon">:</span>
                        <span id="mins" class="contest-timer-box">${timeDiff.minutes}</span>
                        <span class="contest-timer-colon">:</span>
                        <span id="secs" class="contest-timer-box">${timeDiff.seconds}</span>
                    </div>
                </div>
                <div class="upcoming-contest-container card" id="upcoming-contest-container" style="background-image: url('${bannerUrl}')">
                    <div class="participateButton-container">
                        <a href="${contestLink}" target="_blank">Participate</a>
                    </div>
                    <div class="button-wrapper"></div>
                </div>
            </div>
        </div>
    `;
    return contestCard;
}

function createGFGIndicators() {
    const indicatorContainer = document.createElement("div");
    indicatorContainer.className = "indicator-container";

    gfgContests.forEach((_, index) => {
        const indicator = document.createElement("button");
        indicator.className = "carousel-indicator";
        indicator.dataset.index = index;
        if (index === gfgIndex) {
            indicator.classList.add("active");
        }
        indicator.addEventListener("click", () => {
            gfgIndex = index;
            renderGFGContests();
        });
        indicatorContainer.appendChild(indicator);
    });

    const buttonWrapper = document.querySelector(".gfg-contests .button-wrapper");
    buttonWrapper.innerHTML = "";
    buttonWrapper.appendChild(indicatorContainer);
}

function createLeetIndicators() {
    const indicatorContainer = document.createElement("div");
    indicatorContainer.className = "indicator-container";

    leetContests.forEach((_, index) => {
        const indicator = document.createElement("button");
        indicator.className = "carousel-indicator";
        indicator.dataset.index = index;
        if (index === leetIndex) {
            indicator.classList.add("active");
        }
        indicator.addEventListener("click", () => {
            leetIndex = index;
            renderLeetContests();
        });
        indicatorContainer.appendChild(indicator);
    });

    const buttonWrapper = document.querySelector(".leet-contests .button-wrapper");
    buttonWrapper.innerHTML = "";
    buttonWrapper.appendChild(indicatorContainer);
}

function renderGFGContests() {
    let contestList = document.querySelector(".gfg-contests");
    contestList.innerHTML = "";
    
    const prevButton = document.getElementById("gfg-prev");
    const nextButton = document.getElementById("gfg-next");
    const prevButtonUnder = document.getElementById("gfg-prev-under");
    const nextButtonUnder = document.getElementById("gfg-next-under");
    
    if (gfgContests.length > 0) {
        let contest = gfgContests[gfgIndex];
        let bannerUrl = contest.banner.desktop_url;
        let contestLink = `https://practice.geeksforgeeks.org/contest/${contest.slug}`;
        let endTime = new Date(contest.start_time).getTime();
        let timeDiff = calculateTimeDiff(endTime);
        let contestCard = createContestCard(contest.name, "GFG Contest", bannerUrl, contestLink, timeDiff, contest.start_time);
        contestList.appendChild(contestCard);
        
        prevButton.classList.remove("hide-carousel-buttons");
        nextButton.classList.remove("hide-carousel-buttons");
        prevButtonUnder.classList.remove("hide-carousel-buttons");
        nextButtonUnder.classList.remove("hide-carousel-buttons");

        createGFGIndicators(); // Call to create indicators
    } else {
        contestList.innerHTML = `<div class="no-contest"><h4 style='font-weight: 500;'>No upcoming GeeksforGeeks contests available.</h4></div>`;
        prevButton.classList.add("hide-carousel-buttons");
        nextButton.classList.add("hide-carousel-buttons");
        prevButtonUnder.classList.add("hide-carousel-buttons");
        nextButtonUnder.classList.add("hide-carousel-buttons");
    }
    setInterval(updateTimer, 1000);
}

function renderLeetContests() {
    let contestList = document.querySelector(".leet-contests");
    contestList.innerHTML = "";
    
    const prevButton = document.getElementById("leet-prev");
    const nextButton = document.getElementById("leet-next");
    const prevButtonUnder = document.getElementById("leet-prev-under");
    const nextButtonUnder = document.getElementById("leet-next-under");
    
    if (leetContests.length > 0) {
        let contest = leetContests[leetIndex];
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
            bannerUrl = "/static/images/leet-biweekly.png";
        } else if (words[0] === "Weekly") {
            bannerUrl = "/static/images/leet-weekly.png";
        }

        let contestCard = createContestCard(contest.title, "LeetCode Contest", bannerUrl, contestLink, timeDiff, endTime);
        contestList.appendChild(contestCard);
        
        prevButton.classList.remove("hide-carousel-buttons");
        nextButton.classList.remove("hide-carousel-buttons");
        prevButtonUnder.classList.remove("hide-carousel-buttons");
        nextButtonUnder.classList.remove("hide-carousel-buttons");

        createLeetIndicators(); // Call to create indicators
    } else {
        contestList.innerHTML = "<h4 style='font-weight: 500;'>No upcoming LeetCode contests available.</h4>";
        prevButton.classList.add("hide-carousel-buttons");
        nextButton.classList.add("hide-carousel-buttons");
        prevButtonUnder.classList.add("hide-carousel-buttons");
        nextButtonUnder.classList.add("hide-carousel-buttons");
    }
    setInterval(updateTimer, 1000);
}

function renderPast(data) {
    let contestContainer = document.getElementById("past-contest-container");
    contestContainer.innerHTML = "";
    
    data.forEach(contest => {
        if (contest.platform === "geeksforgeeks") {
            renderPastContest(contest, contestContainer, "gfg");
        } else if (contest.platform === "leetcode") {
            renderPastContest(contest, contestContainer, "leetcode");
        }
    });
}

function renderPastContest(contest, contestContainer, platform) {
    try {
        let bannerUrl = "";
        if (platform === "gfg") {
            bannerUrl = contest.banner.desktop_url;
        } else if (platform === "leetcode") {
            if (contest.banner === "leetcode-weekly") {
                bannerUrl = "/static/images/leet-weekly.png";
            } else if (contest.banner === "leetcode-biweekly") {
                bannerUrl = "/static/images/leet-biweekly.png";
            } else {
                bannerUrl = `/static/images/${contest.banner}.png`;
            }
        }

        let contestElement = document.createElement("div");
        contestElement.innerHTML = `
        <div class="past-contest">
            <a href="${contest.url}" target="_blank" referrerpolicy="no-referrer">
                <div class="past-banner">
                    <img src="${bannerUrl}" alt="Contest Banner" height="80px" width="160px"/>
                </div>
                <div class="past-title">${contest.title}</div>
                <div class="past-information">
                    <div class="past-date-time">
                        ${new Date(contest.start_time * 1000).toLocaleDateString('en-GB')}, 
                        ${new Date(contest.start_time * 1000).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </div>
                </div>
            </a>
        </div>
    `;
    contestContainer.appendChild(contestElement);
    
    } catch (error) {
        console.error(`Error rendering ${platform === "gfg" ? "GFG" : "LeetCode"} past contest:`, error);
    }
}

function prevPage() {
    let page = parseInt(document.getElementById("page").innerText, 10);
    if (page > 1) {
        page--;
        document.getElementById("page").innerText = page;
        applyFilter();
    }
}

function nextPage() {
    let page = parseInt(document.getElementById("page").innerText, 10);
    page++;
    document.getElementById("page").innerText = page;
    applyFilter();
}

function applyFilter() {
    const platform = document.getElementById("platform").value;
    const data = { platform };

    document.getElementById("page").innerText = "1";
    getPastContest(data);
}

let filterButton = document.getElementById("applyFilter");
filterButton.addEventListener("click", function() {
    applyFilter();
});

function nextGFGContest() {
    gfgIndex = (gfgIndex + 1) % gfgContests.length;
    renderGFGContests();
}

function prevGFGContest() {
    gfgIndex = (gfgIndex - 1 + gfgContests.length) % gfgContests.length;
    renderGFGContests();
}

function nextLeetContest() {
    leetIndex = (leetIndex + 1) % leetContests.length;
    renderLeetContests();
}

function prevLeetContest() {
    leetIndex = (leetIndex - 1 + leetContests.length) % leetContests.length;
    renderLeetContests();
}

document.querySelector('.gfg-contests').addEventListener('click', nextGFGContest);
document.querySelector('.leet-contests').addEventListener('click', nextLeetContest);

document.addEventListener("DOMContentLoaded", function () {
    getUpcomingContest();
    getPastContest();
});
