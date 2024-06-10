console.log("user here babe");

function userData(username){
    fetch('/api/profile/' + username)
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
}

userData(username)

const cal = new CalHeatmap();
cal.paint({});

