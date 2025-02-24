document.getElementById("phone-input").addEventListener("input", function (e) {
  var x = e.target.value
    .replace(/\D/g, "")
    .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
  e.target.value = !x[2] ? x[1] : `${x[1]} ${x[2]}${x[3] ? " " + x[3] : ""}`;
});
function startTimer(duration, display) {
  var timer = duration,
    hours,
    minutes,
    seconds;
  setInterval(function () {
    hours = parseInt(timer / 3600, 10);
    minutes = parseInt((timer % 3600) / 60, 10);
    seconds = parseInt(timer % 60, 10);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = hours + "h :" + minutes + "min";

    if (--timer < 0) {
      timer = duration;
    }
  }, 1000);
}
document.addEventListener("DOMContentLoaded", function () {
  var tripType = localStorage.getItem("tripType");
  var flightClassText = tripType === "One Way" ? "OW" : "RT";

  // Update the text based on the trip type
  if (tripType === "One Way") {
    document.querySelector(".price-content p").textContent =
      "Business Class, One Way, Total";
  } else {
    document.querySelector(".price-content p").textContent =
      "Business Class, Round Trip, Total";
  }
  // Array of airline objects with name and logo URL
  var airlines = [
    { name: "Emirates", logoUrl: "assets/emirates-logo.png" },
    { name: "Qatar", logoUrl: "assets/qatar-logo.png" },
    { name: "Etihad", logoUrl: "assets/etihad-logo.png" },
    { name: "Delta", logoUrl: "assets/delta-logo.png" },
    { name: "United", logoUrl: "assets/united-logo.png" },
    { name: "Turkish", logoUrl: "assets/turkish-logo.png" },
  ];

  var previousAirline = null; // Variable to store the previously selected airline
  var prePreviousAirline = null; // Variable to store the airline before the previous one

  // Function to generate a random integer between min and max (inclusive)
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Function to calculate the discounted price
  function calculateDiscountedPrice(basePrice) {
    return tripType === "One Way" ? basePrice * 0.4 : basePrice;
  }

  // Function to generate random deals
function generateRandomDeals() {
  var dealsContainer = document.getElementById("deals-container");
  dealsContainer.innerHTML = ""; // Clear existing content

  for (var i = 0; i < 3; i++) {
    // Generate 3 random deals
    var randomIndex;
    do {
      randomIndex = getRandomInt(0, airlines.length - 1);
    } while (
      airlines[randomIndex].name === previousAirline ||
      airlines[randomIndex].name === prePreviousAirline
    ); // Ensure no consecutive same airlines

    var airline = airlines[randomIndex];
    var basePrice = getRandomInt(1800, 2500); // Generate random base price

    // Adjust the price for one-way flights
    if (tripType === "One Way") {
      basePrice *= 0.6; // Apply a 60% discount for one-way flights
    }

    // Create deal element
    var dealElement = document.createElement("div");
    dealElement.classList.add("airline-deal");
    dealElement.innerHTML = `
      <img src="${airline.logoUrl}" class="airline-logo-deal">
      <div class="airline-name">${airline.name}</div>
      <div class="airline-price" data-base-price="${basePrice}">$${basePrice}.00<span class="tooltip"> *</span></div>
      <div class="flight-class">Business Class, ${flightClassText}, Total</div>
    `;

    // Append deal to deals container
    dealsContainer.appendChild(dealElement);

    // Update previousAirline and prePreviousAirline variables
    prePreviousAirline = previousAirline;
    previousAirline = airline.name;
  }
}

  // Generate random deals when the page loads
  generateRandomDeals();
});

