import { getMenuFromApi } from "../../data/menu-api.js";
import { addCartItem } from "../../data/cart-api.js";
import { refreshCart, updateCartQuantity } from "../cart_page/renderOrder.js";

/* ============================================================
   LOCAL MENU FLOW — COMMENTED OUT FOR COMPARISON
   ============================================================
   import { foods } from "./food.js";
   renderMenuOption(foods);
   The old search below filtered the local foods array in the browser.
*/

const sideBar = document.getElementsByClassName('ham')[0];
const menuBtn = document.getElementsByClassName('sidebar-control')[0];
const menu = document.getElementById('menu');
const closeBtn = document.getElementById('close');
const logInBox = document.getElementsByClassName('login-box')[0];

let foods = [];
let latestSearch = 0;

loadMenuFromApi();
updateCartQuantity();

/* ============================================================
   API MENU FLOW — ACTIVE
   ============================================================
   Backend response fields are used directly:
   id, name, image, price, category
*/
async function loadMenuFromApi(query = '') {
  const searchId = ++latestSearch;

  try {
    const apiFoods = await getMenuFromApi({ q: query });
    if (searchId !== latestSearch) return;

    foods = apiFoods;
    // API cache: lets the existing cart page resolve API product details.
    localStorage.setItem('foods', JSON.stringify(apiFoods));
    renderMenuOption(apiFoods);
  } catch (error) {
    document.querySelector('.grid_cards').innerHTML = `
      <div class="not-available">
        <p>${error.message || 'Could not load menu items'}</p>
      </div>
    `;
  }
}

menuBtn.addEventListener('click', ()=>{
  if (menu.style.display !== 'none') {
    sideBar.style.display = 'block';
    menu.style.display = 'none';
    closeBtn.style.display = 'block';
    document.body.classList.add('no-scroll');
  } else{
    sideBar.style.display = 'none';
    menu.style.display = 'block';
    closeBtn.style.display = 'none';
    document.body.classList.remove('no-scroll');
  }
});

function renderMenuOption(foods){

  let foodHTML = ``;
  foods.forEach((food)=>{
    foodHTML+= `
      <div class="card1">
        <img src="${food.image}">
        <p>${food.name}</p>
        <h3><span>₦${food.price}</span> per plate</h3>
        <button class="add_btn" data-product-id = "${food.id}" type="button">Add to Cart</button>
      </div>
    `;
  });

  document.querySelector('.grid_cards').innerHTML = foodHTML || '<p>No menu items found.</p>';

  attachAddButtons();
}


/* ============================================================
   LOCAL ADD-TO-CART FLOW — COMMENTED OUT FOR COMPARISON
   ============================================================
   The old flow pushed productId and quantity into localStorage cart data.
*/
function attachAddButtons(){
  document.querySelectorAll('.add_btn').forEach((button)=>{
    button.addEventListener('click', async ()=>{
      const productId = button.dataset.productId;
      button.disabled = true;

      try {
        await addCartItem(productId, 1);
        await refreshCart({ silent: true });
        button.innerHTML = 'Added';
        setTimeout(() => {
          button.innerHTML = 'Add to Cart';
          button.disabled = false;
        }, 1000);
      } catch (error) {
        button.disabled = false;
        alert(error.message || 'Could not add item to cart.');
      }
    })
  })
}

const searchInputs = document.querySelectorAll('#live-search, #mini-search');
searchInputs.forEach((search)=>{
  search.addEventListener('input', (event)=>{
    const raw = event.target.value || '';
    loadMenuFromApi(raw);
  })
})

