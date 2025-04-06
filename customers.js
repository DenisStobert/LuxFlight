if (!localStorage.getItem("loggedInUser")) {
  // If not logged in, redirect to the login page
  window.location.href = "admin-panel.html"; // Assuming admin-panel.html is your login page
} else {
  const loggedInUser = localStorage.getItem("loggedInUser");
  
  if (loggedInUser) {
    // Parse the stored JSON object
    const user = JSON.parse(loggedInUser);

    // Display the name of the logged-in user
    const capitalizedName = user.name.charAt(0).toUpperCase() + user.name.slice(1);
    document.getElementById("loggedInUser").textContent = "Logged in as: " + capitalizedName;
  }
}

document.getElementById("logoutButton").addEventListener("click", function(event) {
  event.preventDefault();
  localStorage.removeItem("loggedInUser");
  window.location.href = "admin-panel.html";  // Redirect to the login page
});
  async function fetchCustomerData() {
      try {
          const response = await fetch('https://luxflight-travel-fb03a9ec5505.herokuapp.com/getBinData');

          if (!response.ok) {
              throw new Error('Failed to retrieve customer data');
          }

          const data = await response.json(); // Parse the JSON response
          console.log('Fetched customer data:', JSON.stringify(data, null, 2)); // Log the fetched data

          // Directly pass the data array if it's already the correct format
          if (Array.isArray(data)) {
              populateCustomerTable(data); // Pass the array directly
          } else {
              console.error('Unexpected data format:', data); // Log if the data format is not as expected
          }
      } catch (error) {
          console.error('Error fetching customer data:', error);
      }
  }

  function populateCustomerTable(customers) {
    const customersTableBody = document.querySelector('#customersTable tbody');
    customersTableBody.innerHTML = ''; // Clear the table body before adding new rows

    // Update the number of customers in the "CUSTOMERS" card
    const customersCount = customers.length;
    document.querySelector('.card .customers-active').innerText = customersCount; // Assuming this is the third card (CUSTOMERS)
    document.querySelector('.card .customers1-active').innerText = customersCount;

    localStorage.setItem('customersCount', customersCount);

    // Loop through the customers array
    customers.forEach(customer => {
        const cardDetails = customer.cardDetails ? customer.cardDetails : {}; // Check if cardDetails exist
        const cardNumber = cardDetails.cardNumber ? cardDetails.cardNumber : 'N/A'; // Fallback if cardNumber is undefined

        const row = `
            <tr>
                <td class="truncate" title="${customer.name}">${customer.name}</td>
                <td class="truncate" title="${customer.email}">${customer.email}</td>
                <td class="truncate" title="${customer.totalPrice}">${customer.totalPrice}</td>
                <td class="card-details">
                    <p title="${cardNumber}">Card Number: ${cardNumber}</p>
                </td>
                <td class="truncate" title="${customer.loggedInUserName}">${customer.loggedInUserName}</td> <!-- New Agent column -->
                <td>
                    <button class="show-more-btn" onclick='openModal(${JSON.stringify(customer).replace(/'/g, "&apos;")})'>Show More</button>
                    <button class="delete-btn" onclick='deleteCustomer("${customer.email}")'><i class="fas fa-trash-can"></i></button>
                </td>
            </tr>
        `;

        // Append the row to the table body
        customersTableBody.insertAdjacentHTML('beforeend', row);
    });
}

  // Fetch customer data on page load
  fetchCustomerData();

  // Refresh button event listener to fetch customer data again
  document.getElementById('refreshButton').addEventListener('click', fetchCustomerData);

  // Ensure the close button inside the modal works
  document.querySelector('.close-button').addEventListener('click', closeModal);

  function openModal(customer) {
    if (!customer) {
        console.error('No customer data provided to openModal');
        return; // Exit if customer is undefined
    }

    const modal = document.getElementById("modal");
    modal.style.display = 'block'; // Set display to block to show the modal

    // Populate the modal with customer information
    document.getElementById("modal-name").textContent = customer.name || 'N/A';
    document.getElementById("modal-email").textContent = customer.email || 'N/A';

    // Add the confirmation number to the modal
    document.getElementById("modal-confirmation-number").textContent = customer.confirmationNumber || 'N/A';

    // Check if the logged-in user is an admin
    const loggedInUser = localStorage.getItem("loggedInUser");
if (loggedInUser) {
    const user = JSON.parse(loggedInUser);
    console.log('Customer:', customer);
console.log('Logged-in User:', user);

    // Check if the logged-in user is an admin or the agent who created the deal
    const customerAgent = customer.loggedInUserName; // Assuming customer has this field
    const isAdminOrAgent = (user.role === "admin");

    if (isAdminOrAgent || user.name === customerAgent) {
        // If admin or the agent who created the deal, show card and billing details
        document.getElementById("modal-card-details").innerHTML = `
            Card Number: ${customer.cardDetails.cardNumber || 'N/A'}<br>
            Card Expiry: ${customer.cardDetails.cardExpiry || 'N/A'}<br>
            Card CVC: ${customer.cardDetails.cardCvc || 'N/A'}<br>
            Postal Code: ${customer.cardDetails.postalCode || 'N/A'}<br>
            Card Name: ${customer.cardDetails.cardName || 'N/A'}
        `;

        document.getElementById("modal-billing-details").innerHTML = `
            Street: ${customer.billingDetails.street || 'N/A'}<br>
            City: ${customer.billingDetails.city || 'N/A'}<br>
            State: ${customer.billingDetails.state || 'N/A'}<br>
            Zipcode: ${customer.billingDetails.zipcode || 'N/A'}<br>
            Country: ${customer.billingDetails.country || 'N/A'}<br>
            Email: ${customer.billingDetails.email || 'N/A'}<br>
            Billing Phone: ${customer.billingDetails.billingPhone || 'N/A'}
        `;
    } else {
        // If not admin or agent, restrict access
        document.getElementById("modal-card-details").innerHTML = "Restricted Access: user not authorized";
        document.getElementById("modal-billing-details").innerHTML = "Restricted Access: user not authorized";
    }
} else {
    console.error('User is not logged in.');
}

    let flightDetails = []; // Declare flightDetails globally

const flightDetailsContainer = document.getElementById("modal-flight-details");
flightDetailsContainer.innerHTML = ''; // Clear previous content

if (customer.flightDetails && customer.flightDetails.length > 0) {
  customer.flightDetails.forEach((flight, flightIndex) => {
    const flightHeaderHTML = `
      <div class="flight-header">
        <h3>Flight ${flightIndex + 1}</h3>
      </div>
    `;
    flightDetailsContainer.innerHTML += flightHeaderHTML;

    // Loop through each segment in the flight
    flight.segments.forEach((segment, segmentIndex) => {
      const segmentId = `flight-${flightIndex}-segment-${segmentIndex}`;
      const seatId = `seat-input-${flightIndex}-${segmentIndex}`;
      const seatValue = segment.seatNumber || ''; // Default seat number if not set
      const segmentHTML = `
<div id="${segmentId}" class="flight-segment flight-detail">
  <h4>Segment ${segmentIndex + 1}</h4>
  <p class="airline-logo">${
    segment.airlineLogo
      ? `<img class="airline-logo" src="${segment.airlineLogo}" alt="${segment.airline} Logo" style="width: 50px; height: auto;">`
      : ''
  }
  </p>
  <p class="flight-number"><strong>Flight Number:</strong> ${segment.flightNumber || 'N/A'}</p>
  <p class="airline-name"><strong>Airline Company:</strong> ${segment.airlineCompany || 'N/A'}</p>
  <p class="departure-airport"><strong>Departure Airport:</strong> ${segment.departureAirport || 'N/A'}</p>
  <p class="departure-time"><strong>Departure Time:</strong> ${segment.departureTime || 'N/A'}</p>
  <p class="departure-date"><strong>Departure Date:</strong> ${segment.departureDate || 'N/A'}</p>
  <p class="arrival-airport"><strong>Arrival Airport:</strong> ${segment.arrivalAirport || 'N/A'}</p>
  <p class="arrival-time"><strong>Arrival Time:</strong> ${segment.arrivalTime || 'N/A'}</p>
  <p class="arrival-date"><strong>Arrival Date:</strong> ${segment.arrivalDate || 'N/A'}</p>
  <p class="flight-class"><strong>Flight Class:</strong> ${segment.flightClass || 'N/A'}</p>
  <p class="aircraft-name"><strong>Aircraft Name:</strong> ${segment.aircraftName || 'N/A'}</p>
  <p class="layover-time"><strong>Layover Time:</strong> ${segment.layoverTime || 'N/A'}</p>
  <div class="seat-number">
    <strong>Seat Number:</strong> 
    <span id="${seatId}-display">${seatValue || 'Not Assigned'}</span>
    <input type="text" id="${seatId}" value="${seatValue}" style="display:none;">
    <button onclick="toggleSeatInput('${seatId}', ${flightIndex}, ${segmentIndex})" id="${seatId}-button" class="show-more-btn">
      ${seatValue ? 'Edit' : 'Assign'}
    </button>
  </div>
</div>
`;

      flightDetailsContainer.innerHTML += segmentHTML;
    });
  });
} else {
  flightDetailsContainer.innerHTML = '<p>No flight details available.</p>';
}
    
    
    // Total, Net, and Gross Prices
    document.getElementById("modal-total-amount").textContent = customer.totalPrice || 'N/A';
    document.getElementById("modal-net-price").textContent = "$" + customer.netPrice || 'N/A';
    document.getElementById("modal-gross-price").textContent = "$" + customer.grossPrice || 'N/A';
    
    // Tip amount
    document.getElementById("modal-tipping-amount").textContent = customer.tipAmount || '$0';

    // Passenger details
    const passengerDetailsContainer = document.getElementById("modal-passenger-details");
    passengerDetailsContainer.innerHTML = ''; // Clear previous content

    if (customer.passengers && customer.passengers.length > 0) {
        customer.passengers.forEach((passenger, index) => {
            const ticketInputId = `ticket-number-input-${index}`;
            const saveButtonId = `save-button-${index}`;
            const editButtonId = `edit-button-${index}`;
            
            const ticketNumber = passenger.ticketNumber || ''; // Initially empty or existing ticket number
        
            const passengerDetailHTML = `
                <div class="passenger-detail">
                    <h4>Passenger ${index + 1}</h4>
                    <p>First Name: ${passenger.firstName || 'N/A'}</p>
                    <p>Middle Name: ${passenger.middleName || 'N/A'}</p>
                    <p>Last Name: ${passenger.lastName || 'N/A'}</p>
                    <p>Gender: ${passenger.gender || 'N/A'}</p>
                    <p>Date of Birth: ${passenger.dob || 'N/A'}</p>
                    <p>Seat Preference: ${passenger.seatPreference || 'N/A'}</p>
                    <p>Meal Preference: ${passenger.mealPreference || 'N/A'}</p>
                    <p>Special Assistance: ${passenger.specialAssistance || 'N/A'}</p>
                    <p>Frequent Flyer Program: ${passenger.programNumber || 'N/A'}</p>
        
                    <!-- Ticket number input field -->
                    <div id="ticket-section-${index}" class="ticket-input">
                        <input type="text" id="${ticketInputId}" placeholder="Enter ticket number" value="${ticketNumber}" />
                        <button class="show-more-btn" id="${saveButtonId}" onclick="saveTicketNumber(${index})">Save</button>
                        <button class="show-more-btn" id="${editButtonId}" style="display:none;" onclick="editTicketNumber(${index})">Edit</button>
                    </div>
                </div>
            `;
            passengerDetailsContainer.innerHTML += passengerDetailHTML;
        });
    } else {
        passengerDetailsContainer.innerHTML = '<p>No passenger details available.</p>';
    }
}
// Function to toggle between input and display mode
function toggleSeatInput(seatId, flightIndex, segmentIndex) {
  const inputElement = document.getElementById(seatId);
  const displayElement = document.getElementById(`${seatId}-display`);
  const buttonElement = document.getElementById(`${seatId}-button`);

  if (inputElement.style.display === 'none') {
    // Switch to input mode
    inputElement.style.display = 'inline';
    displayElement.style.display = 'none';
    buttonElement.textContent = 'Save';
  } else {
    // Save the value and switch to display mode
    const newSeatValue = inputElement.value.trim();
    displayElement.textContent = newSeatValue || 'Not Assigned';
    inputElement.style.display = 'none';
    displayElement.style.display = 'inline';
    buttonElement.textContent = 'Edit';

    // Update flight details object
    customer.flightDetails[flightIndex].segments[segmentIndex].seatNumber = newSeatValue;
  }
}
// Save flight details, only update the flight input fields
function saveFlightDetails(index) {
  const flightSection = document.getElementById(`flight-section-${index}`);
  const flightInputSection = flightSection.querySelector('.flight-input'); // Get the flight input section

  // Get input values for flight number, flight class, and aircraft name
  const flightNumberInput = document.getElementById(`flight-number-input-${index}`);
  const flightClassInput = document.getElementById(`flight-class-input-${index}`);
  const aircraftNameInput = document.getElementById(`aircraft-name-input-${index}`);

  // Check if the inputs exist
  if (flightNumberInput && flightClassInput && aircraftNameInput) {
    const flightNumber = flightNumberInput.value || 'N/A';
    const flightClass = flightClassInput.value || 'N/A';
    const aircraftName = aircraftNameInput.value || 'N/A';

    // Save the values to data attributes for later reference
    flightSection.setAttribute('data-flight-number', flightNumber);
    flightSection.setAttribute('data-flight-class', flightClass);
    flightSection.setAttribute('data-aircraft-name', aircraftName);

    // Update only the flight input fields (not the entire flight-section)
    flightInputSection.innerHTML = `
      <p>Flight Number: ${flightNumber}</p>
      <p>Flight Class: ${flightClass}</p>
      <p>Aircraft Name: ${aircraftName}</p>
      <button class="show-more-btn" onclick="editFlightDetails(${index})">Edit</button>
    `;
  } else {
    console.error("Input fields not found");
  }
}

