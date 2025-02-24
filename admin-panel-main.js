document.addEventListener('DOMContentLoaded', () => {
  const customersCount = localStorage.getItem('customersCount') || 0; // Default to 0 if no data found
  document.querySelector('.main-cards .card:nth-child(3) h1').innerText = customersCount; // Update the "CUSTOMERS" card
  document.querySelector('.main-cards .card:nth-child(1) h1').innerText = customersCount;
});

document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("loggedInUser")) {
    // If not logged in, redirect to the login page
    window.location.href = "admin-panel.html"; // Assuming admin-panel.html is your login page
  }
  
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (loggedInUser) {
    // Parse the stored JSON object
    const user = JSON.parse(loggedInUser);
  
    // Extract the name from the parsed user object
    const capitalizedName =
      user.name.charAt(0).toUpperCase() + user.name.slice(1);
  
    // Display the name in the element
    document.getElementById("loggedInUser").textContent =
      "Logged in as: " + capitalizedName;
  }
  
  document
    .getElementById("logoutButton")
    .addEventListener("click", function (event) {
      event.preventDefault();
      localStorage.removeItem("loggedInUser");
      window.location.href = "admin-panel.html";
    });
  

  async function fetchPendingPayments() {
    const response = await fetch(
      "https://luxflighttravel.com/admin/pending-payments"
    );
    const { paymentIntents } = await response.json();
    const pendingPaymentsContainer = document.getElementById(
      "pending-payments-container"
    );
    pendingPaymentsContainer.innerHTML = "";

    if (paymentIntents.length === 0) {
      pendingPaymentsContainer.innerHTML = "<p>No pending payments.</p>";
      return;
    }

    paymentIntents.forEach((paymentIntent) => {
      const paymentElement = document.createElement("div");
      paymentElement.classList.add("payment-intent");
      paymentElement.style.display = "flex";
      paymentElement.style.justifyContent = "space-between";
      paymentElement.style.alignItems = "center";
      paymentElement.style.padding = "10px";
      paymentElement.style.borderBottom = "1px solid #ccc";

      paymentElement.innerHTML = `
        <span>Customer: ${
          paymentIntent.metadata.customerName || "Unknown"
        }</span>
        <span>Amount: ${(paymentIntent.amount / 100).toFixed(
          2
        )} ${paymentIntent.currency.toUpperCase()}</span>
        <button onclick="confirmPayment('${
          paymentIntent.id
        }')">Confirm Payment</button>
      `;
      pendingPaymentsContainer.appendChild(paymentElement);
    });
  }

  window.confirmPayment = async function (paymentIntentId) {
    const response = await fetch(
      "https://luxflighttravel.com/admin/capture-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentIntentId }),
      }
    );

    const result = await response.json();
    if (result.success) {
      alert("Payment captured successfully!");
      fetchPendingPayments();
    } else {
      alert("Error capturing payment: " + result.error);
    }
  };

  fetchPendingPayments();
});

let flightIndex = 1;
let passengerIndex = 1;

function addFlightDetails() {
  const flightsContainer = document.getElementById("flightsContainer");
  const flightDetails = document.createElement("div");
  flightDetails.classList.add("flight-details");
  flightDetails.setAttribute("id", `flightDetails${flightIndex}`);
  flightDetails.innerHTML = `
    <h3>Flight ${flightIndex}</h3>
    <div id="segmentContainer${flightIndex}" class="segment-container"></div>
    <button class="add-passenger" type="button" onclick="addSegmentDetails(${flightIndex})">Add a Segment</button>
    <br>
    <label for="totalTime${flightIndex}">Total Time:</label>
    <input type="text" id="totalTime${flightIndex}" name="totalTime${flightIndex}" readonly><br>
    <button class="delete-flight" type="button" onclick="deleteFlight(${flightIndex})">Delete Flight</button>
  `;
  flightsContainer.appendChild(flightDetails);
  flightIndex++;
}
function deleteFlight(index) {
  const flightDetails = document.getElementById(`flightDetails${index}`);
  if (flightDetails) {
    flightDetails.remove();
    renumberFlights();
  }
}