document.addEventListener("DOMContentLoaded", function () {
  // Function to generate a random price between $2000 and $2500
  function generateRandomPrice() {
    return Math.floor(Math.random() * (2500 - 2000 + 1)) + 2000;
  }

  // Function to calculate 15% more than the random price
  function calculateOldPrice(randomPrice) {
    return Math.round(randomPrice * 1.15);
  }

  // Function to get the current time in EST
  function getCurrentTimeEST() {
    var currentTime = new Date();
    var utcOffset = 0; // EST offset from UTC is -5 hours
    var estTime = new Date(currentTime.getTime() + utcOffset * 3600 * 1000);
    return estTime;
  }

  // Function to calculate the time remaining until midnight EST
  function getTimeUntilMidnightEST() {
    var currentTime = getCurrentTimeEST();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();

    // Calculate the time until midnight EST
    var timeUntilMidnightEST =
      (24 - (hours % 24) - 1) * 3600 + (59 - minutes) * 60 + (60 - seconds);
    return timeUntilMidnightEST;
  }

  // Function to update the timer display
  function updateTimer() {
    var timeUntilReset = getTimeUntilMidnightEST();
    var hours = Math.floor(timeUntilReset / 3600);
    var minutes = Math.floor((timeUntilReset % 3600) / 60);
    document.getElementById("timer").textContent = `${("0" + hours).slice(
      -2
    )}h : ${("0" + minutes).slice(-2)}m`;
  }

  // Function to reset the prices and update the timer
  function resetPricesAndTimer() {
    // Update the timer display
    updateTimer();
  
    // Get the destination from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const toDestination = urlParams.get("toAirport");
    var tripType = localStorage.getItem("tripType");
  
    // Retrieve the stored prices for "to" destinations
    let destinationPrices =
      JSON.parse(localStorage.getItem("destinationPrices")) || {};
  
    // Generate a new random price if the destination doesn't have one yet
    if (!destinationPrices.hasOwnProperty(toDestination)) {
      let randomPrice;
  
      // Adjust the random price based on specific countries
      switch (toDestination.toUpperCase()) {
        case "AUSTRALIA":
          randomPrice = Math.floor(Math.random() * (3500 - 3000 + 1)) + 3000;
          break;
        case "INDIA":
        case "UAE":
          randomPrice = Math.floor(Math.random() * (3500 - 2500 + 1)) + 2500;
          break;
        case "SINGAPORE":
        case "TOKYO":
        case "VIETNAM":
          randomPrice = Math.floor(Math.random() * (3000 - 2500 + 1)) + 2500;
          break;
        case "THAILAND":
        case "INDONESIA":
        case "MALDIVES":
          randomPrice = Math.floor(Math.random() * (3500 - 3000 + 1)) + 3000;
          break;
        default:
          // For other destinations, use the default random price range
          randomPrice = generateRandomPrice();
          break;
      }
  
      destinationPrices[toDestination] = randomPrice;
      localStorage.setItem(
        "destinationPrices",
        JSON.stringify(destinationPrices)
      );
    }
  
    // Calculate the old price as 15% more than the random price
    let randomPrice = destinationPrices[toDestination];
  
    // Discount the random price by 60% for one-way trips
    if (tripType === "One Way") {
      randomPrice *= 0.6; // 60% discount
      randomPrice = Math.round(randomPrice);
    }
  
    let oldPrice = calculateOldPrice(randomPrice);
  
    // Display the prices
    document.getElementById("flightPrice").textContent = `$${randomPrice}.00*`;
    document.querySelector(".old-price").textContent = `old price: $${oldPrice}.00`;
  }
  
  // Initialize the timer and prices at the start
  resetPricesAndTimer();

  // Update the timer every second
  setInterval(updateTimer, 1000);

  // Reset the prices and timer at midnight EST
  setInterval(resetPricesAndTimer, getTimeUntilMidnightEST() * 1000);
});

