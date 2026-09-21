const businessConfig = window.AC_BUSINESS_CONFIG || {
  businessName: 'BUSINESS_NAME',
  phoneNumber: 'PHONE_NUMBER',
  whatsappNumber: 'WHATSAPP_NUMBER',
  mapsUrl: 'https://maps.google.com/?q=YOUR_ADDRESS',
  address: 'YOUR_ADDRESS',
  openingHours: 'Mon-Sat: 9:00 AM - 8:00 PM',
  email: 'hello@example.com',
  serviceAreas: 'Local city and nearby areas'
};

const whatsappBase = `https://wa.me/${String(businessConfig.whatsappNumber).replace(/\D/g, '')}`;

function formatPhoneNumber(phone) {
  return String(phone || '').trim();
}

function openWhatsApp(message) {
  const text = encodeURIComponent(message || 'Hello, I would like to enquire about your AC services.');
  window.open(`${whatsappBase}?text=${text}`, '_blank');
}

function buildWhatsAppMessage(type, payload = {}) {
  if (type === 'product') {
    return [
      'Hello, I would like to enquire about an AC.',
      '',
      'Name: ' + (payload.customerName || 'Customer'),
      'Brand: ' + (payload.brand || 'Not specified'),
      'Model: ' + (payload.model || 'Not specified'),
      'Capacity: ' + (payload.capacity || 'Not specified'),
      'Requirement: ' + (payload.requirement || 'Please share details'),
      'Location: ' + (payload.location || 'Not specified')
    ].join('\n');
  }

  return [
    'Hello, I would like to enquire about an AC service.',
    '',
    'Name: ' + (payload.customerName || 'Customer'),
    'Service Type: ' + (payload.serviceType || 'Not specified'),
    'Brand: ' + (payload.brand || 'Not specified'),
    'Problem: ' + (payload.problem || 'Please share details'),
    'Location: ' + (payload.location || 'Not specified'),
    'Preferred Date: ' + (payload.preferredDate || 'Not specified'),
    'Preferred Time: ' + (payload.preferredTime || 'Not specified'),
    'Message: ' + (payload.message || 'Not specified')
  ].join('\n');
}

function getBusinessInfo() {
  return businessConfig;
}

window.businessConfig = businessConfig;
window.getBusinessInfo = getBusinessInfo;
window.openWhatsApp = openWhatsApp;
window.buildWhatsAppMessage = buildWhatsAppMessage;
window.formatPhoneNumber = formatPhoneNumber;
