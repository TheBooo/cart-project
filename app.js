//contentful
const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "47ubfyzrfp2t",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "p07ONepgfQhgqUsUtUQ8V1tJ3uXg9y1gzi9PFP6Kaws"
});

//variables
const cartBtn = document.getElementById("cart-btn");
const closeCartBtn = document.getElementById("close-cart");
const clearCartBtn = document.getElementById("clear-cart");
const cartDOM = document.getElementById("cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartContent = document.getElementById("cart-content");
const productsDOM = document.querySelector(".products-center");
const menuBtn = document.getElementById("menu-btn");
const menuDOM = document.getElementById("menu");
const closeMenuBtn = document.getElementById("close-menu");
const menuBtns = document.querySelectorAll(".menu-item");
// main cart
let cart = [];
//buttons
let buttonsDOM = [];

//getting products
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type: "pianoProjectProducts"
      });

      let products = contentful.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
// display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      result += `
        <!--single product-->
        <article class="product">
          <div class="img-container">
            <img src=${product.image} alt="piano" class="product-img" />
            <button class="item-btn" data-id=${product.id}>
              <!--<i class="fas fa-shopping-cart"></i>-->
              В корзину
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$ ${product.price}</h4>
        </article>
        <!--end of single product-->
        `;
    });
    productsDOM.innerHTML = result;
  }
  getCartButtons() {
    const btns = [...document.querySelectorAll(".item-btn")];
    buttonsDOM = btns;
    btns.forEach(btn => {
      let id = btn.dataset.id;
      let inCart = cart.find(item => item.id == id);

      btn.addEventListener("click", e => {
        e.target.innerText = " Уже в корзине ";
        e.target.disabled = true;
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item, add it to the DOM
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="product"/>
    <div>
      <h3>${item.title}</h3>
      <h5>$${item.price}</h5>
      <span class="remove-item-container">
      <i class="fas fa-trash remove-item" data-id=${item.id}></i>
      </span>
    </div>
    <div>
      <i class="fas fa-chevron-up increase-item" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down decrease-item" data-id=${item.id}></i>
    </div>`;
    cartContent.appendChild(div);
  }

  /*----------------------------------------------menu / открытие меню ------------------------------------------*/
  showMenu() {
    cartOverlay.classList.add("transparent-overlay");
    menuDOM.classList.add("show-menu");
  }
  hideMenu() {
    cartOverlay.classList.remove("transparent-overlay");
    menuDOM.classList.remove("show-menu");
  }

  /* -------------------------------------show cart / открытие корзины --------------------------------------------*/
  showCart() {
    cartOverlay.classList.add("transparent-overlay");
    cartDOM.classList.add("show-cart");
  }
  hideCart() {
    cartOverlay.classList.remove("transparent-overlay");
    cartDOM.classList.remove("show-cart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.fillCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
    menuBtn.addEventListener("click", this.showMenu);
    closeMenuBtn.addEventListener("click", this.hideMenu);
    menuBtns.forEach(btn => {
      btn.addEventListener("click", this.hideMenu);
    });
  }
  fillCart(cart) {
    cart.forEach(item => {
      this.addCartItem(item);
    });
  }
  cartLogic() {
    //clear cart
    clearCartBtn.addEventListener("click", () => this.clearCart());
    //functionality
    cartContent.addEventListener("click", e => {
      if (e.target.classList.contains("remove-item")) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        this.removeItem(id);
        cartContent.removeChild(
          removeItem.parentElement.parentElement.parentElement
        );
      } else if (e.target.classList.contains("increase-item")) {
        let increaseAmount = e.target;
        let id = increaseAmount.dataset.id;
        let tempItem = cart.find(item => item.id == id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        increaseAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains("decrease-item")) {
        let decreaseAmount = e.target;
        let id = decreaseAmount.dataset.id;
        let tempItem = cart.find(item => item.id == id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount < 1) {
          cartContent.removeChild(decreaseAmount.parentElement.parentElement);
          this.removeItem(id);
        } else {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          decreaseAmount.previousElementSibling.innerText = tempItem.amount;
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id != id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerText = `В корзину`;
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id == id);
  }
}
//storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    //console.log(products.find(product => product.id == id)); почему не работает ===?
    return products.find(product => product.id == id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //setup app
  ui.setupAPP();
  //get all poducts
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getCartButtons();
      ui.cartLogic();
    });
});
