document.addEventListener('DOMContentLoaded', function () {
  // Initialize iOS-style size picker
  const sizePicker = document.getElementById('size-picker');
  if (sizePicker) {
    initializeIOSPicker('size-picker');
  } else {
    console.error('Size picker not found');
  }

  // Initialize iOS-style frame picker
  const framePicker = document.getElementById('frame-picker');
  if (framePicker) {
    initializeIOSPicker('frame-picker');
  } else {
    console.error('Frame picker not found');
  }

  // Initialize the upload functionality
  uploadImage();

  // Add event listener for the add to cart button
  const addToCartBtn = document.querySelector('.add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', addToCart);
  }
});

function initializeIOSPicker(pickerId) {
  const picker = document.getElementById(pickerId);
  if (!picker) {
    console.error('Picker not found:', pickerId);
    return;
  }

  const pickerItems = picker.querySelectorAll('.ios-picker-item, .frame-ios-picker-item');
  if (pickerItems.length === 0) {
    console.error('No picker items found in:', pickerId);
    return;
  }

  // Set the first item as selected initially
  pickerItems[0].classList.add('selected');

  // Add scroll event listener
  picker.addEventListener('scroll', function () {
    console.log('Scroll event triggered'); // Depuración
    highlightVisibleItem(picker, pickerItems);
  });

  // Add click event listener for items
  pickerItems.forEach(item => {
    item.addEventListener('click', function () {
      console.log('Item clicked:', item.textContent); // Depuración
      pickerItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      item.scrollIntoView({ block: 'center' });
      updateImageSize(); // Actualizar el tamaño de la imagen
      item.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  });

  // Simulate initial scroll to center the first item
  setTimeout(function () {
    if (pickerItems.length > 0) {
      pickerItems[0].scrollIntoView({ block: 'center' });
      updateImageSize(); // Actualizar el tamaño de la imagen
      pickerItems[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, 100);
}

function highlightVisibleItem(picker, items) {
  const pickerRect = picker.getBoundingClientRect();
  const middlePosition = pickerRect.top + pickerRect.height / 2;

  let closestItem = null;
  let closestDistance = Infinity;

  items.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const itemMiddle = itemRect.top + itemRect.height / 2;
    const distance = Math.abs(itemMiddle - middlePosition);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = item;
    }
  });

  const pickerHighlight = picker.querySelector('.ios-picker-highlight');
  if (pickerHighlight && closestItem) {
    const closestItemRect = closestItem.getBoundingClientRect();
    const itemMiddle = closestItemRect.top + closestItemRect.height / 2;

    pickerHighlight.style.top = itemMiddle - pickerRect.top - (pickerHighlight.offsetHeight / 2) + 'px';
    pickerHighlight.style.height = closestItemRect.height + 'px';
  }

  if (closestItem) {
    items.forEach(item => item.classList.remove('selected'));
    closestItem.classList.add('selected');
  }
}

function toggleSizeOptions(type) {
  if (type === 'standard') {
    document.getElementById('standard-sizes').style.display = 'block';
    document.getElementById('custom-size').style.display = 'none';
  } else {
    document.getElementById('standard-sizes').style.display = 'none';
    document.getElementById('custom-size').style.display = 'flex';
  }
  updateImageSize(); // Actualizar el tamaño de la imagen
}

function toggleFrameOptions(show) {
  document.getElementById('frame-picker-container').style.display = show ? 'block' : 'none';
}

function scrollLeftHandler() {
  const picker = document.getElementById('frame-picker');
  const itemWidth = picker.querySelector('.frame-ios-picker-item').offsetWidth; 
  const currentScroll = picker.scrollLeft; 

  if (currentScroll > 0) {
    picker.scrollBy({
      left: -itemWidth, 
      behavior: 'smooth'
    });
  }
}

function scrollRightHandler() {
  const picker = document.getElementById('frame-picker');
  const itemWidth = picker.querySelector('.frame-ios-picker-item').offsetWidth; 
  const maxScroll = picker.scrollWidth - picker.clientWidth; 

  if (picker.scrollLeft < maxScroll) {
    picker.scrollBy({
      left: itemWidth,
      behavior: 'smooth'
    });
  }
}

// Variables globales para almacenar la imagen
let uploadedImageData = null;

function uploadImage() {
  // Función para abrir el diálogo de selección de archivo
  window.triggerFileInput = () => {
    const fileInput = document.getElementById('file-input');
    fileInput.click(); // Simula un clic en el input de archivo
  };

  // Función para manejar el cambio de imagen
  const handleImageChange = (file) => {
    if (file) {
      const reader = new FileReader(); // Crear un FileReader para leer el archivo
      reader.onloadend = () => {
        // Cuando la lectura termine, mostrar la imagen
        const uploadedImage = document.getElementById('uploaded-image');
        const uploadArea = document.querySelector('.upload-area');
        uploadedImage.src = reader.result;
        uploadedImage.style.display = 'block'; 

        // Guardar la URL de la imagen en la variable global
        uploadedImageData = reader.result;
        
        const svgElement = document.querySelector('.upload-area svg');
        const paragraphElement = document.querySelector('.upload-area p');
        const buttonElement = document.querySelector('.upload-btn');
        svgElement.style.display = 'none';
        paragraphElement.style.display = 'none';
        buttonElement.style.display = 'none';
        // Añadir un botón para eliminar la imagen
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Eliminar imagen';
        removeButton.className = 'remove-image-btn';
        removeButton.onclick = removeUploadedImage;
        uploadArea.appendChild(removeButton)
      };
      reader.readAsDataURL(file); // Leer el archivo como una URL de datos
    }
  };

  // Función para eliminar la imagen subida
  window.removeUploadedImage = () => {
    uploadedImageData = null;
    const uploadArea = document.querySelector('.upload-area');
    uploadArea.innerHTML = 
      `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e76f51" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
        <p>Arrastra tu imagen aquí o</p>
        <button class="upload-btn" onclick="triggerFileInput()">Subir imagen</button>
        <input type="file" id="file-input" style="display: none;" />
        <div class="image-container">
          <img id="uploaded-image" src="" alt="Imagen seleccionada" style="max-width: 100%; display: none;" />
        </div>`;

    // Volver a asignar el evento al nuevo input
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        handleImageChange(file);
      });
    }
  };

  // Función para manejar el evento "drop"
  const handleDrop = (event) => {
    event.preventDefault(); // Evitar el comportamiento por defecto del navegador
    const file = event.dataTransfer.files[0]; // Obtener el archivo arrastrado
    handleImageChange(file); // Procesar el archivo
    uploadArea.classList.remove('dragover'); // Quitar la clase de estilo "dragover"
  };

  // Asignar eventos
  document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.querySelector('.upload-area');

    if (fileInput) {
      fileInput.addEventListener('change', (event) => {
        const file = event.target.files?.[0]; // Obtener el archivo seleccionado
        handleImageChange(file); // Procesar el archivo
      });
    }

    if (uploadArea) {
      // Evento para cuando el archivo está siendo arrastrado sobre el área
      uploadArea.addEventListener('dragover', (event) => {
        event.preventDefault(); // Evitar el comportamiento por defecto
        uploadArea.classList.add('dragover'); // Añadir clase para estilos visuales
      });

      // Evento para cuando el archivo sale del área
      uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover'); // Quitar clase de estilo
      });

      // Evento para cuando el archivo se suelta en el área
      uploadArea.addEventListener('drop', handleDrop);
    }
  });
}

