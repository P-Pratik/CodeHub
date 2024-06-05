// Remove console.logs before deployment

function makeEditable(id) {
    var span = document.getElementById(id);
    var currentValue = span.innerText;
    span.innerHTML = '<input type="text" id="edit-' + id + '" value="' + currentValue + '"/>';
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

function updateConfirm() {
    document.getElementById('update-confirm').disabled = false;
}

function updateProfile(uid) {
    var geeksforgeeks = document.getElementById('geeksforgeeks').innerText;
    var leetcode = document.getElementById('leetcode').innerText;
    var postData = {
        uid: uid,
        geeksforgeeks: geeksforgeeks,
        leetcode: leetcode
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

function updateProfileQuestions() {
    fetch('/update-user-questions', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
};

function handleProfilePicture() {
    let cropper;
    const fileInput = document.getElementById('profilePicInput');
    const image = document.getElementById('cropImage');
    const cropButton = document.getElementById('cropButton');
    const uploadButton = document.getElementById('uploadButton');

    fileInput.addEventListener('change', handleFileChange);
    cropButton.addEventListener('click', handleCrop);
    uploadButton.addEventListener('click', handleUpload);

    function handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                image.src = e.target.result;
                image.style.display = 'block';
                if (cropper) {
                    cropper.destroy();
                }
                cropper = new Cropper(image, {
                    aspectRatio: 1,
                    viewMode: 1,
                });
                cropButton.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    function handleCrop() {
        const canvas = cropper.getCroppedCanvas();
        canvas.toBlob((blob) => {
            const file = new File([blob], "cropped.png", {
                type: 'image/png',
            });
            updateProfilePicture(file);
        });
    }

    function updateProfilePicture(croppedFile) {
        const formData = new FormData();
        formData.append('profile_pic', croppedFile);

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

    function handleUpload() {
        if (!fileInput.files.length) {
            alert('No file selected');
            return;
        }
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            image.src = e.target.result;
            image.style.display = 'block';
            if (cropper) {
                cropper.destroy();
            }
            cropper = new Cropper(image, {
                aspectRatio: 1,
                viewMode: 1,
            });
            cropButton.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

handleProfilePicture();