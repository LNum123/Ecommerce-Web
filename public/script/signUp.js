import { Storage, Main } from './cart.js';
import { generateCaptcha, validateCaptcha } from './captcha.js';

// Cart
let cart = Storage.getCart();

const form = document.querySelector("form");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const submitCaptchaInput = document.getElementById("submit-captcha");
const signUpButton = document.querySelector("input[type='button']");

class SignUp {
    register() {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();
            const captcha = submitCaptchaInput.value.trim();

            // Input validation
            if (username.length < 8) {
                this.showMessage("Username must be more than 8 characters.", "error");
                this.clearFields();
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                this.showMessage("Invalid email format.", "error");
                this.clearFields();
                return;
            }
            if (password.length < 8) {
                this.showMessage("Password must be more than 8 characters.", "error");
                this.clearFields();
                return;
            }
            if (password !== confirmPassword) {
                this.showMessage("Passwords do not match.", "error");
                this.clearFields();
                return;
            }
            if (!validateCaptcha(captcha)) {
                this.showMessage("Invalid captcha.", "error");
                this.clearFields();
                return;
            }

            const newUser = {
                username: username,
                email: email,
                password: password
            };

            try {
                const response = await fetch("/register-user", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newUser)
                });

                if (response.ok) {
                    this.showMessage("User registered successfully.", "success");
                    setTimeout(() => {
                        window.location.href = "account.html";
                    }, 2000);
                } else {
                    const errorData = await response.json();
                    this.showMessage(errorData.message, "error");
                }

            } catch (error) {
                this.showMessage("Error registering user.", "error");
            }
        });
    }

    clearFields() {
        usernameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";
        confirmPasswordInput.value = "";
        submitCaptchaInput.value = "";
    }

    showMessage(message, type) {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${type}`;
        messageElement.innerText = message;

        confirmPasswordInput.parentNode.insertBefore(messageElement, confirmPasswordInput.nextSibling);

        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (cart.length > 0) {
        const main = new Main();
        main.cartLogic();
    }

    const signUp = new SignUp();
    signUp.register();

    // Generate captcha on page load
    generateCaptcha();

    signUpButton.addEventListener("click", () => {
        form.dispatchEvent(new Event("submit"));
    });
});
