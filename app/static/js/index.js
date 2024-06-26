document.addEventListener("DOMContentLoaded", function () {
    displayCurrentDate();
    fetchDaily();
    fetchProblems();

    document.getElementById("applyFilter").addEventListener("click", function () {
        document.getElementById("page").innerText = "1";
        applyfilter();
    });
});

function renderDaily(data) {
    const gfgContainer = document.querySelector("#gfg-daily-content");
    const leetcodeContainer = document.querySelector("#leetcode-daily-content");

    // Clear previous content
    gfgContainer.innerHTML = "";
    leetcodeContainer.innerHTML = "";

    function truncateText(text, maxLength) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + "...";
        } else {
            return text;
        }
    }

    // Create GeeksForGeeks daily challenge
    const gfgDailyDiv = document.createElement("div");
    gfgDailyDiv.classList.add("daily-problem");

    const gfgTitle = document.createElement("h3");
    gfgTitle.textContent = truncateText(data.geeksdaily.problem_name, 30); // Truncate to 30 characters

    const gfgButton = document.createElement("div");
    gfgButton.classList.add("daily-button-container");

    const gfgbuttonLink = data.geeksdaily.problem_url;
    const gfgAnchorTag = document.createElement("a");
    gfgAnchorTag.href = gfgbuttonLink;
    gfgAnchorTag.textContent = "Solve"; 
    
    gfgButton.appendChild(gfgAnchorTag);

    const gfgCompanyTagsDiv = document.querySelector("#gfg-tags #company");
    const gfgTopicTagsDiv = document.querySelector("#gfg-tags #topic");

    gfgCompanyTagsDiv.innerHTML = ""; // Clear previous company tags
    gfgTopicTagsDiv.innerHTML = ""; // Clear previous topic tags

    const gfgcompanyTags = data.geeksdaily.tags.company_tags;
    const gfgtopicTags = data.geeksdaily.tags.topic_tags;

    function createTags(tags, parentDiv, label) {
        if (tags && tags.length > 0) {

            const maxTagsToShow = 2;
            const tagsToShow = tags.slice(0, maxTagsToShow);
            const remainingTagsCount = tags.length - maxTagsToShow;

            tagsToShow.forEach(tag => {
                const tagSpan = document.createElement("span");
                tagSpan.classList.add("tag");
                if (label === "Company Tags") {
                    tagSpan.classList.add("company");
                } else {
                    tagSpan.classList.add("topic");
                }
                tagSpan.textContent = tag;
                parentDiv.appendChild(tagSpan);
            });

            if (remainingTagsCount > 0) {
                const moreSpan = document.createElement("span");
                moreSpan.classList.add("tag");
                if (label === "Company Tags") {
                    moreSpan.classList.add("company-more");
                } else {
                    moreSpan.classList.add("topic-more");
                }
                moreSpan.textContent = `+${remainingTagsCount} more`;
                parentDiv.appendChild(moreSpan);
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
            accStat+='%';
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
    
        statsDiv.innerText = diffStat + " | " + accStat + " | " + formattedSubStat;
    }
    
    const gfgDiffStat = data.geeksdaily.difficulty;
    const gfgAccStat = data.geeksdaily.accuracy;
    const gfgSubStat = data.geeksdaily.total_submissions;
    
    createStats(gfgDiffStat, gfgAccStat, gfgSubStat, "#gfg-stats");
    

    gfgDailyDiv.appendChild(gfgTitle);
    gfgDailyDiv.appendChild(gfgButton);
    gfgContainer.appendChild(gfgDailyDiv);

    // Create LeetCode daily challenge if the data exists
    if (data.leetdaily && data.leetdaily.data && data.leetdaily.data.activeDailyCodingChallengeQuestion) {
        const leetcodeDailyDiv = document.createElement("div");
        leetcodeDailyDiv.classList.add("daily-problem");

        const leetcodeTitle = document.createElement("h3");
        leetcodeTitle.textContent = truncateText(data.leetdaily.data.activeDailyCodingChallengeQuestion.question.title, 30); // Truncate to 30 characters

        const leetcodeButton = document.createElement("div");
        leetcodeButton.classList.add("daily-button-container");

        const leetcodeAnchorTag = document.createElement("a");
        leetcodeAnchorTag.textContent = "Solve";
        leetcodeAnchorTag.href = `https://leetcode.com${data.leetdaily.data.activeDailyCodingChallengeQuestion.link}`;

        leetcodeButton.appendChild(leetcodeAnchorTag);

        const leetcodeTagsDiv = document.querySelector("#leet-tags");
        leetcodeTagsDiv.innerHTML = ""; // Clear previous tags

        const leetcodeTags = data.leetdaily.data.activeDailyCodingChallengeQuestion.question.topicTags;

        let leetTagName = [];
        for(i=0; i<leetcodeTags.length; i++){
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

function renderProblems(data, platform) {
    let baseUrl, endUrl;

    if (platform === "leetcode") {
        baseUrl = "https://leetcode.com/problems/";
        endUrl = "/description/";
    } else {
        baseUrl = "https://www.geeksforgeeks.org/problems/";
        endUrl = "/1/";
    }

    let container = document.getElementById("problems");
    container.innerHTML = "";

    for (let i = 0; i < data.length; i++) {
        let tr = document.createElement("tr");
        let problem_name = document.createElement("td");
        let difficulty = document.createElement("td");
        let diff_text = document.createElement("p");
        let accuracy = document.createElement("td");
        let problem_url = document.createElement("td");
        let problem_url_a = document.createElement("a");

        // Determine color class based on difficulty
        let difficultyClass = "";
        if (data[i].difficulty === "School") {
            difficultyClass = "school-difficulty";
        } else if (data[i].difficulty === "Basic") {
            difficultyClass = "basic-difficulty";
        } else if (data[i].difficulty === "Easy") {
            difficultyClass = "easy-difficulty";
        } else if (data[i].difficulty === "Medium") {
            difficultyClass = "medium-difficulty";
        } else if (data[i].difficulty === "Hard") {
            difficultyClass = "hard-difficulty";
        }
        diff_text.classList.add(difficultyClass);

        difficulty.appendChild(diff_text);

        // color the acceptance or accuracy- 100% is green, 25% is red rest in between
        /*
        let accuracy_color;
        let value = data[i].accuracy;
        if (value <= 25) {
            accuracy_color = "red";
        } else if (value <= 75) {
          var redValue = Math.round(255 * value / 100);
          var greenValue = Math.round(255 * value / 100);
          var blueValue  = 0;
          accuracy_color = "rgb(" + redValue + ", " + greenValue + ", " + blueValue + ", 0)";
        } else {
            accuracy_color = "black";
        }
        accuracy.style.color = accuracy_color;
        */
        problem_name.textContent = data[i].problem_name;
        diff_text.innerHTML = data[i].difficulty;
        accuracy.textContent = `${parseFloat(data[i].accuracy).toFixed(2)}%`;
        problem_url_a.textContent = "Solve";
        problem_url_a.href = baseUrl + data[i].slug + endUrl;

        problem_url.appendChild(problem_url_a);

        tr.appendChild(problem_name);
        tr.appendChild(difficulty);
        tr.appendChild(accuracy);
        tr.appendChild(problem_url);

        // Add event listener to toggle class on hover
        tr.addEventListener("mouseenter", () => {
            // Remove difficulty class and add hover-text class
            diff_text.classList.remove(difficultyClass);
            diff_text.classList.add("hover-text");
        });

        tr.addEventListener("mouseleave", () => {
            // Remove hover-text class and add the previous difficulty class
            diff_text.classList.remove("hover-text");
            diff_text.classList.add(difficultyClass);
        });

        container.appendChild(tr);
    }
}

function renderProblems(data, platform) {
    let baseUrl, endUrl;

    if (platform === "leetcode") {
        baseUrl = "https://leetcode.com/problems/";
        endUrl = "/description/";
    } else {
        baseUrl = "https://www.geeksforgeeks.org/problems/";
        endUrl = "/1/";
    }

    let container = document.getElementById("problems");
    container.innerHTML = "";

    data.forEach(problem => {
        let tr = document.createElement("tr");
        let problem_name = document.createElement("td");
        let difficulty = document.createElement("td");
        let diff_text = document.createElement("p");
        let accuracy = document.createElement("td");
        let problem_url = document.createElement("td");
        let problem_url_a = document.createElement("a");

        // Determine color class based on difficulty
        let difficultyClass = "";
        if (problem.difficulty === "School") {
            difficultyClass = "school-difficulty";
        } else if (problem.difficulty === "Basic") {
            difficultyClass = "basic-difficulty";
        } else if (problem.difficulty === "Easy") {
            difficultyClass = "easy-difficulty";
        } else if (problem.difficulty === "Medium") {
            difficultyClass = "medium-difficulty";
        } else if (problem.difficulty === "Hard") {
            difficultyClass = "hard-difficulty";
        }
        diff_text.classList.add(difficultyClass);

        difficulty.appendChild(diff_text);

        // color the acceptance or accuracy- 100% is green, 25% is red rest in between
        /*
        let accuracy_color;
        let value = problem.accuracy;
        if (value <= 25) {
            accuracy_color = "red";
        } else if (value <= 75) {
          var redValue = Math.round(255 * value / 100);
          var greenValue = Math.round(255 * value / 100);
          var blueValue  = 0;
          accuracy_color = "rgb(" + redValue + ", " + greenValue + ", " + blueValue + ", 0)";
        } else {
            accuracy_color = "black";
        }
        accuracy.style.color = accuracy_color;
        */
        problem_name.textContent = problem.problem_name;
        diff_text.innerHTML = problem.difficulty;
        accuracy.textContent = `${parseFloat(problem.accuracy).toFixed(2)}%`;
        problem_url_a.textContent = "Solve";
        problem_url_a.href = baseUrl + problem.slug + endUrl;

        problem_url.appendChild(problem_url_a);

        tr.appendChild(problem_name);
        tr.appendChild(difficulty);
        tr.appendChild(accuracy);
        tr.appendChild(problem_url);

        // Add event listener to toggle class on hover
        tr.addEventListener("mouseenter", () => {
            // Remove difficulty class and add hover-text class
            diff_text.classList.remove(difficultyClass);
            diff_text.classList.add("hover-text");
        });

        tr.addEventListener("mouseleave", () => {
            // Remove hover-text class and add the previous difficulty class
            diff_text.classList.remove("hover-text");
            diff_text.classList.add(difficultyClass);
        });

        container.appendChild(tr);
    });
}

function fetchProblems(postData = {}) {
    const page = document.getElementById("page").innerText;
    console.log(postData);
    fetch("/problem/" + page, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
    })
        .then((response) => response.json())
        .then((data) => {
            renderProblems(data, postData.platform);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
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
    const difficulty = document.getElementById("difficulty").value;
    const platform = document.getElementById("platform").value;
    const filters = {};

    if (difficulty !== "") {
        filters.difficulty = difficulty;
    }
    const postData = {
        filters: filters,
        platform: platform,
    };
    fetchProblems(postData);
}

displayCurrentDate();
fetchDaily();
fetchProblems();
