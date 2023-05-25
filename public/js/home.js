/* Drop down box */
function show(anything) {
  document.querySelector('.textBox').value = anything;
}

const dropdown = document.querySelector('.dropdown');

dropdown.onclick = function () {
  dropdown.classList.toggle('active');
}

const myDiv = document.querySelector('.option');

document.addEventListener('mousedown', function (event) {
  if (!myDiv.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.classList.remove("active");
  }
});

/* Search bar box */
const input = document.querySelector('.div-search-bar input');
const suggestions = document.querySelector('.search-suggestions');

const searchSuggestions = [
  { name: 'Appliances Services', description: 'Service your home appliances', page: '/service?service=Appliances Service' },
  { name: 'Plumbing', description: 'Fix plumbing problems', page: '/service?service=Plumbing Service' },
  { name: 'Carpenter', description: 'Make old furniture new', page: '/service?service=Furniture Service' },
  { name: 'Electrician', description: 'Repair electric work', page: '/service?service=Electrical Service' },
  { name: 'Refrigerator', description: 'Service and repair', page: '/service?service=Appliances Service' },
  { name: 'AC', description: 'Service and repair', page: '/service?service=Appliances Service' },
  { name: 'Washing Machine', description: 'Service and repair', page: '/service?service=Appliances Service' },
  { name: 'TV', description: 'Service and repair', page: '/service?service=Appliances Service' }
];

function addSuggestions() {
  suggestions.innerHTML = "";
  searchSuggestions.forEach((suggestion) => {
    let li = `<li onclick="search('${suggestion.page}')">${suggestion.name} - <span>${suggestion.description}</span></li>`;
    suggestions.insertAdjacentHTML("beforeend", li);
  });
}

addSuggestions();

function search(page) {
  window.location.href = page;
}

input.addEventListener('focus', function () {
  suggestions.classList.add('active');
});

document.addEventListener('mousedown', function (event) {
  if (!input.contains(event.target) && !suggestions.contains(event.target)) {
    suggestions.classList.remove("active");
  }
});

input.addEventListener("keyup", () => {
  let arr = [];
  let searchWord = input.value.toLowerCase();
  if (!searchWord) {
    addSuggestions();
    return null;
  }

  arr = searchSuggestions.filter(suggestion => {
    return suggestion.name.toLowerCase().startsWith(searchWord);
  }).map((suggestion) => {
    return `<li onclick="search('${suggestion.page}')">${suggestion.name} - <span>${suggestion.description}</span></li>`;
  }).join("");

  suggestions.innerHTML = arr ? arr : `<p style="font-family: 'Inria Sans'; font-size: 16px; padding: 5px 10px; margin: 0px;">Oops! No Service found</p>`;
console.log(suggestions)});