function updateImageSize() {
  const selectedSize = document.querySelector(".ios-picker-item.selected")?.dataset.value;
  const uploadedImage = document.getElementById("uploaded-image");

  if (selectedSize && uploadedImage) {
    const [widthCm, heightCm] = selectedSize.split("X").map(Number);

    // Define factores de conversión diferentes para tamaños grandes y pequeños
    const smallSizeThreshold = 30; // Umbral para considerar un tamaño como pequeño
    const smallCmToPx = 37; // Factor de conversión para tamaños pequeños
    const largeCmToPx = 13; // Factor de conversión para tamaños grandes

    // Determinar el factor de conversión a usar
    const cmToPx = (widthCm <= smallSizeThreshold && heightCm <= smallSizeThreshold) ? smallCmToPx : largeCmToPx;

    const widthPx = widthCm * cmToPx;
    const heightPx = heightCm * cmToPx;
    uploadedImage.style.width = `${widthPx}px`;
    uploadedImage.style.height = `${heightPx}px`;
  }
}

// Llamar a la función para inicializar
uploadImage();

// Función para añadir al carrito
document.addEventListener('DOMContentLoaded', function () {
  console.log("✅ DOM completamente cargado.");

  // Buscar el botón de agregar al carrito
  const addToCartBtn = document.querySelector('.add-to-cart-btn');

  if (addToCartBtn) {
    console.log("✅ Botón 'Agregar al carrito' encontrado.");
    addToCartBtn.addEventListener('click', function () {
      console.log("🛒 Botón 'Agregar al carrito' clickeado.");
      addToCart();
    });
  } else {
    console.log("⚠️ No se encontró el botón 'Agregar al carrito'. Verifica la clase en el HTML.");
  }
});