function renumberFlights() {
  const flights = document.querySelectorAll(".flight-details");
  flightIndex = 1; // Reset the flightIndex
  flights.forEach((flight, idx) => {
    const flightId = `flightDetails${flightIndex}`;
    flight.setAttribute("id", flightId);

    // Update flight number and references
    flight.querySelector("h3").textContent = `Flight ${flightIndex}`;
    const segmentContainer = flight.querySelector(".segment-container");
    segmentContainer.setAttribute("id", `segmentContainer${flightIndex}`);

    // Update buttons
    flight.querySelector(".add-passenger").setAttribute("onclick", `addSegmentDetails(${flightIndex})`);
    flight.querySelector(".delete-flight").setAttribute("onclick", `deleteFlight(${flightIndex})`);

    flightIndex++;
  });
}

function addSegmentDetails(flightIndex) {
  const segmentContainer = document.getElementById(
    `segmentContainer${flightIndex}`
  );
  const segmentIndex = segmentContainer.childElementCount + 1;
  const segmentDetails = document.createElement("div");
  segmentDetails.classList.add("segment-details");
  segmentDetails.id = `segment${flightIndex}_${segmentIndex}`;
  segmentDetails.innerHTML = `
    <h4>Segment ${segmentIndex}</h4>
    <label for="flightNumber${flightIndex}_${segmentIndex}">Flight Number:</label>
    <input type="text" id="flightNumber${flightIndex}_${segmentIndex}" name="flightNumber${flightIndex}_${segmentIndex}" required><br>
    <label for="departureAirport${flightIndex}_${segmentIndex}">Departure Airport:</label>
    <input type="text" id="departureAirport${flightIndex}_${segmentIndex}" name="departureAirport${flightIndex}_${segmentIndex}" required><br>
    <label for="departureAirportShort${flightIndex}_${segmentIndex}">Departure Airport (short):</label>
    <input type="text" id="departureAirportShort${flightIndex}_${segmentIndex}" name="departureAirportShort${flightIndex}_${segmentIndex}" required><br>
    <label for="arrivalAirport${flightIndex}_${segmentIndex}">Arrival Airport:</label>
    <input type="text" id="arrivalAirport${flightIndex}_${segmentIndex}" name="arrivalAirport${flightIndex}_${segmentIndex}" required><br>
    <label for="arrivalAirportShort${flightIndex}_${segmentIndex}">Arrival Airport (short):</label>
    <input type="text" id="arrivalAirportShort${flightIndex}_${segmentIndex}" name="arrivalAirportShort${flightIndex}_${segmentIndex}" required><br>
    <label for="departureTime${flightIndex}_${segmentIndex}">Departure Time:</label>
    <input type="text" id="departureTime${flightIndex}_${segmentIndex}" name="departureTime${flightIndex}_${segmentIndex}" placeholder="HH:MM AM/PM" required><br>
    <label for="arrivalTime${flightIndex}_${segmentIndex}">Arrival Time:</label>
    <input type="text" id="arrivalTime${flightIndex}_${segmentIndex}" name="arrivalTime${flightIndex}_${segmentIndex}" placeholder="HH:MM AM/PM" required><br>
    <label for="departureDate${flightIndex}_${segmentIndex}">Departure Date:</label>
    <input type="date" id="departureDate${flightIndex}_${segmentIndex}" name="departureDate${flightIndex}_${segmentIndex}" required><br>
    <label for="arrivalDate${flightIndex}_${segmentIndex}">Arrival Date:</label>
    <input type="date" id="arrivalDate${flightIndex}_${segmentIndex}" name="arrivalDate${flightIndex}_${segmentIndex}" required><br>
    <label for="totalFlightTime${flightIndex}_${segmentIndex}">Total Flight Time:</label>
    <input type="text" id="totalFlightTime${flightIndex}_${segmentIndex}" name="totalFlightTime${flightIndex}_${segmentIndex}" placeholder="xh:xm" required oninput="calculateTotalTime(${flightIndex})"><br>
    <label for="airline${flightIndex}_${segmentIndex}">Airline Company:</label>
    <div class="airline-input">
      <input type="text" id="airline${flightIndex}_${segmentIndex}" name="airline${flightIndex}_${segmentIndex}" required oninput="updateAirlineLogo(this)">
      <img class="airline-logo" src="" alt="">
    </div>
    <label for="flightClass${flightIndex}_${segmentIndex}">Flight Class:</label>
    <select id="flightClass${flightIndex}_${segmentIndex}" name="flightClass${flightIndex}_${segmentIndex}" required>
      <option value="economy">Economy</option>
      <option value="economy-premium">Economy Premium</option>
      <option value="business">Business</option>
      <option value="first-class">First Class</option>
    </select><br>
    <label for="aircraftName${flightIndex}_${segmentIndex}">Aircraft Name:</label>
    <input type="text" id="aircraftName${flightIndex}_${segmentIndex}" name="aircraftName${flightIndex}_${segmentIndex}" required><br>
    <button type="button" onclick="deleteSegment(${flightIndex}, ${segmentIndex})" class="delete-segment">Delete Segment</button>
  `;
  segmentContainer.appendChild(segmentDetails);

  // Add event listeners to calculate total time and handle autocomplete for airline
  addEventListenersForSegment(flightIndex, segmentIndex);
}
function deleteSegment(flightIndex, segmentIndex) {
  const segmentToDelete = document.getElementById(`segment${flightIndex}_${segmentIndex}`);
  if (segmentToDelete) {
    segmentToDelete.remove();
    renumberSegments(flightIndex);
  }
}

