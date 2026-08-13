export function getProduct(productId) {
  let matchingProduct;

  foods.forEach((product)=>{
    if(product.id === productId){
      matchingProduct = product;
    }
  });

  return matchingProduct;
}

export let foods = JSON.parse(localStorage.getItem('foods')) || [{
  id: '01',
  image: 'assets/foodcard1.webp',
  name: 'Fried Rice',
  price: 3500,
  category: 'Rice'
},{
  id: '02',
  image: 'assets/foodcard2.webp',
  name: "City's special rice",
  price: 4500,
  category: 'Rice'
},{
  id: '03',
  image: 'assets/foodcard3.webp',
  name: 'Singaporean noodles',
  price: 4000,
  category: 'Noodles'
},{
  id: '04',
  image: 'assets/foodcard4.webp',
  name: "Grandma's Special Rice",
  price: 4500,
  category: 'Rice'
},{
  id: '05',
  image: 'assets/foodcard5.webp',
  name: 'Village Rice',
  price: 4500,
  category: 'Rice'
},{
  id: '06',
  image: 'assets/foodcard6.webp',
  name: 'Jollof Rice',
  price: 3500,
  category: 'Rice'
},{
  id: '07',
  image: 'assets/foodcard7.webp',
  name: 'Basmatic Jollof Rice',
  price: 4800,
  category: 'Rice'
},{
  id: '08',
  image: 'assets/foodcard8.webp',
  name: 'Ofada Rice & Sauce',
  price: 8400,
  category: 'Rice'
},{
  id: '09',
  image: 'assets/foodcard9.webp',
  name: 'Yam',
  price: 1500,
  category: 'Yam'
},{
  id: '10',
  image: 'assets/foodcard10.webp',
  name: 'Yam Porridge',
  price: 3000,
  category: 'Yam'
}];
saveFoodStorage();

export function saveFoodStorage(){
  localStorage.setItem('foods', JSON.stringify(foods))
}
