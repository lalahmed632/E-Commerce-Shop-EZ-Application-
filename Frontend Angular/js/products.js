$(function () {
  if ($("#featured-grid").length) {
    initHomePage();
  }

  if ($("#product-grid").length) {
    initCatalogPage();
  }

  if ($("#product-view").length) {
    initProductDetailsPage();
  }
});

function productCardTemplate(product) {
  var name = ShopEZUI.escapeHtml(product.name);
  var category = ShopEZUI.escapeHtml(product.category);
  var categoryClass = getCategoryClass(product.category);

  return (
    '<div class="col-sm-6 col-lg-4">' +
    '<article class="card product-card ' +
    categoryClass +
    '">' +
    '<img src="' +
    product.image +
    '" class="product-thumb" alt="' +
    name +
    '">' +
    '<div class="card-body d-flex flex-column">' +
    '<div class="d-flex justify-content-between align-items-center mb-2">' +
    '<span class="category-pill">' +
    category +
    "</span>" +
    '<span class="price-tag">' +
    ShopEZStore.formatCurrency(product.price) +
    "</span>" +
    "</div>" +
    '<h2 class="h5 mb-2">' +
    name +
    "</h2>" +
    '<p class="text-secondary small mb-3">' +
    ShopEZUI.escapeHtml(product.description.slice(0, 90)) +
    "...</p>" +
    '<div class="mt-auto d-flex gap-2">' +
    '<a href="product-details.html?id=' +
    product.id +
    '" class="btn btn-outline-primary btn-sm flex-fill">View</a>' +
    '<button type="button" class="btn btn-primary btn-sm flex-fill" data-add-cart="' +
    product.id +
    '">Add to Cart</button>' +
    "</div>" +
    "</div>" +
    "</article>" +
    "</div>"
  );
}

function getCategoryClass(category) {
  // Category maps drive both card styling and matching toast accent colors.
  var normalized = String(category || "").trim().toLowerCase();
  if (normalized === "home") {
    return "cat-light-green";
  }
  if (normalized === "electronics") {
    return "cat-light-blue";
  }
  if (normalized === "accessories") {
    return "cat-light-yellow";
  }
  if (normalized === "fashion") {
    return "cat-light-orange";
  }
  if (normalized === "fitness") {
    return "cat-light-red";
  }
  return "cat-light-green";
}

function getToastCategoryClass(category) {
  var categoryClass = getCategoryClass(category);
  return categoryClass ? "toast-" + categoryClass : "";
}

function showCategoryToast(message, category) {
  ShopEZUI.showToast(message);

  var toastClass = getToastCategoryClass(category);
  if (!toastClass) {
    return;
  }

  var $latestToast = $("#toast-host .card").last();
  if (!$latestToast.length) {
    return;
  }

  $latestToast.addClass("shopez-toast " + toastClass);
}

var ProductModule = (function () {
  function loadProducts() {
    return ShopEZProducts.loadProducts();
  }

  function getProductById(productId) {
    var id = Number(productId);
    return loadProducts().then(function (products) {
      return (
        products.find(function (product) {
          return product.id === id;
        }) || null
      );
    });
  }

  function displayProducts(products, selector) {
    var $target = $(selector || "#product-grid");
    if (!$target.length) {
      return;
    }

    var source = Array.isArray(products) ? products : [];
    if (source.length === 0) {
      $target.html(
        '<div class="col-12">' +
          '<div class="card border-0 shadow-sm p-4 text-center">' +
            "<p class=\"mb-0\">No products found.</p>" +
          "</div>" +
        "</div>"
      );
      return;
    }

    $target.html(
      source
        .map(function (product) {
          return productCardTemplate(product);
        })
        .join("")
    );
  }

  return {
    loadProducts: loadProducts,
    getProductById: getProductById,
    displayProducts: displayProducts
  };
})();

window.ProductModule = ProductModule;