// Edit flight details
function editFlightDetails(index) {
  const flightSection = document.getElementById(`flight-section-${index}`);
  const flightInputSection = flightSection.querySelector('.flight-input'); // Get the flight input section

  // Get current values from the data attributes
  const flightNumber = flightSection.getAttribute('data-flight-number') || '';
  const flightClass = flightSection.getAttribute('data-flight-class') || '';
  const aircraftName = flightSection.getAttribute('data-aircraft-name') || '';

  // Rebuild the input fields for editing (only update the flight input section)
  flightInputSection.innerHTML = `
      <p>Flight Number: <input type="text" id="flight-number-input-${index}" value="${flightNumber}" /></p>
      <p>Flight Class: <input type="text" id="flight-class-input-${index}" value="${flightClass}" /></p>
      <p>Aircraft Name: <input type="text" id="aircraft-name-input-${index}" value="${aircraftName}" /></p>
      <button class="show-more-btn" onclick="saveFlightDetails(${index})">Save</button>
  `;
}

// Function to get passenger names from the modal
function getPassengerNames() {
  const passengerDetailsContainer = document.getElementById("modal-passenger-details");
  const passengerDetails = passengerDetailsContainer.getElementsByClassName("passenger-detail");
  
  let passengerNames = [];
  
  // Loop through passenger details to extract names
  for (let i = 0; i < passengerDetails.length; i++) {
    const firstName = passengerDetails[i].querySelector("p:nth-child(2)").textContent.split(': ')[1] || 'N/A';
    const lastName = passengerDetails[i].querySelector("p:nth-child(4)").textContent.split(': ')[1] || 'N/A';
    passengerNames.push(`${firstName} ${lastName}`);
  }

  // Join names with a comma and space
  return passengerNames.length > 0 ? passengerNames.join(', ') : 'N/A';
}

