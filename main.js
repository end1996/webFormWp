let uploadedImageData = null;
let currentSelectedFrame = 'frame1';
let sizePicker;

const sizePrices = {
    "10X15": 0.65,
    "13X18": 0.95,
    "15X21": 1.10,
    "20X25": 3.50,
    "20X30": 3.80,
    "20X40": 5.00,
    "20X50": 6.30,
    "20X60": 7.20,
    "25X30": 4.30,
    "25X38": 5.20,
    "25X40": 6.50,
    "25X50": 7.50,
    "25X60": 7.50,
    "30X40": 7.70,
    "30X45": 8.60,
    "30X50": 10.00,
    "30X60": 10.50
};

document.addEventListener('DOMContentLoaded', function() {
    initializeSizePicker();
    initializeFramePicker();
    uploadImage();
    setupEventListeners();
});

function initializeSizePicker() {
    const sizeOptions = Object.keys(sizePrices).map(value => ({
        value: value,
        label: `${value.replace("X", "cm X ")}cm (S/.${sizePrices[value].toFixed(2)})`
    }));

    sizePicker = new iOSPicker({
        container: document.getElementById('size-picker'),
        items: sizeOptions,
        initialValue: '10X15',
        onChange: (value) => {
            updateTotalPrice();
        }
    });
}

function initializeFramePicker() {
    const framePicker = document.getElementById('frame-picker');
    if (!framePicker) return;

    const pickerItems = framePicker.querySelectorAll('.swiper-slide');
    pickerItems.forEach(item => {
        item.addEventListener('click', function() {
            if (!uploadedImageData) {
                showNotification('Sube una imagen primero', 'error');
                return;
            }
            pickerItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            currentSelectedFrame = item.dataset.value;
        });
    });

    new Swiper('.mySwiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "2",
        coverflowEffect: {
            rotate: 20,
            stretch: 0,
            depth: 150,
            modifier: 3,
            slideShadows: true,
        },
        loop: true
    });
}

function setupEventListeners() {
    document.querySelector('.quantity-field input').addEventListener('input', updateTotalPrice);
    document.getElementById("custom-size__width").addEventListener("input", handleCustomSize);
    document.getElementById("custom-size__height").addEventListener("input", handleCustomSize);
    document.querySelector('.add-to-cart-btn').addEventListener('click', addToCart);
}

function handleCustomSize() {
    if (document.querySelector('input[name="size-type"]:checked').value === 'custom') {
        updateTotalPrice();
    }
}

function toggleSizeOptions(type) {
    const standard = document.getElementById('standard-sizes');
    const custom = document.getElementById('custom-size');
    
    standard.style.display = type === 'standard' ? 'block' : 'none';
    custom.style.display = type === 'custom' ? 'flex' : 'none';
    updateTotalPrice();
}

function toggleFrameOptions(show) {
    document.getElementById('frame-ios-picker-wrapper').style.display = show ? 'block' : 'none';
}

function uploadImage() {
    window.triggerFileInput = () => document.getElementById('file-input').click();

    const handleImageChange = (file) => {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onloadend = () => {
            const uploadedImage = document.getElementById('uploaded-image');
            const uploadArea = document.querySelector('.upload-area');
            const removeButton = document.getElementById('remove-image-btn');

            uploadedImage.src = reader.result;
            uploadedImage.style.display = 'block';
            uploadedImageData = reader.result;

            document.querySelector('.upload-area svg').style.display = 'none';
            document.querySelector('.desktop-upload-text').style.display = 'none';
            document.querySelector('.mobile-upload-text').style.display = 'none';
            
            removeButton.style.display = 'block';
            uploadArea.style.padding = '0';
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        handleImageChange(event.dataTransfer.files[0]);
        document.querySelector('.upload-area').classList.remove('dragover');
    };

    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (e) => handleImageChange(e.target.files[0]));

    const uploadArea = document.querySelector('.upload-area');
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', handleDrop);
    
    window.removeUploadedImage = () => {
        uploadedImageData = null;
        document.getElementById('uploaded-image').src = '';
        document.getElementById('uploaded-image').style.display = 'none';
        document.getElementById('remove-image-btn').style.display = 'none';
        document.querySelector('.upload-area svg').style.display = '';
        document.querySelector('.desktop-upload-text').style.display = 
            window.innerWidth > 768 ? 'block' : 'none';
        document.querySelector('.mobile-upload-text').style.display = 
            window.innerWidth <= 768 ? 'block' : 'none';
        fileInput.value = '';
    };
}

