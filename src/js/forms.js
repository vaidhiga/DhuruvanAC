document.addEventListener('DOMContentLoaded', () => {
  const quoteForm = document.querySelector('#quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(quoteForm);
      const payload = Object.fromEntries(formData.entries());
      const status = quoteForm.querySelector('.form-status');

      const phone = String(payload.phoneNumber || '').replace(/\s+/g, '');
      if (!/^\+?[0-9]{10,12}$/.test(phone)) {
        showStatus(status, 'Please enter a valid Indian phone number.', 'error');
        return;
      }

      try {
        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          const message = Array.isArray(result.errors) ? result.errors.join(' ') : 'Please fill all required fields correctly.';
          showStatus(status, message, 'error');
          return;
        }

        showStatus(status, `${result.message} Booking ID: #${result.bookingId}.`, 'success');
        quoteForm.reset();
      } catch (error) {
        showStatus(status, 'Something went wrong while sending your enquiry. Please try again.', 'error');
      }
    });
  }

  const serviceForm = document.querySelector('#service-form');
  if (serviceForm) {
    serviceForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(serviceForm);
      const payload = Object.fromEntries(formData.entries());
      const status = serviceForm.querySelector('.form-status');

      const phone = String(payload.phoneNumber || '').replace(/\s+/g, '');
      if (!/^\+?[0-9]{10,12}$/.test(phone)) {
        showStatus(status, 'Please enter a valid Indian phone number.', 'error');
        return;
      }

      try {
        const response = await fetch('/api/service', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          const message = Array.isArray(result.errors) ? result.errors.join(' ') : 'Please fill all required fields correctly.';
          showStatus(status, message, 'error');
          return;
        }

        showStatus(status, `${result.message} Booking ID: #${result.bookingId}.`, 'success');
        serviceForm.reset();
      } catch (error) {
        showStatus(status, 'Something went wrong while sending your service request. Please try again.', 'error');
      }
    });
  }
});

function showStatus(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove('success', 'error');
  element.classList.add(type, 'show');
}
