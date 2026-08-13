import { getMenuFromApi, createMenuItem, updateMenuItem, deleteMenuItem } from '../../../data/menu-api.js';

export const normalize = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* ============================================================
   LOCAL ADMIN MENU FLOW — COMMENTED OUT FOR COMPARISON
   ============================================================
   The old version imported foods.js and wrote changes to localStorage.
*/

const selectedCategory = document.getElementById('selectedCategory');
const searchInputElement = document.getElementById('search-input');
const addItem = document.querySelector('.add-item-btn');
const popUp = document.getElementById('add-item-container');
const overlay = document.querySelector('.popup-overlay');
const closeBtn = document.querySelector('.close-popup');
const cancelBtn = document.querySelector('.cancel-btn');
const submitBtn = document.querySelector('.submit-btn');
const popupForm = document.querySelector('.popup');
const itemName = document.getElementById('name');
const itemPrice = document.getElementById('price');
const itemCategory = document.getElementById('category');

let foods = [];
let currentEditingId = null;

function imageSource(image) {
  return /^https?:\/\//i.test(image) ? image : `../../Main_page/${image}`;
}

function renderAdminMenu(items) {
  const itemBody = document.querySelector('.js-item-body');
  if (!itemBody) return;

  itemBody.innerHTML = items.map((foodItem) => `
    <tr>
      <td class="item-cell"><img class="item-avatar" src="${imageSource(foodItem.image)}" alt="${foodItem.name}"><div><div class="item-name">${foodItem.name}</div><div class="item-category">${foodItem.category}</div></div></td>
      <td>${foodItem.category}</td>
      <td>₦${Number(foodItem.price).toLocaleString()}</td>
      <td><span class="status-badge available"><ion-icon name="checkmark-circle"></ion-icon> Available</span></td>
      <td class="action-buttons"><button type="button" class="edit-item" data-product-id="${foodItem.id}"><ion-icon name="create"></ion-icon></button><button type="button" class="delete-item" data-product-id="${foodItem.id}"><ion-icon name="trash"></ion-icon></button></td>
    </tr>
  `).join('');
}

export function showNoResults() {
  const body = document.querySelector('.js-item-body');
  if (body) body.innerHTML = '<tr><td colspan="5">No matching item</td></tr>';
}

function filterMenu() {
  const category = normalize(selectedCategory?.value || 'all');
  const query = normalize(searchInputElement?.value || '');
  const filtered = foods.filter((item) => {
    const categoryMatches = category === 'all' || normalize(item.category).includes(category);
    const queryMatches = !query || normalize(item.name).includes(query) || normalize(item.category).includes(query);
    return categoryMatches && queryMatches;
  });
  filtered.length ? renderAdminMenu(filtered) : showNoResults();
}

async function loadMenu() {
  try {
    foods = await getMenuFromApi();
    renderAdminMenu(foods);
  } catch (error) {
    const body = document.querySelector('.js-item-body');
    if (body) body.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
  }
}

selectedCategory?.addEventListener('change', filterMenu);
searchInputElement?.addEventListener('input', filterMenu);

const toggleMenuPopup = () => {
  overlay?.classList.toggle('show');
  popUp?.classList.toggle('show-popup');
  document.body.classList.toggle('sidebar-open');
};

addItem?.addEventListener('click', toggleMenuPopup);
closeBtn?.addEventListener('click', toggleMenuPopup);
cancelBtn?.addEventListener('click', toggleMenuPopup);

submitBtn?.addEventListener('click', async (event) => {
  event.preventDefault();
  const existing = foods.find((item) => item.id === currentEditingId);
  const payload = {
    name: itemName?.value.trim() || existing?.name,
    price: Number(itemPrice?.value) || existing?.price,
    category: itemCategory?.value.trim() || existing?.category,
    image: existing?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
  };

  try {
    if (currentEditingId) await updateMenuItem(currentEditingId, payload);
    else await createMenuItem(payload);
    await loadMenu();
    popupForm?.reset();
    currentEditingId = null;
    toggleMenuPopup();
  } catch (error) {
    alert(error.message || 'Could not save menu item.');
  }
});

document.querySelector('.js-item-body')?.addEventListener('click', async (event) => {
  const deleteBtn = event.target.closest('.delete-item');
  const editBtn = event.target.closest('.edit-item');

  if (deleteBtn) {
    try {
      await deleteMenuItem(deleteBtn.dataset.productId);
      await loadMenu();
    } catch (error) {
      alert(error.message || 'Could not delete menu item.');
    }
    return;
  }

  if (editBtn) {
    const item = foods.find((food) => food.id === editBtn.dataset.productId);
    if (!item) return;
    currentEditingId = item.id;
    if (itemName) itemName.value = item.name;
    if (itemCategory) itemCategory.value = item.category;
    if (itemPrice) itemPrice.value = item.price;
    toggleMenuPopup();
  }
});

loadMenu();