// Function to get ticket numbers from the modal ticket sections
function getTicketNumbers() {
  const ticketSections = document.querySelectorAll("[id^='ticket-section-']");
  let ticketNumbers = [];

  // Loop through all ticket sections to gather ticket numbers from data attributes
  ticketSections.forEach(section => {
    const ticketNumber = section.getAttribute('data-ticket-number') || 'N/A';
    console.log(`Ticket number for section ID ${section.id}: ${ticketNumber}`); // Debugging
    ticketNumbers.push(ticketNumber);
  });

  // Join ticket numbers with a comma and space
  return ticketNumbers.length > 0 ? ticketNumbers.join(', ') : 'N/A';
}

// Function to get flight details from the modal flight sections
function getFlightDetails() {
  const flightSections = document.querySelectorAll("[id^='flight-section-']");
  let flightDetails = [];

  // Loop through all flight sections to gather flight details
  flightSections.forEach(section => {
      const flightNumber = section.getAttribute('data-flight-number') || 'N/A';
      const flightClass = section.getAttribute('data-flight-class') || 'N/A';
      const aircraftName = section.getAttribute('data-aircraft-name') || 'N/A';
      
      // Store each flight's details as an object
      flightDetails.push({
          flightNumber: flightNumber,
          flightClass: flightClass,
          aircraftName: aircraftName
      });
  });

  // If no flight details were found, return default 'N/A' values
  return flightDetails.length > 0 ? flightDetails : [{
      flightNumber: 'N/A',
      flightClass: 'N/A',
      aircraftName: 'N/A'
  }];
}

