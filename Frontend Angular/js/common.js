(function () {
  var CART_KEY = "cart";
  var LEGACY_CART_KEY = "shopez_cart_v1";

  // Parse persisted JSON safely so corrupt storage never breaks app boot.
  function safeParse(value, fallback) {
    try {
      var parsed = JSON.parse(value);
      return parsed == null ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function sanitizeCart(cart) {
    if (!Array.isArray(cart)) {
      return [];
    }

    return cart
      .filter(function (item) {
        return item && Number.isFinite(Number(item.id)) && Number.isFinite(Number(item.price));
      })
      .map(function (item) {
        return {
          id: Number(item.id),
          name: String(item.name || "Unnamed Product"),
          price: Number(item.price),
          image: String(item.image || ""),
          quantity: Math.max(1, Math.floor(Number(item.quantity) || 1))
        };
      });
  }

  function getCart() {
    var stored = localStorage.getItem(CART_KEY);
    if (!stored) {
      // One-time migration path for users who still have the legacy key.
      var legacy = localStorage.getItem(LEGACY_CART_KEY);
      if (legacy) {
        localStorage.setItem(CART_KEY, legacy);
        localStorage.removeItem(LEGACY_CART_KEY);
        stored = legacy;
      }
    }
    return sanitizeCart(safeParse(stored, []));
  }

  function saveCart(cart) {
    var sanitized = sanitizeCart(cart);
    var itemCount = sanitized.reduce(function (total, item) {
      return total + Number(item.quantity || 0);
    }, 0);

    localStorage.setItem(CART_KEY, JSON.stringify(sanitized));
    // Keep header cart badge in sync from one shared source of truth.
    $(".cart-count").text(itemCount).toggleClass("d-none", itemCount <= 0);
    return sanitized;
  }

  function addToCart(product, quantity) {
    var qty = Math.max(1, Math.floor(Number(quantity) || 1));
    var productId = Number(product.id);
    var cart = getCart();
    var existing = cart.find(function (item) {
      return item.id === productId;
    });

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({
        id: productId,
        name: String(product.name),
        price: Number(product.price),
        image: String(product.image || ""),
        quantity: qty
      });
    }

    return saveCart(cart);
  }

  function updateQuantity(productId, quantity) {
    var MAX_QTY = 99;
    var id = Number(productId);
    var qty = Math.min(MAX_QTY, Math.floor(Number(quantity)));
    var cart = getCart();

    if (!Number.isFinite(qty)) {
      return cart;
    }

    if (qty <= 0) {
      return removeFromCart(id);
    }

    var updated = cart.map(function (item) {
      if (item.id === id) {
        item.quantity = qty;
      }
      return item;
    });

    return saveCart(updated);
  }

  function removeFromCart(productId) {
    var id = Number(productId);
    var cart = getCart().filter(function (item) {
      return item.id !== id;
    });
    return saveCart(cart);
  }

  function clearCart() {
    return saveCart([]);
  }

  function getCartCount() {
    return getCart().reduce(function (total, item) {
      return total + item.quantity;
    }, 0);
  }

  function getSummary(cartInput) {
    var cart = Array.isArray(cartInput) ? cartInput : getCart();
    var subtotal = calculateTotal(cart);
    var shipping = cart.reduce(function (total, item) {
      var price = Number(item.price || 0);
      var quantity = Number(item.quantity || 0);
      if (price <= 500) {
        return total;
      }
      return total + quantity * 99;
    }, 0);
    // Free shipping threshold is applied at cart level, not per item/category.
    if (subtotal > 6000) {
      shipping = 0;
    }
    var tax = 0;
    var total = subtotal + shipping;
    var itemCount = cart.reduce(function (count, item) {
      return count + item.quantity;
    }, 0);

    return {
      itemCount: itemCount,
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      total: total
    };
  }

  function formatCurrency(amount) {
    var value = Number(amount) || 0;
    return "Rs " + new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function calculateTotal(cartInput) {
    var cart = Array.isArray(cartInput) ? cartInput : getCart();
    return cart.reduce(function (total, item) {
      var quantity = Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 1;
      return total + Number(item.price || 0) * quantity;
    }, 0);
  }

  window.ShopEZStore = {
    getCart: getCart,
    saveCart: saveCart,
    addToCart: addToCart,
    updateQuantity: updateQuantity,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    getCartCount: getCartCount,
    calculateTotal: calculateTotal,
    getSummary: getSummary,
    formatCurrency: formatCurrency
  };
})();

(function () {
  var cache = null;

  function normalize(products) {
    if (!Array.isArray(products)) {
      return [];
    }

    return products.map(function (item) {
      return {
        id: Number(item.id),
        name: String(item.name || ""),
        category: String(item.category || "General"),
        price: Number(item.price || 0),
        description: String(item.description || ""),
        image: String(item.image || "")
      };
    });
  }

  function loadProducts() {
    if (cache) {
      return Promise.resolve(cache);
    }

    return $.getJSON("data/products.json").then(function (products) {
      cache = normalize(products);
      return cache;
    });
  }

  function getById(productId) {
    var id = Number(productId);
    return loadProducts().then(function (products) {
      return (
        products.find(function (product) {
          return product.id === id;
        }) || null
      );
    });
  }

  function getCategories(products) {
    var source = Array.isArray(products) ? products : [];
    var unique = new Set(
      source.map(function (product) {
        return product.category;
      })
    );
    return Array.from(unique).sort();
  }

  window.ShopEZProducts = {
    loadProducts: loadProducts,
    getById: getById,
    getCategories: getCategories
  };
})();

(function () {
  function syncCartCount() {
    var count = window.ShopEZStore ? ShopEZStore.getCartCount() : 0;
    $(".cart-count").text(count).toggleClass("d-none", count <= 0);
  }

  function showToast(message) {
    var host = $("#toast-host");
    if (!host.length) {
      $("body").append('<div id="toast-host" class="position-fixed bottom-0 end-0 p-3" style="z-index:1090;"></div>');
      host = $("#toast-host");
    }

    var id = "toast-" + Date.now();
    host.append(
      '<div id="' +
        id +
        '" class="card p-2 shadow-sm mb-2">' +
        '<p class="mb-0 small">' +
        escapeHtml(message) +
        "</p>" +
      "</div>"
    );
    setTimeout(function () {
      $("#" + id).remove();
    }, 1600);
  }

  function escapeHtml(value) {
    var text = String(value == null ? "" : value);
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initScrollToTop() {
    $("body").append(
      '<button id="scroll-top-btn" aria-label="Back to top" title="Back to top">' +
      '<i class="bi bi-arrow-up"></i>' +
      "</button>"
    );

    var $btn = $("#scroll-top-btn");

    $(window).on("scroll.scrolltop", function () {
      if ($(this).scrollTop() > 300) {
        $btn.addClass("visible");
      } else {
        $btn.removeClass("visible");
      }
    });

    $btn.on("click", function () {
      $("html, body").animate({ scrollTop: 0 }, 400);
    });
  }

  $(function () {
    syncCartCount();
    initScrollToTop();
  });

  window.ShopEZUI = {
    syncCartCount: syncCartCount,
    showToast: showToast,
    escapeHtml: escapeHtml
  };
})();


