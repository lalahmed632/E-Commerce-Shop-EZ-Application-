$(function () {
  var $checkoutCard = $("#checkout-card");
  var $emptyState = $("#empty-checkout-state");
  var $form = $("#checkout-form");
  var $success = $("#success-message");
  var $button = $("#place-order-btn");
  var $payment = $("#payment");

  function syncPaymentMethodStyle() {
    if (!$payment.length) {
      return;
    }
    var selected = String($payment.val() || "").toLowerCase();
    $payment.toggleClass("upi-selected", selected === "upi");
  }

  function renderSummary() {
    var cart = ShopEZStore.getCart();
    if (cart.length === 0) {
      $checkoutCard.addClass("d-none");
      $emptyState.removeClass("d-none");
      return;
    }

    $checkoutCard.removeClass("d-none");
    $emptyState.addClass("d-none");

    $("#order-items").html(
      cart
        .map(function (item) {
          return (
            '<div class="card border-0 shadow-sm order-item checkout-item-card">' +
            '<div class="card-body py-2">' +
            '<div class="d-flex justify-content-between">' +
            '<span class="order-item-name">' +
            ShopEZUI.escapeHtml(item.name) +
            "</span>" +
            "<strong>" +
            ShopEZStore.formatCurrency(item.price * item.quantity) +
            "</strong>" +
            "</div>" +
            '<div class="order-item-meta">Qty: ' +
            item.quantity +
            " x " +
            ShopEZStore.formatCurrency(item.price) +
            "</div>" +
            "</div>" +
            "</div>"
          );
        })
        .join("")
    );

    var summary = ShopEZStore.getSummary(cart);
    $("#checkout-subtotal").text(ShopEZStore.formatCurrency(summary.subtotal));
    $("#checkout-total").text(ShopEZStore.formatCurrency(summary.total));
    $("#checkout-shipping").text(ShopEZStore.formatCurrency(summary.shipping));
  }

  $form.on("submit", function (event) {
    event.preventDefault();
    event.stopPropagation();

    var formElement = $form.get(0);
    if (!formElement.checkValidity()) {
      $form.addClass("was-validated");
      return;
    }

    var cart = ShopEZStore.getCart();
    if (cart.length === 0) {
      renderSummary();
      return;
    }

    var summary = ShopEZStore.getSummary(cart);
    var orderId = "SEZ-" + Date.now().toString().slice(-8);

    var orderRecord = {
      id: orderId,
      createdAt: new Date().toISOString(),
      total: summary.total,
      items: cart
    };

    localStorage.setItem("shopez_last_order", JSON.stringify(orderRecord));

    $button.prop("disabled", true).text("Placing order...");
    setTimeout(function () {
      ShopEZStore.clearCart();
      $checkoutCard.addClass("d-none");
      $success.removeClass("d-none");
      $("#order-ref").text(orderId);
      $("#order-total").text(ShopEZStore.formatCurrency(summary.total));
      $button.prop("disabled", false).text("Place Order");
    }, 900);
  });

  $payment.on("change", function () {
    syncPaymentMethodStyle();
  });

  syncPaymentMethodStyle();
  renderSummary();
});
