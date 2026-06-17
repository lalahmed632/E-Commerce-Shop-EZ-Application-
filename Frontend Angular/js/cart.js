$(function () {
  var $rows = $("#cart-rows");
  var $contentWrap = $("#cart-content-wrap");
  var $emptyState = $("#empty-cart-state");
  var $checkoutBtn = $("#checkout-btn");

  function itemRow(item) {
    return (
      '<div class="card border-0 shadow-sm cart-item-card">' +
      '<div class="card-body py-3">' +
      '<div class="row g-2 align-items-center">' +
      '<div class="col-md-4 d-flex align-items-center gap-2">' +
      '<img src="' +
      item.image +
      '" alt="' +
      ShopEZUI.escapeHtml(item.name) +
      '" class="line-item-image">' +
      '<div class="fw-semibold">' +
      ShopEZUI.escapeHtml(item.name) +
      "</div>" +
      "</div>" +
      '<div class="col-md-2 text-md-end">' +
      ShopEZStore.formatCurrency(item.price) +
      "</div>" +
      '<div class="col-md-2 d-flex justify-content-md-center">' +
      '<div class="qty-control">' +
      '<button type="button" class="btn btn-sm btn-outline-dark qty-btn qty-minus" data-id="' +
      item.id +
      '">-</button>' +
      '<input type="number" min="1" max="99" class="form-control form-control-sm qty-input quantity-input" data-id="' +
      item.id +
      '" value="' +
      item.quantity +
      '">' +
      '<button type="button" class="btn btn-sm btn-outline-dark qty-btn qty-plus" data-id="' +
      item.id +
      '">+</button>' +
      "</div>" +
      "</div>" +
      '<div class="col-md-2 text-md-end fw-semibold">' +
      ShopEZStore.formatCurrency(item.price * item.quantity) +
      "</div>" +
      '<div class="col-md-2 text-md-end">' +
      '<button type="button" class="btn btn-sm btn-outline-danger remove-item-btn" data-id="' +
      item.id +
      '">Remove</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function showCartRemoveToast(message) {
    ShopEZUI.showToast(message);
    var $latestToast = $("#toast-host .card").last();
    if ($latestToast.length) {
      $latestToast.addClass("shopez-toast toast-cat-light-green");
    }
  }

  function updateSummary(summary) {
    $("#summary-subtotal").text(ShopEZStore.formatCurrency(summary.subtotal));
    $("#summary-total").text(ShopEZStore.formatCurrency(summary.total));
    $("#summary-shipping").text(ShopEZStore.formatCurrency(summary.shipping));
  }

  function render() {
    var cart = ShopEZStore.getCart();
    var isEmpty = cart.length === 0;

    $contentWrap.toggleClass("d-none", isEmpty);
    $emptyState.toggleClass("d-none", !isEmpty);
    $checkoutBtn.toggleClass("disabled", isEmpty);
    $checkoutBtn.attr("aria-disabled", String(isEmpty));

    if (isEmpty) {
      $rows.html("");
      updateSummary(ShopEZStore.getSummary([]));
      return;
    }

    $rows.html(
      cart
        .map(function (item) {
          return itemRow(item);
        })
        .join("")
    );

    updateSummary(ShopEZStore.getSummary(cart));
  }

  $rows.on("change", ".quantity-input", function () {
    var id = Number($(this).data("id"));
    var quantity = Number($(this).val());
    ShopEZStore.updateQuantity(id, quantity);
    render();
  });

  $rows.on("click", ".qty-plus", function () {
    var id = Number($(this).data("id"));
    var cart = ShopEZStore.getCart();
    var item = cart.find(function (entry) {
      return entry.id === id;
    });
    if (!item) {
      return;
    }

    ShopEZStore.updateQuantity(id, item.quantity + 1);
    render();
  });

  $rows.on("click", ".qty-minus", function () {
    var id = Number($(this).data("id"));
    var cart = ShopEZStore.getCart();
    var item = cart.find(function (entry) {
      return entry.id === id;
    });
    if (!item) {
      return;
    }

    var nextQuantity = item.quantity - 1;
    ShopEZStore.updateQuantity(id, nextQuantity);
    render();

    if (nextQuantity <= 0) {
      showCartRemoveToast("Item removed from cart");
    }
  });

  $rows.on("click", ".remove-item-btn", function () {
    var id = Number($(this).data("id"));
    ShopEZStore.removeFromCart(id);
    render();
    showCartRemoveToast("Item removed from cart");
  });

  $("#clear-cart-btn").on("click", function () {
    ShopEZStore.clearCart();
    render();
    ShopEZUI.showToast("Cart cleared");
  });

  render();
});
