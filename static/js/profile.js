// Remove console.logs before deployment
function makeEditable(id) {
    var span = document.getElementById(id);
    var currentValue = span.innerText;
    span.innerHTML = '<input type="text" id="edit-' + id + '" value="' + currentValue +'"/>';
    document.getElementById('edit-' + id).focus();

    document.getElementById('edit-' + id).addEventListener('blur', function () {
        var newValue = this.value;
        span.innerHTML = newValue;
    });

    document.getElementById('edit-' + id).addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            this.blur();
        }
    });

    if (currentValue != span.innerText) {
        updateConfirm();
    }
}

function updateConfirm(){
    document.getElementById('update-confirm').disabled = false;
}

function updateProfile(uid) {
    var geeksforgeeks = document.getElementById('geeksforgeeks').innerText;
    var leetcode = document.getElementById('leetcode').innerText;
    var postData = {
        uid : uid,
        geeksforgeeks : geeksforgeeks,
        leetcode : leetcode
    };

    fetch('/update-profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('update-confirm').disabled = true;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function updateProfileQuestions(){
    fetch('/update-user-questions' ,{
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
}

function updateProfilePicture() {
    const input = document.getElementById('profilePicInput');
    if (input.files.length === 0) {
        alert('No file selected');
        return;
    }

    const file = input.files[0];
    const formData = new FormData();
    formData.append('profile_pic', file);

    fetch('/update/profile-pic', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Profile picture updated successfully');
            window.location.reload();
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}