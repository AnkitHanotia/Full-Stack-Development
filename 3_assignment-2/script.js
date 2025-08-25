function addToCart(itemName, itemImage) {
  let cartList = document.getElementById("cart-items");
  let li = document.createElement("li");

  let itemDiv = document.createElement("div");
  itemDiv.classList.add("cart-item");

  let img = document.createElement("img");
  img.src = itemImage;
  img.alt = itemName;

  let span = document.createElement("span");
  span.textContent = itemName;

  let removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.classList.add("remove-btn");
  removeBtn.onclick = function () {
    cartList.removeChild(li);
  };

  itemDiv.appendChild(img);
  itemDiv.appendChild(span);
  li.appendChild(itemDiv);
  li.appendChild(removeBtn);
  cartList.appendChild(li);
}