document.addEventListener("DOMContentLoaded", function () {
  // Function to generate random additional price
  function getRandomAdditionalPrice(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // Get all price elements
  const priceElements = document.querySelectorAll(".airline-price");

  // Update each price element with a random additional price
  priceElements.forEach((priceElement) => {
    const basePrice = parseInt(
      priceElement.getAttribute("data-base-price"),
      10
    );
    const additionalPrice = getRandomAdditionalPrice(100, 1000);
    const newPrice = basePrice + additionalPrice;
    priceElement.textContent = `$${newPrice.toFixed(2)}*`;
  });
});

const multiCityOption = document.querySelector('.menu li:nth-child(3)'); // Select the "Multi City" option
const returnInput = document.getElementById('return'); // Select the return date input
const addSegmentButton = document.getElementById('addSegmentButton'); // Select the + button
const multiCitySection = document.getElementById('multiCitySection'); // Select the container for multi-city options

let multiCityCount = 0; // Variable to track the number of multi-city options

multiCityOption.addEventListener('click', function() {
  addSegmentButton.style.display = 'block'; // Show the "+" button
});

const tripTypeSelector = document.querySelector('ul.menu');

// Event listener for trip type selection
tripTypeSelector.addEventListener('click', function(event) {
  const selectedTripType = event.target.textContent.trim();
  if (selectedTripType === 'Round Trip') {
    multiCitySection.innerHTML = ''; // Remove all multi-city options
    addSegmentButton.style.display = 'none'; // Hide the + button
    multiCityCount = 0; // Reset the multi-city count
    returnInput.disabled = false; // Enable the return date input
    returnInput.style.backgroundColor = ""; // Reset background color
    returnInput.placeholder = "Arrival Date"; // Reset placeholder
  } else if (selectedTripType === 'Multi City') {
    multiCitySection.innerHTML = ''; // Remove all multi-city options
    addSegmentButton.style.display = 'block'; // Show the + button
    returnInput.disabled = true; // Disable the return date input
    returnInput.style.backgroundColor = "rgba(0,0,0,0.1)"; // Grey out the return date input
    returnInput.placeholder = ""; // Remove placeholder
  } else if (selectedTripType === 'One Way') {
    multiCitySection.innerHTML = ''; // Remove all multi-city options
    returnInput.disabled = true; // Disable the return date input
    returnInput.style.backgroundColor = "rgba(0,0,0,0.1)"; // Grey out the return date input
    returnInput.placeholder = ""; // Remove placeholder
  }
});


// Hide the "+" button when other options are selected
document.querySelectorAll('.menu li').forEach(function(item, index) {
  if (index !== 2) { // Skip the "Multi City" option
    item.addEventListener('click', function() {
      addSegmentButton.style.display = 'none'; // Hide the "+" button
      returnInput.disabled = false; // Enable the return date input
      returnInput.style.backgroundColor = ""; // Reset background color
      returnInput.placeholder = "Arrival Date"; // Reset placeholder
    });
  }
});

// Add a new multi-city option when the + button is clicked
addSegmentButton.addEventListener('click', function() {
  if (multiCityCount < 2) { // Check if the maximum number of multi-city options has been reached
    // Create a div to hold the three inputs and the trash icon
    const multiCityDiv = document.createElement('div');
    multiCityDiv.classList.add('form-section', 'row', 'multi-city');

    // Create the "From" input
    const fromDiv = document.createElement('div');
    fromDiv.classList.add('third');
    fromDiv.innerHTML = `
      <label for="fromMultiCity">From</label>
      <input type="text" id="fromMultiCity" placeholder="Departure" required>
      <ul class="autocomplete-dropdown" id="fromAutocompleteDropdown"></ul>`;
    multiCityDiv.appendChild(fromDiv);

    // Create the "To" input
    const toDiv = document.createElement('div');
    toDiv.classList.add('third');
    toDiv.innerHTML = `
      <label for="toMultiCity">To</label>
      <input type="text" id="toMultiCity" placeholder="Arrival" required>
      <ul class="autocomplete-dropdown" id="toAutocompleteDropdown"></ul>`;
    multiCityDiv.appendChild(toDiv);

    // Create the "Departure Date" input
    const departureDiv = document.createElement('div');
    departureDiv.classList.add('third');
    departureDiv.innerHTML = `
      <label for="departureMultiCity">Departure</label>
      <input type="date" id="departureMultiCity" required>`;
    multiCityDiv.appendChild(departureDiv);

    // Append the new div to the form
    multiCitySection.appendChild(multiCityDiv);

    multiCityCount++; // Increment the multi-city count

    if (multiCityCount >= 2) {
      addSegmentButton.style.display = 'none'; // Hide the + button if the maximum number of options is reached
    }

    // Create the trash icon
    const trashIcon = document.createElement('i');
    trashIcon.classList.add('fa', 'fa-trash', 'trash-icon');
    trashIcon.addEventListener('click', function() {
      // Remove the multi-city option when the trash icon is clicked
      multiCitySection.removeChild(multiCityDiv);
      multiCityCount--; // Decrement the multi-city count
      addSegmentButton.style.display = 'block'; // Show the "+" button if it was hidden
    });
    multiCityDiv.appendChild(trashIcon);
  }
});
// Function to fetch autocomplete suggestions
function fetchAutocompleteResults(searchTerm) {
  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json?types=poi&autocomplete=true&limit=5&language=en&access_token=pk.eyJ1IjoiYnVzaW5lc3NmbHllciIsImEiOiJjbHZ2bWdkZ2IwM2hrMmxxc3k4d254ZXFtIn0.GzyAnHfIuZM0Llx66w5bWw`;

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      // Filter features to include only airports
      const airports = data.features.filter(feature => feature.properties.category === 'airport');
      
      // Extract airport names and city + airport codes from the filtered features
      return airports.map(airport => ({
        name: airport.text,
        cityCode: airport.context.find(c => c.id.startsWith('place')).text
      }));
    });
}
// Event listener for input field changes in multi-city divs
multiCitySection.addEventListener('input', function(event) {
  const targetId = event.target.id;
  if (targetId.startsWith('fromMultiCity') || targetId.startsWith('toMultiCity')) {
    const searchTerm = event.target.value;
    const dropdownId = targetId.replace('MultiCity', 'AutocompleteDropdown');
    fetchAutocompleteResults(searchTerm, dropdownId);
  }
});
// Event listener for input field changes
document.getElementById('from').addEventListener('input', function() {
  const searchTerm = this.value;

  fetchAutocompleteResults(searchTerm)
    .then(results => {
      const dropdown = document.getElementById('fromAutocompleteDropdown');
      dropdown.innerHTML = ''; // Clear previous results

      // Create and append list items for each result
      results.forEach(result => {
        const li = document.createElement('li');
        li.textContent = result.name; // Display entire airport name in dropdown
        li.addEventListener('click', () => {
          // Use city + airport code in the input field
          document.getElementById('from').value = `${result.cityCode} (${result.name})`; 
          
          // Hide the dropdown
          dropdown.style.display = 'none';
        });
        dropdown.appendChild(li);
      });

      // Display the dropdown if there are results
      dropdown.style.display = results.length ? 'block' : 'none';
    });
});

// Event listener for input field changes
document.getElementById('to').addEventListener('input', function() {
  const searchTerm = document.getElementById('to').value;

  fetchAutocompleteResults(searchTerm)
    .then(results => {
      const dropdown = document.getElementById('toAutocompleteDropdown');
      dropdown.innerHTML = ''; // Clear previous results

      // Create and append list items for each result
      results.forEach(result => {
        const li = document.createElement('li');
        li.textContent = result.name; // Display entire airport name in dropdown
        li.addEventListener('click', () => {
          // Use city + airport code in the input field
          document.getElementById('to').value = `${result.cityCode} (${result.name})`; 
          
          // Hide the dropdown
          dropdown.style.display = 'none';
        });
        dropdown.appendChild(li);
      });

      // Display the dropdown if there are results
      dropdown.style.display = results.length ? 'block' : 'none';
    });
});
// Hide the dropdown when clicking outside of it
document.addEventListener('click', function(event) {
  const fromDropdown = document.getElementById('fromAutocompleteDropdown');
  const toDropdown = document.getElementById('toAutocompleteDropdown');
  
  if (!event.target.closest('#from') && !event.target.closest('#fromAutocompleteDropdown')) {
    fromDropdown.style.display = 'none';
  }
  if (!event.target.closest('#to') && !event.target.closest('#toAutocompleteDropdown')) {
    toDropdown.style.display = 'none';
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const fromAirport = params.get("fromAirport");
  const toAirport = params.get("toAirport");
  const departureDate = params.get("departureDate");
  const returnDate = params.get("returnDate");
  const tripType = params.get("tripType"); // 'Round-Trip' or 'One-Way'
  const passengers = params.get("passengers"); // Number of passengers
  const cityCode = params.get("cityCode");

  if (fromAirport && toAirport) {
    // Extract the city name from 'toAirport' (assuming city name is before the parentheses)
    const toCity = toAirport.substring(0, toAirport.indexOf("(")).trim();
    const fromCity = fromAirport.substring(0, fromAirport.indexOf("(")).trim();

    document.getElementById("from").placeholder = fromCity;
    document.getElementById("to").placeholder = toCity;
    const h1Element = document.querySelector(".price-content h1");
    h1Element.innerHTML = `${fromCity} →<br> ${toCity}`;

    // Use the city code here
    if (cityCode) {
      // Do something with the city code
    }
  }
  // Dynamically set the destination in the "OTHER DEALS TO" header
  if (toAirport) {
    const toCity = toAirport.substring(0, toAirport.indexOf("(")).trim();
    document.getElementById("destination-city").textContent = toCity;
  }
  // Set dates in date inputs
  document.getElementById("departure").value = departureDate || "";
  const returnInput = document.getElementById("return");
  returnInput.value = returnDate || "";
  if (!tripType) {
    tripType = "Round-Trip";
  }
  if (!returnDate || tripType === "One-Way") {
    returnInput.disabled = true;
    returnInput.style.backgroundColor = "rgba(0,0,0,0.1)";
  } else if (tripType === "Round-Trip") {
    returnInput.disabled = false;
    returnInput.style.backgroundColor = "";
  }
  // Update the display and active selection for trip type and passengers
  updateDropdown(".dropdown:nth-child(1)", tripType.replace("-", " ")); // Adjust if tripType has hyphen
  updateDropdown(
    ".dropdown:nth-child(2)",
    passengers > 6
      ? "6+ Passengers"
      : `${passengers} Passenger${passengers > 1 ? "s" : ""}`
  );
});

// Handles updating dropdown selected text and active states
function updateDropdown(dropdownSelector, value) {
  const dropdown = document.querySelector(dropdownSelector);
  const selected = dropdown.querySelector(".selected");
  const items = dropdown.querySelectorAll("li");

  selected.textContent = value; // Update the visible selected display
  items.forEach((item) => {
    item.classList.remove("active"); // Remove active from all first
    if (item.textContent === value) {
      item.classList.add("active"); // Set active where text matches
    }
  });
}

// To handle dropdown interactions
const dropdowns = document.querySelectorAll(".dropdown");
dropdowns.forEach((dropdown) => {
  const select = dropdown.querySelector(".select");
  const caret = dropdown.querySelector(".caret");
  const menu = dropdown.querySelector(".menu");
  const options = menu.querySelectorAll("li");
  const selected = select.querySelector(".selected");

  select.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevents the document event from firing when clicking the select
    const isCurrentlyOpen = menu.classList.contains("menu-open");
    closeAllDropdowns(); // Close all dropdowns first
    if (!isCurrentlyOpen) {
      menu.classList.add("menu-open"); // Only open the menu if it was not already open
      caret.classList.add("caret-rotate");
    }
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      selected.innerText = option.innerText;
      options.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      closeAllDropdowns(); // Close dropdown after selection
      if (selected.innerText === "One Way") {
        document.getElementById("return").disabled = true;
        document.getElementById("return").style.backgroundColor =
          "rgba(0,0,0,0.1)";
        document.getElementById("return").value = "";
        document.getElementById("return").placeholder = "";
      } else {
        document.getElementById("return").disabled = false;
        document.getElementById("return").style.backgroundColor = "";
        document.getElementById("return").placeholder = "mm/dd/yyyy";
      }
    });
    
  });
});
// Object to store prices for each destination
const destinationPrices = {
  Sydney: 2990.0,
  Dubai: 2830.0,
  Paris: 2550.0,
  Singapore: 2480.0,
  Switzerland: 2750.0,
  Antarctica: 3000.0,
};
// Update destination name, price, and hero image in HTML elements
function updateDestinationDetails(cityName) {
  // Update destination name and price
  document.querySelector(".price-content h1").textContent = cityName;
  const oldPrice = destinationPrices[cityName];
  const discountedPrice = calculateDiscountedPrice(oldPrice);
  document.querySelector(
    ".old-price"
  ).textContent = `old price: $${oldPrice.toFixed(2)}`;
  document.querySelector("h2").textContent = `$${discountedPrice.toFixed(2)}*`;

  // Update hero image
  const heroImageElement = document.querySelector(".hero-image");
  const imageUrl = `url('assets/${cityName.toLowerCase()}.jpg')`;
  heroImageElement.style.backgroundImage = imageUrl;

  document.getElementById("destination-city").textContent = cityName;
}

// Example function to calculate discounted price
function calculateDiscountedPrice(oldPrice) {
  // Example calculation for discounted price
  // You can replace this with your own logic
  const discountPercentage = 0.15; // 15% discount
  return oldPrice * (1 - discountPercentage);
}

// In search-results.js
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const cityName = urlParams.get("city");
  if (cityName) {
    updateDestinationDetails(cityName);
  }
});

// Function to close all dropdowns
function closeAllDropdowns() {
  dropdowns.forEach((dropdown) => {
    const menu = dropdown.querySelector(".menu");
    const caret = dropdown.querySelector(".caret");
    menu.classList.remove("menu-open");
    caret.classList.remove("caret-rotate");
  });
}
document.addEventListener("DOMContentLoaded", function () {
  // Initialize any actions on load
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission behavior
      if (form.id === "subscribeForm") {
        handleSubscribe(); // Call your custom function for the subscribe form
      } else if (form.id === "quoteForm") {
        submitQuote(); // Call your custom function for the quote form
      }
    });
  });
});
document.querySelector(".subscribe-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the form from submitting normally

  const form = event.target;

  fetch(form.action, {
    method: form.method,
    body: new FormData(form),
    headers: {
      'Accept': 'application/json'
    }
  }).then(response => {
    if (response.ok) {
      Swal.fire({
        title: "Thank you for subscribing!",
        text: "You will now receive updates directly to your inbox.",
        icon: "success",
        confirmButtonText: "Close",
      }).then((result) => {
        if (result.isConfirmed) {
          form.reset(); // Reset the form fields
        }
      });
    } else {
      response.json().then(data => {
        if (Object.hasOwn(data, 'errors')) {
          Swal.fire({
            title: "Error!",
            text: data["errors"].map(error => error["message"]).join(", "),
            icon: "error",
            confirmButtonText: "Close",
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "There was an error sending your subscription. Please try again later.",
            icon: "error",
            confirmButtonText: "Close",
          });
        }
      });
    }
  }).catch(error => {
    Swal.fire({
      title: "Error!",
      text: "There was an error sending your subscription. Please try again later.",
      icon: "error",
      confirmButtonText: "Close",
    });
  });
});
function submitQuote() {
  const inputs = document.querySelectorAll("#quoteForm input[required]:not(:disabled)");
  let allFieldsFilled = true;
  let validationMessage = "Please fill in this field.";

  // Remove existing error messages
  document.querySelectorAll(".error-message").forEach((element) => {
    element.parentNode.removeChild(element);
  });

  // Determine the trip type
  const tripType = document.querySelector(".selected") ? document.querySelector(".selected").textContent.trim() : "";

  inputs.forEach((input) => {
    // Reset previous styles
    input.style.borderColor = "";
    input.classList.remove("error");

    // Autofill 'from' and 'to' if empty using their placeholders
    if ((input.id === "from" || input.id === "to") && !input.value) {
      input.value = input.placeholder;
    }

    // Check if required fields are filled, exempting the return date for 'One Way' trips
    if (!input.value && !(input.id === "return" && tripType === "One Way")) {
      input.style.borderColor = "red";
      input.classList.add("error");
      allFieldsFilled = false;

      // Add error message below input
      const errorMessage = document.createElement("div");
      errorMessage.textContent = validationMessage;
      errorMessage.classList.add("error-message");
      errorMessage.style.color = "red";
      input.parentNode.insertBefore(errorMessage, input.nextSibling);
    }
  });

  if (allFieldsFilled) {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const departure = document.getElementById('departure').value;
    const returnDate = document.getElementById('return').value;
    const name = document.querySelector('.personal-info input[type="text"]').value;
    const email = document.querySelector('.personal-info input[type="email"]').value;
    const phone = document.getElementById('phone-input').value;

    // Prepare the form data
    const formData = new FormData();
    formData.append('From', from);
    formData.append('To', to);
    formData.append('Departure Date', departure);
    formData.append('Return Date', returnDate);
    formData.append('Name', name);
    formData.append('Email', email);
    formData.append('Phone', phone);

    fetch('https://formspree.io/f/mldrebve', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "A travel advisor will contact you soon.",
          icon: "success",
          confirmButtonText: "OK",
        }).then((result) => {
          if (result.isConfirmed) {
            document.getElementById('quoteForm').reset(); // Reset the form fields
          }
        });
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            Swal.fire({
              title: "Error!",
              text: data["errors"].map(error => error["message"]).join(", "),
              icon: "error",
              confirmButtonText: "Close",
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: "There was an error sending your quote request. Please try again later.",
              icon: "error",
              confirmButtonText: "Close",
            });
          }
        });
      }
    }).catch(error => {
      Swal.fire({
        title: "Error!",
        text: "There was an error sending your quote request. Please try again later.",
        icon: "error",
        confirmButtonText: "Close",
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Get all select elements within .third containers
  const selects = document.querySelectorAll(".flight-details .third select");

  // Add event listeners to each select element
  selects.forEach((select) => {
    select.addEventListener("focus", () => {
      select.parentNode.classList.add("focused");
    });
    select.addEventListener("blur", () => {
      select.parentNode.classList.remove("focused");
    });
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector("nav");
  window.addEventListener("scroll", function () {
    // Check if page is scrolled more than 50 pixels and window width is greater than 600px
    if (window.scrollY > 50 && window.innerWidth > 600) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
});

// Disable scrolling on the body and any other scrollable elements
function disableScroll() {
  document.body.style.overflow = "hidden";
  // Add similar lines for other scrollable elements if necessary
  // document.querySelector('.scrollable-element').style.overflow = 'hidden';
}

// Enable scrolling on the body and any other scrollable elements
function enableScroll() {
  document.documentElement.style.overflow = "auto"; // for the html element
  document.body.style.overflow = "auto";
}
// Call disableScroll as soon as possible
disableScroll();
window.addEventListener("load", function () {
  setTimeout(() => {
    // Wait for 2 seconds after the page has loaded
    const loader = document.querySelector(".loader-wrapper");
    loader.style.opacity = 0;
    setTimeout(() => {
      loader.style.display = "none";
      enableScroll();
    }, 1000); // Additional time for the fade-out transition
  }, 1000); // Minimum display time for the loader
});
document.getElementById("tripType").addEventListener("click", function (event) {
  if (event.target.classList.contains("trip-option-form")) {
    // Remove active class from all options
    document.querySelectorAll(".trip-option-form").forEach(function (option) {
      option.classList.remove("active");
    });
    // Add active class to clicked option
    event.target.classList.add("active");
    // Optionally handle the value
    console.log("Selected Trip Type:", event.target.dataset.value);
    // If you need to use this value for further processing, you can set it on a hidden input or form data
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var menuIcon = document.querySelector(".menu-icon a");
  var navLinks = document.querySelectorAll(".nav__links a");
  var navLinksContainer = document.querySelector(".nav__links");
  var navContact = document.querySelector(".nav__contact");
  var navLogo = document.querySelector(".nav__logo");
  var navLogoMobile = document.querySelector(".nav__logo-mobile");

  // Function to toggle the mobile navigation
  function toggleMenu() {
    if (navLinksContainer.style.transform === "translateY(0%)") {
      navLinksContainer.style.transform = "translateY(-100%)"; // Hide it
      navContact.style.display = "none"; // Hide nav contact
      navLogoMobile.style.display = "none"; // Hide mobile logo
      navLogo.style.opacity = "1";
      document.body.style.overflow = "auto"; // Allow scrolling on the body
    } else {
      navLinksContainer.style.transform = "translateY(0%)"; // Show it
      navContact.style.display = "block"; // Show nav contact
      navLogoMobile.style.display = "block"; // Show mobile logo
      navLogo.style.opacity = "0";
      document.body.style.overflow = "hidden"; // Disable scrolling on the body
    }
  }

  // Function to set active class on clicked link and handle navigation
  function handleNavLinkClick(event) {
    // Remove 'active' class from all links
    navLinks.forEach((link) => link.classList.remove("active"));

    // Add 'active' class to clicked link
    this.classList.add("active");

    // Navigate to the section linked by the anchor
    const hash = this.getAttribute("href");
    const target = document.querySelector(hash);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 60, // Offset by header height
        behavior: "smooth",
      });
    }

    // If in mobile view and menu is open, toggle the menu closed
    if (
      window.innerWidth <= 600 &&
      navLinksContainer.style.transform === "translateY(0%)"
    ) {
      toggleMenu();
    }
  }

  // Attach event listeners
  menuIcon.addEventListener("click", toggleMenu);
  navLinks.forEach((link) =>
    link.addEventListener("click", handleNavLinkClick)
  );
});

// Keep this structure. You won't need the 'description' property anymore since it's static.
const destinations = {
  turkey: {
    imageUrl: "assets/trending-card-1.jpeg",
    name: "Turkey",
    price: "$2325",
  },
  vietnam: {
    imageUrl: "assets/trending-card-2.jpeg",
    name: "Vietnam",
    price: "$1449",
  },
  carribean: {
    imageUrl: "assets/trending-card-3.jpeg",
    name: "Carribean",
    price: "$2165",
  },
  dubai: {
    imageUrl: "assets/trending-card-4.jpeg",
    name: "Dubai",
    price: "$2775",
  },
  singapore: {
    imageUrl: "assets/trending-card-5.jpeg",
    name: "Singapore",
    price: "$2959",
  },
  tokyo: {
    imageUrl: "assets/trending-card-6.jpeg",
    name: "Tokyo",
    price: "$2899",
  },
  japan: {
    imageUrl: "assets/trending-card-8.jpeg",
    name: "Japan",
    price: "$1535",
  },
  delhi: {
    imageUrl: "assets/trending-card-7.jpeg",
    name: "Delhi",
    price: "$1909",
  },
  frankfurt: {
    imageUrl: "assets/trending-card-9.jpeg",
    name: "Frankfurt",
    price: "$1039",
  },
  amsterdam: {
    imageUrl: "assets/trending-card-10.jpeg",
    name: "Amsterdam",
    price: "$1635",
  },
  sydney: {
    imageUrl: "assets/trending-card-11.jpeg",
    name: "Sydney",
    price: "$2899",
  },
  cairo: {
    imageUrl: "assets/trending-card-12.jpg",
    name: "Cairo",
    price: "$2325",
  },
};

// Get the modal
var modal = document.getElementById("myModal");

// Get all elements with the class 'trending__card'
var cards = document.getElementsByClassName("trending__card");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Function to populate and open modal
var openModal = function () {
  var destinationId = this.getAttribute("data-destination");
  var data = destinations[destinationId];

  var modalLeft = document.querySelector(".modal-left");
  modalLeft.style.backgroundImage = `url(${data.imageUrl})`; // Make sure URLs are correct

  document.getElementById(
    "modalDestinationName"
  ).innerText = `Fly to ${data.name} in Business Class up to 77% OFF`;
  document.getElementById("modalPrice").innerText = `${data.price}`;

  modal.style.display = "block"; // This should only be called here
  document.body.classList.add("no-scroll");
};

// Function to close modal
var closeModal = function () {
  modal.style.display = "none";
  document.body.classList.remove("no-scroll");
};

// Attach openModal function to click event of each card
for (var i = 0; i < cards.length; i++) {
  cards[i].addEventListener("click", openModal);
}

// When the user clicks on <span> (x), close the modal
span.onclick = closeModal;

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    closeModal();
  }
};
document.addEventListener("DOMContentLoaded", function () {
  var swiper = new Swiper(".mySwiper", {
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Access the 'From' input
  var inputFrom = document.getElementById("from");
  var autocompleteFrom = new google.maps.places.Autocomplete(inputFrom, {
    types: ["(cities)"], // Suggests cities from all over the world
  });

  // Listen for when a place is selected from the 'From' input
  autocompleteFrom.addListener("place_changed", function () {
    var place = autocompleteFrom.getPlace();
    console.log("Place from:", place); // Example action: logging the selected place
  });

  // Access the 'To' input
  var inputTo = document.getElementById("to");
  var autocompleteTo = new google.maps.places.Autocomplete(inputTo, {
    types: ["(cities)"], // Suggests cities from all over the world
  });

  // Listen for when a place is selected from the 'To' input
  autocompleteTo.addListener("place_changed", function () {
    var place = autocompleteTo.getPlace();
    console.log("Place to:", place); // Example action: logging the selected place
  });
});
document.getElementById("roundTrip").addEventListener("click", function () {
  this.classList.add("active");
  document.getElementById("oneWay").classList.remove("active");
  document.getElementById("returnDate").disabled = false;
});

document.getElementById("oneWay").addEventListener("click", function () {
  this.classList.add("active");
  document.getElementById("roundTrip").classList.remove("active");
  document.getElementById("returnDate").disabled = true;
});

// Initialize as round trip
document.getElementById("returnDate").disabled = false;
document.addEventListener("DOMContentLoaded", function () {
  var departureInput = document.getElementById("departureDate");
  var returnInput = document.getElementById("returnDate");
  var today = new Date();
  var day = today.getDate();
  var month = today.getMonth() + 1; // JavaScript months are 0-based.
  var year = today.getFullYear();

  // Ensuring two digits for day and month
  if (day < 10) day = "0" + day;
  if (month < 10) month = "0" + month;

  var todayFormatted = `${year}-${month}-${day}`;
  departureInput.setAttribute("min", todayFormatted);
  returnInput.setAttribute("min", todayFormatted);
});
ScrollReveal().reveal(".subscribeForm", {
  ...scrollRevealOption,
});

ScrollReveal().reveal(".step", {
  ...scrollRevealOption,
  delay: 500,
});

// trending container
/*ScrollReveal().reveal(".trending__card", {
    ...scrollRevealOption,
    interval: 500,
  });*/

// destination container
ScrollReveal().reveal(".destination__card", {
  duration: 1000,
  interval: 500,
});

// seller container
ScrollReveal().reveal(".seller__card", {
  ...scrollRevealOption,
  interval: 500,
});

// guide container
ScrollReveal().reveal(".guide__card", {
  ...scrollRevealOption,
  interval: 500,
});

//  client container
ScrollReveal().reveal(".client__card", {
  ...scrollRevealOption,
  interval: 500,
});

ScrollReveal().reveal(".step", {
  ...scrollRevealOption,
  interval: 300,
});
ScrollReveal().reveal(".line img", {
  ...scrollRevealOption,
  delay: 1000, // Delay line images more than the steps
  interval: 300,
});
const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};
