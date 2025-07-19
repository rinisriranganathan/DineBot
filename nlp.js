// Step 1: Start listening
function startListening() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;

  recognition.onresult = function (event) {
    const text = event.results[0][0].transcript;
    document.getElementById("speechText").textContent = text;
    processTextWithNLP(text);
  };

  recognition.onerror = function (event) {
    alert("Error: " + event.error);
  };

  recognition.start();
}

// Step 2: NLP to extract items
function processTextWithNLP(text) {
  const menuItems = ["burger", "pizza", "fries", "coke", "cold coffee"];
  const cart = [];

  menuItems.forEach(item => {
    const pattern = new RegExp(`(\\d+)?\\s*${item}`, 'i');
    const match = text.match(pattern);
    if (match) {
      cart.push({
        item: item,
        quantity: parseInt(match[1]) || 1
      });
    }
  });

  // Show cart
  document.getElementById("cartOutput").textContent = JSON.stringify(cart, null, 2);

  // You can now send this `cart` to your backend using fetch
}