function initHomePage() {
  var $featured = $("#featured-grid");
  var featuredProducts = [];

  function renderFeatured() {
    if (featuredProducts.length === 0) {
      $featured.html(
        '<div class="col-12">' +
          '<div class="card border-0 shadow-sm p-4 text-center">' +
            "<p class=\"mb-0\">No featured products found.</p>" +
          "</div>" +
        "</div>"
      );
      return;
    }

    $featured.html(
      featuredProducts
        .map(function (product) {
          return productCardTemplate(product);
        })
        .join("")
    );
  }

  $featured.on("click", "[data-add-cart]", function () {
    var productId = Number($(this).data("addCart"));
    var product = featuredProducts.find(function (item) {
      return item.id === productId;
    });
    if (!product) {
      return;
    }

    ShopEZStore.addToCart(product, 1);
    showCategoryToast(product.name + " added to cart", product.category);
  });

  ProductModule.loadProducts()
    .then(function (products) {
      var featuredOrder = [9, 1, 3];
      featuredProducts = featuredOrder
        .map(function (id) {
          return products.find(function (product) {
            return product.id === id;
          });
        })
        .filter(Boolean);
      renderFeatured();
    })
    .catch(function () {
      $featured.html(
        '<div class="col-12">' +
          '<div class="card border-0 shadow-sm p-4 text-center">' +
            "<p class=\"mb-0\">Unable to load featured products right now.</p>" +
          "</div>" +
        "</div>"
      );
    });
}

function initCatalogPage() {
  var allProducts = [];
  var searchTerm = "";
  var selectedCategory = "all";
  var sortOrder = "default";
  var query = new URLSearchParams(window.location.search);
  var requestedCategory = query.get("category");

  var $grid = $("#product-grid");
  var $empty = $("#product-empty");
  var $search = $("#search-input");
  var $category = $("#category-select");
  var $sort = $("#sort-select");

  function renderCategories(products) {
    var categories = ShopEZProducts.getCategories(products);
    // Preserve category query param if it matches available options.
    if (requestedCategory && categories.includes(requestedCategory)) {
      selectedCategory = requestedCategory;
    }
    var options = ['<option value="all">All Categories</option>']
      .concat(
        categories.map(function (category) {
          return '<option value="' + category + '">' + ShopEZUI.escapeHtml(category) + "</option>";
        })
      )
      .join("");
    $category.html(options);
    $category.val(selectedCategory);
  }

  function sortProducts(products) {
    var sorted = products.slice();
    if (sortOrder === "name-asc") {
      sorted.sort(function (a, b) { return a.name.localeCompare(b.name); });
    } else if (sortOrder === "name-desc") {
      sorted.sort(function (a, b) { return b.name.localeCompare(a.name); });
    } else if (sortOrder === "price-asc") {
      sorted.sort(function (a, b) { return a.price - b.price; });
    } else if (sortOrder === "price-desc") {
      sorted.sort(function (a, b) { return b.price - a.price; });
    }
    return sorted;
  }

  function renderProducts() {
    var filtered = allProducts.filter(function (product) {
      // Search is intentionally name-based for quick, predictable matching.
      var byCategory = selectedCategory === "all" || product.category === selectedCategory;
      var bySearch = product.name.toLowerCase().includes(searchTerm);
      return byCategory && bySearch;
    });

    var sorted = sortProducts(filtered);

    if (sorted.length === 0) {
      $empty.removeClass("d-none");
      $grid.html("");
      return;
    }

    $empty.addClass("d-none");
    $grid.html(
      sorted
        .map(function (product) {
          return productCardTemplate(product);
        })
        .join("")
    );
  }

  $search.on("input", function () {
    searchTerm = $(this).val().trim().toLowerCase();
    renderProducts();
  });

  $category.on("change", function () {
    selectedCategory = $(this).val();
    renderProducts();
  });

  $sort.on("change", function () {
    sortOrder = $(this).val();
    renderProducts();
  });

  $grid.on("click", "[data-add-cart]", function () {
    var productId = Number($(this).data("addCart"));
    var product = allProducts.find(function (item) {
      return item.id === productId;
    });
    if (!product) {
      return;
    }

    ShopEZStore.addToCart(product, 1);
    showCategoryToast(product.name + " added to cart", product.category);
  });

  ProductModule.loadProducts()
    .then(function (products) {
      allProducts = products;
      renderCategories(products);
      renderProducts();
    })
    .catch(function () {
      $grid.html("");
      $empty.removeClass("d-none").text("Unable to load products right now.");
    });
}

