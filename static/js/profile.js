// Remove console.logs before deployment
let cropper;
let debounceTimeout;

document.addEventListener("DOMContentLoaded", function () {
    let form = document.getElementById("coding-profile-form");
    let inputs = form.querySelectorAll('input[type="text"]');
    let updateConfirmButton = document.getElementById("update-confirm");

    inputs.forEach(function (input) {
        input.addEventListener("input", function () {
            clearTimeout(debounceTimeout);
            updateConfirmButton.disabled = true;
            debounceTimeout = setTimeout(() => {
                usernameExists(input);
            }, 1000);
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        updateProfile();
    });

    function updateProfile() {
        var geeksforgeeks = document
            .getElementById("geeksforgeeks")
            .value.trim();
        var leetcode = document.getElementById("leetcode").value.trim();

        if (geeksforgeeks === "None" || geeksforgeeks === "") {
            geeksforgeeks = null;
        }

        if (leetcode === "None" || leetcode === "") {
            leetcode = null;
        }

        var postData = {
            geeksforgeeks: geeksforgeeks,
            leetcode: leetcode,
        };

        fetch("/update/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                window.location.reload();
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
});

function usernameExists(input) {
    let username = input.value.trim();
    let platform = input.getAttribute("name");
    let messageElement = document.getElementById(input.getAttribute('id') + '-message');
    let updateConfirmButton = document.getElementById("update-confirm");

    if (username === "") {
        updateConfirmButton.disabled = false;
        messageElement.innerHTML = '<span style="color: yellow;">setting no username</span>';
        return;
    }

    let postData = {}
    postData["platform"] = platform;
    postData["username"] = username;

    console.log(postData);
    fetch("/check/username-exists", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        if (data.exists) {
            updateConfirmButton.disabled = false;
            messageElement.innerHTML = '<span style="color: green;">Username is available.</span>';
        } else {
            messageElement.innerHTML = '<span style="color: red;">Username does not exist.</span>';
        }
    });

};

function toggleCropperVisibility(visible) {
    const overlayCropper = document.querySelector(".overlay-cropper");
    overlayCropper.style.display = visible ? "block" : "none";
}

function handleProfilePicture() {
    const fileInput = document.getElementById("profilePicInput");
    const image = document.getElementById("cropImage");
    const cropButton = document.getElementById("cropButton");

    fileInput.addEventListener("change", handleFileChange);
    cropButton.addEventListener("click", handleCrop);

    function handleFileChange(event) {
        if (!fileInput.files.length) {
            alert("No file selected");
            return;
        }
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                image.src = e.target.result;
                image.style.display = "block";
                if (cropper) {
                    cropper.destroy();
                }
                cropper = new Cropper(image, {
                    aspectRatio: 1,
                    viewMode: 1,
                });
                toggleCropperVisibility(true); // Show overlay-cropper
                cropButton.style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    }

    function handleCrop() {
        const canvas = cropper.getCroppedCanvas();
        canvas.toBlob((blob) => {
            const file = new File([blob], "cropped.png", {
                type: "image/png",
            });
            updateProfilePicture(file);
        });
    }

    function updateProfilePicture(croppedFile) {
        const formData = new FormData();
        formData.append("profile_pic", croppedFile);

        fetch("/update/profile-pic", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert("Profile picture updated successfully");
                    window.location.reload();
                } else {
                    alert("Error: " + data.error);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            })
            .finally(() => {
                toggleCropperVisibility(false); // Hide overlay-cropper after updating profile picture
            });
    }
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
        });
}
