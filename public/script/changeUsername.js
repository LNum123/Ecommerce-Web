import { Storage, Main } from './cart.js'

const form = document.querySelector("form");
const emailInput = document.getElementById("email");
const newUsernameInput = document.getElementById("newUsername");

//cart
let cart = Storage.getCart();

function generateToken(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++){
        const randomIndex = Math.floor(Math.random() * charset.length);
        token += charset[randomIndex]
    }
    return token;
}

class Username{
    constructor() {
        this.tokenGenerationTime = Date.now();
        this.tokenLifetime = 30 * 60 * 1000; // 30 minutes
        this.token = generateToken(); // Generate a new token on load
    }

    async changeUsername(){
        form.addEventListener('submit', async(event)=>{
            event.preventDefault();

            const email = emailInput.value.trim();
            const newUsername = newUsernameInput.value.trim();

            if (Date.now() - this.tokenGenerationTime > this.tokenLifetime) {
                this.showMessage("Token has expired. Please reload the page to get a new token.", "error");
                this.token;
                return;
            } else {
                try {
                    const response = await fetch('user.json');

                    if (!response.ok) {
                        throw new Error("Network response was not ok " + response.statusText);
                    }
                    
                    const userData = await response.json();

                    const user = userData.user.find(user=> user.fields.email === email);
                            
                    if(!user){
                        this.showMessage("User not found.", "error");
                        return;
                    }

                    const updatedUserData = {
                        email: email,
                        newUsername: newUsername
                    };

                    const updateResponse = await fetch("/update-username", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(updatedUserData)
                    });

                    if (updateResponse.ok) {
                        this.showMessage("Username changed successfully.", "success");

                        // Set a cookie with the new username
                        document.cookie = `username=${newUsername}; path=/;`;

                        setTimeout(() => {
                            window.location.href = "profile.html";
                        }, 2000);
                    } else {
                        const errorMsg = await updateResponse.text();
                        this.showMessage("Error: " + errorMsg, "error");
                    }

                } catch (error) {
                    console.error("Error:", error);
                    this.showMessage("An error occurred while changing the username. Please try again.", "error");
                }

            
            }
        })
    }

    showMessage(message, type) {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${type}`;
        messageElement.innerText = message;

        newUsernameInput.parentNode.insertBefore(messageElement, newUsernameInput.nextSibling);

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

    const username = new Username();
    username.changeUsername();
});
