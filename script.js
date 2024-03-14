
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
  
    // Add click event listener for scaling animation
    cards.forEach(card => {
      card.addEventListener('click', () => {
        card.style.transform = 'scale(1.1)';
      });
    });
  });