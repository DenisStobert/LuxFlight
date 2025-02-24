emailjs.init("01Jm5QaWfujuWrHJI");

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
document.addEventListener("DOMContentLoaded", function () {
  var video = document.getElementById("heroVideo");
  var videoWrapper = document.querySelector(".video-wrapper");

  function updateParallax() {
    var scrollPosition = window.scrollY;
    var offset = videoWrapper.offsetTop;
    var windowHeight = window.innerHeight;

    // Only apply the effect when the video is in view
    if (scrollPosition + windowHeight > offset && scrollPosition < offset + videoWrapper.offsetHeight) {
      var parallaxAmount = (scrollPosition - offset) * 1; // Adjust multiplier for speed
      // Maintain centering while adding parallax
      video.style.transform = `translateX(-50%) translateY(calc(-50% + ${parallaxAmount}px)) scale(1.2)`;
    } else {
      // Reset transform when out of view
      video.style.transform = `translateX(-50%) translateY(-50%) scale(1.2)`;
    }
  }

  window.addEventListener("scroll", updateParallax);
  updateParallax(); // Update on page load
});


function bookNow(city) {
  const urlParams = new URLSearchParams();
  urlParams.set('city', city);
  window.location.href = `search-results.html?${urlParams.toString()}`;
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
function updateTripType(type) {
  document.getElementById('tripType').value = type;
  document.querySelectorAll('.trip-option').forEach(option => {
    option.classList.remove('active');
  });
  event.target.classList.add('active');
}

// Attach event listeners to trip type options
document.getElementById("oneWay").addEventListener("click", function (event) {
  updateTripType('One Way');
});

document.getElementById("roundTrip").addEventListener("click", function (event) {
  updateTripType('Round Trip');
});
const bookingForm = document.getElementById('bookingForm');

  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(bookingForm); // Collect form data

    try {
      const response = await fetch(bookingForm.action, {
        method: bookingForm.method,
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'A travel advisor will contact you soon.',
        });
        bookingForm.reset(); // Reset the form fields
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong! Please try again later.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Unable to submit the form. Please check your internet connection and try again.',
      });
    }
  });

// Load airlines data from JSON file
let airlinesData = [];
function renderDropdown(results, dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  
  // Clear previous results
  dropdown.innerHTML = '';

  if (results.length === 0) {
    dropdown.innerHTML = '<li>No results found</li>';
    return;
  }

  // Add each result to the dropdown
  results.forEach(result => {
    const li = document.createElement('li');
    li.textContent = result.display;  // Assuming 'display' contains formatted info
    dropdown.appendChild(li);
  });
}
fetch('airports.json')
  .then(response => response.json())
  .then(data => {
    airlinesData = data;
    console.log('Airline data loaded:', airlinesData);
  })
  .catch(error => console.error('Error loading airline data:', error));

  function fetchAutocompleteResults(searchTerm) {
    const lowerCaseTerm = searchTerm.toLowerCase();
  
    // First, filter by IATA code only
    const iataMatches = airlinesData.filter(airline => {
      const iataCode = airline.GKA?.toLowerCase() || ''; // IATA code
      return iataCode.startsWith(lowerCaseTerm); // Match IATA code strictly
    });
  
    // If no IATA matches, then filter by city and airport names
    if (iataMatches.length > 0) {
      return iataMatches.map(airline => ({
        dropdownDisplay: `${airline.Goroka || 'Unknown City'} (${airline.GKA || 'N/A'} - ${airline['Goroka Airport'] || 'Unknown Airport'})`, // Dropdown format
        inputDisplay: `${airline.Goroka || 'Unknown City'} (${airline['Goroka Airport'] || 'Unknown Airport'})`, // Input format
      }));
    } else {
      // If no IATA code matches, then search for city and airport names
      return airlinesData
        .filter(airline => {
          const cityName = airline.Goroka?.toLowerCase() || ''; // City name
          const airportName = airline['Goroka Airport']?.toLowerCase() || ''; // Airport name
          return (
            cityName.includes(lowerCaseTerm) || // Match city
            airportName.includes(lowerCaseTerm) // Match airport
          );
        })
        .map(airline => ({
          dropdownDisplay: `${airline.Goroka || 'Unknown City'} (${airline.GKA || 'N/A'} - ${airline['Goroka Airport'] || 'Unknown Airport'})`, // Dropdown format
          inputDisplay: `${airline.Goroka || 'Unknown City'} (${airline['Goroka Airport'] || 'Unknown Airport'})`, // Input format
        }));
    }
  }
  
  
// Trip type toggle logic
document.getElementById("oneWay").addEventListener("click", function () {
  localStorage.setItem("tripType", "One Way");
});

document.getElementById("roundTrip").addEventListener("click", function () {
  localStorage.setItem("tripType", "Round Trip");
});

