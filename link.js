document.addEventListener("DOMContentLoaded", async () => {
  try {
    const currentUrl = window.location.href;

    // Fetch the existing bin data
    const existingDataResponse = await fetch('https://nameless-sands-85519-56d7c462d260.herokuapp.com/getBinData');
    if (!existingDataResponse.ok) {
      throw new Error('Failed to retrieve existing customer data');
    }
    const existingData = await existingDataResponse.json();

    // Check if the current URL is already in the bin and paid
    const existingCustomer = existingData.find(
      (customer) => customer.pageUrl === currentUrl && customer.paid
    );

    if (existingCustomer) {
      // Redirect to payment success page with the confirmation number
      const confirmationNumber = existingCustomer.confirmationNumber || 'N/A';
      window.location.href = `/payment-success.html?confirmationNumber=${confirmationNumber}`;
      return; // Exit after successful redirect
    }

    // Fetch the archived data
    const archivedDataResponse = await fetch('https://nameless-sands-85519-56d7c462d260.herokuapp.com/getArchivedData');
    if (!archivedDataResponse.ok) {
      throw new Error('Failed to retrieve archived customer data');
    }
    const archivedData = await archivedDataResponse.json();

    // Check if the current URL is in the archived data and paid
    const archivedCustomer = archivedData.find(
      (customer) => customer.pageUrl === currentUrl && customer.paid
    );

    if (archivedCustomer) {
      // Redirect to payment success page with the confirmation number
      const confirmationNumber = archivedCustomer.confirmationNumber || 'N/A';
      window.location.href = `/payment-success.html?confirmationNumber=${confirmationNumber}`;
      return; // Exit after successful redirect
    }

    // If no matching customer in both current and archived data, do nothing
  } catch (error) {
    console.error('Error checking customer data:', error);
    alert('An error occurred while verifying the payment status. Please refresh the page.');
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  emailjs.init("01Jm5QaWfujuWrHJI");

  /*const stripe = Stripe(
    "pk_test_51PLuTjRq3XjrRaZYgBIQHuzHiNnaFMdUnXUNyfX6D5nSTGVWqIhzR9CqQZCG4zf2rDpfvI8gc8puwxfB5tJOI3m200OSHu9Jqa"
  );
  const elements = stripe.elements();

  // Initialize Stripe elements
  const style = {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  };

  const cardNumber = elements.create("cardNumber", { style });
  const cardExpiry = elements.create("cardExpiry", { style });
  const cardCvc = elements.create("cardCvc", { style });
  const postalCode = elements.create("postalCode", { style });

  cardNumber.mount("#card-number-element");
  cardExpiry.mount("#card-expiry-element");
  cardCvc.mount("#card-cvc-element");
  postalCode.mount("#postal-code-element");
  */

// Update card number on input
document.querySelector("#card-number").addEventListener("input", function (event) {
  let input = this.value.replace(/\D/g, ""); // Remove any non-digit characters
  input = input.substring(0, 16); // Limit to 16 digits
  
  // Format the input as #### #### #### ####
  let formattedInput = input.replace(/(\d{4})(?=\d)/g, "$1 ");
  
  this.value = formattedInput;
  const value = this.value.replace(/\D+/g, ""); // Remove non-numeric characters
  const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 "); // Format as 4 digits blocks
  document.querySelector(".card-number-box").textContent = formattedValue || "0000 0000 0000 0000";

  const cardType = detectCardType(value); // Function to detect the card type
  let cardLogo = "";
  if (cardType === "visa") {
    cardLogo = '<img src="assets/visa.png" alt="Visa" class="card-logo">';
  } else if (cardType === "mastercard") {
    cardLogo = '<img src="assets/mastercard.png" alt="MasterCard" class="card-logo">';
  } else if (cardType === "amex") {
    cardLogo = '<img src="assets/amex1.png" alt="American Express" class="card-logo">';
  } else if (cardType === "discover") {
    cardLogo = '<img src="assets/discover.png" alt="Discover" class="card-logo">';
  }
  document.querySelector(".card-logo-container").innerHTML = cardLogo;
});
// Format expiration date as MM/YY
document.querySelector("#card-expiry").addEventListener("input", function (event) {
  let input = this.value.replace(/\D/g, ""); // Remove non-digit characters
  if (input.length >= 3) {
    input = input.substring(0, 4); // Limit to 4 digits
    this.value = input.substring(0, 2) + '/' + input.substring(2, 4); // Format as MM/YY
  } else {
    this.value = input; // If less than 3 digits, just show the input
  }
});

// Ensure CVV is max 4 digits
document.querySelector("#card-cvc").addEventListener("input", function (event) {
  let input = this.value.replace(/\D/g, ""); // Remove non-digit characters
  this.value = input.substring(0, 4); // Limit to 4 digits
});

// Ensure ZIP code is max 5 digits
document.querySelector("#postal-code").addEventListener("input", function (event) {
  let input = this.value.replace(/\D/g, ""); // Remove non-digit characters
  this.value = input.substring(0, 5); // Limit to 5 digits
});
// Update card holder name on input
document.querySelector("#customer-name").addEventListener("input", function () {
  const value = this.value.toUpperCase();
  document.querySelector(".card-holder-name").textContent = value || "NAME";
});

// Update expiration date on input
document.querySelector("#card-expiry").addEventListener("input", function () {
  let input = this.value.replace(/\D/g, ""); // Remove non-digit characters
  if (input.length >= 3) {
    input = input.substring(0, 4); // Limit to 4 digits (MMYY)
    this.value = input.substring(0, 2) + '/' + input.substring(2, 4); // Format as MM/YY
  } else {
    this.value = input; // If less than 3 digits, just show the input
  }
  
  // Update month and year dynamically
  const value = this.value.split("/");
  if (value.length === 2) {
    document.querySelector(".exp-month").innerText = value[0].trim(); // MM
    document.querySelector(".exp-year").innerText = value[1].trim();  // YY
  } else {
    document.querySelector(".exp-month").innerText = "MM"; // Reset to default
    document.querySelector(".exp-year").innerText = "YY"; // Reset to default
  }
});

// Update CVV on input
document.querySelector("#card-cvc").addEventListener("input", function () {
  document.querySelector(".cvv-box").innerText = this.value || "000";
});


  // Flip card on CVV input focus
const cardFront = document.querySelector(".front");
const cardBack = document.querySelector(".back");
const cvvInput = document.querySelector("#card-cvc");

cvvInput.addEventListener("focus", () => {
  cardFront.style.transform = "perspective(1000px) rotateY(-180deg)";
  cardBack.style.transform = "perspective(1000px) rotateY(0deg)";
});

cvvInput.addEventListener("blur", () => {
  cardFront.style.transform = "perspective(1000px) rotateY(0deg)";
  cardBack.style.transform = "perspective(1000px) rotateY(180deg)";
});


  const cardContainer = document.querySelector(".card-container");

  cardContainer.addEventListener("mousemove", function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    const rotateY = (x / width - 0.5) * 10;
    const rotateX = -(y / height - 0.5) * 10;
    this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  cardContainer.addEventListener("mouseleave", function () {
    this.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  });

  function detectCardType(number) {
    const re = {
      visa: /^4[0-9]{0,15}/,
      mastercard: /^(?:5[1-5][0-9]{0,14}|22[2-9][0-9]{0,12}|2[3-7][0-9]{0,13})/,
      amex: /^3[47][0-9]{0,13}/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{0,12}/,
    };
    if (re.visa.test(number)) {
      return "visa";
    } else if (re.mastercard.test(number)) {
      return "mastercard";
    } else if (re.amex.test(number)) {
      return "amex";
    } else if (re.discover.test(number)) {
      return "discover";
    }
    return "unknown";
  }

  function formatPhoneNumber(value) {
    if (!value.startsWith("+1 ")) {
      value = "+1 " + value.replace(/^(\+?1)?\s?/, "");
    }
    const cleaned = value.replace(/\D+/g, "");
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);

    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    } else if (cleaned.length > 1 && cleaned.length <= 4) {
      return `+1 (${cleaned.slice(1, 4)}`;
    } else if (cleaned.length > 4 && cleaned.length <= 7) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}`;
    } else if (cleaned.length > 7) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(
        4,
        7
      )}-${cleaned.slice(7, 11)}`;
    }

    return value;
  }

  function handlePhoneInput(event) {
    const input = event.target;
    const formattedValue = formatPhoneNumber(input.value);
    input.value = formattedValue;

    if (input.value === "+1 ") {
      input.value = "";
    }
  }

  const payButton = document.getElementById("stripePayButton");
