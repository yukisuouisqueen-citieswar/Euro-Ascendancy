const MACRO_URL = "https://script.google.com/macros/s/AKfycbzcc71u_UWIqJKHFMABE6TvepFbjcJ7J8C6nEI69ItoniLjM6jPXX32Jx3zuDFbZf8e/exec";

document.getElementById('trackerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const player = document.getElementById('playerSelect').value;
    const weapon = document.getElementById('weaponSelect').value;
    const quantity = document.getElementById('quantityInput').value;
    
    submitBtn.disabled = true;
    submitBtn.innerText = "TRANSMITTING...";
    
    const payload = {
        player: player,
        weapon: weapon,
        quantity: quantity
    };
    
    fetch(MACRO_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(() => {
        alert("Transmission successful! Spreadsheet updated.");
        document.getElementById('weaponSelect').value = "";
        document.getElementById('quantityInput').value = "";
    })
    .catch(err => {
        alert("Error sending update: " + err);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerText = "DISPATCH DATA";
    });
});
