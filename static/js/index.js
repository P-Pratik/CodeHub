function renderdaily(data) {                                 //WILL REQUIRE MODIFICATION. BASE STUFF.
    let container = document.querySelector('#daily-container');
    container.innerHTML = '';
    const geeksdailyDiv = document.createElement('div');
    let h2 = document.createElement('h3');
    let button = document.createElement('a')
    h2.textContent = data.geeksdaily.problem_name;
    button.textContent = "Solve";
    button.href = data.geeksdaily.problem_url

    geeksdailyDiv.appendChild(h2);
    geeksdailyDiv.appendChild(button);

    container.appendChild(geeksdailyDiv);

    const lcDiv = document.createElement('div');
    const lch3 = document.createElement('h3');
    const lcbutton = document.createElement('a')

    lch3.textContent = data.leetdaily.data.activeDailyCodingChallengeQuestion.question.title;
    lcbutton.textContent = "Solve";
    lcbutton.href = `https://leetcode.com${data.leetdaily.data.activeDailyCodingChallengeQuestion.link}`

    lcDiv.appendChild(lch3);
    lcDiv.appendChild(lcbutton);

    container.appendChild(lcDiv);
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
            renderdaily(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

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
        endUrl = '/description/' }

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
        let problem_url = document.createElement('a');

        problem_name.textContent = data[i].problem_name;
        difficulty.textContent = data[i].difficulty;
        accuracy.textContent = data[i].accuracy;
        problem_url.textContent = 'Solve';
        problem_url.href = baseUrl + data[i].slug + endUrl;

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

    const postData = {
        difficulty: difficulty,
        platform: platform,
    };

    fetchProblems(postData);
}


fetchProblems(); 