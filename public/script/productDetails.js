import { Products, Storage, Main } from './cart.js';
import { Login } from './login.js';

//product
const productImage = document.getElementById('product-image');
const productTitle = document.getElementById('product-title');
const productPrice = document.getElementById('product-price');
const productDescription = document.getElementById('product-description');
const productDetailDOM = document.querySelector('.product-details');
const productCategories = document.querySelector('#product-categories');

//cart
const cartBtn = document.querySelector('.cart-btn');
const addToCartButton = document.getElementById('add-to-cart');
const cartContent = document.querySelector('.cart-content');
const clearCartBtn = document.querySelector('.clear-cart');

let cart = Storage.getCart();


export class ProductDetails {
    constructor() {
        // Initialize product as null
        this.product = null; 
    }

    findProduct(products, productId) {
        this.product = products.find(item => item.id === productId);

        if (this.product) {
            productImage.src = this.product.image;
            productTitle.textContent = this.product.title;
            productPrice.textContent = `$${this.product.price}`;
            productCategories.textContent = this.product.categories;

            let description = this.product.description || `
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. 
            Placeat, quasi ullam nihil recusandae accusamus ad harum 
            reiciendis obcaecati expedita?
            `;
            productDescription.textContent = description;

            addToCartButton.innerText = this.updateBtn(productId);

            
        } else {
            productDetailDOM.innerHTML = '<p>Product not found.</p>';
        }
    }

    updateBtn(productId){
        const isInCart = cart.find(item => item.id === productId);

        if (isInCart) {
            addToCartButton.innerText = 'In Cart';
            // addToCartButton.disabled = true;
        } else {
            addToCartButton.innerText = 'Add to cart';
            // addToCartButton.disabled = false;
        }
    }

    addToCart(productId) {
        addToCartButton.addEventListener('click', (event) => {
            const isInCart = cart.find(item => item.id === productId);

            this.updateBtn(productId)
            
            const login = new Login();
            if (login.checkLogin()) {
                if (isInCart) {
                    this.showCart();
                } else {
                    const cartItem = { ...this.product, amount: 1 };
                    cart.push(cartItem);
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    this.addCartItem(cartItem);
                    this.showCart();
                    addToCartButton.innerText = 'In Cart';
                }
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
        document.querySelector('.cart-total').innerHTML = parseFloat(tempTotal.toFixed(2));
        document.querySelector('.cart-items').innerHTML = itemsTotal;
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
        document.querySelector('.cart-overlay').classList.add('transparentBcg');
        document.querySelector('.cart').classList.add('showCart');
    }

    hideCart() {
        document.querySelector('.cart-overlay').classList.remove('transparentBcg');
        document.querySelector('.cart').classList.remove('showCart');
    }

    cartLogic(){
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });

        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            } else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount -= 1;
                if(tempItem.amount > 0){
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


    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        this.updateBtn(id);
    }

}

document.addEventListener("DOMContentLoaded", () => {
    const products = new Products();
    const productDetails = new ProductDetails();
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    products.getProducts().then(productList => {
        productDetails.findProduct(productList, productId);
    }).then(() => {
        productDetails.updateBtn(productId)
        productDetails.addToCart(productId);
        if(cart.length > 0){
            productDetails.cartLogic();
        }
    })
});
