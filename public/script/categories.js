
document.addEventListener("DOMContentLoaded", () => {
    let categoriesSection = document.querySelector(".categories");


    //fetch products data
    async function fetchProducts() {
        try {
            const response = await fetch("products.json");
            const data = await response.json();
            //use products
            let products = data.items;
            products = products.map(item => {
                const { title, price, categories } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
            
                return { title, price, id, image, categories };
            });
            
            return products;

        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    function displayProductsByCategory(products) {
        const categories = {};

        products.forEach(product => {
            const category = product.categories;
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(product);
        });

        // Display each category and its products
        let categoryHTML = '';

        for (const [category, products] of Object.entries(categories)) {
            let productsHTML = '';

            products.forEach(product => {
                let {id, image, title, price} = product;

                if (title.length >15) {
                    title = `${title.substring(0, 15)}...`;
                }

                productsHTML += `
                <div class="product">
                    <a href="productDetails.html?id=${id}">
                        <img class="product-img" src="${image}" alt="${title}">
                        <div class="product-title">${title}</div>
                        <div class="product-price">$${price}</div>
                    </a>
                </div>
                `;
            });

            categoryHTML += `
            <div class="category">
                <h2 class="category-title">${category}</h2>
                <div class="category-products">
                    ${productsHTML}
                </div>
            </div>
            `;
        }


        categoriesSection.innerHTML = categoryHTML;
    }

    fetchProducts().then(products => {
        if (products) {
            displayProductsByCategory(products);
        }
    });
});




