function renderDaily(data) {
    const gfgContainer = document.querySelector('#gfg-daily-content');
    const leetcodeContainer = document.querySelector('#leetcode-daily-content');

    // Clear previous content
    gfgContainer.innerHTML = '';
    leetcodeContainer.innerHTML = '';

    // Create GeeksForGeeks daily challenge
    const gfgDailyDiv = document.createElement('div');
    gfgDailyDiv.classList.add('daily-problem');

    const gfgTitle = document.createElement('h3');
    gfgTitle.textContent = data.geeksdaily.problem_name;

    const gfgButton = document.createElement('a');
    gfgButton.textContent = "Solve";
    gfgButton.href = data.geeksdaily.problem_url;

    gfgDailyDiv.appendChild(gfgTitle);
    gfgDailyDiv.appendChild(gfgButton);
    gfgContainer.appendChild(gfgDailyDiv);

    // Create LeetCode daily challenge
    const leetcodeDailyDiv = document.createElement('div');
    leetcodeDailyDiv.classList.add('daily-problem');

    const leetcodeTitle = document.createElement('h3');
    leetcodeTitle.textContent = data.leetdaily.data.activeDailyCodingChallengeQuestion.question.title;

    const leetcodeButton = document.createElement('a');
    leetcodeButton.textContent = "Solve";
    leetcodeButton.href = `https://leetcode.com${data.leetdaily.data.activeDailyCodingChallengeQuestion.link}`;

    leetcodeDailyDiv.appendChild(leetcodeTitle);
    leetcodeDailyDiv.appendChild(leetcodeButton);
    leetcodeContainer.appendChild(leetcodeDailyDiv);
}

function fetchDaily() {
    fetch(dailyUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        renderDaily(data);
        updateTimers();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateTimers() {
    function getRemainingTimeIST() {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000); // Convert local time to UTC
        const istNow = new Date(utcNow + istOffset); // Convert UTC time to IST
        const endOfDayIST = new Date(
            istNow.getFullYear(),
            istNow.getMonth(),
            istNow.getDate() + 1, // Next day
            0, 0, 0 // Midnight
        ).getTime();
        const remainingMilliseconds = endOfDayIST - istNow.getTime();
        const hours = String(Math.floor((remainingMilliseconds / (1000 * 60 * 60)) % 24)).padStart(2, '0');
        const minutes = String(Math.floor((remainingMilliseconds / (1000 * 60)) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((remainingMilliseconds / 1000) % 60)).padStart(2, '0');
        return { hours, minutes, seconds };
    }

    function getRemainingTimeUTC() {
        const now = new Date();
        const endOfDayUTC = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
        );
        const remainingMilliseconds = endOfDayUTC - now;
        const hours = String(Math.floor((remainingMilliseconds / (1000 * 60 * 60)) % 24)).padStart(2, '0');
        const minutes = String(Math.floor((remainingMilliseconds / (1000 * 60)) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((remainingMilliseconds / 1000) % 60)).padStart(2, '0');
        return { hours, minutes, seconds };
    }

    function updateTimer() {
        const gfgHours = document.getElementById('gfg-hours');
        const gfgMinutes = document.getElementById('gfg-minutes');
        const gfgSeconds = document.getElementById('gfg-seconds');
        
        const leetHours = document.getElementById('leet-hours');
        const leetMinutes = document.getElementById('leet-minutes');
        const leetSeconds = document.getElementById('leet-seconds');

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
    const gfgDateElement = document.getElementById('gfg-date');
    const leetDateElement = document.getElementById('leet-date');

    if (!gfgDateElement || !leetDateElement) {
        console.error('Element with id "gfg-date" or "leet-date" not found.');
        return;
    }

    const now = new Date();

    // IST Date
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000); // Convert local time to UTC
    const istNow = new Date(utcNow + istOffset); // Convert UTC time to IST
    const istDay = istNow.getDate();
    const istMonth = istNow.toLocaleString('default', { month: 'long' });
    const formattedISTDate = `${istDay}, ${istMonth}`;
    gfgDateElement.textContent = formattedISTDate;

    // UTC Date
    const utcDay = now.getUTCDate();
    const utcMonth = now.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
    const formattedUTCDate = `${utcDay}, ${utcMonth}`;
    leetDateElement.textContent = formattedUTCDate;
}

displayCurrentDate();

function prevPage() {
    let page = document.getElementById('page').innerText;
    if (page > 1) {
        page--;
        document.getElementById('page').innerText = page;
        applyfilter();
    }
}

function nextPage() {
    let page = document.getElementById('page').innerText;
    page++;
    document.getElementById('page').innerText = page;
    applyfilter();
}

function renderProblems(data, platform) {
    let baseUrl, endUrl;

    if (platform === 'leetcode') {
        baseUrl = 'https://leetcode.com/problems/';
        endUrl = '/description/';
    } else {
        baseUrl = 'https://www.geeksforgeeks.org/problems/';
        endUrl = '/1/';
    }

    let container = document.getElementById('problems');
    container.innerHTML = '';

    for (let i = 0; i < data.length; i++) {
        let tr = document.createElement('tr');
        let problem_name = document.createElement('td');
        let difficulty = document.createElement('td');
        let accuracy = document.createElement('td');
        let problem_url = document.createElement('td');
        let problem_url_a = document.createElement('a');

        problem_name.textContent = data[i].problem_name;
        difficulty.textContent = data[i].difficulty;
        accuracy.textContent = data[i].accuracy;
        problem_url_a.textContent = 'Solve';
        problem_url_a.href = baseUrl + data[i].slug + endUrl;

        problem_url.appendChild(problem_url_a);

        tr.appendChild(problem_name);
        tr.appendChild(difficulty);
        tr.appendChild(accuracy);
        tr.appendChild(problem_url);

        container.appendChild(tr);
    }
}

function fetchProblems(postData = {}) {
    const page = document.getElementById('page').innerText;
    console.log(postData)
    fetch('/problem/' + page, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    })
    .then(response => response.json())
    .then(data => {
        renderProblems(data, postData.platform);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function applyfilter() {
    const difficulty = document.getElementById('difficulty').value;
    const platform = document.getElementById('platform').value;
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

fetchDaily();
fetchProblems();