function renumberSegments(flightIndex) {
  const segments = document.querySelectorAll(`#segmentContainer${flightIndex} .segment-details`);
  segments.forEach((segment, idx) => {
    const segmentId = `segment${flightIndex}_${idx + 1}`;
    segment.setAttribute("id", segmentId);

    // Update segment number and references
    segment.querySelector("h4").textContent = `Segment ${idx + 1}`;
    segment.querySelectorAll("label, input, select").forEach((field) => {
      const nameAttr = field.getAttribute("name");
      const idAttr = field.getAttribute("id");
      if (nameAttr) field.setAttribute("name", nameAttr.replace(/\d+_\d+/, `${flightIndex}_${idx + 1}`));
      if (idAttr) field.setAttribute("id", idAttr.replace(/\d+_\d+/, `${flightIndex}_${idx + 1}`));
    });

    // Update delete button
    const deleteButton = segment.querySelector(".delete-segment");
    deleteButton.setAttribute("onclick", `deleteSegment(${flightIndex}, ${idx + 1})`);
  });
}
function calculateTotalTime(flightIndex) {
  const segmentContainer = document.getElementById(
    `segmentContainer${flightIndex}`
  );
  const totalFlightTimes = segmentContainer.querySelectorAll(
    `[id^=totalFlightTime${flightIndex}_]`
  );
  let totalMinutes = 0;

  totalFlightTimes.forEach((flightTimeInput) => {
    const timeParts = flightTimeInput.value.split(":");
    if (timeParts.length === 2) {
      const hours = parseInt(timeParts[0].replace("h", ""), 10) || 0;
      const minutes = parseInt(timeParts[1].replace("m", ""), 10) || 0;
      totalMinutes += hours * 60 + minutes;
    }
  });

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalTimeInput = document.getElementById(`totalTime${flightIndex}`);
  totalTimeInput.value = `${totalHours}h:${remainingMinutes}m`;
}
const airlineLogos = {
  "American Airlines": "assets/american-airlines.png",
  "Delta Air Lines": "assets/delta-logo.png",
  "Southwest Airlines": "assets/southwest-airlines.png",
  "United Airlines": "assets/united-logo.png",
  "Alaska Airlines": "assets/alaska-airlines.png",
  "Lufthansa": "assets/lufthansa-airlines.png",
  "Air Canada": "assets/air-canada.png",
  "Air China": "assets/air-china.png",
  "China Eastern Airlines": "assets/china-eastern.png",
  "Hawaiian Airlines": "assets/hawaiian-airlines.png",
  "Ryanair": "assets/ryanair.png",
  "Spirit Airlines": "assets/spirit.png",
  "Turkish Airlines": "assets/turkish-logo.png",
  "Frontier Airlines": "assets/frontier.png",
  "JetBlue": "assets/jetblue.png",
  "Advanced Airlines": "assets/advajced-airlines.png",
  "Allegiant Air": "assets/allegiant.png",
  "Breeze Airways": "assets/breeze.png",
  "JAL": "assets/jal.png",
  "Air France": "assets/airfrance.png",
  "LATAM Airlines": "assets/latam.png",
  "Hainan Airlines": "assets/hainan.png",
  "Air India": "assets/air-india.png"
};

