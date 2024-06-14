function getUpcomingContest() {
    fetch("/api/contest/upcoming")
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        });
}

function getPastContest(data = {}) {
    const page = document.getElementById("page").innerText;
    fetch("/api/contest/past/" + page, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        });
}

function renderUpcomingContest(data) {
    let contestList = document.querySelector(".upcoming-contest")
    contestList.innerHTML = "";
    data.forEach((contest) => {
        let contestCard = document.createElement("div");
        contestCard.className = "card";
        contestCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${contest.name}</h5>
                <p class="card-text">${contest.platform}</p>
                <a href="${contest.url}" class="btn btn-primary">Participate</a>
            </div>
        `;
        contestList.appendChild(contestCard);
    });
};

function renderPastContest(data) {

};

function prevPage() {
    let page = document.getElementById("page").innerText;
    if (page > 1) {
        page--;
        document.getElementById("page").innerText = page;
        applyfilter();
    }
}

function nextPage() {
    let page = document.getElementById("page").innerText;
    page++;
    document.getElementById("page").innerText = page;
    applyfilter();
}

function applyfilter() {
    const platform = document.getElementById("platform").value;

    const data = {
        platform: platform,
    };
    getPastContest(data);
}


let filterButton = document.getElementById("applyFilter");
filterButton.addEventListener("click", {
    handleEvent: function () {
        document.getElementById("page").innerText = "1";
        applyfilter();
    },
});

getUpcomingContest();
applyfilter();