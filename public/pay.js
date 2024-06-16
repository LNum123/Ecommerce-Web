import { Main } from './script/cart.js';

const main = new Main();
const payBtn = document.querySelector(".btn-buy");

payBtn.addEventListener("click", () => {
  const login = new Login();
  if (login.checkLogin()) {
  fetch("/stripe-checkout", {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      items: JSON.parse(localStorage.getItem("Ecart")),
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((text) => {
          throw new Error(text);
        });
      }
      return res.json();
    })
    .then((data) => {
      console.log('Stripe session data:', data);
      if (data.url) {
        location.href = data.url;
        main.clearCart(); // Use the clearCart method from Main class instance
      } else {
        console.error("Stripe session URL not found");
      }
    })
    .catch((err) => {
      console.error("Error during checkout:", err);
    });
  }
});
