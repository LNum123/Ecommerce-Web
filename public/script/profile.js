import {Storage, Main} from './cart.js'

const profile_details = document.getElementsByClassName('profile-details');
const signOut = document.getElementsByClassName('signOut')[0];


//cart
let cart = Storage.getCart();

class Profile {
    async getUser() {
        try {
            const response = await fetch("user.json");
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }

            let userData = await response.json();

            userData = userData.user.map(user => {
                const { username, password, email } = user.fields;
                const { id } = user.sys;

                return { id, username, password, email };
            });

            const username = this.getCookie("username");
            userData = userData.find(user => user.username === username);

            console.log(userData);
            return userData;
        } catch (error) {
            console.error("Error fetching user data:", error);
            throw error;
        }
    }

    clearCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    signOut() {
        signOut.addEventListener('click', (event) => {
            event.preventDefault();
            this.clearCookie("username");
            window.location.href = "index.html";
        });
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    showDetails(userData) {
        let { username, password, email } = userData;

        if (password) {
            password = password.replace(/./g, "*");
        }

        profile_details[0].innerHTML = `
            <div class="profile-username">
                <h2>Username: ${username}</h2>
            </div>
            <div class="profile-password">
                <h2>Password: ${password}</h2>
            </div>
            <div class="profile-email">
                <h2>Email: ${email}</h2>
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const profile = new Profile();

    if(cart.length > 0){
        const main = new Main();
        main.cartLogic();
    }

    profile.getUser().then(userData => {
        profile.showDetails(userData);
    });

    //use sign out btn
    profile.signOut(); 
});