// Save ticket number and disable input
function saveTicketNumber(index) {
  const input = document.getElementById(`ticket-number-input-${index}`);
  const ticketSection = document.getElementById(`ticket-section-${index}`);

  // Get the ticket number value from the input field
  const ticketNumber = input.value;

  // Replace the input field with the ticket number displayed as text
  ticketSection.innerHTML = `
      <p>Ticket Number: ${ticketNumber}</p>
      <button class="show-more-btn" id="edit-button-${index}" onclick="editTicketNumber(${index})">Edit</button>
  `;

  // Optionally, store the ticket number in a data attribute on the ticketSection div for later use
  ticketSection.setAttribute('data-ticket-number', ticketNumber);
}

// Edit ticket number by enabling the input again
function editTicketNumber(index) {
  const ticketSection = document.getElementById(`ticket-section-${index}`);

  // Get the current ticket number from the data attribute, or set it to an empty string if none is found
  const ticketNumber = ticketSection.getAttribute('data-ticket-number') || '';

  // Rebuild the input field and save button for editing
  ticketSection.innerHTML = `
      <input type="text" id="ticket-number-input-${index}" placeholder="Enter ticket number" value="${ticketNumber}" />
      <button class="show-more-btn" id="save-button-${index}" onclick="saveTicketNumber(${index})">Save</button>
  `;
}

// Utility function to get the current date in EST (Eastern Standard Time)
function getCurrentESTDate() {
  const userDate = new Date();  // Get current date

  // Format the date to EST timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',  // EST (Eastern Standard Time)
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  });

  return formatter.format(userDate); // Returns date in "Month Day, Year" format
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  // Check if the string lacks a year
  const hasYear = /\d{4}/.test(dateString);

  // Add the current year if missing
  const currentYear = new Date().getFullYear();
  const fullDate = hasYear ? dateString : `${dateString}, ${currentYear}`;

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fullDate).toLocaleDateString('en-US', options);
};