function updateAirlineLogo(input) {
  const airlineName = input.value;
  const logoSrc = airlineLogos[airlineName];
  const airlineLogo = input.parentElement.querySelector(".airline-logo");
  if (logoSrc) {
    airlineLogo.src = logoSrc;
    airlineLogo.style.display = "inline-block"; // Show the logo if it exists
  } else {
    airlineLogo.src = "";
    airlineLogo.style.display = "none"; // Hide the logo if it doesn't exist
  }
}
function initializeAirlineAutocomplete(input) {
  const airlines = [
    "American Airlines",
    "Delta Air Lines",
    "United Airlines",
    "Southwest Airlines",
    "JetBlue Airways",
    "Alaska Airlines",
    "Spirit Airlines",
    "Frontier Airlines",
    "Allegiant Air",
    "Hawaiian Airlines",
  ];

  input.addEventListener("input", function () {
    const list = input.nextElementSibling;
    list.innerHTML = "";

    const value = input.value.toLowerCase();
    const filteredAirlines = airlines.filter((airline) =>
      airline.toLowerCase().includes(value)
    );

    filteredAirlines.forEach((airline) => {
      const option = document.createElement("div");
      option.textContent = airline;
      option.addEventListener("click", () => {
        input.value = airline;
        list.innerHTML = "";
      });
      list.appendChild(option);
    });
  });

  const dropdown = document.createElement("div");
  dropdown.className = "dropdown";
  input.parentNode.appendChild(dropdown);
}

function addPassengerDetails() {
  const passengersContainer = document.getElementById("passengersContainer");
  const passengerDetails = document.createElement("div");
  passengerDetails.classList.add("passenger-details");
  passengerDetails.id = `passenger${passengerIndex}`;
  passengerDetails.innerHTML = `
    <h3>Passenger ${passengerIndex}</h3>
    <label for="passengerFirstName${passengerIndex}">First Name:</label>
    <input type="text" id="passengerFirstName${passengerIndex}" name="passengerFirstName${passengerIndex}"><br>
    <label for="passengerMiddleName${passengerIndex}">Middle Name:</label>
    <input type="text" id="passengerMiddleName${passengerIndex}" name="passengerMiddleName${passengerIndex}"><br>
    <label for="passengerLastName${passengerIndex}">Last Name:</label>
    <input type="text" id="passengerLastName${passengerIndex}" name="passengerLastName${passengerIndex}"><br>
    <label for="passengerGender${passengerIndex}">Gender:</label>
    <select id="passengerGender${passengerIndex}" name="passengerGender${passengerIndex}">
      <option value="male">Male</option>
      <option value="female">Female</option>
    </select><br>
    <label for="passengerDob${passengerIndex}">Date of Birth:</label>
    <input type="date" id="passengerDob${passengerIndex}" name="passengerDob${passengerIndex}"><br>
    <button type="button" onclick="deletePassenger(${passengerIndex})" class="delete-passenger">Delete Passenger</button>
  `;
  passengersContainer.appendChild(passengerDetails);
  passengerIndex++;
}
function deletePassenger(passengerIndex) {
  const passengerToDelete = document.getElementById(`passenger${passengerIndex}`);
  if (passengerToDelete) {
    passengerToDelete.remove();
    renumberPassengers();
  }
}

