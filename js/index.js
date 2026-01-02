const haierFaqItems = document.querySelectorAll('.haier__card-faq-card');

haierFaqItems.forEach((faqItem) => {
  updateHaierFaqItem(faqItem);

  faqItem.addEventListener('click', (event) => {
    const isActive = event.currentTarget.classList.contains('active');
    const isToggler = event.target.classList.contains('haier__card-faq-card-toggler');

    if (isToggler) {
      const panel = event.target.nextElementSibling;
      if (isActive) {
        panel.style.maxHeight = null;
        event.currentTarget.classList.remove('active');
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        event.currentTarget.classList.add('active');
      }
    }
  });
});

function updateHaierFaqItem(faqItem) {
  if (!faqItem) return;

  const isActive = faqItem.classList.contains('active');
  const panel = faqItem.querySelector('.haier__card-faq-card-panel');

  if (!panel) return;

  if (isActive) {
    panel.style.maxHeight = panel.scrollHeight + 'px';
  } else {
    panel.style.maxHeight = null;
  }
}


const candyFaqItems = document.querySelectorAll('.candy__card-faq-card');

candyFaqItems.forEach((faqItem) => {
  updateCandyFaqItem(faqItem);

  faqItem.addEventListener('click', (event) => {
    const isActive = event.currentTarget.classList.contains('active');
    const isToggler = event.target.classList.contains('candy__card-faq-card-toggler');

    if (isToggler) {
      const panel = event.target.nextElementSibling;
      if (isActive) {
        panel.style.maxHeight = null;
        event.currentTarget.classList.remove('active');
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        event.currentTarget.classList.add('active');
      }
    }
  });
});

function updateCandyFaqItem(faqItem) {
  if (!faqItem) return;

  const isActive = faqItem.classList.contains('active');
  const panel = faqItem.querySelector('.candy__card-faq-card-panel');

  if (!panel) return;

  if (isActive) {
    panel.style.maxHeight = panel.scrollHeight + 'px';
  } else {
    panel.style.maxHeight = null;
  }
}
