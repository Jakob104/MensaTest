// public/js/main.js

// 1. Warenkorb laden (oder leer starten, wenn nichts da ist)
function getCart() {
    const cart = localStorage.getItem('easymensa_cart');
    return cart ? JSON.parse(cart) : [];
}

// 2. Warenkorb speichern
function saveCart(cart) {
    localStorage.setItem('easymensa_cart', JSON.stringify(cart));
    updateCartCount(); // Zahl oben aktualisieren
}

// 3. Produkt hinzufügen
function addToCart(id, name, price) {
    let cart = getCart();

    // Schauen, ob das Produkt schon drin ist
    let existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1; // Einfach eins mehr
    } else {
        cart.push({ id, name, price, quantity: 1 }); // Neu reinlegen
    }

    saveCart(cart);
    alert(name + " ist im Korb! 🥨");
}

// 4. Die kleine rote Zahl oben aktualisieren
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = count;
        // Verstecken wenn 0, sonst anzeigen
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Wenn die Seite lädt, sofort die Zahl aktualisieren
document.addEventListener('DOMContentLoaded', updateCartCount);