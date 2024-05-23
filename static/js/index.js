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

fetchDaily();