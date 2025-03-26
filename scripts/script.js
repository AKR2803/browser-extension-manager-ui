const themeToggle = document.getElementById("theme-toggle");
const rootElement = document.documentElement;
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

// set theme based on user or system preferences
function setTheme(theme) {
    if (theme === 'dark') {
        rootElement.setAttribute('data-theme', 'dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
        localStorage.setItem('theme', 'dark');
    } else {
        rootElement.setAttribute('data-theme', 'light');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        localStorage.setItem('theme', 'light');
    }
}

// check for user preferences in local storage or set according to system preferences
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(systemPrefersDark ? 'dark' : 'light');
}

// toggle theme on button click
themeToggle.addEventListener('click', () => {
    const currentTheme = rootElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});


// ----------------Populating extension cards----------------

const extContainer = document.querySelector(".extension-container");
const allBtn = document.getElementById("all-btn");
const activeBtn = document.getElementById("active-btn");
const inactiveBtn = document.getElementById("inactive-btn");

let extensionsData = [];

// fetch data only once, when page loads (or reloads)
async function fetchExtensions(){
    try{
        const response = await fetch("../data.json");
        extensionsData = await response.json();
        renderExtensions("all");
        console.log("--------------------------> Fetch API triggered");
    } catch(e){
        throw new Error(`Following Error occured: ${e.message}`);
    }
}

// render the extensions based on the filter text ("all", "active", "inactive")
function renderExtensions(filterText = "all"){
    extContainer.innerHTML = "";

    let filteredData = extensionsData.filter(ext => 
        filterText === "all" ? true : filterText === "active" ? ext.isActive : !ext.isActive
    )

    if(filteredData.length > 0){
        filteredData.forEach((extension) => {
            extContainer.innerHTML += `
            <div class="extension-card">
                <div class="extension-header">
                    <img src="${extension.logo}" alt="logo">
                    <div class="extension-heading">
                        <h3 class="heading">${extension.name}</h3>
                        <p class="subheading">${extension.description}</p>
                    </div>
                </div>
                <div class="extension-footer">
                    <button type="button" class="remove-button" data-id="${extension.name}">Remove</button>
                    <label class="toggle-switch">
                        <input type="checkbox" ${extension.isActive ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            `;
        });
    } else{
        extContainer.innerHTML = "No Extensions Avaialble!";
    }

    // we set an attribute "data-id" to uniquely identify extensions and be able to use the remove buttons using event listeners
    document.querySelectorAll(".remove-button").forEach(button => {
        button.addEventListener('click', () => {
            removeExtension(button.getAttribute("data-id"));
        })
    })
}

// setting the styling for active button(using .active class css)
function setActiveButton(button){
    document.querySelectorAll(".filter-button").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
}

allBtn.addEventListener('click', () => {
    setActiveButton(allBtn);
    renderExtensions("all");
})

activeBtn.addEventListener('click', () => {
    setActiveButton(activeBtn);
    renderExtensions("active");
})

inactiveBtn.addEventListener('click', () => {
    setActiveButton(inactiveBtn);
    renderExtensions("inactive");
})

// fetch extensions initially
fetchExtensions();

// dataid is nothing but a unique id to each extension, here we have take the extension name as the dataid
function removeExtension(dataid){
    // remove the extension from the list
    extensionsData = extensionsData.filter(ext => ext.name != dataid);

    // re-render the list
    // get what filter is applied when removing the extension, accordingly re-render the list
    // for example if removing extensions during "active" filter, that means the filtertext of "active", we extract this "active" from the button `id`
    // i.e. "active-btn", we replace the "-btn" with "", hence getting the required filterText, i.e. "active" in this case.
    renderExtensions(document.querySelector(".filter-button.active").id.replace("-btn",""));
}