const payButtonIcon = document.getElementById("payButtonIcon");
let currentBinId = null;

// Handle payment process when the customer clicks the pay button
payButton.addEventListener("click", async (event) => {
  event.preventDefault();
  event.stopPropagation();

  // Validate all necessary fields
  if (!validateFields()) {
    return; // Exit if validation fails
  }

  // Change the button icon to loading spinner
  payButtonIcon.classList.remove("fa-lock");
  payButtonIcon.classList.add("loading-spinner");
  payButton.disabled = true;

  // Gather all necessary details
  const customerName = document.getElementById("customer-name").value;
  const customerEmail = document.getElementById("confirmationEmail").value;
  const flightDetails = gatherFlightDetails();
  const billingInfo = gatherBillingInfo(); // This should return billing info as an object
  const tipAmount = document.getElementById("tipAmount").innerText || 0; // Default to 0 if not filled
  const totalPrice = document.getElementById("mainPrice").innerText;

  // Gather net and gross prices
  const netPrice = document.getElementById("netTotal").innerText.replace('$', '');
  const grossPrice = document.getElementById("grossTotal").innerText.replace('$', '');

  // Gather card details
  const cardDetails = {
    cardNumber: document.getElementById("card-number").value,
    cardExpiry: document.getElementById("card-expiry").value,
    cardCvc: document.getElementById("card-cvc").value,
    postalCode: document.getElementById("postal-code").value,
    cardName: customerName,
  };

  // Get the passengers details
  const passengers = getPassengerDetails(); // Use the new function here
  const confirmationNumber = document.getElementById("confirmationNumber").innerText || 'N/A';
  localStorage.setItem("confirmationNumber", confirmationNumber);

  const pageUrl = window.location.href;

  const urlParams = new URLSearchParams(window.location.search);
  const loggedInUserName = urlParams.get('user');

  // Prepare the new customer data with unique ID, net/gross prices, and passenger details
  const newCustomer = {
    name: customerName,
    email: customerEmail,
    paid: true,
    flightDetails: flightDetails, // Array of flights
    cardDetails: cardDetails,
    billingDetails: billingInfo,
    totalPrice: totalPrice,
    tipAmount: tipAmount,
    netPrice: netPrice, // Net price for LuxFlight
    grossPrice: grossPrice, // Gross price for the airline
    passengers: passengers,
    confirmationNumber: confirmationNumber,
    pageUrl: pageUrl,
    loggedInUserName: loggedInUserName
  };

  try {
    // Fetch the existing bin data
    const existingDataResponse = await fetch('https://nameless-sands-85519-56d7c462d260.herokuapp.com/getBinData');
    if (!existingDataResponse.ok) {
      throw new Error('Failed to retrieve existing customer data');
    }

    const existingData = await existingDataResponse.json(); // Get existing bin data

    let updatedCustomerList = [];

    // Check if customer array exists in the bin
    if (existingData && Array.isArray(existingData)) {
      updatedCustomerList = existingData; // Copy existing customer array
    }

    // Add new customer to the array
    updatedCustomerList.push(newCustomer);

    // Prepare updated bin data
    const updatedData = { customer: updatedCustomerList };

    // Send updated data back to the backend
    const response = await fetch('https://nameless-sands-85519-56d7c462d260.herokuapp.com/updateBin', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update customer data');
    }

    const responseData = await response.json();
    console.log('Customer added successfully:', responseData);

    // Redirect to the success page or handle the result as needed, passing the confirmation number
    window.location.href = `/payment-success.html?confirmationNumber=${confirmationNumber}`;

  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`); // Notify user about the error
  } finally {
    // Re-enable the button and reset the icon
    payButton.disabled = false;
    payButtonIcon.classList.add("fa-lock");
    payButtonIcon.classList.remove("loading-spinner");
  }
});
function gatherBillingInfo() {
  const billingDetails = {
    street: document.getElementById("street").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    zipcode: document.getElementById("zipcode").value,
    country: document.getElementById("country").value,
    email: document.getElementById("email-send").value,
    billingPhone: document.getElementById("billingPhone").value,
  };

  return billingDetails;
}
function getPassengerDetails() {
  const passengerDetails = [];
    
  for (let index = 0; index < passengersParam.length; index++) {
    // Get passenger info from DOM elements by their IDs
    const firstName = document.getElementById(`firstNameInput-${index}`)?.value;
    const middleName = document.getElementById(`middleNameInput-${index}`)?.value || '';
    const lastName = document.getElementById(`lastNameInput-${index}`)?.value;
    const gender = document.getElementById(`genderInput-${index}`)?.value;
    const dob = document.getElementById(`dobInput-${index}`)?.value;
    
    console.log("Passenger", index, firstName, middleName, lastName, gender, dob);
    
    // Gather additional options like redress number and frequent flyer info
    const redressNumber = document.getElementById(`redressNumber-${index}`)?.checked ? document.getElementById(`redressInput-${index}`)?.value : null;
    const seatPreference = document.getElementById(`seatPreference-${index}`)?.value || null;
    const mealPreference = document.getElementById(`mealPreference-${index}`)?.value || null;
    const specialAssistance = document.getElementById(`specialAssistance-${index}`)?.value || null;
    const programNumber = document.getElementById(`programNumber-${index}`)?.value || null;

    // Add this passenger's data to the array
    passengerDetails.push({
      firstName,
      middleName,
      lastName,
      gender,
      dob,
      redressNumber,
      seatPreference,
      mealPreference,
      specialAssistance,
      programNumber,
    });
  }
  return passengerDetails;
}

function gatherFlightDetails() {
  console.log("Gathered Flight Details:", JSON.stringify(allFlightDetails, null, 2));
  return allFlightDetails;
}

  /*payButton.addEventListener("click", async (event) => {
    event.preventDefault();
  
    if (!validateFields()) {
      return;
    }
  
    // Change the button icon to loading spinner
    payButtonIcon.classList.remove("fa-lock");
    payButtonIcon.classList.add("loading-spinner");
    payButton.disabled = true;
  
    try {
      // Create SetupIntent to save card info
      const setupResponse = await fetch("https://nameless-sands-85519-56d7c462d260.herokuapp.com/create-setup-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: document.getElementById("email-send").value,
        }),
      });
  
      if (!setupResponse.ok) {
        const errorText = await setupResponse.text();
        throw new Error(`Failed to create setup intent: ${errorText}`);
      }
  
      const { clientSecret: setupClientSecret } = await setupResponse.json();
  
      // Confirm SetupIntent to save card details
      const { error: setupError } = await stripe.confirmCardSetup(setupClientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: document.getElementById("customer-name").value,
            email: document.getElementById("email-send").value,
            address: {
              line1: document.getElementById("street").value,
              city: document.getElementById("city").value,
              state: document.getElementById("state").value,
              postal_code: document.getElementById("zipcode").value,
              country: "US",
            },
          },
        },
      });
  
      if (setupError) {
        throw new Error(setupError.message);
      }
  
      // Proceed to create PaymentIntent
      const paymentResponse = await fetch("https://nameless-sands-85519-56d7c462d260.herokuapp.com/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: (netprice + additionalServicesPrice + selectedTipAmount) * 100,
          currency: "usd",
          customerEmail: document.getElementById("email-send").value,
        }),
      });
  
      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        throw new Error(`Failed to create payment intent: ${errorText}`);
      }
  
      const { clientSecret, paymentId } = await paymentResponse.json();
  
      // Confirm PaymentIntent
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: document.getElementById("customer-name").value,
            email: document.getElementById("email-send").value,
            address: {
              line1: document.getElementById("street").value,
              city: document.getElementById("city").value,
              state: document.getElementById("state").value,
              postal_code: document.getElementById("zipcode").value,
              country: "US",
            },
          },
        },
      });
  
      if (stripeError) {
        throw new Error(stripeError.message);
      } else {
        // Confirm and capture the payment
        const confirmResponse = await fetch(
          "https://nameless-sands-85519-56d7c462d260.herokuapp.com/confirm-payment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ paymentId }), // Use the paymentId here
          }
        );
  
        if (!confirmResponse.ok) {
          const errorText = await confirmResponse.text();
          throw new Error(`Failed to confirm payment: ${errorText}`);
        }
  
        const { success, paymentIntent: confirmedPaymentIntent } = await confirmResponse.json();
  
        if (!success) {
          throw new Error("Payment confirmation failed");
        }
  
        // Continue with confirmation email, Formspree submission, etc.
        const customerEmail = document.getElementById("confirmationEmail").value;
        const confirmationNumber = document.getElementById("confirmationNumber").innerText;
  
        // Send confirmation email to the customer
        await sendEmail(customerEmail, confirmationNumber);
  
        // Gather all the required details
        const details = gatherDetails();
  
        // Send the details via Formspree
        await sendDetailsToFormspree(details);
  
        // Store the confirmation number in localStorage
        localStorage.setItem('confirmationNumberElement', confirmationNumber);
  
        // Mark the paymentId as used on your server
        await fetch('https://nameless-sands-85519-56d7c462d260.herokuapp.com/mark-payment-used', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentId }), // Use the paymentId here as well
        });
  
        // Redirect to the success page
        window.location.href = 'payment-success.html';
      }
    } catch (error) {
      alert("Payment failed: " + error.message);
    } finally {
      // Restore the button icon and state
      payButtonIcon.classList.remove("loading-spinner");
      payButtonIcon.classList.add("fa-lock");
      payButton.disabled = false;
    }
  });  */
  // Encryption key (should be stored securely)
const encryptionKey = "8f743b25eecf401bb9e11282a402107c0d4e1283a740ea56d7f5ff15fbe5641d"; // Replace this with a strong key and store securely

// Function to encrypt card details
function encryptCardDetails(cardDetails) {
  return CryptoJS.AES.encrypt(JSON.stringify(cardDetails), encryptionKey).toString();
}
function decryptCardDetails(encryptedCardDetails) {
  const bytes = CryptoJS.AES.decrypt(encryptedCardDetails, encryptionKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
  
  // Function to gather details
  function gatherDetails() {
    const passengers = document.querySelectorAll('.passenger-details');
    let passengerDetails = '';
  
    passengers.forEach((passenger, index) => {
      const firstName = document.getElementById(`firstNameDisplay-${index}`).innerText;
      const middleName = document.getElementById(`middleNameDisplay-${index}`).innerText;
      const lastName = document.getElementById(`lastNameDisplay-${index}`).innerText;
      const gender = document.getElementById(`genderDisplay-${index}`).innerText;
      const dob = document.getElementById(`dobDisplay-${index}`).innerText;
  
      let redressNumberDetail = 'No';
      if (document.getElementById(`redressNumber-${index}`).checked) {
          const redressNumberInput = document.getElementById(`redressInput-${index}`).value;
          redressNumberDetail = `Yes, Redress Number: ${redressNumberInput}`;
      }
  
      let frequentFlyerDetail = 'No';
      if (document.getElementById(`frequentFlyer-${index}`).checked) {
          const seatPreference = document.getElementById(`seatPreference-${index}`).value;
          const mealPreference = document.getElementById(`mealPreference-${index}`).value;
          const specialAssistance = document.getElementById(`specialAssistance-${index}`).value;
          const programNumber = document.getElementById(`programNumber-${index}`).value;
          frequentFlyerDetail = `Yes, Seat Preference: ${seatPreference}\nMeal Preference: ${mealPreference}\nSpecial Assistance: ${specialAssistance}\nProgram Number: ${programNumber}`;
      }
  
      passengerDetails += `Passenger ${index + 1}:\n
                           First Name: ${firstName}\n
                           Middle Name: ${middleName}\n
                           Last Name: ${lastName}\n
                           Gender: ${gender}\n
                           Date of Birth: ${dob}\n
                           Global Entry/TSA Pre-Check: ${redressNumberDetail}\n
                           Frequent Flyer: ${frequentFlyerDetail}\n\n`;
    });
  
    const customerEmail = document.getElementById("confirmationEmail").value;
    const customerPhone = document.getElementById("confirmationPhone").value;
    const tipAmount = document.getElementById('tipAmount').innerText;
    const totalPrice = document.querySelector('.totalPrice').innerText;

    const exchangeableFlightOption = document.querySelector('.summary-right.add-button').innerText.trim();
  
    // Card details
  const cardDetails = {
    cardNumber: document.getElementById("card-number").value,
    cardHolderName: document.getElementById("customer-name").value,
    expMonth: document.getElementById("card-expiry").value.split('/')[0],
    expYear: document.getElementById("card-expiry").value.split('/')[1],
    cvv: document.getElementById("card-cvc").value,
    postalCode: document.getElementById("postal-code").value
  };

  // Encrypt card details
  const encryptedCardDetails = encryptCardDetails(cardDetails);
  console.log('Encrypted Card Details:', encryptedCardDetails);
  
    return {
      passengerDetails,
      customerEmail,
      customerPhone,
      exchangeableFlightOption,
      tipAmount,
      totalPrice,
      encryptedCardDetails
    };
  }
  
  // Function to send details to Formspree
  async function sendDetailsToFormspree(details) {
    // Decrypt card details for email content
  const decryptedCardDetails = decryptCardDetails(details.encryptedCardDetails);

  // Format card details for email
  const cardDetailsString = `
    Card Number: ${decryptedCardDetails.cardNumber}\n
    Card Holder Name: ${decryptedCardDetails.cardHolderName}\n
    Expiration Month: ${decryptedCardDetails.expMonth}\n
    Expiration Year: ${decryptedCardDetails.expYear}\n
    CVV: ${decryptedCardDetails.cvv}\n
    Postal Code: ${decryptedCardDetails.postalCode}
  `;
    await fetch("https://formspree.io/f/xdknogqj", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: "chad@luxflighttravel.com",
            message: `Passengers:\n
                ${details.passengerDetails}\n
                Customer Details:\n
                Customer Email: ${details.customerEmail}\n
                Customer Phone: ${details.customerPhone}\n
                Price:\n
                Exchangeable Flight Option: ${details.exchangeableFlightOption}\n
                Tip Amount: ${details.tipAmount}\n
                Total Price: ${details.totalPrice}\n
                \nCard Details:\n
                ${cardDetailsString}`
        }),
    });
  }
  
  function sendEmail(customerEmail, confirmationNumber) {
    return emailjs
      .send("service_38t1kna", "template_vaawysb", {
        customer_email: customerEmail,
        confirmation_number: confirmationNumber,
      })
      .then((response) => {
        console.log("Email successfully sent!", response.status, response.text);
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        throw error;
      });
  }

  function validateFields() {
    let isValid = true;
    const requiredFields = document.querySelectorAll(".required");

    requiredFields.forEach((field) => {
      const input = field.querySelector("input, select");
      const errorMessage = field.querySelector(".error-message");

      if (!input.value) {
        isValid = false;
        input.classList.add("error");
        errorMessage.style.display = "block";
      } else {
        input.classList.remove("error");
        errorMessage.style.display = "none";
      }
    });

    const affirmationCheckbox = document.getElementById("affirmationCheckbox");
    const affirmationError = affirmationCheckbox.nextElementSibling;

    if (!affirmationCheckbox.checked) {
      isValid = false;
      affirmationCheckbox.classList.add("error");
      affirmationError.style.display = "block";
    } else {
      affirmationCheckbox.classList.remove("error");
      affirmationError.style.display = "none";
    }

    return isValid;
  }

  let firstName, lastName, customerEmail, customerPhone, passengerCount;
let price, netprice, grossprice, credit, tripType, confirmationNumber, flightsParam, passengersParam;

const urlParams = new URLSearchParams(window.location.search);
const uniqueId = parseInt(urlParams.get("uniqueId")); // Ensure uniqueId is an integer

// Fetch data from JSONBin
const binId = "6759d8acacd3cb34a8b80443";
const fetchData = async () => {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      headers: {
        "X-Master-Key": "$2a$10$sTfBdnuXS6t/JCVhvvVyB.QWcZR8T1ysed2QsFLdKPFHhN9t61L0C" // Replace with your actual JSONBin API Key
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from JSONBin");
    }

    const data = await response.json();
    const flights = data.record.flights;

    // Find the flight with the matching uniqueId
    const selectedFlight = flights.find(flight => flight.uniqueId === uniqueId);

    if (selectedFlight) {
      // Assign the fetched data to global variables
      firstName = selectedFlight.passengers[0]?.firstName;
      lastName = selectedFlight.passengers[0]?.lastName;
      customerEmail = selectedFlight.customerEmail;
      customerPhone = selectedFlight.customerPhone;
      passengerCount = selectedFlight.passengers.length;
      netprice = parseFloat(selectedFlight.netprice);
      grossprice = parseFloat(selectedFlight.grossprice);
      credit = parseFloat(selectedFlight.credit);
      tripType = selectedFlight.tripType;
      confirmationNumber = selectedFlight.confirmationNumber;
      flightsParam = selectedFlight.flights;
      passengersParam = selectedFlight.passengers;
      price = (grossprice);

      console.log(flightsParam);
      

      // Call the function that uses this data
      displayPassengerDetails(passengersParam);
      updatePassengerDetails(customerEmail, customerPhone);
      displayFlightDetails(flightsParam, tripType);
      displayRightColumnDetails(flightsParam, price, netprice, grossprice, tripType, credit, confirmationNumber);
    } else {
      console.error("No flight found with the given uniqueId");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Call the function to fetch and filter data
fetchData();
  
  let flights = [];
  if (flightsParam) {
    try {
      flights = JSON.parse(decodeURIComponent(flightsParam));
    } catch (e) {
      console.error("Error parsing flights JSON:", e);
    }
  }
  
  let passengers = [];
  if (passengersParam) {
    try {
      passengers = JSON.parse(decodeURIComponent(passengersParam));
    } catch (e) {
      console.error("Error parsing passengers JSON:", e);
    }
  }
  
  const formatDate = (dateString) => {
    if (!dateString) {
      console.error("Invalid date string:", dateString);
      return "Invalid Date";
    }
  
    const date = new Date(dateString);
  
    if (isNaN(date.getTime())) {
      console.error("Unable to parse date string:", dateString);
      return "Invalid Date";
    }
  
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };
  
  function formatDateSmall(dateString) {
    if (!dateString) {
      console.error("Invalid date string:", dateString);
      return "Invalid Date";
    }
  
    const date = new Date(dateString);
  
    if (isNaN(date.getTime())) {
      console.error("Unable to parse date string:", dateString);
      return "Invalid Date";
    }
  
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  
  function calculateTotalTime(segments) {
    if (!segments || segments.length === 0) return "0h 0m";

    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    const startTime = new Date(`${firstSegment.departureDate} ${firstSegment.departureTime}`);
    const endTime = new Date(`${lastSegment.arrivalDate} ${lastSegment.arrivalTime}`);

    const totalMinutes = (endTime - startTime) / 60000; // Convert milliseconds to minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h: ${minutes}m`;
}
  
  function createDetailsModal() {
    const modal = document.createElement("div");
    modal.id = "flightDetailsModal";
    modal.className = "details";
    modal.innerHTML = `
      <div class="details-content">
          <span class="close-button">&times;</span>
          <div id="detailsBody"></div>
      </div>
    `;
    document.body.appendChild(modal);
  
    const closeButton = modal.querySelector(".close-button");
    closeButton.addEventListener("click", () => {
      modal.style.display = "none";
    });
  
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }
  
  function showDetailsModal(content) {
    const modal = document.getElementById("flightDetailsModal");
    const modalBody = document.getElementById("detailsBody");
    modalBody.innerHTML = content;
    modal.style.display = "flex";
  }
  
  createDetailsModal();

  let allFlightDetails = [];
  
  function displayFlightDetails(flightsParam, tripType) {
  const bookingDetailsContainer = document.getElementById("bookingDetailsContainer");
  
  if (flightsParam.length > 0) {
    flightsParam.forEach((flight, index) => {
      const firstSegment = flight.segments[0];
      const lastSegment = flight.segments[flight.segments.length - 1];
  
      const formattedDepartureDate = formatDate(firstSegment.departureDate);
      const formattedArrivalDate = formatDate(lastSegment.arrivalDate);
      const formattedDepartureDateSmall = formatDateSmall(firstSegment.departureDate);
      const formattedArrivalDateSmall = formatDateSmall(lastSegment.arrivalDate);
  
      let stopsText;
      if (flight.segments.length === 1) {
        stopsText = "nonstop";
      } else if (flight.segments.length === 2) {
        stopsText = "1 stop";
      } else {
        stopsText = `${flight.segments.length - 1} stops`;
      }
  
      const totalTime = calculateTotalTime(flight.segments);
  
      const flightSegment = document.createElement("div");
      flightSegment.className = "booking-details";
      flightSegment.innerHTML = `
        <div class="flight-segment">
          <div class="flight-index">
            <p class="flight-name">Flight ${index + 1}</p>
            <p class="date-main">${formattedDepartureDate}</p>
          </div>
          <div class="flight-info">
            <div class="departure">
              <p class="date">${formattedDepartureDateSmall}</p>
              <p class="time">${firstSegment.departureTime}</p>
              <p class="airport">${firstSegment.departureAirportShort}</p>
              <p class="airport-long" style="display: none;">${firstSegment.departureAirport}</p>
            </div>
            <div class="line">
              <div class="stops">${stopsText}</div>
              ${'<i class="fa-solid fa-angle-right"></i>'.repeat(15)}
              <i class="fa-regular fa-circle"></i>
              <div class="layover-time">${totalTime}</div>
              ${'<i class="fa-solid fa-angle-right"></i>'.repeat(15)}
            </div>
            <div class="arrival">
              <p class="date">${formattedArrivalDateSmall}</p>
              <p class="time">${lastSegment.arrivalTime}</p>
              <p class="airport">${lastSegment.arrivalAirportShort}</p>
              <p class="airport-long" style="display: none;">${lastSegment.arrivalAirport}</p>
            </div>
          </div>
          <div class="flight-details">
            <button class="details-button" data-index="${index}">Details</button>
          </div>
        </div>
      `;
      bookingDetailsContainer.appendChild(flightSegment);
    });

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


// Function to open flight details and save them
document.querySelectorAll(".details-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    const index = event.target.getAttribute("data-index");
    const paddedIndex = (parseInt(index) + 1).toString().padStart(1, "0");
    const flight = flightsParam[index];

    let modalContent = `
      <div class="modal-header">
        <h2>Flight ${paddedIndex}</h2>
        <p>${flight.segments[0].departureAirport} <i class="fa-solid fa-arrow-right-long"></i> ${flight.segments[flight.segments.length - 1].arrivalAirport}</p>
      </div>
      <div class="modal-body">
        <div class="flight-info-wrapper" data-flight-index="${paddedIndex}">
    `;

    flight.segments.forEach((segment, idx) => {
      const formattedDepartureDateSmall = formatDateSmall(segment.departureDate);
      const formattedArrivalDateSmall = formatDateSmall(segment.arrivalDate);
      const airlineLogoSrc = airlineLogos[segment.airline] || segment.airlineLogo || ""; // Use the airline logo from flight data

      modalContent += `
        <div class="modal-flight-info">
          <div class="flight-timeline">
            <div class="circle"><i class="fa-regular fa-circle"></i></div>
            <div class="line">${'<i class="fa-solid fa-angle-down"></i>'.repeat(28)}</div>
            <div class="circle"><i class="fa-regular fa-circle"></i></div>
          </div>
          <div class="modal-flight-details-container">
            <div class="modal-flight-details-left">
              <div class="departure-info">
                <div class="time">${segment.departureTime}</div>
                <div class="date">${formattedDepartureDateSmall}</div>
                <div class="airport">${segment.departureAirport}, ${segment.departureAirportShort}</div>
              </div>
              <div class="modal-flight-additional">
                <p>Flight Time:<br/> ${segment.totalFlightTime}</p>
              </div>
              <div class="arrival-info">
                <div class="time">${segment.arrivalTime}</div>
                <div class="date">${formattedArrivalDateSmall}</div>
                <div class="airport">${segment.arrivalAirport}, ${segment.arrivalAirportShort}</div>
              </div>
            </div>
            <div class="modal-flight-details-right">
              <div class="additional-flight-info">
                ${
                  airlineLogoSrc
                    ? `<img class="airline-logo" src="${airlineLogoSrc}" alt="${segment.airline} Logo">`
                    : ""
                }
                <div class="airline-company">${segment.airline}</div>
                <div class="flight-number-class">
                  <span>${segment.flightNumber}</span> | <span>${segment.flightClass}</span>
                </div>
                <div class="aircraft-name">${segment.aircraftName}</div>
              </div>
            </div>
          </div>
        </div>
      `;

      if (idx < flight.segments.length - 1) {
        const currentArrival = new Date(`${segment.arrivalDate} ${segment.arrivalTime}`);
        const nextDeparture = new Date(
          `${flight.segments[idx + 1].departureDate} ${flight.segments[idx + 1].departureTime}`
        );
        const layoverTimeMinutes = (nextDeparture - currentArrival) / 60000; // Convert milliseconds to minutes
        const layoverHours = Math.floor(layoverTimeMinutes / 60);
        const layoverMinutes = layoverTimeMinutes % 60;

        modalContent += `
          <div class="layover-info">
            <div class="layover-time-modal">Layover Time: ${layoverHours}h:${layoverMinutes
          .toString()
          .padStart(2, "0")}min</div>
          </div>
        `;
      }
    });

    modalContent += `</div></div>`; // Close flight-info-wrapper and modal-body
    showDetailsModal(modalContent);

    allFlightDetails.push({
      flightIndex: paddedIndex,
      segments: flight.segments.map((segment, idx) => {
        const layoverTime =
          idx < flight.segments.length - 1
            ? (() => {
                const currentArrival = new Date(
                  `${segment.arrivalDate} ${segment.arrivalTime}`
                );
                const nextDeparture = new Date(
                  `${flight.segments[idx + 1].departureDate} ${flight.segments[idx + 1].departureTime}`
                );
                const layoverTimeMinutes = (nextDeparture - currentArrival) / 60000;
                const layoverHours = Math.floor(layoverTimeMinutes / 60);
                const layoverMinutes = layoverTimeMinutes % 60;
                return `${layoverHours}h:${layoverMinutes.toString().padStart(2, "0")}min`;
              })()
            : null;
    
        const departureAirportShort = segment.departureAirportShort || 'N/A';
        const arrivalAirportShort = segment.arrivalAirportShort || 'N/A';
    
        const departureAirportFormatted = `${segment.departureAirport}, ${departureAirportShort}`;
        const arrivalAirportFormatted = `${segment.arrivalAirport}, ${arrivalAirportShort}`;
    
        return {
          airlineCompany: segment.airline,
          departureAirport: departureAirportFormatted,  
          arrivalAirport: arrivalAirportFormatted,      
          departureTime: segment.departureTime,
          arrivalTime: segment.arrivalTime,
          departureDate: segment.departureDate,
          arrivalDate: segment.arrivalDate,
          flightNumber: segment.flightNumber,
          flightClass: segment.flightClass,
          aircraftName: segment.aircraftName,
          layoverTime, 
          airlineLogo: segment.airlineLogo,
        };
      }),
    });
  });
});

  }

  const tripTypeContainer = document.getElementById("tripTypeContainer");
  if (tripType) {
    tripTypeContainer.innerHTML = `<h2>${tripType} Flight</h2>`;
  }
  
  const passengerDetailsContainer = document.getElementById(
    "passengerDetailsContainer"
  );
  function addAirlineOptions(segments, index) {
    const airlineNames = segments.map(segment => segment.airline);
    const uniqueAirlineNames = [...new Set(airlineNames)];

    const frequentFlyerSelect = document.getElementById(`frequentFlyerCompany-${index}`);
    uniqueAirlineNames.forEach(airlineName => {
        const option = document.createElement("option");
        option.value = airlineName;
        option.textContent = airlineName;
        frequentFlyerSelect.appendChild(option);
    });
}
  }
