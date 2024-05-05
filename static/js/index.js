console.log('Hello, world!');

problemArea = document.querySelector('.problems');

function fetchProblems(){
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