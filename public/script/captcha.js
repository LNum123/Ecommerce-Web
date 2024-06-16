let captcha;

function generate() {
    // Clear old input
    document.getElementById("submit-captcha").value = "";

    // Access the element to store the generated captcha
    captcha = document.getElementById("image");
    let uniquechar = "";

    const randomchar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // Generate captcha for length of 5 with random characters
    for (let i = 0; i < 5; i++) {
        uniquechar += randomchar.charAt(Math.floor(Math.random() * randomchar.length));
    }

    // Store generated input
    captcha.innerHTML = uniquechar;
}

function printmsg() {
    const usr_input = document.getElementById("submit-captcha").value;
    const keyElement = document.getElementById("key");

    // Check whether the input is equal to generated captcha or not
    if (usr_input === captcha.innerHTML) {
        keyElement.innerHTML = "Matched";
    } else {
        keyElement.innerHTML = "Not Matched";
        generate();
    }
}

export function generateCaptcha() {
    const captchaText = Math.random().toString(36).substring(2, 8);
    document.getElementById("image").innerText = captchaText;
}

export function validateCaptcha(input) {
    const captchaText = document.getElementById("image").innerText;
    return input === captchaText;
}


window.onload = function() {
    generate();
}