function displayPassengerDetails(passengers) {
  if (passengers.length > 0) {
    passengers.forEach((passenger, index) => {
      const passengerElement = document.createElement("div");
      passengerElement.className = "passenger-details";
      passengerElement.innerHTML = `
      <div class="passenger-info">
        <div class="extra-info">
          <p><i class="fa-solid fa-circle-info"></i>Traveler names must match the government-issued identification document intended to use during travel.</p>
        </div>
        <div class="name-row">
          <div class="name-container">
            <h3>First Name:</h3>
            <p class="value-display" id="firstNameDisplay-${index}">${
        passenger.firstName
      }</p>
            <input type="text" class="value-input" id="firstNameInput-${index}" value="${
        passenger.firstName
      }" style="display: none;">
          </div>
          <div class="name-container">
            <h3>Middle Name:</h3>
            <p class="value-display" id="middleNameDisplay-${index}">${
        passenger.middleName
      }</p>
            <input type="text" class="value-input" id="middleNameInput-${index}" value="${
        passenger.middleName
      }" style="display: none;">
          </div>
          <div class="name-container">
            <h3>Last Name:</h3>
            <p class="value-display" id="lastNameDisplay-${index}">${
        passenger.lastName
      }</p>
            <input type="text" class="value-input" id="lastNameInput-${index}" value="${
        passenger.lastName
      }" style="display: none;">
          </div>
        </div>
        <div class="passenger-gender-dob">
          <div class="gender">
            <label for="gender">Gender</label>
            <p class="value-display" id="genderDisplay-${index}">${
        passenger.gender
      }</p>
            <select class="value-input" id="genderInput-${index}" style="display: none;">
              <option value="male" ${
                passenger.gender === "male" ? "selected" : ""
              }>Male</option>
              <option value="female" ${
                passenger.gender === "female" ? "selected" : ""
              }>Female</option>
            </select>
          </div>
          <div class="dob">
            <label for="dob">Date of Birth</label>
            <p class="value-display" id="dobDisplay-${index}">${
        passenger.dob
      }</p>
            <input type="date" class="value-input" id="dobInput-${index}" value="${
        passenger.dob
      }" style="display: none;">
          </div>
          <div class="edit-button-container">
            <button class="edit-button" id="editButton-${index}"><i class="fa fa-edit"></i> Edit</button>
            <button class="save-button" id="saveButton-${index}" style="display: none;"><i class="fa fa-save"></i> Save</button>
          </div>
        </div>
        <div class="additional-options">
  <div class="option-container redress-container">
    <input type="checkbox" id="redressNumber-${index}" name="option-${index}" value="redressNumber">
    <label for="redressNumber-${index}">Global Entry/TSA Pre-Check</label>
    <div class="additional-input" id="redressInputContainer-${index}" style="display: none;">
      <label for="redressInput-${index}">Redress Number</label>
      <input type="text" id="redressInput-${index}" class="styled-input" placeholder="Enter Number">
    </div>
  </div>
  <div class="option-container frequent-flyer-container">
    <input type="checkbox" id="frequentFlyer-${index}" name="option-${index}" value="frequentFlyer">
    <label for="frequentFlyer-${index}">Frequent Flyer and Seat/Meal Preferences</label>
    <div class="additional-input" id="frequentFlyerInputContainer-${index}" style="display: none;">
      <div class="input-row">
        <div class="input-container">
          <label for="seatPreference-${index}">Seat Preference</label>
          <select id="seatPreference-${index}" class="styled-input">
          <option value="" selected disabled>Select Seat Preference</option>
            <option value="none">None</option>
            <option value="aisle">Aisle</option>
            <option value="window">Window</option>
            <option value="predefined">Predefined</option>
          </select>
        </div>
        <div class="input-container">
          <label for="mealPreference-${index}">Meal Preference</label>
          <select id="mealPreference-${index}" class="styled-input">
          <option value="" selected disabled>Select Meal Preference</option>
            <option value="none">None</option>
            <option value="vegHindu">Veg Hindu</option>
            <option value="babyMeal">Baby Meal</option>
            <option value="bland">Bland</option>
            <option value="child">Child</option>
            <option value="diabetic">Diabetic</option>
            <option value="nonUAFruitPltr">Non-UA Fruit Pltr</option>
            <option value="hindu">Hindu</option>
            <option value="kosher">Kosher</option>
            <option value="lowCalorie">Low Calorie</option>
            <option value="lowFat">Low Fat</option>
            <option value="lowSodium">Low Sodium</option>
            <option value="moslem">Moslem</option>
            <option value="lowLactose">Low Lactose</option>
            <option value="vegRaw">Veg Raw</option>
            <option value="seafood">Seafood</option>
            <option value="vegVegan">Veg Vegan</option>
            <option value="vegJain">Veg Jain</option>
            <option value="vegLactoOvo">Veg Lacto-ovo</option>
            <option value="vegOriental">Veg Oriental</option>
            <option value="glutenFreeMeal">Gluten Free Meal</option>
          </select>
        </div>
      </div>
      <div class="input-row">
        <div class="input-container">
          <label for="specialAssistance-${index}">Special Assistance</label>
          <select id="specialAssistance-${index}" class="styled-input">
          <option value="" selected disabled>Select Special Assistance</option>
          <option value="none">None</option>
            <option value="blind">Passenger is blind</option>
            <option value="deaf">Passenger is deaf</option>
            <option value="wheelchairDryCell">Wheelchair - with dry cell battery</option>
            <option value="wheelchairImmobile">Wheelchair - passenger is immobile</option>
            <option value="wheelchairWalkStairs">Wheelchair - can walk and ascend/descend stairs</option>
            <option value="wheelchairCannotStairs">Wheelchair - cannot ascend/descend stairs</option>
          </select>
        </div>
        <div class="input-container">
          <label for="programNumber-${index}">Program Number</label>
          <input type="text" id="programNumber-${index}" class="styled-input" placeholder="Program Number">
        </div>
      </div>
    </div>
  </div>
</div>
      </div>
    `;
      passengerDetailsContainer.appendChild(passengerElement);

      
      // Add event listeners for the options
      document
        .getElementById(`redressNumber-${index}`)
        .addEventListener("change", function () {
          const container = document.getElementById(
            `redressInputContainer-${index}`
          );
          container.style.display = this.checked ? "block" : "none";
        });

      document
        .getElementById(`frequentFlyer-${index}`)
        .addEventListener("change", function () {
          const container = document.getElementById(
            `frequentFlyerInputContainer-${index}`
          );
          container.style.display = this.checked ? "block" : "none";
        });
        

      const editButton = document.getElementById(`editButton-${index}`);
      const saveButton = document.getElementById(`saveButton-${index}`);
      const valueDisplays = document.querySelectorAll(
        `#firstNameDisplay-${index}, #middleNameDisplay-${index}, #lastNameDisplay-${index}, #genderDisplay-${index}, #dobDisplay-${index}`
      );
      const valueInputs = document.querySelectorAll(
        `#firstNameInput-${index}, #middleNameInput-${index}, #lastNameInput-${index}, #genderInput-${index}, #dobInput-${index}`
      );

      editButton.addEventListener("click", function () {
        valueDisplays.forEach((display) => (display.style.display = "none"));
        valueInputs.forEach((input) => (input.style.display = "block"));
        editButton.style.display = "none";
        saveButton.style.display = "block";
      });
      
      saveButton.addEventListener("click", function () {
        const updatedFirstName = document.getElementById(
          `firstNameInput-${index}`
        ).value;
        const updatedMiddleName = document.getElementById(
          `middleNameInput-${index}`
        ).value;
        const updatedLastName = document.getElementById(
          `lastNameInput-${index}`
        ).value;
        const updatedGender = document.getElementById(
          `genderInput-${index}`
        ).value;
        const updatedDob = document.getElementById(`dobInput-${index}`).value;

        document.getElementById(`firstNameDisplay-${index}`).textContent =
          updatedFirstName;
        document.getElementById(`middleNameDisplay-${index}`).textContent =
          updatedMiddleName;
        document.getElementById(`lastNameDisplay-${index}`).textContent =
          updatedLastName;
        document.getElementById(`genderDisplay-${index}`).textContent =
          updatedGender;
        document.getElementById(`dobDisplay-${index}`).textContent = updatedDob;

        valueDisplays.forEach((display) => (display.style.display = "block"));
        valueInputs.forEach((input) => (input.style.display = "none"));
        editButton.style.display = "block";
        saveButton.style.display = "none";
      });
    });
  }
}

