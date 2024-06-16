import { Storage, Main } from './cart.js'

let cart = Storage.getCart();

const form = document.querySelector("form");
const emailInput = document.getElementById("email");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const tokenInput = document.getElementById("token");

function generateToken(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        token += charset[randomIndex];
    }
    return token;
}

class Password {
    constructor() {
        this.tokenGenerationTime = Date.now();
        this.tokenLifetime = 30 * 60 * 1000; // 30 minutes
        this.token = generateToken(); // Generate a new token on load
        tokenInput.value = this.token; // Display the token
    }

    async changePassword() {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = emailInput.value.trim();
            const newPassword = newPasswordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();
            const token = tokenInput.value.trim();

            if (newPassword !== confirmPassword) {
                this.showMessage("New Password and Confirm Password do not match.", "error");
                return;
            }

            if (Date.now() - this.tokenGenerationTime > this.tokenLifetime) {
                this.showMessage("Token has expired. Please reload the page to get a new token.", "error");
                this.generateToken();
                return;
            }

            try {
                const response = await fetch("user.json");
                if (!response.ok) {
                    throw new Error("Network response was not ok " + response.statusText);
                }
                const userData = await response.json();

                const user = userData.user.find(user => user.fields.email === email);
                if (!user) {
                    this.showMessage("User not found.", "error");
                    return;
                }

                // Token comparison
                if (this.token === token) {
                    if (user.fields.usedPassword && user.fields.usedPassword.includes(newPassword)) {
                        this.showMessage("New password has been used before. Please choose a different password.", "error");
                        return;
                    }

                    user.fields.usedPassword = user.fields.usedPassword || [];
                    user.fields.usedPassword.push(user.fields.password);
                    user.fields.password = newPassword;

                    const updatedUserData = JSON.stringify(userData, null, 2);

                    await fetch("/update-user", { 
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: updatedUserData
                    });

                    this.showMessage("Password changed successfully.", "success");
                    setTimeout(() => {
                        window.location.href = "account.html";
                    }, 2000);
                } else {
                    this.showMessage("Invalid token.", "error");
                }
            } catch (error) {
                console.error("Error:", error);
                this.showMessage("An error occurred while changing the password. Please try again.", "error");
            }
        });
    }

    generateToken() {
        this.token = generateToken();
        tokenInput.value = this.token;
        this.tokenGenerationTime = Date.now();
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
    if(cart.length > 0){
        const main = new Main();
        main.cartLogic();
    }


    const password = new Password();
    password.changePassword();
});