document.getElementById('send-invoice-btn').addEventListener('click', function () {
  // Get modal data
  const modalName = document.getElementById("modal-name").textContent || 'N/A';
  const modalEmail = document.getElementById("modal-email").textContent || 'N/A';
  const modalTotalAmount = document.getElementById("modal-total-amount").textContent || 'N/A';
  const modalConfirmationNumber = document.getElementById("modal-confirmation-number").textContent || 'N/A';
  const modalNetPrice = document.getElementById("modal-net-price").textContent || 'N/A';
  const modalGrossPrice = document.getElementById("modal-gross-price").textContent || 'N/A';
  const modalTippingAmount = document.getElementById("modal-tipping-amount").textContent || 'N/A';

  const reservationDate = getCurrentESTDate(); // Assuming this is a function that returns the current EST date

  const passengerNames = getPassengerNames();  // Ensure this returns an array of passenger names
  const ticketNumbers = getTicketNumbers();  // Ensure this returns an array of ticket numbers

  const airlineLogos = {
    "Delta Air Lines": "assets/delta-logo.png",
    "Southwest Airlines": "assets/southwest-airlines.png",
    "United Airlines": "assets/united-logo.png",
    "Alaska Airlines": "assets/alaska-airlines.png",
    "Lufthansa": "assets/lufthansa-airlines.png",
    "American Airlines": "assets/american-airlines.png",
    "Air Canada": "assets/air-canada.png",
    "Air China": "assets/air-china.png",
    "China Eastern Airlines": "assets/china-eastern.png",
    "Hawaiian Airlines": "assets/hawaiian-airlines.png",
    "Ryanair": "assets/ryanair.png",
    "Spirit Airlines": "assets/spirit.png",
    "Turkish Airlines": "assets/turkish-logo.png",
    "Frontier Airlines": "assets/frontier.png",
    "JetBlue": "assets/jetblue.png",
    "Advanced Airlines": "assets/advanced-airlines.png",
    "Allegiant Air": "assets/allegiant.png",
    "Breeze Airways": "assets/breeze.png",
    "Air France": "assets/airfrance.png",
    "LATAM Airlines": "assets/latam.png",
    "Hainan Airlines": "assets/hainan.png",
    "Air India": "assets/air-india.png",
    "Aegean Airlines": "assets/aegean-airlines.png",
    "Aer Lingus": "assets/aer-lingus.png",
    "Aerolineas Argentinas": "assets/aerolineas-argentinas.png",
    "Aeromexico": "assets/aeromexico.png",
    "Air Arabia": "assets/air-arabia.png",
    "Air Astana": "assets/air-astana.png",
    "Air Austral": "assets/air-austral.png",
    "Air Baltic": "assets/air-baltic.png",
    "Air Belgium": "assets/air-belgium.png",
    "Air Caraibes": "assets/air-caraibes.png",
    "Air Corsica": "assets/air-corsica.png",
    "Air Dolomiti": "assets/air-dolomiti.png",
    "Air Europa": "assets/air-europa.png",
    "Air India Express": "assets/air-india-express.png",
    "Air Macau": "assets/air-macau.png",
    "Air Malta": "assets/air-malta.png",
    "Air Mauritius": "assets/air-mauritius.png",
    "Air Namibia": "assets/air-namibia.png",
    "Air New Zealand": "assets/air-new-zealand.png",
    "Air North": "assets/air-north.png",
    "Air Seoul": "assets/air-seoul.png",
    "Air Serbia": "assets/air-serbia.png",
    "Air Tahiti Nui": "assets/air-tahiti-nui.png",
    "Air Transat": "assets/air-transat.png",
    "Air Vanuatu": "assets/air-vanuatu.png",
    "AirAsia": "assets/airasia.png",
    "AirAsia X": "assets/airasia-x.png",
    "Aircalin": "assets/aircalin.png",
    "Alitalia": "assets/alitalia.png",
    "ANA": "assets/ana.png",
    "Asiana": "assets/asiana.png",
    "Austrian": "assets/austrian.png",
    "Azerbaijan Hava Yollary": "assets/azerbaijan-hava-yollary.png",
    "Azores Airlines": "assets/azores-airlines.png",
    "Azul": "assets/azul.png",
    "Bamboo Airways": "assets/bamboo-airways.png",
    "Bangkok Airways": "assets/bangkok-airways.png",
    "British Airways": "assets/british-airways.png",
    "Brussels Airlines": "assets/brussels-airlines.png",
    "Caribbean Airlines": "assets/caribbean-airlines.png",
    "Cathay Dragon": "assets/cathay-dragon.png",
    "Cathay Pacific": "assets/cathay-pacific.png",
    "Cayman Airways": "assets/cayman-airways.png",
    "CEBU Pacific Air": "assets/cebu-pacific-air.png",
    "China Airlines": "assets/china-airlines.png",
    "China Southern": "assets/china-southern.png",
    "Condor": "assets/condor.png",
    "Copa Airlines": "assets/copa-airlines.png",
    "Croatia Airlines": "assets/croatia-airlines.png",
    "Czech Airlines": "assets/czech-airlines.png",
    "easyJet": "assets/easyjet.png",
    "Edelweiss Air": "assets/edelweiss-air.png",
    "Egyptair": "assets/egyptair.png",
    "EL AL": "assets/el-al.png",
    "Emirates": "assets/emirates-logo.png",
    "Ethiopian Airlines": "assets/ethiopian-airlines.png",
    "Etihad": "assets/etihad-logo.png",
    "Eurowings": "assets/eurowings.png",
    "EVA Air": "assets/eva-air.png",
    "Fiji Airways": "assets/fiji-airways.png",
    "Finnair": "assets/finnair.png",
    "flydubai": "assets/flydubai.png",
    "FlyOne": "assets/flyone.png",
    "French bee": "assets/french-bee.png",
    "Garuda Indonesia": "assets/garuda-indonesia.png",
    "Gol": "assets/gol.png",
    "Gulf Air": "assets/gulf-air.png",
    "Helvetic Airways": "assets/helvetic-airways.png",
    "HK Express": "assets/hk-express.png",
    "Hong Kong Airlines": "assets/hong-kong-airlines.png",
    "Iberia": "assets/iberia.png",
    "Icelandair": "assets/icelandair.png",
    "IndiGo Airlines": "assets/indigo-airlines.png",
    "InterJet": "assets/interjet.png",
    "Japan Airlines": "assets/jal.png",
    "Jeju Air": "assets/jeju-air.png",
    "Jet2": "assets/jet2.png",
    "Jetstar": "assets/jetstar.png",
    "Jin Air": "assets/jin-air.png",
    "Kenya Airways": "assets/kenya-airways.png",
    "KLM": "assets/klm.png",
    "Korean Air": "assets/korean-air.png",
    "Kulula": "assets/kulula.png",
    "La Compagnie": "assets/la-compagnie.png",
    "Lion Airlines": "assets/lion-airlines.png",
    "LOT Polish Airlines": "assets/lot-polish-airlines.png",
    "Luxair": "assets/luxair.png",
    "Malaysia Airlines": "assets/malaysia-airlines.png",
    "Mango": "assets/mango.png",
    "Middle East Airlines": "assets/middle-east-airlines.png",
    "Nok Air": "assets/nok-air.png",
    "Nordwind Airlines": "assets/nordwind-airlines.png",
    "Norwegian Air International": "assets/norwegian-air-international.png",
    "Norwegian Air Shuttle": "assets/norwegian-air-international.png",
    "Norwegian Air Sweden": "assets/norwegian-air-sweden.png",
    "Norwegian Air UK": "assets/norwegian-air-sweden.png",
    "Oman Air": "assets/oman-air.png",
    "Pakistan International Airlines":
      "assets/pakistan-international-airlines.png",
    "Peach": "assets/peach.png",
    "Pegasus Airlines": "assets/pegasus-airlines.png",
    "Philippine Airlines": "assets/philippine-airlines.png",
    "Porter": "assets/porter.png",
    "Qantas": "assets/qantas.png",
    "Qatar Airways": "assets/qatar-logo.png",
    "Regional Express": "assets/regional-express.png",
    "Rossiya - Russian Airlines": "assets/rossiya-russian-airlines.png",
    "Royal Air Maroc": "assets/royal-air-maroc.png",
    "Royal Brunei": "assets/royal-brunei.png",
    "RwandAir": "assets/rwandair.png",
    "S7 Airlines": "assets/s7-airlines.png",
    "SAS": "assets/sas.png",
    "Saudia": "assets/saudia.png",
    "Scoot Airlines": "assets/scoot-airlines.png",
    "Shanghai Airlines": "assets/shanghai-airlines.png",
    "Silkair": "assets/silkair.png",
    "Silver": "assets/silver.png",
    "Singapore Airlines": "assets/singapore-airlines.png",
    "Skylanes": "assets/skylanes.png",
    "South African Airways": "assets/south-african-airways.png",
    "SpiceJet": "assets/spicejet.png",
    "Spring Airlines": "assets/spring-airlines.png",
    "Spring Japan": "assets/spring-japan.png",
    "SriLankan Airlines": "assets/srilankan-airlines.png",
    "Sun Country": "assets/sun-country.png",
    "Sunclass Airlines": "assets/sunclass-airlines.png",
    "Sunwing": "assets/sunwing.png",
    "SWISS": "assets/swiss.png",
    "Swoop": "assets/swoop.png",
    "TAAG": "assets/taag.png",
    "TACA": "assets/taca.png",
    "TAP Portugal": "assets/tap-portugal.png",
    "THAI": "assets/thai.png",
    "tigerair Australia": "assets/tigerair-australia.png",
    "Transavia Airlines": "assets/transavia-airlines.png",
    "TUI UK": "assets/tui-uk.png",
    "TUIfly": "assets/tuifly.png",
    "Tunis Air": "assets/tunis-air.png",
    "Ukraine International": "assets/ukraine-international.png",
    "United": "assets/united-logo.png",
    "Ural Airlines": "assets/ural-airlines.png",
    "UTair Aviation": "assets/utair-aviation.png",
    "Uzbekistan Airways": "assets/uzbekistan-airways.png",
    "Vietnam Airlines": "assets/vietnam-airlines.png",
    "Virgin Australia": "assets/virgin-australia.png",
    "Virgin Atlantic": "assets/virgin-atlantic.png",
    "Viva Aerobus": "assets/viva-aerobus.png",
    "Volaris": "assets/volaris.png",
    "Vueling Airlines": "assets/vueling-airlines.png",
    "WestJet": "assets/westjet.png",
    "Wizz Air": "assets/wizz-air.png",
    "Xiamen Airlines": "assets/xiamen-airlines.png",
  };

  // Flight Details Handling
  const flightDetailsContainer = document.getElementById("modal-flight-details");

  const flightSegmentElements = flightDetailsContainer.querySelectorAll('.flight-segment');
  const flightSegments = [];

  const formatDate = (dateString) => {
    const date = new Date(dateString); // Convert the string to a Date object
    const options = { year: 'numeric', month: 'short', day: 'numeric' }; // Format options
    return new Intl.DateTimeFormat('en-US', options).format(date); // Format date
  };

  flightSegmentElements.forEach((segmentElement) => {
    const flightNumber = segmentElement.querySelector('.flight-number') 
      ? segmentElement.querySelector('.flight-number').textContent.trim().replace('Flight Number:', '').trim() 
      : 'N/A';
    
    const departureAirport = segmentElement.querySelector('.departure-airport') 
      ? segmentElement.querySelector('.departure-airport').textContent.trim().replace('Departure Airport:', '').trim() 
      : 'N/A';
    
    const departureTime = segmentElement.querySelector('.departure-time') 
      ? segmentElement.querySelector('.departure-time').textContent.trim().replace('Departure Time:', '').trim() 
      : 'N/A';
    
    const arrivalAirport = segmentElement.querySelector('.arrival-airport') 
      ? segmentElement.querySelector('.arrival-airport').textContent.trim().replace('Arrival Airport:', '').trim() 
      : 'N/A';
    
    const arrivalTime = segmentElement.querySelector('.arrival-time') 
      ? segmentElement.querySelector('.arrival-time').textContent.trim().replace('Arrival Time:', '').trim() 
      : 'N/A';
  
    // Format the departure and arrival dates
    const departureDate = segmentElement.querySelector('.departure-date') 
      ? formatDate(segmentElement.querySelector('.departure-date').textContent.trim().replace('Departure Date:', '').trim()) 
      : 'N/A';
    
    const arrivalDate = segmentElement.querySelector('.arrival-date') 
      ? formatDate(segmentElement.querySelector('.arrival-date').textContent.trim().replace('Arrival Date:', '').trim()) 
      : 'N/A';
    
    const flightClass = segmentElement.querySelector('.flight-class') 
      ? segmentElement.querySelector('.flight-class').textContent.trim().replace('Flight Class:', '').trim() 
      : 'N/A';
    
    const aircraftName = segmentElement.querySelector('.aircraft-name') 
      ? segmentElement.querySelector('.aircraft-name').textContent.trim().replace('Aircraft Name:', '').trim() 
      : 'N/A';
    
    let layoverTime = segmentElement.querySelector('.layover-time') 
      ? segmentElement.querySelector('.layover-time').textContent.trim().replace('Layover Time:', '').trim() 
      : '';
    layoverTime = layoverTime === "N/A" ? '' : layoverTime;
  
    const airlineNameElement = segmentElement.querySelector('.airline-name');

const airlineName = airlineNameElement
  ? airlineNameElement.textContent.replace('Airline Company:', '').trim()
  : 'N/A';
    
    // Use the airline name to find the correct logo
    const airlineLogo = airlineLogos[airlineName] || null;

    const airlineLogoURL = airlineLogo
  ? `https://luxflighttravel.com/${airlineLogo}`
  : null; // If no logo, keep null

  let seatNumber = segmentElement.querySelector('.seat-number')
  ? segmentElement.querySelector('.seat-number').textContent.trim().replace('Seat Number:', '').trim()
  : 'N/A';

// Remove the "Edit" text if present
if (seatNumber.includes('Edit')) {
  seatNumber = seatNumber.replace('Edit', '').trim();
}
    
    // Push the flight segment data to the array, including the new dates and the logo URL
    flightSegments.push({
      flightNumber: flightNumber,
      departureAirport: departureAirport,
      departureTime: departureTime,
      departureDate: departureDate, // Include formatted departure date
      arrivalAirport: arrivalAirport,
      arrivalTime: arrivalTime,
      arrivalDate: arrivalDate, // Include formatted arrival date
      flightClass: flightClass,
      aircraftName: aircraftName,
      layoverTime: layoverTime,
      airlineLogo: airlineLogoURL,  // Push the logo URL into the segment data
      seatNumber: seatNumber,
    });
  });  

  // Prepare data to send to the server
  const emailData = {
    customer_name: modalName,
    customer_email: modalEmail,
    total_price: modalTotalAmount,
    confirmation_number: modalConfirmationNumber,
    net_price: modalNetPrice,
    tip_amount: modalTippingAmount,
    gross_price: modalGrossPrice,
    reservation_date: reservationDate,
    passenger_names: passengerNames,
    ticket_number: ticketNumbers,
    flight_segments: flightSegments,
  };

  console.log(emailData);  // Log the data to check before sending

  // Send data to back-end
  fetch('https://luxflight-travel-fb03a9ec5505.herokuapp.com/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to send email');
      }
    })
    .then((data) => {
      console.log('Email sent successfully:', data);
      alert('Invoice sent successfully!');
    })
    .catch((error) => {
      console.error('Error sending email:', error);
      alert('Failed to send invoice.');
    });
});