const updatePassengerDetails = (email, phone) => {
  // Format phone number before inserting
  const formattedPhone = formatPhoneNumber(phone);

  // Create the passenger details container for contact info
  const passengerDetails2 = document.createElement("div");
  passengerDetails2.className = "passenger-details2";
  passengerDetails2.innerHTML = `
    <div class="extra-info">
      <p><i class="fa-solid fa-circle-info"></i>Confirmation email and phone number fields are required!</p>
    </div>
    <div class="contact-info-row">
      <div class="contact-person">
        <h3>Contact Person</h3>
        <p>Please provide information about a contact person we should get in touch with in case of schedule change.</p>
      </div>
      <div class="confirmation-email">
        <h3>CONFIRMATION EMAIL*</h3>
        <input type="email" id="confirmationEmail" placeholder="Enter email" value="${email || ""}">
        <span class="error-message" style="display:none;color:red;">This is a required field</span>
      </div>
      <div class="phone-number">
        <h3>PHONE NUMBER*</h3>
        <input type="tel" id="confirmationPhone" placeholder="Enter phone number" value="${formattedPhone || ""}">
        <span class="error-message" style="display:none;color:red;">This is a required field</span>
      </div>
    </div>
  `;

  // Append the new passenger details to the container
  passengerDetailsContainer.appendChild(passengerDetails2);

  // Add event listeners for phone input
  const confirmationPhoneInput = document.getElementById("confirmationPhone");
  confirmationPhoneInput.addEventListener("input", handlePhoneInput);
};