function renumberPassengers() {
  const passengers = document.querySelectorAll(".passenger-details");
  passengerIndex = 1; // Reset the passengerIndex
  passengers.forEach((passenger) => {
    const passengerId = `passenger${passengerIndex}`;
    passenger.setAttribute("id", passengerId);

    // Update passenger number and references
    passenger.querySelector("h3").textContent = `Passenger ${passengerIndex}`;
    passenger.querySelectorAll("label, input, select").forEach((field) => {
      const nameAttr = field.getAttribute("name");
      const idAttr = field.getAttribute("id");
      if (nameAttr) field.setAttribute("name", nameAttr.replace(/\d+/, passengerIndex));
      if (idAttr) field.setAttribute("id", idAttr.replace(/\d+/, passengerIndex));
    });

    // Update delete button
    const deleteButton = passenger.querySelector(".delete-passenger");
    deleteButton.setAttribute("onclick", `deletePassenger(${passengerIndex})`);

    passengerIndex++;
  });
}
document.getElementById("adminForm").addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent the form from submitting

  // Get form values
  const customerEmail = document.getElementById("customerEmail").value || "N/A";
  const customerPhone = document.getElementById("customerPhone").value || "N/A";
  const netprice = document.getElementById("netprice").value;
  const grossprice = document.getElementById("grossprice").value;
  const credit = document.getElementById("credit").value || "0";
  const confirmationNumber = document.getElementById("confirmationNumber").value;
  const tripType = document.querySelector('input[name="tripType"]:checked').value;

  let flights = [];
  let missingFields = false;

  // Collect flight data
  for (let i = 1; i < flightIndex; i++) {
    const segments = [];
    const segmentContainer = document.getElementById(`segmentContainer${i}`);
    const segmentDetails = segmentContainer.querySelectorAll(".segment-details");

    segmentDetails.forEach((segmentDetail, index) => {
      const flightNumber = document.getElementById(`flightNumber${i}_${index + 1}`).value;
      const departureAirport = document.getElementById(`departureAirport${i}_${index + 1}`).value;
      const departureAirportShort = document.getElementById(`departureAirportShort${i}_${index + 1}`).value;
      const arrivalAirport = document.getElementById(`arrivalAirport${i}_${index + 1}`).value;
      const arrivalAirportShort = document.getElementById(`arrivalAirportShort${i}_${index + 1}`).value;
      const departureTime = document.getElementById(`departureTime${i}_${index + 1}`).value;
      const arrivalTime = document.getElementById(`arrivalTime${i}_${index + 1}`).value;
      const departureDate = document.getElementById(`departureDate${i}_${index + 1}`).value;
      const arrivalDate = document.getElementById(`arrivalDate${i}_${index + 1}`).value;
      const totalFlightTime = document.getElementById(`totalFlightTime${i}_${index + 1}`).value;
      const airline = document.getElementById(`airline${i}_${index + 1}`).value;
      const flightClass = document.getElementById(`flightClass${i}_${index + 1}`).value;
      const aircraftName = document.getElementById(`aircraftName${i}_${index + 1}`).value;

      if (!flightNumber || !departureAirport || !arrivalAirport || !departureTime || !arrivalTime) {
        missingFields = true;
      }

      segments.push({
        flightNumber,
        departureAirport,
        arrivalAirport,
        departureTime,
        arrivalTime,
        departureDate,
        arrivalDate,
        departureAirportShort,
        arrivalAirportShort,
        totalFlightTime,
        airline,
        flightClass,
        aircraftName,
      });
    });

    if (missingFields) break;

    flights.push({ segments });
  }

  let passengers = [];
  for (let i = 1; i < passengerIndex; i++) {
    const passengerFirstName = document.getElementById(`passengerFirstName${i}`).value || "N/A";
    const passengerLastName = document.getElementById(`passengerLastName${i}`).value || "N/A";
    const passengerMiddleName = document.getElementById(`passengerMiddleName${i}`).value || "N/A";
    const passengerDob = document.getElementById(`passengerDob${i}`).value || "yyyy-mm-dd";
    const passengerGender = document.getElementById(`passengerGender${i}`).value || "N/A";

    if (!passengerFirstName || !passengerLastName || !passengerDob) {
      missingFields = true;
      break;
    }

    passengers.push({
      firstName: passengerFirstName,
      lastName: passengerLastName,
      dob: passengerDob,
      middleName: passengerMiddleName,
      gender: passengerGender,
    });
  }

  if (missingFields) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    // Fetch current bin data
    const binResponse = await fetch("https://api.jsonbin.io/v3/b/6759d8acacd3cb34a8b80443/latest", {
      headers: {
        "X-Master-Key": "$2a$10$sTfBdnuXS6t/JCVhvvVyB.QWcZR8T1ysed2QsFLdKPFHhN9t61L0C",
      },
    });

    if (!binResponse.ok) throw new Error("Failed to fetch JSONBin data");

    const binData = await binResponse.json();
    const uniqueIdCounter = binData.record.uniqueIdCounter + 1;

    // Prepare the new flight data
    const newFlight = {
      uniqueId: uniqueIdCounter,
      customerEmail,
      customerPhone,
      netprice,
      grossprice,
      credit,
      confirmationNumber,
      tripType,
      flights,
      passengers,
    };

    // Update the bin data
    binData.record.uniqueIdCounter = uniqueIdCounter;
    binData.record.flights.push(newFlight);

    // Save updated data back to JSONBin
    const updateResponse = await fetch("https://api.jsonbin.io/v3/b/6759d8acacd3cb34a8b80443", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": "$2a$10$sTfBdnuXS6t/JCVhvvVyB.QWcZR8T1ysed2QsFLdKPFHhN9t61L0C",
      },
      body: JSON.stringify(binData.record),
    });

    if (!updateResponse.ok) throw new Error("Failed to update JSONBin");

    // Get logged-in user details from localStorage
    const loggedInUser = localStorage.getItem("loggedInUser");
    let username = "Unknown User";
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      username = user.name || "Unknown User";
    }

    // Generate the unique link with the unique ID and logged-in user name
    const uniqueLink = `https://luxflighttravel.com/link.html?uniqueId=${uniqueIdCounter}&user=${encodeURIComponent(username)}`;
    console.log("Generated URL:", uniqueLink); // Debugging purposes
    window.location.href = uniqueLink;
  } catch (error) {
    console.error("Error storing flight data:", error);
    alert("Failed to store flight data. Please try again.");
  }
});


  /*
  document.getElementById('flightSearchForm').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const departureDate = document.getElementById('departureDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const adults = document.getElementById('adults').value;

    console.log(`Departure Date: ${departureDate}`);  // Should log in YYYY-MM-DD
    console.log(`Return Date: ${returnDate}`);
   try {
      const response = await fetch('https://nameless-sands-85519-56d7c462d260.herokuapp.com/search-flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departureDate,
          returnDate,
          adults
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Flight results:', data); // Log the data received
      displayFlightResults(data);
    } catch (error) {
      console.error('Error searching flights:', error);
    }
  });
  
  function displayFlightResults(data) {
    const resultsDiv = document.getElementById('flightResults');
    resultsDiv.innerHTML = '';
  
    // Check if 'flights' is an array
    if (Array.isArray(data.flights)) {
      data.flights.forEach(flight => {
        resultsDiv.innerHTML += `
          <div>
            <h3>Flight from ${flight.itineraries[0].segments[0].departure.airport} to ${flight.itineraries[0].segments[0].arrival.airport}</h3>
            <p>Price: $${flight.price.grandTotal}</p>
            <p>Duration: ${flight.itineraries[0].duration}</p>
          </div>
        `;
      });
    } else {
      console.error('Unexpected response format:', data);
      resultsDiv.innerHTML = '<p>No flights found.</p>';
    }
  }
  */
  function generateUniqueLink(data) {
    const uniqueId = Date.now(); // This can be a more complex unique identifier
    const encodedFlights = encodeURIComponent(JSON.stringify(data.flights));
    const encodedPassengers = encodeURIComponent(JSON.stringify(data.passengers));
    const queryString = `customerEmail=${encodeURIComponent(
      data.customerEmail
    )}&customerPhone=${encodeURIComponent(
      data.customerPhone
    )}&netprice=${encodeURIComponent(data.netprice)}&grossprice=${encodeURIComponent(data.grossprice)}&credit=${encodeURIComponent(
      data.credit
    )}&confirmationNumber=${encodeURIComponent(
      data.confirmationNumber
    )}&tripType=${encodeURIComponent(
      data.tripType
    )}&flights=${encodedFlights}&passengers=${encodedPassengers}&totalTime=${encodeURIComponent(
      data.totalTime
    )}&uniqueId=${data.uniqueLinkId}&loggedInUserName=${encodeURIComponent(
    data.loggedInUserName)}`;
    const url = `https://luxflighttravel.com/link.html?${queryString}`;
    console.log("Generated URL:", url); // Log the generated URL for debugging
    return url;
  }
  
  
function openSidebar() {
  document.getElementById("sidebar").classList.add("sidebar-responsive");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("sidebar-responsive");
}
