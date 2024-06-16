import { Storage, Main } from './cart.js'


// search
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');


document.addEventListener("DOMContentLoaded", () => {

    // let cart = Storage.getCart();
    
    // if(cart.length>0){
    //     const main = new Main();
    //     main.cartLogic();
    // }

        // Get query from URL parameters
        const params = new URLSearchParams(window.location.search);
        let query = params.get('query');
    
        const searchProducts = (query) => {
            fetch('products.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (!Array.isArray(data.items)) {
                        throw new Error('Data items is not an array');
                    }
                    const filteredProducts = data.items.filter(product => 
                        product.fields.title.toLowerCase().includes(query) ||
                        product.fields.description && product.fields.description.toLowerCase().includes(query)
                    );
                    displayResults(filteredProducts);
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                    searchResults.innerHTML = '<p>Error loading products. Please try again later.</p>';
                });
        };
    
        //convert to lowercase to match with the product.json file result
        if (query) {
            searchInput.value = query;
            query = query.toLowerCase();
            searchProducts(query);
        }
    
        searchButton.addEventListener('click', (event) => {
            event.preventDefault();
            const query = searchInput.value.toLowerCase();
            const searchUrl = `searchResults.html?query=${encodeURIComponent(query)}`;
            window.location.href = searchUrl;
        });
    
    
        const displayResults = (products) => {
            searchResults.innerHTML = '';
            if (products.length === 0) {
                searchResults.innerHTML = '<p>No products found.</p>';
                return;
            }
            products.forEach(product => {
                let id = product.sys.id;
                let image = product.fields.image.fields.file.url;
                let title = product.fields.title;
                let price = product.fields.price;
                let description = product.fields.description || '';
    
                // Truncate description if it exceeds 10 characters
                if (description.length > 10) {
                    description = description.substring(0, 10) + '...';
                }
        
                const productElement = document.createElement('div');
                productElement.classList.add('product-item');
                productElement.innerHTML = `
                    <a href="productDetails.html?id=${id}">
                        <img src="${image}" alt="${title}">
                    </a>
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <p class="product-price">$${price}</p>
                `;
                searchResults.appendChild(productElement);
            });
        };
        
    
        // Perform search if query is present in the URL
        if (query) {
            searchProducts(query);
        }
});