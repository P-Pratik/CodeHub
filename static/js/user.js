function getLastYearDate() {
    let lastYearDate = new Date();
    lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
    lastYearDate.setMonth(lastYearDate.getMonth() + 1);
    return lastYearDate.toISOString().split("T")[0];
}
function getLastYearDate() {
    let lastYearDate = new Date();
    lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
    lastYearDate.setMonth(lastYearDate.getMonth() + 1);
    return lastYearDate.toISOString().split("T")[0];
}

function userData(username) {
    fetch("/api/profile/" + username)
        .then((response) => response.json())
        .then((data) => {
            let calender = data["userCalender"]["submissionCalender"];
            let solvedStats = data["stats"]["solvedStats"];
            let date = getLastYearDate();

            renderCalender(calender, date);
            renderSolved(solvedStats);

            document
                .getElementById("calYear")
                .addEventListener("change", filterCalYear);
            function filterCalYear() {
                if (document.getElementById("calYear").value == "current") {
                    date = getLastYearDate();
                } else {
                    date = document.getElementById("calYear").value;
                }
                document.getElementById("cal-heatmap").innerHTML = "";
                renderCalender(calender, date);
            }
        });
}

function renderCalender(calender, date) {
    const cal = new CalHeatmap();
    cal.paint(
        {
            range: 12,
            domain: { type: "month" },
            subDomain: { type: "day" },
            date: { start: date },
            scale: {
                color: {
                    type: "quantize",
                    domain: [-1, 10],
                    scheme: "Oranges",
                },
            },
            data: {
                source: calender,
                type: "json",
                x: "date",
                y: "count",
            },
            theme: "dark",
        },
        [
            [
                Tooltip,
                {
                    text: function (date, value, dayjsDate) {
                        return (
                            (value ? value + " Submissions" : "No data") +
                            " on " +
                            dayjsDate.format("MMM D, YYYY")
                        );
                    },
                },
            ],
        ]
    );

    // Maybe This is Not Required We will figure it out later
    document.getElementById("prev").addEventListener("click", (e) => {
        e.preventDefault();
        cal.previous();
    });

    document.getElementById("next").addEventListener("click", (e) => {
        e.preventDefault();
        cal.next();
    });
}

function renderSolved(data) {
    let solvedStats = document.getElementById("solvedStats");
    for (let i = 0; i < data.length; i++) {
        let solved = document.createElement("div");
        let difficulty = data[i]["difficulty"];
        let count = data[i]["count"];
        let stat = document.createElement("p");
        stat.textContent = difficulty + " : " + count;

        solved.appendChild(stat);
        solvedStats.appendChild(solved);
    }

    const basic = data[0]["count"], easy = data[1]["count"], medium = data[2]["count"], hard = data[3]["count"];
    const total_basic = 150, total_easy = 802, total_medium = 1672, total_hard = 709;

    const graph_data = [basic, (total_basic-basic), easy, (total_easy-easy), medium, (total_medium-medium), hard, (total_hard-hard)];
    const colors = ['#57FFFF', '#556666','#3FD63F', '#335533', '#FFD300', '#4E4E2E', '#FF4C4C', '#6E3333']; 
    // blue, lite blue, green, lite green, yellow, lite yellow, red, lite red 
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: graph_data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            cutout: '95%',
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateStats() {
    fetch("/update/stats", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        window.location.reload();
    });
}


document.getElementById("update-stats").addEventListener("click", updateStats);
userData(username);
