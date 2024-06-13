function getUpcomingContest(){
    fetch ("/api/contest/upcoming")
    .then(response => response.json())
    .then(data => {
        console.log(data);
    });
};

getUpcomingContest();