// Exponer la función al ámbito global para evitar problemas con `onclick`
window.addToCart = addToCart;

// Función para añadir al carrito --------------------------------------
function addToCart() {
  console.log("🚀 addToCart() fue llamada correctamente");

  // Verificar si hay una imagen subida
  if (!uploadedImageData) {
    showNotification('Por favor, sube una imagen primero.', 'error');
    console.log("⚠️ No hay imagen subida.");
    return;
  }

  // Obtener los valores del formulario
  const quantity = document.querySelector('#quantity-input').value;
  const isCustomSize = document.querySelector('input[name="size-type"]:checked').value === 'custom';

  let size, customWidth, customHeight;
  if (isCustomSize) {
    const customSizeInputs = document.querySelectorAll('#custom-size input');
    customWidth = customSizeInputs[0].value;
    customHeight = customSizeInputs[1].value;

    if (!customWidth || !customHeight) {
      showNotification('Por favor, ingresa las dimensiones personalizadas.', 'error');
      console.log("⚠️ Falta ingresar dimensiones personalizadas.");
      return;
    }
    size = `${customWidth}x${customHeight}`;
  } else {
    const selectedSizeElement = document.querySelector('#size-picker .ios-picker-item.selected');
    size = selectedSizeElement ? selectedSizeElement.getAttribute('data-value') : '10X15';
  }

  const comments = document.querySelector('.comment-area').value;
  const withFrame = document.querySelector('input[name="frame"]:checked').value !== 'sin-marco';
  let frame = 'sin-marco';

  if (withFrame) {
    const selectedFrameElement = document.querySelector('#frame-picker .frame-ios-picker-item.selected');
    frame = selectedFrameElement ? selectedFrameElement.getAttribute('data-value') : 'frame1';
  }

  // Verificar si `ajax_object` está definido antes de usarlo
  if (typeof ajax_object === 'undefined') {
    console.error("❌ ERROR: ajax_object no está definido. Verifica que el script de WordPress está cargando correctamente.");
    showNotification("Error de configuración. Contacte con el administrador.", "error");
    return;
  }

  // Preparar los datos para enviar
  const formData = new FormData();
  formData.append('action', 'process_print_image');
  formData.append('nonce', ajax_object.nonce);
  formData.append('image_data', uploadedImageData);
  formData.append('quantity', quantity); //✅
  formData.append('size', size); //✅ 
  formData.append('is_custom_size', isCustomSize); //✅
  formData.append('custom_width', customWidth || 0); //✅
  formData.append('custom_height', customHeight || 0); //✅
  formData.append('comments', comments); //✅
  formData.append('frame', frame); //✅

  console.log("📦 Enviando datos al servidor...", Object.fromEntries(formData));

  // Mostrar indicador de carga
  showLoadingIndicator();

  // Enviar datos mediante AJAX
  fetch(ajax_object.ajax_url, {
    method: 'POST',
    body: formData,
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then(data => {
      hideLoadingIndicator();
      console.log("🔄 Respuesta del servidor:", data);

      if (data.success) {
        showNotification('¡Producto añadido al carrito!', 'success');
        setTimeout(() => {
          window.location.href = data.data.cart_url;
        }, 1500);
      } else {
        showNotification('Error: ' + data.data, 'error');
      }
    })
    .catch(error => {
      hideLoadingIndicator();
      console.error("❌ Error al procesar la solicitud:", error);
      showNotification('Error al procesar la solicitud: ' + error.message, 'error');
    });
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// Función para mostrar indicador de carga
function showLoadingIndicator() {
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'loading-overlay';
  loadingOverlay.innerHTML = `<div class="loading-spinner"></div><p>Procesando...</p>`;
  document.body.appendChild(loadingOverlay);
  setTimeout(() => loadingOverlay.classList.add('show'), 10);
}

// Función para ocultar indicador de carga
function hideLoadingIndicator() {
  const loadingOverlay = document.querySelector('.loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('show');
    setTimeout(() => document.body.removeChild(loadingOverlay), 300);
  }
}