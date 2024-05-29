console.log('Hello, world!');

let problemArea = document.querySelector('.problems');

function fetchProblems() {
    const postData = {
        param1: 'value1',
        param2: 'value2'
    };
    const url = '/problem';
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

function renderdaily(data){                                 //WILL REQUIRE MODIFICATION. BASE STUFF.
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


function renderProblems(data) {
    console.log(data);
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
        problem_url.href = data[i].problem_url;

        tr.appendChild(problem_name);
        tr.appendChild(difficulty);
        tr.appendChild(accuracy);
        tr.appendChild(problem_url);

        container.appendChild(tr);
    }
}

function fetchProblems() {
    // maybe not fetch it like this ?
    const page = document.getElementById('page').value;

    // maybe filters in future ? 
    const postData = {
    };

    // problem with fetching page number replacing with 1 for testing
    fetch('/problem/' + 1 , {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    })
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            renderProblems(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

fetchProblems(); 