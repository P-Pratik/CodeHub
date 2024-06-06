console.log("user here babe")
let loggedin = false;
checkLoggedIn();

function checkLoggedIn() {
    fetch('/check-logged-in', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            if (data == true) {
                console.log("logged in")
                loggedin = true;
                renderEdit();
            } else {
                console.log("not logged in")

            }
        })
};

function renderEdit(){
    if (loggedin){
        const editDiv = document.querySelector('.edit-profile');
        let editBtn = document.createElement('a');
        editBtn.innerHTML = "Edit Profile";
        editBtn.href = "/profile";

        editDiv.appendChild(editBtn);

    }
};