function displayRightColumnDetails(){
  const rightColumnContainer = document.getElementById("rightColumnContainer");
  rightColumnContainer.innerHTML = `
      <h2 class="flight">Purchase Summary</h2>
      <button class="close-summary" onclick="togglePurchaseSummary()">Close</button>
      <div class="purchase-summary">
          <div class="flight-summary">
              <div class="flight-summary-left">
                  <i class="fa-solid fa-plane"></i>
                  <span>Flight</span>
              </div>
              <div class="flight-summary-right" id="flightDetailsRight"></div>
          </div>
          <div class="summary-row">
              <span class="summary-left">${tripType}</span>
              <span class="summary-right">$${price.toFixed(2)}</span>
          </div>
          <div class="summary-row">
              <span class="summary-left credit-left">Credit with the company</span>
              <span class="summary-right credit-right">$${credit.toFixed(2)}</span>
          </div>
          <div class="summary-row" id="exchangeableFlight">
              <span class="summary-left">Exchangeable Flight</span>
              <span class="summary-right add-button">ADD</span>
          </div>
          <div class="summary-row last-row" id="lostBaggageProtection">
              <span class="summary-left">Tip Amount (optional)</span>
              <span class="summary-right tip-amount" id="tipAmount">$0</span>
          </div>
          <p class="confirmation"><strong>Confirmation Nr.:</strong> <span id="confirmationNumber">${confirmationNumber}</span></p>
          <p class="totalDiv" id="totalDiv">
  TOTAL: <span class="arrow-icon" id="arrowIcon">&#11166;</span><span class="totalPrice mainPrice" id="mainPrice">${(price - credit).toFixed(2)}</span>
</p>
          <div class="hidden-info" id="hiddenInfo">
  <p class="totalDiv netDiv">Will be charged by LuxFlight Travel: 
    <span class="totalPrice netPrice" id="netTotal">$${(grossprice - netprice - credit).toFixed(2)}</span>
  </p>
  <p class="totalDiv grossDiv">Will be charged from the airline:
    <span class="totalPrice1 grossPrice1" id="grossTotal">$${netprice.toFixed(2)}</span>
  </p>
</div>
              <div class="end"></div>
      </div>
  `;

  const flightDetailsRight = document.getElementById("flightDetailsRight");

  document.getElementById('totalDiv').addEventListener('click', function () {
    const arrowIcon = document.getElementById('arrowIcon');
    const hiddenInfo = document.getElementById('hiddenInfo');
  
    // Add the 'hidden' class to start the opacity transition
    arrowIcon.classList.add('hidden');
    
    // Wait for the opacity transition to complete before changing the arrow character
    setTimeout(() => {
        if (arrowIcon.innerHTML === '⮟') { // Right arrow (⮇)
            arrowIcon.innerHTML = '⮞'; // Down arrow (⮆)
        } else {
            arrowIcon.innerHTML = '⮟'; // Right arrow (⮇)
        }

        // Remove the 'hidden' class to fade the new arrow back in
        arrowIcon.classList.remove('hidden');
    }, 150); // Match this delay with the CSS transition duration
  
    // Toggle the "show" class to animate the display of hidden info
    hiddenInfo.classList.toggle('show');
});


flightsParam.forEach((flight) => {
  const firstSegment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];

  let formattedDepartureDate = "Invalid Date";
  if (firstSegment && firstSegment.departureDate && firstSegment.departureTime) {
    formattedDepartureDate = formatDate(
      firstSegment.departureDate,
      firstSegment.departureTime
    );
  } else {
    console.error("Invalid or missing departure data for flight:", flight);
  }

  flightDetailsRight.innerHTML += `
    <p class="right-airport">${firstSegment?.departureAirport || "Unknown"} to ${lastSegment?.arrivalAirport || "Unknown"}</p>
    <p class="right-date">${formattedDepartureDate}</p>
  `;
});


  function togglePurchaseSummary() {
    const rightColumn = document.getElementById("rightColumnContainer");

    if (rightColumn.classList.contains("active")) {
      rightColumn.style.top = "-100%"; // Move off-screen
      setTimeout(() => {
        rightColumn.classList.remove("active");
        rightColumn.style.display = "none"; // Hide after animation
      }, 500); // Match the CSS transition duration
    } else {
      rightColumn.style.display = "flex"; // Show initially
      setTimeout(() => {
        rightColumn.style.top = "0"; // Move on-screen
      }, 0); // Delay to ensure display change is processed
      rightColumn.classList.add("active");
    }
  }
  window.togglePurchaseSummary = togglePurchaseSummary;

