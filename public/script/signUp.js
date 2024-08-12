import { Storage, Main } from "./cart.js";
import { generateCaptcha, validateCaptcha } from "./captcha.js";

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
        password: password,
        usedPassword: [],
      };

      try {
        const response = await fetch("/register-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
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
        this.showMessage(
          "Error registering user. " +
            error +
            "\n Error using Server, Data saved in localStorage",
          "error"
        );

        // Save the new user to localStorage
        let users = JSON.parse(localStorage.getItem("users")) || { user: [] };
        let newUser = {
          sys: {
            id:
              users.user.length > 0
                ? parseInt(users.user[users.user.length - 1].sys.id) + 1
                : 1,
          },
          fields: {
            username: username,
            password: password,
            usedPassword: [],
            email: email,
          },
        };

        users.user.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        this.showMessage("User registered successfully.", "success");
        setTimeout(() => {
          window.location.href = "account.html";
        }, 2000);
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
    // Check if an existing message is already displayed
    let existingMessageElement = document.querySelector(".message");

    if (existingMessageElement) {
      existingMessageElement.innerText = message;
      clearTimeout(this.messageTimeout);
    } else {
      const messageElement = document.createElement("div");
      messageElement.className = `message ${type}`;
      messageElement.innerText = message;

      passwordInput.parentNode.insertBefore(
        messageElement,
        passwordInput.nextSibling
      );
    }

    // Reset the timeout for the message to disappear
    this.messageTimeout = setTimeout(() => {
      if (existingMessageElement) {
        existingMessageElement.remove();
      }
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
