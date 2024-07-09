
function renderDaily(data) {
    const gfgContainer = document.querySelector("#gfg-daily-content");
    const leetcodeContainer = document.querySelector("#leetcode-daily-content");

    // Clear previous content
    gfgContainer.innerHTML = "";
    leetcodeContainer.innerHTML = "";

    function truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    }

    // Create GeeksForGeeks daily challenge
    const gfgDailyDiv = document.createElement("div");
    gfgDailyDiv.classList.add("daily-problem");

    const gfgTitle = document.createElement("h3");
    gfgTitle.textContent = truncateText(data.geeksdaily.problem_name, 30);

    const gfgButton = document.createElement("div");
    gfgButton.classList.add("daily-button-container");

    const gfgAnchorTag = document.createElement("a");
    gfgAnchorTag.href = data.geeksdaily.problem_url;
    gfgAnchorTag.textContent = "Solve";
    
    gfgButton.appendChild(gfgAnchorTag);

    const gfgCompanyTagsDiv = document.querySelector("#gfg-tags #company");
    const gfgTopicTagsDiv = document.querySelector("#gfg-tags #topic");

    gfgCompanyTagsDiv.innerHTML = "";
    gfgTopicTagsDiv.innerHTML = "";

    const gfgcompanyTags = data.geeksdaily.tags.company_tags;
    const gfgtopicTags = data.geeksdaily.tags.topic_tags;
    const maxTagsToShow = 2;
    

    function createTags(tags, parentDiv, label) {
        if (tags && tags.length > 0) {
            const tagsToShow = tags.slice(0, maxTagsToShow);
            const remainingTagsCount = tags.length - maxTagsToShow;
    
            tagsToShow.forEach(tag => {
                const tagSpan = document.createElement("span");
                tagSpan.classList.add("tag");
                tagSpan.classList.add(label === "Company Tags" ? "company" : "topic");
                tagSpan.textContent = tag;
                parentDiv.appendChild(tagSpan);
                parentDiv.classList.add("tagList");
            });
    
            if (remainingTagsCount > 0) {
                const moreSpan = document.createElement("span");
                moreSpan.classList.add("tag");
                moreSpan.textContent = `+${remainingTagsCount} more`;
    
                const toolTipContainer = document.createElement("div");
                toolTipContainer.classList.add("tooltip");
                if (label === "Company Tags") {
                    moreSpan.classList.add("company-more");
                    toolTipContainer.classList.add("company-tooltip");
                } else {
                    moreSpan.classList.add("topic-more");
                    if (parentDiv === gfgTopicTagsDiv){
                        toolTipContainer.classList.add("gfg");
                    }
                }
    
                const remainingTags = tags.slice(maxTagsToShow, tags.length);
                const remainingTagsList = document.createElement("ul");
                remainingTags.forEach(tag => {
                    const tagItem = document.createElement("li");
                    tagItem.textContent = tag;
                    remainingTagsList.appendChild(tagItem);
                });
    
                toolTipContainer.appendChild(remainingTagsList);
                moreSpan.classList.add("moreTag");
    
                parentDiv.appendChild(moreSpan);
                parentDiv.appendChild(toolTipContainer);
    
                function positionToolTip() {
                    const moreSpanHeight = moreSpan.offsetHeight;
                    const moreSpanLeft = moreSpan.offsetLeft;
                
                    if (toolTipContainer.classList.contains("gfg")) {
                        const topPosition = moreSpanHeight * 2.5; // Adjusted top position for gfgTopicTags
                        toolTipContainer.style.top = topPosition + "px";
                        toolTipContainer.style.left = "50%";
                    } else {
                        const topPosition = moreSpanHeight + 10;
                        toolTipContainer.style.top = topPosition + "px";
                    }
                
                    toolTipContainer.style.bottom = "auto";
                    toolTipContainer.style.left = (moreSpanLeft - 30) + "px";
                }
                
    
                moreSpan.addEventListener("click", () => {
                    positionToolTip();
    
                    toolTipContainer.style.display = toolTipContainer.style.display === "block" ? "none" : "block";
                });
    
                document.addEventListener("click", (event) => {
                    if (!toolTipContainer.contains(event.target) && !moreSpan.contains(event.target)) {
                        toolTipContainer.style.display = "none";
                    }
                });
    
                positionToolTip();
            }
        }
    }

    createTags(gfgcompanyTags, gfgCompanyTagsDiv, "Company Tags");
    createTags(gfgtopicTags, gfgTopicTagsDiv, "Topic Tags");

    function createStats(diffStat, accStat, subStat, id) {
        const statsDiv = document.querySelector(id);
        statsDiv.innerText = "";
        
        let formattedSubStat = subStat;
        if(id === "#gfg-stats"){
            accStat += '%';
            const subStatNum = parseInt(subStat);
        
            if (subStatNum >= 1000000) {
                formattedSubStat = (subStatNum / 1000000).toFixed(1) + "M";
            } else if (subStatNum >= 1000) {
                formattedSubStat = (subStatNum / 1000).toFixed(1) + "K";
            } else {
                formattedSubStat = subStat;
            }
        }

        if (diffStat === "Medium"){
            diffStat = "Med";
        }
    
        statsDiv.innerText = `${diffStat} | ${accStat} | ${formattedSubStat}`;
    }
    
    const gfgDiffStat = data.geeksdaily.difficulty;
    const gfgAccStat = data.geeksdaily.accuracy;
    const gfgSubStat = data.geeksdaily.total_submissions;
    
    createStats(gfgDiffStat, gfgAccStat, gfgSubStat, "#gfg-stats");
    
    gfgDailyDiv.appendChild(gfgTitle);
    gfgDailyDiv.appendChild(gfgButton);
    gfgContainer.appendChild(gfgDailyDiv);

    if (data.leetdaily && data.leetdaily.data && data.leetdaily.data.activeDailyCodingChallengeQuestion) {
        const leetcodeDailyDiv = document.createElement("div");
        leetcodeDailyDiv.classList.add("daily-problem");

        const leetcodeTitle = document.createElement("h3");
        leetcodeTitle.textContent = truncateText(data.leetdaily.data.activeDailyCodingChallengeQuestion.question.title, 30);

        const leetcodeButton = document.createElement("div");
        leetcodeButton.classList.add("daily-button-container");

        const leetcodeAnchorTag = document.createElement("a");
        leetcodeAnchorTag.textContent = "Solve";
        leetcodeAnchorTag.href = `https://leetcode.com${data.leetdaily.data.activeDailyCodingChallengeQuestion.link}`;

        leetcodeButton.appendChild(leetcodeAnchorTag);

        const leetcodeTagsDiv = document.querySelector("#leet-tags");
        leetcodeTagsDiv.innerHTML = "";

        const leetcodeTags = data.leetdaily.data.activeDailyCodingChallengeQuestion.question.topicTags;
        
        let leetTagName = [];
        for (let i = 0; i < leetcodeTags.length; i++) {
            leetTagName.push(leetcodeTags[i].name);
        }
        
        createTags(leetTagName, leetcodeTagsDiv, "Topic Tags");

        const leetDiffStat = data.leetdaily.data.activeDailyCodingChallengeQuestion.question.difficulty;
        const leetStatsString = data.leetdaily.data.activeDailyCodingChallengeQuestion.question.stats;
        let leetStatObj = JSON.parse(leetStatsString);
        const leetAccStat = leetStatObj.acRate;
        const leetSubStat = leetStatObj.totalSubmission;

        createStats(leetDiffStat, leetAccStat, leetSubStat, "#leet-stats");

        leetcodeDailyDiv.appendChild(leetcodeTitle);
        leetcodeDailyDiv.appendChild(leetcodeButton);
        leetcodeContainer.appendChild(leetcodeDailyDiv);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    displayCurrentDate();
    fetchDaily();
});

