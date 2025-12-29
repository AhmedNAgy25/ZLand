!(function () {
  // Constants
  const CART_STORAGE_KEY = "zland_cart";
  const DEFAULT_PRODUCT_IMAGE = "assets/product.png";
  const PRODUCT_IMAGE_BASE_PATH = "productImge/";

  // Utility Functions
  const utils = {
    // Convert Western Arabic numerals to Eastern Arabic numerals
    toEasternNumerals: (number) => {
      return String(number).replace(/[0-9]/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[digit]);
    },

    // Get size display text
    getSizeDisplay: (size) => {
      const sizeMap = {
        large: "1000 mL",
        small: "250 mL",
      };
      return sizeMap[size] || "";
    },

    // Truncate text with ellipsis
    truncateText: (text, maxLength = 80) => {
      return text
        ? text.length > maxLength
          ? text.slice(0, maxLength) + "..."
          : text
        : "";
    },

    // Generate product image path
    getProductImagePath: (product) => {
      const name = (product["الاسم"] || "").trim();
      const size = (product.size || "").trim();

      if (size && size !== "unknown") {
        return `${PRODUCT_IMAGE_BASE_PATH}${name} ${size}.jpg`;
      }
      return `${PRODUCT_IMAGE_BASE_PATH}${name}.jpg`;
    },
  };

  // Cart Management
  const cartManager = {
    getCart: () => {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    },

    saveCart: (cart) => {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    },

    addToCart: (product) => {
      const cart = cartManager.getCart();
      const existingItemIndex = cart.findIndex(
        (item) =>
          item["الاسم"] === product["الاسم"] && item.size === product.size
      );

      if (existingItemIndex > -1) {
        cart[existingItemIndex].qty += 1;
      } else {
        cart.push({ ...product, qty: 1 });
      }

      cartManager.saveCart(cart);
      cartManager.updateCartUI();
    },

    increaseQuantity: (index) => {
      const cart = cartManager.getCart();
      cart[index].qty += 1;
      cartManager.saveCart(cart);
      cartManager.updateCartUI();
    },

    decreaseQuantity: (index) => {
      const cart = cartManager.getCart();
      if (cart[index].qty > 1) {
        cart[index].qty -= 1;
      } else {
        cart.splice(index, 1);
      }
      cartManager.saveCart(cart);
      cartManager.updateCartUI();
    },

    removeFromCart: (index) => {
      const cart = cartManager.getCart();
      cart.splice(index, 1);
      cartManager.saveCart(cart);
      cartManager.updateCartUI();
    },

    updateCartUI: () => {
      const cart = cartManager.getCart();
      const countElement = document.getElementById("cart-count");
      const itemsElement = document.getElementById("cart-items");
      const totalElement = document.getElementById("cart-total");

      // Update cart count
      if (countElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        countElement.textContent = totalItems;
      }

      // Update cart items list
      if (itemsElement) {
        if (cart.length === 0) {
          itemsElement.innerHTML =
            '<li class="list-group-item">سلة المشتريات فارغة</li>';
        } else {
          itemsElement.innerHTML = cart
            .map(
              (item, index) => `
            <li class="list-group-item d-flex justify-content-between align-items-center item-card-container">
              <span>
                <span dir="ltr" style="unicode-bidi: embed;">${
                  item["الاسم"]
                }</span>
                <span style="unicode-bidi: embed;">${utils.getSizeDisplay(
                  item.size
                )}</span>
                ×
                <span dir="rtl" style="unicode-bidi: embed;">${utils.toEasternNumerals(
                  item.qty
                )}</span>
              </span>
              <span>${utils.toEasternNumerals(item.price * item.qty)} ج.م</span>
              <div class="btn-group ms-2 car-controller" role="group">
                <button class="btn btn-sm btn-btn-success border-0 bg-success" onclick="cartManager.increaseQuantity(${index})">+</button>
                <button class="btn btn-sm btn-danger ms-1 border-0 me-1" onclick="cartManager.removeFromCart(${index})">حذف</button>
                <button class="btn btn-sm btn-btn-success border-0 bg-success" onclick="cartManager.decreaseQuantity(${index})">-</button>
              </div>
            </li>
          `
            )
            .join("");
        }
      }

      // Update total
      if (totalElement) {
        const totalAmount = cart.reduce(
          (sum, item) => sum + item.price * item.qty,
          0
        );
        totalElement.textContent = utils.toEasternNumerals(totalAmount);
      }
    },

    checkout: () => {
      const cart = cartManager.getCart();
      if (cart.length === 0) return;

      let message = "أرغب في شراء المنتجات التالية:%0A";
      cart.forEach((item) => {
        message += `- ${item["الاسم"]} ${utils.getSizeDisplay(item.size)} × ${
          item.qty
        } = ${item.price * item.qty} ج.م%0A`;
      });

      const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      message += `%0Aالإجمالي: ${total} ج.م`;

      window.open(`https://wa.me/201021944642?text=${message}`, "_blank");
      cartManager.saveCart([]);
      cartManager.updateCartUI();
    },
  };

  // Modal Management
  const modalManager = {
    initModal: () => {
      if (!document.getElementById("productModal")) {
        const modalHTML = `
          <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="productModalLabel"></h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="row">
                    <div class="col-md-4">
                      <img id="modalProductImg" src="${DEFAULT_PRODUCT_IMAGE}" class="img-fluid rounded" alt="Product Image" />
                    </div>
                    <div class="col-md-8">
                      <div id="modalContent"></div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                  <a href="contact.html" class="btn btn-success">اطلب الآن</a>
                </div>
              </div>
            </div>
          </div>
        `;
        document.body.insertAdjacentHTML("beforeend", modalHTML);
      }
    },

    showProductDetails: (product) => {
      modalManager.initModal();

      const modal = new bootstrap.Modal(
        document.getElementById("productModal")
      );
      const titleElement = document.getElementById("productModalLabel");
      const contentElement = document.getElementById("modalContent");
      const imageElement = document.getElementById("modalProductImg");

      // Set modal title
      titleElement.textContent = `${
        product["الاسم"] || "منتج"
      } - ${utils.getSizeDisplay(product.size)}`;

      // Set modal content
      contentElement.innerHTML = `
        <h6 class="text-muted mb-3 rtl-text">${
          product["مميزات المنتج"] || ""
        }</h6>
        <div class="mb-3"><strong>التصنيف:</strong> ${
          product["تصنيف المنتج"] || ""
        }</div>
        <div class="mb-3"><strong>الاستخدامات:</strong><p>${
          product["أستخدماته"] || ""
        }</p></div>
        <div class="mb-3"><strong>المكونات:</strong><p>${
          product["المكونات"] || ""
        }</p></div>
        <div class="mb-3"><strong>طريقة الاستخدام:</strong><p>${
          product["طريقة الاستخدام"] || ""
        }</p></div>
        <div class="mb-3"><strong>طريقة التخزين:</strong><p>${
          product["طريقة التخزين"] || ""
        }</p></div>
        <div class="mb-3"><strong>فترة الصلاحية:</strong><p>${
          product["فترة الصلاحية"] || ""
        }</p></div>
        <div class="mt-4">
          <h3 lang="ar" style="color: var(--Primary);">
            ${utils.toEasternNumerals(product.price)}<span> ج.م</span>
          </h3>
        </div>
      `;

      // Set product image
      imageElement.src = utils.getProductImagePath(product);
      imageElement.onerror = () => {
        imageElement.src = DEFAULT_PRODUCT_IMAGE;
      };

      // Update modal footer with cart button
      const footer = document.querySelector("#productModal .modal-footer");
      if (footer) {
        footer.innerHTML = `
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
          <button type="button" id="modalAddToCartBtn" class="btn btn-warning">أضف للسلة</button>
          <a href="contact.html" class="btn btn-success">اطلب الآن</a>
        `;

        document.getElementById("modalAddToCartBtn").onclick = () => {
          cartManager.addToCart(product);
          modal.hide();
        };
      }

      modal.show();
    },
  };

  // Product Card Template
  const productTemplates = {
    createProductCard: (product, { showReadMore = true } = {}) => {
      const safeProductJson = JSON.stringify(product).replace(/\"/g, "&quot;");

      return `
        <div class="card h-100 shadow w-100" style="min-height: 420px; display: flex; flex-direction: column;">
          <img src="${utils.getProductImagePath(product)}" 
               class="card-img-top" 
               alt="${product["الاسم"] || "منتج"}"
               style="object-fit: contain; height: 180px; background: #f8f8f8; cursor: pointer;"
               onerror="this.src='${DEFAULT_PRODUCT_IMAGE}'"
               onclick="modalManager.showProductDetails(${safeProductJson})" />
          <div class="card-body d-flex flex-column" style="flex: 1 1 auto; min-height: 200px;">
            <div style="margin-bottom: 0.5rem;">
              <span class="card-title" style="display:block;font-size:1.35rem;font-weight:800;color:var(--Primary);line-height:1.2;">
                ${product["الاسم"] || ""} 
                <span style="font-size:0.8em;color:#888;">${utils.getSizeDisplay(
                  product.size
                )}</span>
              </span>
              <span class="card-category" style="display:block;font-size:1rem;font-weight:500;color:#4e6e4e;opacity:0.85;margin-top:0.15em;">
                ${product["تصنيف المنتج"] || ""}
              </span>
            </div>

            <h6 class="card-subtitle mb-3 text-muted" style="font-size:0.95em;direction: rtl;text-align: start">
              ${utils.truncateText(product["مميزات المنتج"], 200)}
            </h6>

            <div class="mt-auto d-flex flex-column align-items-end justify-content-end" style="margin-top: auto;">
              <h3 lang="ar" class="mt-2 mb-2" style="font-size: 1.5em; color: var(--Primary);">
                ${utils.toEasternNumerals(product.price)}<span> ج.م</span>
              </h3>

              <div class="d-flex gap-2 w-100">
                ${
                  showReadMore
                    ? `<button class="btn btn-outline-primary flex-fill" onclick="modalManager.showProductDetails(${safeProductJson})">اقرأ المزيد</button>`
                    : ""
                }
                <button class="btn btn-warning flex-fill" onclick='cartManager.addToCart(${safeProductJson})'>أضف للسلة</button>
              </div>
            </div>
          </div>
        </div>
      `;
    },
  };

  // Product Data Management
  const productManager = {
    loadProducts: async () => {
      try {
        const response = await fetch("items.json");
        const products = await response.json();

        productManager.renderIndexProducts(products);
        productManager.renderAllProducts(products);
      } catch (error) {
        productManager.handleLoadError();
      }
    },

    renderIndexProducts: (products) => {
      const container = document.getElementById("index-products-container");
      if (!container) return;

      container.innerHTML = "";
      products.slice(0, 3).forEach((product) => {
        const productElement = document.createElement("div");
        productElement.className =
          "col-12 col-md-6 col-lg-4 mb-4 d-flex align-items-stretch";
        productElement.innerHTML = productTemplates.createProductCard(product);
        container.appendChild(productElement);
      });
    },

    renderAllProducts: (products) => {
      const container = document.getElementById("products-container");
      if (!container) return;

      container.innerHTML = "";
      products.forEach((product) => {
        const productElement = document.createElement("div");
        productElement.className =
          "col-12 col-md-6 col-lg-4 mb-4 d-flex align-items-stretch";
        productElement.innerHTML = productTemplates.createProductCard(product);
        container.appendChild(productElement);
      });
    },

    handleLoadError: () => {
      const errorHTML =
        '<div class="alert alert-danger">تعذر تحميل المنتجات أو عرضها.</div>';

      const indexContainer = document.getElementById(
        "index-products-container"
      );
      const allProductsContainer =
        document.getElementById("products-container");

      if (indexContainer) indexContainer.innerHTML = errorHTML;
      if (allProductsContainer) allProductsContainer.innerHTML = errorHTML;
    },
  };

  // Initialize Application
  const init = () => {
    // Make managers globally available
    window.modalManager = modalManager;
    window.cartManager = cartManager;

    // Initialize cart UI
    cartManager.updateCartUI();

    // Setup checkout button
    const checkoutButton = document.getElementById("checkout-btn");
    if (checkoutButton) {
      checkoutButton.onclick = cartManager.checkout;
    }

    // Load products
    productManager.loadProducts();
  };

  // Start the application when DOM is ready
  document.addEventListener("DOMContentLoaded", init);
})();
