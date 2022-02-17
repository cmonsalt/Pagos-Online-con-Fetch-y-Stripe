import stripeKeys from "./stripe-keys.js";
import STRIPE_KEYS from "./stripe-keys.js";

const d = document,
  $camisetas = d.getElementById("camisetas"),
  $template = d.getElementById("camiseta-id").content,
  $fragment = d.createDocumentFragment(),
  fetchOptions = {
    headers: {
      Authorization: `Bearer ${STRIPE_KEYS.secret}`,
    },
  };

let prices, products;
const moneyFormat = (num) => `$${num.slice(0, -2)},${num.slice(-2)}`;
Promise.all([
  fetch("https://api.stripe.com/v1/products", fetchOptions),
  fetch("https://api.stripe.com/v1/prices", fetchOptions),
])
  .then((responses) => Promise.all(responses.map((res) => res.json())))
  .then((json) => {
    //console.log(json);
    products = json[0].data;
    prices = json[1].data;
    //console.log(products, prices);

    prices.forEach((el) => {
      let productData = products.filter((product) => product.id === el.product);
      //console.log(productData);
      $template.querySelector(".camiseta").setAttribute("data-price", el.id);
      $template.querySelector("img").src = productData[0].images[0];
      $template.querySelector("img").alt = productData[0].name;
      $template.querySelector("figcaption").innerHTML = ` 
      ${productData[0].name}
      <br>
      ${moneyFormat(el.unit_amount_decimal)} ${el.currency}
      `;
      let $clone = d.importNode($template, true);
      $fragment.appendChild($clone);
    });
    $camisetas.appendChild($fragment);
  })
  .catch((err) => {
    let message = err.statusText || "Ocurrio un error";
    $camisetas.innerHTML = ` <p>Error ${err.status}: ${message}</p>`;
  });

d.addEventListener("click", (e) => {
  if (e.target.matches(".camiseta *")) {
    let priceId = e.target.parentElement.getAttribute("data-price");
    Stripe(
      `pk_test_51KSqEOH0yPsnrvMGO0jkoC3XNRlVlhvKq04tvEZkQ2KbbeRUmhBlm0WyIH7bmDUaBIit5P6baYUzjF2mugtWCKte00vKoRPSB5`
    )
      .redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        successUrl: "http://127.0.0.1:5500/stripe-success.html",
        cancelUrl: "http://127.0.0.1:5500/stripe-cancel.html",
      })
      .then((res) => {
        console.log(res);
        if (res.error) {
          $camisetas.insertAdjacentHTML("afterend", res.error.message);
        }
      });
  }
});
