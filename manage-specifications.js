let products = []; // Array to store fetched products
let selectedSpecs = JSON.parse(localStorage.getItem("selectedSpecs")) || {}; // Retrieve selected specifications

// DOM Elements
const searchInput = document.getElementById("search-input");
const productSpecsList = document.getElementById("product-specs-list");

// Fetch products from products.json
async function fetchProducts() {
  try {
    const response = await fetch("products.json"); // Fetch the JSON file
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    products = await response.json(); // Parse JSON data
    renderProductSpecs(products); // Render product specifications
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Render Product Specifications
function renderProductSpecs(filteredProducts) {
  productSpecsList.innerHTML = filteredProducts
    .map(
      (product) => `
      <tr>
        <td>${product.name}</td>
        <td>
          ${Object.entries(product.specifications)
            .map(
              ([key, value]) => `
            <div class="spec-checkbox">
              <input
                type="checkbox"
                id="spec-${product.id}-${key}"
                ${selectedSpecs[product.id]?.some((spec) => spec.key === key) ? "checked" : ""}
                onchange="updateSelectedSpecs(${product.id}, '${key}', '${value}')"
              >
              <label for="spec-${product.id}-${key}">${key}: ${value}</label>
            </div>
          `
            )
            .join("")}
        </td>
      </tr>
    `
    )
    .join("");
}

// Update Selected Specifications
function updateSelectedSpecs(productId, key, value) {
  if (!selectedSpecs[productId]) {
    selectedSpecs[productId] = [];
  }

  const specIndex = selectedSpecs[productId].findIndex((spec) => spec.key === key);

  if (specIndex === -1) {
    selectedSpecs[productId].push({ key, value });
  } else {
    selectedSpecs[productId].splice(specIndex, 1);
  }

  // Save to localStorage
  localStorage.setItem("selectedSpecs", JSON.stringify(selectedSpecs));
}

// Search Products
searchInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm)
  );
  renderProductSpecs(filteredProducts);
});

// Initialize
fetchProducts(); // Fetch products when the page loads