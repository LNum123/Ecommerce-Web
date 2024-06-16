
const usernameInput = document.querySelector(".username-input");
const passwordInput = document.querySelector(".password-input");
const loginButton = document.querySelector(".login-btn");
const accountButton = document.getElementById("account");



class User {
    async getUser() {
        try {
            const response = await fetch("user.json");
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }

            let userData = await response.json();

            userData = userData.user;
            userData = userData.map(user => {
                const { username, password } = user.fields;
                const { id } = user.sys;

                return { id, username, password };
            });

            console.log(userData);

            return userData;
        } catch (error) {
            console.error("Error fetching user data:", error);
            throw error;
        }
    }
}

export class Login {
    userLogin(users, username, password) {
        try {
            let user = users.find(user => user.username === username && user.password === password);
            if (user) {
                this.showMessage("Login successful!", "success");
                // Set a timeout to redirect to the home page after 1 second
                setTimeout(() => {
                    // Set a cookie that expires in 24 hours
                    this.setCookie("username", username, 1);
                    window.location.href = "index.html";
                }, 1000);
            } else {
                this.showMessage("Invalid username or password.", "error");
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    }

    setCookie(name, value, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = `${name}=${value}; ${expires}; path=/`;
    }

    showMessage(message, type) {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${type}`;
        messageElement.innerText = message;

        passwordInput.parentNode.insertBefore(messageElement, passwordInput.nextSibling);

        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }

    loginBtn(users) {
        loginButton.addEventListener("click", (event) => {
            event.preventDefault();
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (username === "" || password === "") {
                this.showMessage("Please enter both username and password.", "error");
                return;
            } else {
                this.userLogin(users, username, password);
            }
        });
    }

    checkLogin() {
        const username = this.getCookie("username");
        if (username) {
            return true;
        } else {
            window.location.href = "account.html";
            return false;
        }
    }

    clickAccountBtn(){
        accountButton.addEventListener("click", () => {
            this.checkLogin();
        });
    }


    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

}


document.addEventListener("DOMContentLoaded", () => {
    const user = new User();
    const login = new Login();

    user.getUser().then((userData) => {
        login.loginBtn(userData);
        login.clickCartBtn();
    });


});
