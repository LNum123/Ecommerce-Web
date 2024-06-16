function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function checkLogin() {
    const username = getCookie('username');
    window.location.href = username ? "profile.html" : "account.html";
}
