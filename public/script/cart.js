import { Login } from './login.js';


const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center');

//cart
let cart = [];

//buttons
let buttonsDOM = [];


export class Products {
    async getProducts() {
        try {
            //fetch data from json file
            let getData = await fetch('products.json');
            let data = await getData.json();

            //use products
            let products = data.items;
            products = products.map(item => {
                const { title, price, categories } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;

                return { title, price, id, image, categories };
            });

            // console.log(products);
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

export class Main {
    // display products
    displayProducts(products) {
        let result = '';
        // loop
        products.forEach(product => {
            //destructuring
            let { image, id, title, price, categories } = product;

            // show in html
            result += `
            <!-- single product -->
            <div class="product">
                <div class="img-container">
                <a href="productDetails.html?id=${id}">
                <img src=${image} alt="" class="product-img">
                </a>
                    <button class="bag-btn" data-id=${id}>
                        <i class="fas fa-shopping-cart">
                            add to cart
                        </i>
                    </button>
                </div>

                <a href="productDetails.html?id=${id}">
                <h3>${title}</h3>
                <h5>${categories}</h5>
                <h4>$${price}</h4>
                </a>
            </div>
            `;
        });
        productDOM.innerHTML = result;
    }

    validateCart() {
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }else{
                button.addEventListener('click', (event) => {
                    const login = new Login();
                    if (login.checkLogin()) {
                        event.target.innerText = "In Cart";
                        event.target.disabled = true;
                        //get product from localStorage
                        let cartItem = { ...Storage.getProduct(id), amount: 1 };
                        console.log(cartItem);
                        //add product to the cart
                        cart = [...cart, cartItem];
                        //save cart in local storage
                        Storage.saveCart(cart);
                        //set cart values
                        this.setCartValues(cart);
                        //display cart item
                        this.addCartItem(cartItem);
                        //show the cart
                        this.showCart();
                    }
                });
            }
        });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerHTML = parseFloat(tempTotal.toFixed(2));
        cartItems.innerHTML = itemsTotal;
        // console.log(cartTotal, cartItems);
    }

    addCartItem(item) {
        let { image, title, price, id, amount } = item;
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${image} alt=${title}>
        <div>
            <h4>${title}</h4>
            <h5>$${price}</h5>
            <span class="remove-item" data-id=${id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${id}></i>
            <p class="item-amount">${amount}</p>
            <i class="fas fa-chevron-down" data-id=${id}></i>
        </div>
        `;
        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
        // document.addEventListener('click', this.handleOutsideClick);
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
        // document.removeEventListener('click', this.handleOutsideClick);
    }

    // handleOutsideClick = (event) => {
    //     if (!cartDOM.contains(event.target) && !cartBtn.contains(event.target)) {
    //         this.hideCart();
    //     }
    // }

    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', () => this.showCart());
        closeCartBtn.addEventListener('click', () => this.hideCart());
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic() {
        //clear cart button
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
        //cart functionality
        cartContent.addEventListener('click', event => {
            //console.log(event.target);
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                //console.log(removeItem);
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            } else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                // console.log(addAmount);
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;

            } else if (event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;

                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);

        Storage.saveCart(cart);
        //reset the cart button
        let button = this.getSingleButton(id);
        if(button){
            button.disabled = false;
            button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
        }else{
            return;
        }
    }

    //get button id
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }

}

//local storage
export class Storage {
    static saveProducts(products) {
        localStorage.setItem('Eproducts', JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('Eproducts'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem('Ecart', JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('Ecart') ? JSON.parse(localStorage.getItem('Ecart')) : [];
    }
}

// load content
document.addEventListener("DOMContentLoaded", () => {
    const main = new Main();
    const products = new Products();

    //setupAPP
    main.setupAPP();

    //get all products
    products.getProducts().then(products => {
        main.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        main.validateCart();
        main.cartLogic();
    });
});