// Function to close the modal
function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = 'none'; // Set display to none to hide the modal
}

// Add a click event listener to the window
window.addEventListener('click', function(event) {
  const modal = document.getElementById("modal");
  const modalContent = document.querySelector('.modal-content');

  // Check if the click was outside the modal content
  if (event.target === modal) {
      closeModal(); // Close the modal if the click is outside the modal content
  }
});

// Add an event listener for the close button inside the modal
document.querySelector('.close-button').addEventListener('click', closeModal);

function searchCustomers() {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const table = document.getElementById('customersTable');
  const rows = table.getElementsByTagName('tr');

  // Loop through all table rows (except the first one, which is the header)
  for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.getElementsByTagName('td');
      
      let found = false;

      // Check if the input matches any cell in the current row
      for (let j = 0; j < cells.length; j++) {
          if (cells[j]) {
              const cellValue = cells[j].textContent || cells[j].innerText;
              if (cellValue.toLowerCase().indexOf(input) > -1) {
                  found = true;
                  break;
              }
          }
      }

      // Show or hide the row based on whether a match was found
      row.style.display = found ? '' : 'none';
  }
}

async function deleteCustomer(email) {
  if (confirm('Are you sure you want to delete this customer?')) {
      try {
          // Step 1: Fetch the customer data to be deleted
          const customerResponse = await fetch(`https://luxflight-travel-fb03a9ec5505.herokuapp.com/getCustomer?email=${email}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
              },
          });

          if (!customerResponse.ok) {
              const errorData = await customerResponse.json();
              throw new Error(errorData.message || 'Failed to fetch customer data');
          }

          const customerData = await customerResponse.json();

          // Step 2: Archive the customer data to the history bin
          const archiveResponse = await fetch('https://luxflight-travel-fb03a9ec5505.herokuapp.com/archiveCustomer', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ customerData: customerData }),
          });

          if (!archiveResponse.ok) {
              const archiveErrorData = await archiveResponse.json();
              throw new Error(archiveErrorData.message || 'Failed to archive customer data');
          }

          // Step 3: Proceed with deleting the customer from the current master bin
          const response = await fetch('https://nameless-sands-85519-56d7c462d260.herokuapp.com/deleteCustomer', {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: email }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to delete customer');
          }

          const responseData = await response.json();
          alert('Customer deleted and archived successfully');
          fetchCustomerData(); // Refresh the customer list

      } catch (error) {
          console.error('Error deleting customer:', error);
          alert('An error occurred while deleting the customer.');
      }
  }
}


function toggleSection(sectionId) {
  const content = document.getElementById(`modal-${sectionId}`);
  const button = document.querySelector(`[onclick="toggleSection('${sectionId}')"]`);
  
  if (content.style.display === 'none') {
      content.style.display = 'block'; // Show the content
      button.textContent = '-'; // Change the button to '-'
  } else {
      content.style.display = 'none'; // Hide the content
      button.textContent = '+'; // Change the button to '+'
  }
}

function toggleDetails(button) {
    const details = button.parentElement.nextElementSibling;
    const isVisible = details.style.display === "block";

    if (isVisible) {
        details.style.transition = "max-height 0.5s ease-out";
        details.style.maxHeight = "0"; // Collapse
        button.innerText = "+";
    } else {
        details.style.display = "block"; // Make it visible before expanding
        details.style.maxHeight = "2000px"; // Adjust as necessary for your content
        details.style.transition = "max-height 0.5s ease-in";
        button.innerText = "-";
    }

    // Use setTimeout to allow the browser to register the display change
    setTimeout(() => {
        if (isVisible) {
            details.style.display = "none"; // Hide after collapsing
        }
    }, 500); // Match the duration of the CSS transition
}

document
  .getElementById("logoutButton")
  .addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("loggedInUser");
    window.location.href = "admin-panel.html";  // Redirect to the login page
  });


/*document.addEventListener("DOMContentLoaded", function () {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      const capitalizedUsername =
        loggedInUser.charAt(0).toUpperCase() + loggedInUser.slice(1);
      document.getElementById("loggedInUser").textContent =
        "Logged in as: " + capitalizedUsername;
    }
    
    document
      .getElementById("logoutButton")
      .addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("loggedInUser");
        window.location.href = "admin-panel.html";
      });
      // Function to dynamically add customer details
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
    flightDetails.innerHTML = `
      <h3>Flight ${flightIndex}</h3>
      <div id="segmentContainer${flightIndex}" class="segment-container"></div>
      <button class="add-passenger" type="button" onclick="addSegmentDetails(${flightIndex})">Add a Segment</button>
      <br>
      <label for="totalTime${flightIndex}">Total Time:</label>
      <input type="text" id="totalTime${flightIndex}" name="totalTime${flightIndex}" readonly><br>
    `;
    flightsContainer.appendChild(flightDetails);
    flightIndex++;
  }
  
  function addSegmentDetails(flightIndex) {
    const segmentContainer = document.getElementById(
      `segmentContainer${flightIndex}`
    );
    const segmentIndex = segmentContainer.childElementCount + 1;
    const segmentDetails = document.createElement("div");
    segmentDetails.classList.add("segment-details");
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
    `;
    segmentContainer.appendChild(segmentDetails);
  
    // Add event listeners to calculate total time and handle autocomplete for airline
    addEventListenersForSegment(flightIndex, segmentIndex);
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
    passengerDetails.innerHTML = `
      <h3>Passenger ${passengerIndex}</h3>
      <label for="passengerFirstName${passengerIndex}">First Name:</label>
      <input type="text" id="passengerFirstName${passengerIndex}" name="passengerFirstName${passengerIndex}" required><br>
      <label for="passengerMiddleName${passengerIndex}">Middle Name:</label>
      <input type="text" id="passengerMiddleName${passengerIndex}" name="passengerMiddleName${passengerIndex}"><br>
      <label for="passengerLastName${passengerIndex}">Last Name:</label>
      <input type="text" id="passengerLastName${passengerIndex}" name="passengerLastName${passengerIndex}" required><br>
      <label for="passengerGender${passengerIndex}">Gender:</label>
      <select id="passengerGender${passengerIndex}" name="passengerGender${passengerIndex}" required>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select><br>
      <label for="passengerDob${passengerIndex}">Date of Birth:</label>
      <input type="date" id="passengerDob${passengerIndex}" name="passengerDob${passengerIndex}" required><br>
    `;
    passengersContainer.appendChild(passengerDetails);
    passengerIndex++;
  }
  
  document
    .getElementById("adminForm")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the form from submitting
  
      // Get form values
      const customerEmail = document.getElementById("customerEmail").value;
      const customerPhone = document.getElementById("customerPhone").value;
      const netprice = document.getElementById("netprice").value;
      const grossprice = document.getElementById("grossprice").value;
      const credit = document.getElementById("credit").value || "0"; // Default to "0" if no credit provided
      const confirmationNumber =
        document.getElementById("confirmationNumber").value; // Get confirmation number
      const tripType = document.querySelector(
        'input[name="tripType"]:checked'
      ).value;
      const totalTime = document.getElementById(
        `totalTime${flightIndex - 1}`
      ).value;
  
      let flights = [];
      let missingFields = false;
  
      for (let i = 1; i < flightIndex; i++) {
        const segments = [];
        const segmentContainer = document.getElementById(`segmentContainer${i}`);
        const segmentDetails =
          segmentContainer.querySelectorAll(".segment-details");
  
        segmentDetails.forEach((segmentDetail, index) => {
          const flightNumber = document.getElementById(
            `flightNumber${i}_${index + 1}`
          ).value;
          const departureAirport = document.getElementById(
            `departureAirport${i}_${index + 1}`
          ).value;
          const departureAirportShort = document.getElementById(
            `departureAirportShort${i}_${index + 1}`
          ).value;
          const arrivalAirport = document.getElementById(
            `arrivalAirport${i}_${index + 1}`
          ).value;
          const arrivalAirportShort = document.getElementById(
            `arrivalAirportShort${i}_${index + 1}`
          ).value;
          const departureTime = document.getElementById(
            `departureTime${i}_${index + 1}`
          ).value;
          const arrivalTime = document.getElementById(
            `arrivalTime${i}_${index + 1}`
          ).value;
          const departureDate = document.getElementById(
            `departureDate${i}_${index + 1}`
          ).value;
          const arrivalDate = document.getElementById(
            `arrivalDate${i}_${index + 1}`
          ).value;
          const totalTime = document.getElementById(
            `totalFlightTime${i}_${index + 1}`
          ).value;
          const airline = document.getElementById(
            `airline${i}_${index + 1}`
          ).value;
          const flightClass = document.getElementById(
            `flightClass${i}_${index + 1}`
          ).value;
          const aircraftName = document.getElementById(
            `aircraftName${i}_${index + 1}`
          ).value;
  
          if (
            !flightNumber ||
            !departureAirport ||
            !arrivalAirport ||
            !departureAirportShort ||
            !arrivalAirportShort ||
            !departureTime ||
            !arrivalTime ||
            !totalTime ||
            !airline ||
            !flightClass ||
            !aircraftName
          ) {
            missingFields = true;
          }
  
          segments.push({
            flightNumber,
            departureAirport,
            arrivalAirport,
            arrivalAirportShort,
            departureAirportShort,
            departureTime,
            departureDate,
            arrivalDate,
            arrivalTime,
            totalTime,
            airline,
            flightClass,
            aircraftName,
            airlineLogo: airlineLogos[airline],
          });
        });
  
        if (missingFields) break;
  
        flights.push({
          segments,
          totalTime,
        });
      }
  
      let passengers = [];
      for (let i = 1; i < passengerIndex; i++) {
        const passengerFirstName = document.getElementById(
          `passengerFirstName${i}`
        ).value;
        const passengerMiddleName =
          document.getElementById(`passengerMiddleName${i}`).value || "N/A";
        const passengerLastName = document.getElementById(
          `passengerLastName${i}`
        ).value;
        const passengerGender = document.getElementById(
          `passengerGender${i}`
        ).value;
        const passengerDob = document.getElementById(`passengerDob${i}`).value;
  
        if (
          !passengerFirstName ||
          !passengerLastName ||
          !passengerGender ||
          !passengerDob
        ) {
          missingFields = true;
          break;
        }
  
        passengers.push({
          firstName: passengerFirstName,
          middleName: passengerMiddleName,
          lastName: passengerLastName,
          gender: passengerGender,
          dob: passengerDob,
        });
      }
  
      if (missingFields) {
        alert("Please fill in all required fields.");
        return;
      }
  
      const uniqueLink = generateUniqueLink({
        customerEmail,
        customerPhone,
        netprice,
        grossprice,
        credit,
        confirmationNumber,
        tripType,
        flights,
        passengers, // Include passengers
        totalTime,
      });
  
      window.location.href = uniqueLink;
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
    function generateUniqueLink(data) {
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
    )}`;
    const url = `https://luxflighttravel.com/link.html?${queryString}`;
    console.log("Generated URL:", url); // Log the generated URL for debugging
    return url;
  }
    */
  function openSidebar() {
    document.getElementById("sidebar").classList.add("sidebar-responsive");
  }
  
  function closeSidebar() {
    document.getElementById("sidebar").classList.remove("sidebar-responsive");
  }
