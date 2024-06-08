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
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

fetchDaily(); // throw it somewhere i dont want it here


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

    if (platform === 'leetcode') {
        baseUrl = 'https://leetcode.com/problems/'
        endUrl = '/description/'
    }

    else {
        baseUrl = 'https://www.geeksforgeeks.org/problems/'
        endUrl = '/1/'
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
};



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
            // console.log(data);
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

fetchProblems(); 