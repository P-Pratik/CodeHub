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
    fetch("/profile/" + username)
        .then((response) => response.json())
        .then((data) => {
            let calender = data["userCalender"]["submissionCalender"];
            let solvedStats = data["stats"]["solvedStats"];
            let date = getLastYearDate();

            renderCalender(calender, date);
            renderSolved(solvedStats);
            renderContestData();

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
    const school = data[1]["count"], basic = data[2]["count"], easy = data[3]["count"], medium = data[4]["count"], hard = data[5]["count"];
    const total_school = 123, total_basic = 523, total_easy = 1872, total_medium = 2687, total_hard = 911; 
    //figure some way to get total questions on Lc & Gfg

    const graph_data = [school, (total_school - school), basic, (total_basic-basic), easy, (total_easy-easy), medium, (total_medium-medium), hard, (total_hard-hard)];
    const colors = ['#ff44ff', '#673367', '#57FFFF', '#556666','#3FD63F', '#335533', '#FFD300', '#4E4E2E', '#FF4C4C', '#6E3333']; 
    // pink, lite pink, blue, lite blue, green, lite green, yellow, lite yellow, red, lite red 
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
    
    document.getElementById("completed").textContent = data[0]["count"]; 
    document.getElementById("total").textContent = 6116; 
    
    document.getElementById("solved-school").textContent = school + "/" + total_school;
    document.getElementById("solved-basic").textContent = basic + "/" + total_basic;
    document.getElementById("solved-easy").textContent = easy + "/" + total_easy;
    document.getElementById("solved-medium").textContent = medium + "/" + total_medium;
    document.getElementById("solved-hard").textContent = hard + "/" + total_hard;
}

function renderContestData() {
    // const data = {300:1200, 69:1300, 301:1400};
    // contest data shall arrive in order of least recently to most recently, combining both weekly and biweekly
    const xValues = [0, 302, 12, 13, 306, 16, 312,1,1,1];
    const yValues = [0, 1214, 1326, 1440, 1432, 1567, 1604, 1464, 1542, 1467, 1576];
    const gradientColors = ['#E78300', '#FFC700']; // add any more colors

    new Chart("myChart", {
    type: "line",
    data: {
        labels: xValues,
        datasets: [{
        fill: true,
        lineTension: 0.35,      //curvature of line: more is better but also more inaccurate
        backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) {return null;}

            const gradientFill = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
            for (let i = 0; i < gradientColors.length; i++) {
            gradientFill.addColorStop(i / (gradientColors.length - 1), gradientColors[i]);
            }
            return gradientFill;
        },
        borderColor: "#FFFFFF",
        pointRadius: 2.5,
        data: yValues
        }]
    },
    options: {
        plugins:{
            legend: {display: false}
            },
            scales: {
                x: {display: false},
                y: {ticks: {min: 0, max: 2400}, display: false}
            }// min, max is range of ratings possible (else graph overflow)
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
