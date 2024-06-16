// Remove console.logs before deployment
let cropper;
let debounceTimeout;

document.addEventListener("DOMContentLoaded", function () {
let form = document.getElementById("coding-profile-form");
let inputs = form.querySelectorAll('input[type="text"]');
let updateConfirmButton = document.getElementById("update-confirm");
let confirmButtonContainer = document.getElementById("confirmButton-container"); // Corrected the id name

inputs.forEach(function (input) {
    input.addEventListener("input", function () {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            usernameExists(input);
        }, 1000);
    });
});

updateConfirmButton.addEventListener("click", function () {
    form.requestSubmit();
});

form.addEventListener("submit", function (event) {
    event.preventDefault();
    updateProfile();
});

function updateProfile() {
    var geeksforgeeks = document.getElementById("geeksforgeeks").value.trim();
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

function usernameExists(input) {
    let username = input.value.trim();
    let platform = input.getAttribute("name");
    let messageElement = document.getElementById(input.getAttribute('id') + '-message');
    let remarkContainer = document.getElementById("remarkContainer");
    
    if (username === "") {
        updateConfirmButton.disabled = false;
        confirmButtonContainer.style.display = "flex";
        remarkContainer.style.backgroundColor = "#353535";
        fetch('/static/svg/exclaim.svg')
        .then(response => response.text())
        .then(svgText => {
            const div = document.createElement('div');
            div.innerHTML = svgText;
            div.classList.add('svg-container');
            messageElement.innerHTML = ''; // Clear previous content
            messageElement.appendChild(div);
            setTimeout(() => {
                div.classList.add('visible'); // Add the visible class to trigger the transition
            }, 50);
            
            remarkContainer.innerHTML = '<span style="color: #FFD233; margin-left: 5px;">Username set to blank.</span>';
            return;
        })
        .catch(error => {
            console.error('Error fetching SVG:', error);
            remarkContainer.style.backgroundColor = "#353535";
            messageElement.innerHTML = '<span style="color: #FFD233;">Username set to blank.</span>';
            
            // Add message to the remark container if SVG fetch fails
            remarkContainer.innerHTML = '<span style="color: #FFD233;">Username set to blank.</span>';
            return;
        });
    }

    let postData = {
        platform: platform,
        username: username,
    };

    fetch("/check/username-exists", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.exists) {
            updateConfirmButton.disabled = false;
            confirmButtonContainer.style.display = "flex";
            fetch('/static/svg/tick.svg')
            .then(response => response.text())
            .then(svgText => {
                const div = document.createElement('div');
                div.innerHTML = svgText;
                div.classList.add('svg-container');
                messageElement.innerHTML = ''; // Clear previous content
                messageElement.appendChild(div);
                setTimeout(() => {
                    div.classList.add('visible'); // Add the visible class to trigger the transition
                }, 50);
                
                // Show the remarkContainer only when svg-container is hovered over
                div.addEventListener('mouseenter', function() {
                    remarkContainer.innerHTML = '<span style="color: #0FA958; margin-left: 5px;">Username is available.</span>';
                    remarkContainer.style.display = "block";
                    remarkContainer.style.backgroundColor = "#353535";
                });
                div.addEventListener('mouseleave', function() {
                    remarkContainer.style.display = "none";
                });
            })
            .catch(error => {
                console.error('Error fetching SVG:', error);
                remarkContainer.style.backgroundColor = "#353535";
                messageElement.innerHTML = '<span style="color: #0FA958;">Username is available.</span>';
                
                // Add message to the remark container if SVG fetch fails
                remarkContainer.innerHTML = '<span style="color: #0FA958;">Username is available.</span>';
            });
        } else {
            updateConfirmButton.disabled = true;
            confirmButtonContainer.style.display = "none";
            fetch('/static/svg/cross.svg')
            .then(response => response.text())
            .then(svgText => {
                const div = document.createElement('div');
                div.innerHTML = svgText;
                div.classList.add('svg-container');
                messageElement.innerHTML = ''; // Clear previous content
                messageElement.appendChild(div);
                setTimeout(() => {
                    div.classList.add('visible'); // Add the visible class to trigger the transition
                }, 50);
                
                // Show the remarkContainer only when svg-container is hovered over
                div.addEventListener('mouseenter', function() {
                    remarkContainer.innerHTML = '<span style="color: #FF4F4F; margin-left: 5px;">Username does not exist.</span>';
                    remarkContainer.style.display = "block";
                    remarkContainer.style.backgroundColor = "#353535";
                });
                div.addEventListener('mouseleave', function() {
                    remarkContainer.style.display = "none";
                });
            })
            .catch(error => {
                console.error('Error fetching SVG:', error);
                remarkContainer.style.backgroundColor = "#353535";
                messageElement.innerHTML = '<span style="color: #FF4F4F;">Username does not exist.</span>';
                
                // Add message to the remark container if SVG fetch fails
                remarkContainer.innerHTML = '<span style="color: #FF4F4F;">Username does not exist.</span>';
            });
        }
    });
}


function toggleCropperVisibility(visible) {
    const overlayCropper = document.querySelector(".overlay-cropper");
    overlayCropper.style.display = visible ? "block" : "none";
}

function handleProfilePicture() {
    const fileInput = document.getElementById("profilePicInput");
    const image = document.getElementById("cropImage");
    const cropButton = document.getElementById("cropButton");
    const closeButton = document.getElementById("cropCloseButton");
    const fileNameSpan = document.getElementById("fileName");

    fileInput.addEventListener("change", handleFileChange);
    cropButton.addEventListener("click", handleCrop);
    closeButton.addEventListener("click", () => toggleCropperVisibility(false));

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            toggleCropperVisibility(false);
        }
    });

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
                fileNameSpan.textContent = file.name; // Set file name
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

handleProfilePicture(); // Initialize profile picture handling
});