// Sticky right column
const rightColumn = document.querySelector(".right-column");
const rightColumnTop = rightColumn.offsetTop;

window.onscroll = function () {
  if (window.pageYOffset > rightColumnTop) {
    rightColumn.classList.add("fixed");
  } else {
    rightColumn.classList.remove("fixed");
  }
};

let totalPrice = price - credit;
let additionalServicesPrice = 0;
let selectedTipAmount = 0;

const totalDiv = document.querySelector(".end");
const ratingRow = document.createElement("div");
ratingRow.className = "rating-row";
ratingRow.innerHTML = `
  <div class="rate-quality">
      <p class="rating">Please rate</p>
      <p class="service">the quality of Service</p>
  </div>
  <div class="smiley-rating">
      <i class="fa-regular fa-face-frown"></i>
      <i class="fa-regular fa-face-meh"></i>
      <i class="fa-regular fa-face-smile"></i>
      <i class="fa-regular fa-face-grin"></i>
      <i class="fa-regular fa-face-laugh-beam"></i>
  </div>
`;
totalDiv.insertAdjacentElement("afterend", ratingRow);

const tipOptions = document.querySelectorAll("#tipOptions li");
const smileyFaces = document.querySelectorAll(".smiley-rating i");
const customTipInput = document.getElementById("customTip");