function initProductDetailsPage() {
  var $productView = $("#product-view");
  var detailCategoryClasses = "cat-light-green cat-light-blue cat-light-yellow cat-light-orange cat-light-red";

  function renderNotFound(message) {
    $productView.removeClass(detailCategoryClasses);
    $productView.html(
      '<div class="text-center py-4">' +
      '<h2 class="h4 mb-2">Product not found</h2>' +
      "<p>" +
      ShopEZUI.escapeHtml(message) +
      "</p>" +
      '<a href="products.html" class="btn btn-primary">Back to Products</a>' +
      "</div>"
    );
  }

  function renderProduct(product) {
    var categoryClass = getCategoryClass(product.category);
    $productView.removeClass(detailCategoryClasses).addClass(categoryClass);

    $productView.html(
      '<div class="row g-4 align-items-start">' +
      '<div class="col-md-6">' +
      '<img src="' +
      product.image +
      '" class="product-detail-image" alt="' +
      ShopEZUI.escapeHtml(product.name) +
      '">' +
      "</div>" +
      '<div class="col-md-6">' +
      '<span class="category-pill mb-2 d-inline-block">' +
      ShopEZUI.escapeHtml(product.category) +
      "</span>" +
      '<h1 class="h2 mb-3">' +
      ShopEZUI.escapeHtml(product.name) +
      "</h1>" +
      '<p class="product-meta mb-3">' +
      ShopEZUI.escapeHtml(product.description) +
      "</p>" +
      '<p class="price-tag mb-4">' +
      ShopEZStore.formatCurrency(product.price) +
      "</p>" +
      '<div class="d-flex flex-wrap gap-2 align-items-center">' +
      '<div class="qty-control detail-qty-control">' +
      '<button id="detail-qty-minus" type="button" class="btn btn-sm btn-outline-dark qty-btn">-</button>' +
      '<input id="detail-qty" type="number" class="form-control qty-input quantity-input" value="1" min="1" max="10">' +
      '<button id="detail-qty-plus" type="button" class="btn btn-sm btn-outline-dark qty-btn">+</button>' +
      "</div>" +
      '<button id="detail-add-btn" type="button" class="btn btn-primary">Add to Cart</button>' +
      '<a href="cart.html" class="btn btn-outline-primary">View Cart</a>' +
      "</div>" +
      "</div>" +
      "</div>"
    );

    function normalizeDetailQty(value) {
      // Product details page caps per-click quantity to avoid oversized local cart updates.
      var qty = Number(value) || 1;
      return Math.max(1, Math.min(10, qty));
    }

    $("#detail-qty-minus").on("click", function () {
      var currentQty = normalizeDetailQty($("#detail-qty").val());
      $("#detail-qty").val(normalizeDetailQty(currentQty - 1));
    });

    $("#detail-qty-plus").on("click", function () {
      var currentQty = normalizeDetailQty($("#detail-qty").val());
      $("#detail-qty").val(normalizeDetailQty(currentQty + 1));
    });

    $("#detail-qty").on("change", function () {
      $(this).val(normalizeDetailQty($(this).val()));
    });

    $("#detail-add-btn").on("click", function () {
      var qty = normalizeDetailQty($("#detail-qty").val());
      ShopEZStore.addToCart(product, qty);
      showCategoryToast(product.name + " added to cart", product.category);
    });
  }

  var query = new URLSearchParams(window.location.search);
  var productId = Number(query.get("id"));

  if (!Number.isFinite(productId) || productId <= 0) {
    renderNotFound("The product ID in the URL is invalid.");
    return;
  }

  ProductModule.getProductById(productId)
    .then(function (product) {
      if (!product) {
        renderNotFound("This product does not exist.");
        return;
      }
      renderProduct(product);
    })
    .catch(function () {
      renderNotFound("Unable to load product details right now.");
    });
}


