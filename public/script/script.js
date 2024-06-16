

let slider = document.querySelector('.slider .list');
let items = document.querySelectorAll('.item');
let next = document.getElementById('next');
let prev = document.getElementById('prev');
let dotsContainer = document.querySelector('.dots');

let lengthItems = items.length - 1;
let active = 0;

// Clear existing dots
dotsContainer.innerHTML = '';

// Generate dots dynamically
for (let i = 0; i < items.length; i++) {
    let dot = document.createElement('li');
    if(i===0) dot.classList.add(active);
    dotsContainer.appendChild(dot);
}

let dots = document.querySelectorAll('.slider .dots li');

next.onclick = function () {
    active = active <= lengthItems  ?  active + 1 : 0;
    reloadSlider();
}

prev.onclick = function () {
    active = active - 1 >= 0 ?  active - 1 : lengthItems ;
    reloadSlider();
}

let refreshInterval = setInterval(() => { next.click() }, 3000);

//load slider from left
function reloadSlider() {
    slider.style.transform = `translateX(-${items[active].offsetLeft}px)`;

    let last_active_dot = document.querySelector('.slider .dots li.active');
    if (last_active_dot) last_active_dot.classList.remove('active');
    dots[active].classList.add('active');

    clearInterval(refreshInterval);
    refreshInterval = setInterval(() => { next.click() }, 3000);
}

dots.forEach((li, key) => {
    li.addEventListener('click', () => {
        active = key;
        reloadSlider();
    });
});

window.onresize = function () {
    reloadSlider();
};



//search function
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-btn');

searchButton.addEventListener('click', (event) => {
    event.preventDefault();
    const query = searchInput.value.toLowerCase();
    if (query) {
        const searchUrl = `searchResults.html?query=${encodeURIComponent(query)}`;
        window.location.href = searchUrl;
    }
    searchInput.value= "";
});