displayCurrentDate();
fetchDaily();


function fetchDaily() {
    fetch(dailyUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            renderDaily(data);
            updateTimers();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function updateTimers() {
    function getRemainingTimeIST() {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        const utcNow = now.getTime() + now.getTimezoneOffset() * 60000; // Convert local time to UTC
        const istNow = new Date(utcNow + istOffset); // Convert UTC time to IST
        const endOfDayIST = new Date(
            istNow.getFullYear(),
            istNow.getMonth(),
            istNow.getDate() + 1, // Next day
            0,
            0,
            0 // Midnight
        ).getTime();
        const remainingMilliseconds = endOfDayIST - istNow.getTime();
        const hours = String(
            Math.floor((remainingMilliseconds / (1000 * 60 * 60)) % 24)
        ).padStart(2, "0");
        const minutes = String(
            Math.floor((remainingMilliseconds / (1000 * 60)) % 60)
        ).padStart(2, "0");
        const seconds = String(
            Math.floor((remainingMilliseconds / 1000) % 60)
        ).padStart(2, "0");
        return { hours, minutes, seconds };
    }

    function getRemainingTimeUTC() {
        const now = new Date();
        const endOfDayUTC = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate() + 1,
                0,
                0,
                0
            )
        );
        const remainingMilliseconds = endOfDayUTC - now;
        const hours = String(
            Math.floor((remainingMilliseconds / (1000 * 60 * 60)) % 24)
        ).padStart(2, "0");
        const minutes = String(
            Math.floor((remainingMilliseconds / (1000 * 60)) % 60)
        ).padStart(2, "0");
        const seconds = String(
            Math.floor((remainingMilliseconds / 1000) % 60)
        ).padStart(2, "0");
        return { hours, minutes, seconds };
    }

    function updateTimer() {
        const gfgHours = document.getElementById("gfg-hours");
        const gfgMinutes = document.getElementById("gfg-minutes");
        const gfgSeconds = document.getElementById("gfg-seconds");

        const leetHours = document.getElementById("leet-hours");
        const leetMinutes = document.getElementById("leet-minutes");
        const leetSeconds = document.getElementById("leet-seconds");

        const gfgTime = getRemainingTimeIST();
        gfgHours.textContent = gfgTime.hours;
        gfgMinutes.textContent = gfgTime.minutes;
        gfgSeconds.textContent = gfgTime.seconds;

        const leetTime = getRemainingTimeUTC();
        leetHours.textContent = leetTime.hours;
        leetMinutes.textContent = leetTime.minutes;
        leetSeconds.textContent = leetTime.seconds;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

function displayCurrentDate() {
    const gfgDateElement = document.getElementById("gfg-date");
    const leetDateElement = document.getElementById("leet-date");

    if (!gfgDateElement || !leetDateElement) {
        console.error('Element with id "gfg-date" or "leet-date" not found.');
        return;
    }

    const now = new Date();

    // IST Date
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const utcNow = now.getTime() + now.getTimezoneOffset() * 60000; // Convert local time to UTC
    const istNow = new Date(utcNow + istOffset); // Convert UTC time to IST
    const istDay = istNow.getDate();
    const istMonth = istNow.toLocaleString("default", { month: "long" });
    const formattedISTDate = `${istDay}, ${istMonth}`;
    gfgDateElement.textContent = formattedISTDate;

    // UTC Date
    const utcDay = now.getUTCDate();
    const utcMonth = now.toLocaleString("default", {
        month: "long",
        timeZone: "UTC",
    });
    const formattedUTCDate = `${utcDay}, ${utcMonth}`;
    leetDateElement.textContent = formattedUTCDate;
}

document.addEventListener("DOMContentLoaded", function () {
    displayCurrentDate();
    fetchDaily();
});

displayCurrentDate();
fetchDaily();


function fetchDaily() {
    fetch(dailyUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            renderDaily(data);
            updateTimers();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function updateTimers() {
    function getRemainingTimeIST() {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
        const istNow = new Date(utcNow + istOffset);

        const nextMidnightIST = new Date(
            istNow.getFullYear(),
            istNow.getMonth(),
            istNow.getDate() + 1,
            0,
            0,
            0
        );

        return nextMidnightIST - istNow;
    }

    const countdownElement = document.getElementById("countdown");
    const remainingTimeIST = getRemainingTimeIST();

    function updateCountdown() {
        const hours = Math.floor((remainingTimeIST / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remainingTimeIST / (1000 * 60)) % 60);
        const seconds = Math.floor((remainingTimeIST / 1000) % 60);

        countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function fetchDaily() {
    fetch(dailyUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            renderDaily(data);
            updateTimers();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function updateTimers() {
    function getRemainingTimeIST() {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        const utcNow = now.getTime() + now.getTimezoneOffset() * 60000; // Convert local time to UTC
        const istNow = new Date(utcNow + istOffset); // Convert UTC time to IST
        const endOfDayIST = new Date(
            istNow.getFullYear(),
            istNow.getMonth(),
            istNow.getDate() + 1, // Next day
            0,
            0,
            0 // Midnight
        ).getTime();
        const remainingMilliseconds = endOfDayIST - istNow.getTime();
        const hours = String(
            Math.floor((remainingMilliseconds / (1000 * 60 * 60)) % 24)
        ).padStart(2, "0");
        const minutes = String(
            Math.floor((remainingMilliseconds / (1000 * 60)) % 60)
        ).padStart(2, "0");
        const seconds = String(
            Math.floor((remainingMilliseconds / 1000) % 60)
        ).padStart(2, "0");
        return { hours, minutes, seconds };
    }

    function getRemainingTimeUTC() {
        const now = new Date();
        const endOfDayUTC = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate() + 1,
                0,
                0,
                0
            )
        );
        const remainingMilliseconds = endOfDayUTC - now;
        const hours = String(
            Math.floor((remainingMilliseconds / (1000 * 60 * 60)) % 24)
        ).padStart(2, "0");
        const minutes = String(
            Math.floor((remainingMilliseconds / (1000 * 60)) % 60)
        ).padStart(2, "0");
        const seconds = String(
            Math.floor((remainingMilliseconds / 1000) % 60)
        ).padStart(2, "0");
        return { hours, minutes, seconds };
    }

    function updateTimer() {
        const gfgHours = document.getElementById("gfg-hours");
        const gfgMinutes = document.getElementById("gfg-minutes");
        const gfgSeconds = document.getElementById("gfg-seconds");

        const leetHours = document.getElementById("leet-hours");
        const leetMinutes = document.getElementById("leet-minutes");
        const leetSeconds = document.getElementById("leet-seconds");

        const gfgTime = getRemainingTimeIST();
        gfgHours.textContent = gfgTime.hours;
        gfgMinutes.textContent = gfgTime.minutes;
        gfgSeconds.textContent = gfgTime.seconds;

        const leetTime = getRemainingTimeUTC();
        leetHours.textContent = leetTime.hours;
        leetMinutes.textContent = leetTime.minutes;
        leetSeconds.textContent = leetTime.seconds;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

function displayCurrentDate() {
    const gfgDateElement = document.getElementById("gfg-date");
    const leetDateElement = document.getElementById("leet-date");

    if (!gfgDateElement || !leetDateElement) {
        console.error('Element with id "gfg-date" or "leet-date" not found.');
        return;
    }

    const now = new Date();

    // IST Date
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const utcNow = now.getTime() + now.getTimezoneOffset() * 60000; // Convert local time to UTC
    const istNow = new Date(utcNow + istOffset); // Convert UTC time to IST
    const istDay = istNow.getDate();
    const istMonth = istNow.toLocaleString("default", { month: "long" });
    const formattedISTDate = `${istDay}, ${istMonth}`;
    gfgDateElement.textContent = formattedISTDate;

    // UTC Date
    const utcDay = now.getUTCDate();
    const utcMonth = now.toLocaleString("default", {
        month: "long",
        timeZone: "UTC",
    });
    const formattedUTCDate = `${utcDay}, ${utcMonth}`;
    leetDateElement.textContent = formattedUTCDate;
}

document.addEventListener("DOMContentLoaded", function () {
    displayCurrentDate();
    fetchDaily();
});

displayCurrentDate();
fetchDaily();