function updateTipAmounts() {
  const finalPrice = totalPrice + additionalServicesPrice;
  if (finalPrice < 5000) {
    setTipAmounts([40, 50, 60, 80, 100]);
  } else if (finalPrice >= 5000 && finalPrice < 10000) {
    setTipAmounts([60, 80, 100, 120, 150]);
  } else {
    setTipAmounts([100, 130, 160, 190, 250]);
  }
}

function setTipAmounts(tipAmounts) {
  tipOptions.forEach((option, index) => {
    const amount = tipAmounts[index];
    option.setAttribute("data-tip", amount);
    option.querySelector(".text").textContent = `${option.querySelector('.text').textContent.split('(')[0].trim()} ($${amount})`;
  });
}

tipOptions.forEach((option, index) => {
  option.addEventListener("click", () => {
    selectedTipAmount = parseInt(option.getAttribute("data-tip"));
    customTipInput.value = 0; // Reset custom tip input when a predefined tip is selected
    updateTipAmount();

    // Clear all active classes
    smileyFaces.forEach((face, i) => {
      face.classList.remove("highlight");
      if (i <= index) {
        face.classList.add("highlight");
      }
    });

    tipOptions.forEach((tip, idx) => {
      if (idx <= index) {
        tip.classList.remove("darken");
      } else {
        tip.classList.add("darken");
      }
    });
  });
});
function updateCustomTipLabel() {
  const customTipLabel = document.querySelector('.custom-tip label');

  if (window.innerWidth <= 600) {
    customTipLabel.innerHTML = 'Leave a Tip <br/> (Optional)';
  } else {
    customTipLabel.innerHTML = 'Think I did <br/> better?';
  }
}

// Run on page load
updateCustomTipLabel();

// Add event listener for window resize
window.addEventListener('resize', updateCustomTipLabel);