document.addEventListener("DOMContentLoaded", function () {
  var roundTripOption = document.querySelector(".trip-option.round-trip");
  var oneWayOption = document.querySelector(".trip-option.one-way");
  var returnDateInput = document.getElementById("returnDate");

  roundTripOption.parentElement.addEventListener("click", function (event) {
    if (event.target === roundTripOption) {
      console.log("Round trip option clicked");
      roundTripOption.classList.add("active");
      oneWayOption.classList.remove("active");
      returnDateInput.disabled = false;
      returnDateInput.style.backgroundColor = "";
      returnDateInput.placeholder = "mm/dd/yyyy";
    }
  });

  oneWayOption.parentElement.addEventListener("click", function (event) {
    if (event.target === oneWayOption) {
      console.log("One-way option clicked");
      oneWayOption.classList.add("active");
      roundTripOption.classList.remove("active");
      returnDateInput.disabled = true;
      returnDateInput.style.backgroundColor = "rgba(0,0,0,0.1)";
      returnDateInput.placeholder = "";
    }
  });

  document.getElementById("returnDate").disabled = false;
});

// Event listener for 'From' airport input field
document.getElementById('fromAirport').addEventListener('input', function () {
  const searchTerm = this.value;
  const results = fetchAutocompleteResults(searchTerm);
  const dropdown = document.getElementById('fromAirportDropdown');
  dropdown.innerHTML = '';

  results.forEach(result => {
    const li = document.createElement('li');
    li.textContent = result.dropdownDisplay; // Display dropdown format
    li.addEventListener('click', () => {
      document.getElementById('fromAirport').value = result.inputDisplay; // Populate input with the input format
      dropdown.style.display = 'none';
    });
    dropdown.appendChild(li);
  });

  dropdown.style.display = results.length ? 'block' : 'none';
});

// Event listener for 'To' airport input field
document.getElementById('toAirport').addEventListener('input', function () {
  const searchTerm = this.value;
  const results = fetchAutocompleteResults(searchTerm);
  const dropdown = document.getElementById('toAirportDropdown');
  dropdown.innerHTML = '';

  results.forEach(result => {
    const li = document.createElement('li');
    li.textContent = result.dropdownDisplay; // Display dropdown format
    li.addEventListener('click', () => {
      document.getElementById('toAirport').value = result.inputDisplay; // Populate input with the input format
      dropdown.style.display = 'none';
    });
    dropdown.appendChild(li);
  });

  dropdown.style.display = results.length ? 'block' : 'none';
});

// Hide dropdown when clicking outside of it
document.addEventListener('click', function(event) {
  const fromDropdown = document.getElementById('fromAirportDropdown');
  const toDropdown = document.getElementById('toAirportDropdown');

  if (!event.target.closest('#fromAirportDropdown') && !event.target.matches('#fromAirport')) {
    fromDropdown.style.display = 'none';
  }
  if (!event.target.closest('#toAirportDropdown') && !event.target.matches('#toAirport')) {
    toDropdown.style.display = 'none';
  }
});

// Form submission handler
document.getElementById('flightSearchForm').addEventListener('submit', function(event) {
  const fromValue = document.getElementById('fromAirport').value.trim();
  const toValue = document.getElementById('toAirport').value.trim();

  if (fromValue === '' || toValue === '') {
    event.preventDefault();
    alert('Please select options for both the "From" and "To" airports from the autocomplete lists.');
  }
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

document.addEventListener("DOMContentLoaded", function () {
  // Access trip type options
  var roundTripOption = document.querySelector(".trip-option-form.round-trip");
  var oneWayOption = document.querySelector(".trip-option-form.one-way");
  var returnDateInput = document.getElementById("returnDate1");

  // Add event listeners to trip type options parent
  roundTripOption.parentElement.addEventListener("click", function (event) {
    if (event.target === roundTripOption) {
      console.log("Round trip option clicked");
      roundTripOption.classList.add("active");
      oneWayOption.classList.remove("active");
      returnDateInput.disabled = false; // Enable return date input for round trip
      returnDateInput.style.backgroundColor = ""; // Reset background color
      returnDateInput.placeholder = "mm/dd/yyyy"; // Reset placeholder
    }
  });

  oneWayOption.parentElement.addEventListener("click", function (event) {
    if (event.target === oneWayOption) {
      console.log("One-way option clicked");
      oneWayOption.classList.add("active");
      roundTripOption.classList.remove("active");
      returnDateInput.disabled = true; // Disable return date input for one-way
      returnDateInput.style.backgroundColor = "rgba(0,0,0,0.1)"; // Grey out background
      returnDateInput.placeholder = ""; // Remove placeholder
    }
  });

  // Initialize as round trip
  document.getElementById("returnDate").disabled = false;

  // Debugging: Log the state of the returnDate input
  console.log("Initial returnDate input state:", returnDateInput.disabled);
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
  }
});


document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('nav');
  window.addEventListener('scroll', function() {
    // Check if page is scrolled more than 50 pixels and window width is greater than 600px
    if (window.scrollY > 50 && window.innerWidth > 600) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  var menuIcon = document.querySelector('.menu-icon a');
  var navLinks = document.querySelectorAll('.nav__links a');
  var navLinksContainer = document.querySelector('.nav__links');
  var navContact = document.querySelector('.nav__contact');
  var navLogo = document.querySelector('.nav__logo');
  var navLogoMobile = document.querySelector('.nav__logo-mobile');

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
    navLinks.forEach(link => link.classList.remove('active'));

    // Add 'active' class to clicked link
    this.classList.add('active');

    // Navigate to the section linked by the anchor
    const hash = this.getAttribute('href');
    const target = document.querySelector(hash);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 60, // Offset by header height
        behavior: 'smooth'
      });
    }

    // If in mobile view and menu is open, toggle the menu closed
    if (window.innerWidth <= 600 && navLinksContainer.style.transform === "translateY(0%)") {
      toggleMenu();
    }
  }

  // Attach event listeners
  menuIcon.addEventListener('click', toggleMenu);
  navLinks.forEach(link => link.addEventListener('click', handleNavLinkClick));
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
    price: "$2692",
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
  italy: {
    imageUrl: "assets/trending-card-8.jpeg",
    name: "Italy",
    price: "$1951",
  },
  delhi: {
    imageUrl: "assets/trending-card-7.jpeg",
    name: "Delhi",
    price: "$1909",
  },
  frankfurt: {
    imageUrl: "assets/trending-card-9.jpeg",
    name: "Frankfurt",
    price: "$1975",
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
  document.body.classList.add('no-scroll');
};

