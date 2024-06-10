function getUsername(){
    return fetch('/get-username')
    .then(response => response.json())
    .then(data => {
        return data;
    })
}

function checkLoggedIn() {
    fetch('/check-logged-in', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            if (data == true ) {
                console.log("logged in")
                loggedin = true;
                getUsername().then(loggedinuser => {
                    console.log(loggedinuser)
                    if (loggedinuser === username)
                        renderEdit();
                });
            } else {
                console.log("not logged in")
            }
        })
}

function renderEdit(){
    if (loggedin){
        const editDiv = document.querySelector('.edit-profile');
        let editBtn = document.createElement('a');
        editBtn.innerHTML = "Edit Profile";
        editBtn.href = "/profile";

        editDiv.appendChild(editBtn);
    }
}

console.log("user here babe")
let loggedin = false;
let username = document.getElementById('username').innerText.trim();
checkLoggedIn();