customTipInput.addEventListener("input", () => {
  const value = parseInt(customTipInput.value, 10) || 0;
  selectedTipAmount = value;
  updateTipAmount();

  // Clear all active classes if custom tip is used
  if (value >= 0) {
    tipOptions.forEach((tip) => {
      tip.classList.add("darken");
    });

    smileyFaces.forEach((face, i) => {
      face.classList.remove("highlight");
      if (i < value / 20) {
        face.classList.add("highlight");
      }
    });

    updateTipAmount();
  }
});

function updateTipAmount() {
  const tipAmountElement = document.getElementById("tipAmount");
  tipAmountElement.textContent = `$${selectedTipAmount.toFixed(2)}`;
  updateTotalPrice();
}

function updateTotalPrice() {
  const updatedNetPrice = (grossprice - netprice) + additionalServicesPrice + selectedTipAmount - credit;
  const finalPrice = totalPrice + additionalServicesPrice + selectedTipAmount;
  document.getElementById("mainPrice").textContent = `$${finalPrice.toFixed(2)}`;
  document.getElementById("total1").textContent = `$${finalPrice.toFixed(2)}`;
  document.getElementById("netTotal").textContent = `$${updatedNetPrice.toFixed(2)}`;
  updateTipAmounts();
}

const smileyRating = document.querySelector(".smiley-rating");
const mainSection = document.querySelector(".main");

smileyRating.addEventListener("click", (event) => {
  if (event.target.tagName === "I") {
    mainSection.scrollIntoView({ behavior: "smooth" });
  }
});
const exchangeableFlightButton = document.querySelector(
  "#exchangeableFlight .add-button"
);
const exchangeablePrice = (price * 0.08).toFixed(2);

// Confirmation Modal Elements
const confirmationModal = document.getElementById("confirmationModal");
const confirmYesButton = document.getElementById("confirmYes");
const confirmNoButton = document.getElementById("confirmNo");
const modalCloseButton = document.querySelector(".close");

let cancelExchangeable = false;

function showConfirmationModal() {
  confirmationModal.style.display = "block";
}

function hideConfirmationModal() {
  confirmationModal.style.display = "none";
}

modalCloseButton.addEventListener("click", hideConfirmationModal);
confirmNoButton.addEventListener("click", () => {
  document.querySelector(
    "#exchangeableFlight .add-button"
  ).textContent = `$${exchangeablePrice}`;
  document.querySelector(
    'input[name="exchangeableOption"][value="yes"]'
  ).checked = true;
  hideConfirmationModal();
});

confirmYesButton.addEventListener("click", () => {
  if (cancelExchangeable) {
    const exchangeablePrice = (price * 0.08).toFixed(2);
    additionalServicesPrice -= parseFloat(exchangeablePrice);
    document.querySelector("#exchangeableFlight .add-button").textContent =
      "ADD";
    document.querySelector(
      'input[name="exchangeableOption"][value="no"]'
    ).checked = true;
    updateTotalPrice();
  }
  hideConfirmationModal();
});

// Event listeners for exchangeable flight options
document
  .querySelectorAll('input[name="exchangeableOption"]')
  .forEach((option) => {
    option.addEventListener("change", function () {
      const exchangeablePrice = (price * 0.08).toFixed(2);

      if (this.value === "yes") {
        document.querySelector(
          "#exchangeableFlight .add-button"
        ).textContent = `$${exchangeablePrice}`;
        additionalServicesPrice += parseFloat(exchangeablePrice);
        updateTotalPrice();
      } else if (this.value === "no") {
        if (
          document.querySelector("#exchangeableFlight .add-button")
            .textContent !== "ADD"
        ) {
          cancelExchangeable = true;
          showConfirmationModal();
        }
      }
    });
  });

document
  .getElementById("exchangeableFlight")
  .addEventListener("click", function (event) {
    if (event.target.classList.contains("add-button")) {
      const exchangeablePrice = (price * 0.08).toFixed(2);
      if (event.target.textContent === "ADD") {
        event.target.textContent = `$${exchangeablePrice}`;
        additionalServicesPrice += parseFloat(exchangeablePrice);
        document.querySelector(
          'input[name="exchangeableOption"][value="yes"]'
        ).checked = true;
        updateTotalPrice();
      } else {
        cancelExchangeable = true;
        showConfirmationModal();
      }
    }
  });

document
  .getElementById("lostBaggageProtection")
  .addEventListener("click", function (event) {
    if (event.target.classList.contains("add-button")) {
      const baggagePrice = 39.91;
      if (event.target.textContent === "ADD") {
        event.target.textContent = `$${baggagePrice.toFixed(2)}`;
        additionalServicesPrice += baggagePrice;
      } else {
        event.target.textContent = "ADD";
        additionalServicesPrice -= baggagePrice;
      }
      updateTotalPrice();
    }
  });

const one = document.querySelector(".one");
const two = document.querySelector(".two");
const three = document.querySelector(".three");
const four = document.querySelector(".four");
const five = document.querySelector(".five");

const icons = document.querySelectorAll("ul li .icon");
const texts = document.querySelectorAll("ul li .text");

function setActiveProgress(progress, index) {
  const progresses = [one, two, three, four, five];
  progresses.forEach((p, i) => {
    if (i <= index) {
      p.classList.add("active");
      p.parentElement.classList.remove("darken");
    } else {
      p.classList.remove("active");
      p.parentElement.classList.add("darken");
    }
  });

  icons.forEach((icon, i) => {
    if (i <= index) {
      icon.style.color = "#ffc496";
    } else {
      icon.style.color = "#aaa";
    }
  });

  texts.forEach((text, i) => {
    if (i <= index) {
      text.style.color = "#ffc496";
    } else {
      text.style.color = "#aaa";
    }
  });
}

one.onclick = function () {
  setActiveProgress(one, 0);
  customTipInput.value = 0;
};

two.onclick = function () {
  setActiveProgress(two, 1);
  customTipInput.value = 0;
};

three.onclick = function () {
  setActiveProgress(three, 2);
  customTipInput.value = 0;
};

four.onclick = function () {
  setActiveProgress(four, 3);
  customTipInput.value = 0;
};

five.onclick = function () {
  setActiveProgress(five, 4);
  customTipInput.value = 0;
};

// Modify custom tip input event listener to handle 0 and highlighting
customTipInput.addEventListener("input", () => {
  const value = parseInt(customTipInput.value, 10) || 0;
  selectedTipAmount = value;
  updateTipAmount();

  // Gray out all options when custom tip is used
  if (value >= 0) {
    tipOptions.forEach((tip) => {
      tip.classList.add("darken");
    });

    smileyFaces.forEach((face, i) => {
      face.classList.remove("highlight");
      if (value > 0 && value >= parseInt(tipOptions[i].getAttribute("data-tip"))) {
        face.classList.add("highlight");
      }
    });
  }
});
updateTipAmount();
updateTipAmounts();
}

  function initializeAutocomplete() {
    const stateInput = document.getElementById("state");
    const cityInput = document.getElementById("city");
    const streetInput = document.getElementById("street");

    const options = {
      componentRestrictions: { country: "us" },
    };

    const stateAutocomplete = new google.maps.places.Autocomplete(stateInput, {
      ...options,
      types: ["(regions)"],
    });
    const cityAutocomplete = new google.maps.places.Autocomplete(cityInput, {
      ...options,
      types: ["(cities)"],
    });
    const streetAutocomplete = new google.maps.places.Autocomplete(
      streetInput,
      { ...options, types: ["address"] }
    );

    stateAutocomplete.addListener("place_changed", () => {
      const place = stateAutocomplete.getPlace();
      console.log("Selected state:", place);
    });

    cityAutocomplete.addListener("place_changed", () => {
      const place = cityAutocomplete.getPlace();
      console.log("Selected city:", place);
    });

    streetAutocomplete.addListener("place_changed", () => {
      const place = streetAutocomplete.getPlace();
      console.log("Selected street address:", place);
    });
  }

  google.maps.event.addDomListener(window, "load", initializeAutocomplete);
});
