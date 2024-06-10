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
                    type: "linear",
                    domain: [-1, 10],
                    scheme: "YlOrRd",
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
}

userData(username);