function addToCart() {
    if (!uploadedImageData) {
        showNotification('Sube una imagen primero', 'error');
        return;
    }

    const quantity = parseInt(document.querySelector('.quantity-field input').value) || 1;
    const isCustomSize = document.querySelector('input[name="size-type"]:checked').value === 'custom';
    
    let size, customWidth, customHeight;
    if (isCustomSize) {
        customWidth = document.getElementById('custom-size__width').value;
        customHeight = document.getElementById('custom-size__height').value;
        if (!customWidth || !customHeight) {
            showNotification('Ingresa las medidas personalizadas', 'error');
            return;
        }
        size = `${customWidth}x${customHeight}`;
    } else {
        size = sizePicker.getValue();
    }

    const comments = document.querySelector('.comment-area').value;
    const withFrame = document.querySelector('input[name="frame"]:checked').value !== 'sin-marco';
    const frame = withFrame ? currentSelectedFrame : 'sin-marco';

    const formData = new FormData();
    formData.append('action', 'process_print_image');
    formData.append('nonce', ajax_object.nonce);
    formData.append('image_data', uploadedImageData);
    formData.append('quantity', quantity);
    formData.append('size', size);
    formData.append('is_custom_size', isCustomSize);
    formData.append('custom_width', customWidth || 0);
    formData.append('custom_height', customHeight || 0);
    formData.append('comments', comments);
    formData.append('frame', frame);

    showLoadingIndicator();
    
    fetch(ajax_object.ajax_url, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        hideLoadingIndicator();
        if (data.success) {
            showNotification('¡Añadido al carrito!', 'success');
            setTimeout(() => window.location.href = data.data.cart_url, 1500);
        } else {
            showNotification('Error: ' + data.data, 'error');
        }
    })
    .catch(error => {
        hideLoadingIndicator();
        showNotification('Error de conexión', 'error');
        console.error('Error:', error);
    });
}

function updateTotalPrice() {
    if (!uploadedImageData) {
        document.getElementById("total-price-button").textContent = 'S/. 0.00';
        return;
    }

    const quantity = parseInt(document.querySelector('.quantity-field input').value) || 1;
    let price = 0;

    if (document.querySelector('input[name="size-type"]:checked').value === 'standard') {
        const size = sizePicker.getValue();
        price = sizePrices[size] || 0;
    } else {
        price = 5.00;
    }

    document.getElementById("total-price-button").textContent = 
        `S/. ${(price * quantity).toFixed(2)}`;
}

function showNotification(message, type) {
  // Crear contenedor de notificaciones si no existe
  let notificationContainer = document.getElementById('notification-container');
  if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notification-container';
      notificationContainer.style.position = 'fixed';
      notificationContainer.style.top = '20px';
      notificationContainer.style.right = '20px';
      notificationContainer.style.zIndex = '10000';
      document.body.appendChild(notificationContainer);
  }

  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // Estilos básicos para la notificación
  notification.style.position = 'relative';
  notification.style.width = '300px';
  notification.style.padding = '15px';
  notification.style.marginBottom = '10px';
  notification.style.borderRadius = '5px';
  notification.style.color = 'white';
  notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.animation = 'slideIn 1s ease-out';
  
  // Icono según el tipo
  const icon = document.createElement('span');
  icon.style.marginRight = '10px';
  icon.style.fontSize = '20px';
  
  if (type === 'error') {
      notification.style.backgroundColor = '#ff4444';
      icon.textContent = '❌';
  } else if (type === 'success') {
      notification.style.backgroundColor = '#00C851';
      icon.textContent = '✅';
  } else {
      notification.style.backgroundColor = '#33b5e5';
      icon.textContent = 'ℹ️';
  }
  
  // Texto del mensaje
  const text = document.createElement('span');
  text.textContent = message;
  
  // Botón de cerrar
  const closeBtn = document.createElement('span');
  closeBtn.textContent = '×';
  closeBtn.style.marginLeft = 'auto';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '20px';
  closeBtn.addEventListener('click', () => {
      notification.style.animation = 'slideOut 1s ease-out';
      setTimeout(() => notification.remove(), 300);
  });
  
  // Añadir elementos a la notificación
  notification.appendChild(icon);
  notification.appendChild(text);
  notification.appendChild(closeBtn);
  
  // Añadir al contenedor
  notificationContainer.appendChild(notification);
  
  // Eliminar después de 5 segundos
  setTimeout(() => {
      notification.style.animation = 'slideOut 1s ease-out';
      setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Añadir estilos de animación
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);