// Function to close modal
var closeModal = function () {
  modal.style.display = "none";
  document.body.classList.remove('no-scroll');
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
document.addEventListener('DOMContentLoaded', function () {
  var swiper = new Swiper('.mySwiper', {
    loop: true,
    autoplay: {
      delay: 10000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Function to fetch autocomplete suggestions
  function fetchAutocompleteResults(searchTerm, city) {
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json?types=poi&autocomplete=true&limit=5&language=en&access_token=pk.eyJ1IjoiYnVzaW5lc3NmbHllciIsImEiOiJjbHZ2bWdkZ2IwM2hrMmxxc3k4d254ZXFtIn0.GzyAnHfIuZM0Llx66w5bWw`;

    if (city) {
      url += `&bbox=${city.bbox[0]},${city.bbox[1]},${city.bbox[2]},${city.bbox[3]}`;
    }

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

  // Event listener for input field changes
  document.getElementById('from').addEventListener('input', function() {
    const searchTerm = this.value;

    fetchAutocompleteResults(searchTerm, null) // Pass null for city initially
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
    const searchTerm = this.value;

    fetchAutocompleteResults(searchTerm, null) // Pass null for city initially
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
            dropdown.style.display = 'none';
          });
          dropdown.appendChild(li);
        });

        // Display the dropdown if there are results
        dropdown.style.display = results.length ? 'block' : 'none';
      });
  });

  // Hide the 'To' airport dropdown when clicking outside of it
  document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('toAutocompleteDropdown');
    if (!event.target.closest('#to') && !event.target.matches('#to')) {
      dropdown.style.display = 'none';
    }
  });
});

document.getElementById('addSegmentButton').addEventListener('click', function() {
  // Create new div for each segment
  const fromDiv = document.createElement('div');
  fromDiv.className = 'half';
  fromDiv.innerHTML = `
    <label for="from">From</label>
    <input type="text" id="from" placeholder="Departure Airport" required>
    <ul class="autocomplete-dropdown" id="fromAutocompleteDropdown"></ul>
  `;

  const toDiv = document.createElement('div');
  toDiv.className = 'half';
  toDiv.innerHTML = `
    <label for="to">To</label>
    <input type="text" id="to" placeholder="Arrival Airport" required>
    <ul class="autocomplete-dropdown" id="toAutocompleteDropdown"></ul>
  `;

  const departureDiv = document.createElement('div');
  departureDiv.className = 'half';
  departureDiv.innerHTML = `
    <label for="departure">Departure</label>
    <input type="date" id="departure" required>
  `;

  // Append new divs to the form
  document.getElementById('quoteForm').insertBefore(fromDiv, document.getElementById('addSegmentButton').parentNode);
  document.getElementById('quoteForm').insertBefore(toDiv, document.getElementById('addSegmentButton').parentNode);
  document.getElementById('quoteForm').insertBefore(departureDiv, document.getElementById('addSegmentButton').parentNode);
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

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

// header container
ScrollReveal().reveal(".header__container h1", {
  ...scrollRevealOption,
});

ScrollReveal().reveal(".header__form", {
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