document.addEventListener("DOMContentLoaded", function () {
    fetchProblems();

    document.getElementById("applyFilter").addEventListener("click", function () {
        document.getElementById("page").innerText = "1";
        applyfilter();
    });
});

function renderProblems(data, platform) {
    let baseUrl, endUrl;

    if (platform === "leetcode") {
        baseUrl = "https://leetcode.com/problems/";
        endUrl = "/description/";
    } else {
        baseUrl = "https://www.geeksforgeeks.org/problems/";
        endUrl = "/1/";
    }

    let container = document.getElementById("problems");
    container.innerHTML = "";

    for (let i = 0; i < data.length; i++) {
        let tr = document.createElement("tr");
        let problem_name = document.createElement("td");
        let difficulty = document.createElement("td");
        let diff_text = document.createElement("p");
        let accuracy = document.createElement("td");
        let problem_url = document.createElement("td");
        let problem_url_a = document.createElement("a");

        // Determine color class based on difficulty
        let difficultyClass = "";
        if (data[i].difficulty === "School") {
            difficultyClass = "school-difficulty";
        } else if (data[i].difficulty === "Basic") {
            difficultyClass = "basic-difficulty";
        } else if (data[i].difficulty === "Easy") {
            difficultyClass = "easy-difficulty";
        } else if (data[i].difficulty === "Medium") {
            difficultyClass = "medium-difficulty";
        } else if (data[i].difficulty === "Hard") {
            difficultyClass = "hard-difficulty";
        }
        diff_text.classList.add(difficultyClass);

        difficulty.appendChild(diff_text);

        // color the acceptance or accuracy- 100% is green, 25% is red rest in between
        /*
        let accuracy_color;
        let value = data[i].accuracy;
        if (value <= 25) {
            accuracy_color = "red";
        } else if (value <= 75) {
          var redValue = Math.round(255 * value / 100);
          var greenValue = Math.round(255 * value / 100);
          var blueValue  = 0;
          accuracy_color = "rgb(" + redValue + ", " + greenValue + ", " + blueValue + ", 0)";
        } else {
            accuracy_color = "black";
        }
        accuracy.style.color = accuracy_color;
        */
        problem_name.textContent = data[i].problem_name;
        diff_text.innerHTML = data[i].difficulty;
        accuracy.textContent = `${parseFloat(data[i].accuracy).toFixed(2)}%`;
        problem_url_a.textContent = "Solve";
        problem_url_a.href = baseUrl + data[i].slug + endUrl;

        problem_url.appendChild(problem_url_a);

        tr.appendChild(problem_name);
        tr.appendChild(difficulty);
        tr.appendChild(accuracy);
        tr.appendChild(problem_url);

        // Add event listener to toggle class on hover
        tr.addEventListener("mouseenter", () => {
            // Remove difficulty class and add hover-text class
            diff_text.classList.remove(difficultyClass);
            diff_text.classList.add("hover-text");
        });

        tr.addEventListener("mouseleave", () => {
            // Remove hover-text class and add the previous difficulty class
            diff_text.classList.remove("hover-text");
            diff_text.classList.add(difficultyClass);
        });

        container.appendChild(tr);
    }
}

function renderProblems(data, platform) {
    let baseUrl, endUrl;

    if (platform === "leetcode") {
        baseUrl = "https://leetcode.com/problems/";
        endUrl = "/description/";
    } else {
        baseUrl = "https://www.geeksforgeeks.org/problems/";
        endUrl = "/1/";
    }

    let container = document.getElementById("problems");
    container.innerHTML = "";

    data.forEach(problem => {
        let tr = document.createElement("tr");
        let problem_name = document.createElement("td");
        let difficulty = document.createElement("td");
        let diff_text = document.createElement("p");
        let accuracy = document.createElement("td");
        let problem_url = document.createElement("td");
        let problem_url_a = document.createElement("a");

        // Determine color class based on difficulty
        let difficultyClass = "";
        if (problem.difficulty === "School") {
            difficultyClass = "school-difficulty";
        } else if (problem.difficulty === "Basic") {
            difficultyClass = "basic-difficulty";
        } else if (problem.difficulty === "Easy") {
            difficultyClass = "easy-difficulty";
        } else if (problem.difficulty === "Medium") {
            difficultyClass = "medium-difficulty";
        } else if (problem.difficulty === "Hard") {
            difficultyClass = "hard-difficulty";
        }
        diff_text.classList.add(difficultyClass);

        difficulty.appendChild(diff_text);

        // color the acceptance or accuracy- 100% is green, 25% is red rest in between
        /*
        let accuracy_color;
        let value = problem.accuracy;
        if (value <= 25) {
            accuracy_color = "red";
        } else if (value <= 75) {
          var redValue = Math.round(255 * value / 100);
          var greenValue = Math.round(255 * value / 100);
          var blueValue  = 0;
          accuracy_color = "rgb(" + redValue + ", " + greenValue + ", " + blueValue + ", 0)";
        } else {
            accuracy_color = "black";
        }
        accuracy.style.color = accuracy_color;
        */
        problem_name.textContent = problem.problem_name;
        diff_text.innerHTML = problem.difficulty;
        accuracy.textContent = `${parseFloat(problem.accuracy).toFixed(2)}%`;
        problem_url_a.textContent = "Solve";
        problem_url_a.href = baseUrl + problem.slug + endUrl;

        problem_url.appendChild(problem_url_a);

        tr.appendChild(problem_name);
        tr.appendChild(difficulty);
        tr.appendChild(accuracy);
        tr.appendChild(problem_url);

        // Add event listener to toggle class on hover
        tr.addEventListener("mouseenter", () => {
            // Remove difficulty class and add hover-text class
            diff_text.classList.remove(difficultyClass);
            diff_text.classList.add("hover-text");
        });

        tr.addEventListener("mouseleave", () => {
            // Remove hover-text class and add the previous difficulty class
            diff_text.classList.remove("hover-text");
            diff_text.classList.add(difficultyClass);
        });

        container.appendChild(tr);
    });
}

function fetchProblems(postData = {}) {
    const page = document.getElementById("page").innerText;
    console.log(postData);
    fetch("/problem/" + page, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
    })
        .then((response) => response.json())
        .then((data) => {
            renderProblems(data, postData.platform);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

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
    const difficulty = document.getElementById("difficulty").value;
    const platform = document.getElementById("platform").value;
    const filters = {};

    if (difficulty !== "") {
        filters.difficulty = difficulty;
    }
    const postData = {
        filters: filters,
        platform: platform,
    };
    fetchProblems(postData);
}

fetchProblems();
