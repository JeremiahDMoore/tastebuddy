document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
  
    // Function to animate card appearance
    function showCard(card) {
        card.style.opacity = 1;
    }

    // Animate cards on page load
    cards.forEach((card, index) => {
        setTimeout(() => showCard(card), index * 200); // Delay for staggered effect
    });

    // Add mouseover event listener for hover animation
    cards.forEach(card => {
        card.addEventListener('mouseover', () => {
            card.style.transform = 'scale(1.05)';

        });
        card.addEventListener('mouseout', () => {
            card.style.transform = 'scale(1)';
        });
    });

    // Existing click event listener for scaling animation
    // ... rest of your click event code ...
});