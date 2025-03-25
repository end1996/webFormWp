document.addEventListener('DOMContentLoaded', function () {
 // Initialize size picker (vertical)
 const sizePicker = document.getElementById('size-picker');
 if (sizePicker) {
   initializeVerticalPicker('size-picker');
 } else {
   console.error('Size picker not found');
 }

 // Initialize frame picker (horizontal)
 const framePicker = document.getElementById('frame-picker');
 if (framePicker) {
   initializeHorizontalPicker('frame-picker');
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

function initializeVerticalPicker(pickerId) {
  const picker = document.getElementById(pickerId);
  if (!picker) return;

  const pickerItems = picker.querySelectorAll('.ios-picker-item');
  if (pickerItems.length === 0) return;

  // Configuración inicial
  pickerItems.forEach(i => i.classList.remove('selected'));
  
  // Evento de scroll
  picker.addEventListener('scroll', function() {
    highlightVerticalItem(picker, pickerItems);
    ensureVerticalBoundary(picker, pickerItems);
  });

  // Evento de clic
  pickerItems.forEach(item => {
    item.addEventListener('click', function() {
      pickerItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      item.scrollIntoView({ block: 'center', behavior: 'smooth' });
      updateImageSize();
    });
  });

  // Evento de rueda del mouse
  picker.addEventListener('wheel', function(event) {
    event.preventDefault();
    picker.scrollTop += event.deltaY;
  });
}

function initializeHorizontalPicker(pickerId) {
  const picker = document.getElementById(pickerId);
  if (!picker) return;

  const pickerItems = picker.querySelectorAll('.frame-ios-picker-item');
  if (pickerItems.length === 0) return;

  // Configuración inicial
  pickerItems.forEach(i => i.classList.remove('selected'));
  
  // Evento de scroll
  picker.addEventListener('scroll', function() {
    highlightHorizontalItem(picker, pickerItems);
    ensureHorizontalBoundary(picker, pickerItems);
  });

  // Evento de clic
  pickerItems.forEach(item => {
    item.addEventListener('click', function() {
      pickerItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      item.scrollIntoView({ inline: 'center', behavior: 'smooth' });
      updateFrameSelection();
    });
  });

  // Evento de rueda del mouse
  picker.addEventListener('wheel', function(event) {
    event.preventDefault();
    picker.scrollLeft += event.deltaY;
  });
}

// Funciones específicas para el picker vertical
function highlightVerticalItem(picker, items) {
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

  const pickerHighlight = picker.parentElement.querySelector('.ios-picker-highlight');
  if (pickerHighlight && closestItem) {
    const closestItemRect = closestItem.getBoundingClientRect();
    pickerHighlight.style.top = (closestItemRect.top - pickerRect.top) + 'px';
    pickerHighlight.style.height = closestItemRect.height + 'px';
  }

  if (closestItem) {
    items.forEach(item => item.classList.remove('selected'));
    closestItem.classList.add('selected');
  }
}

function ensureVerticalBoundary(picker, items) {
  const firstItem = items[0];
  const lastItem = items[items.length - 1];

  if (picker.scrollTop <= 0) {
    items.forEach(item => item.classList.remove('selected'));
    firstItem.classList.add('selected');
  } else if (picker.scrollTop + picker.clientHeight >= picker.scrollHeight - 1) {
    items.forEach(item => item.classList.remove('selected'));
    lastItem.classList.add('selected');
  }
}

// Funciones específicas para el picker horizontal
function highlightHorizontalItem(picker, items) {
  const pickerRect = picker.getBoundingClientRect();
  const middlePosition = pickerRect.left + pickerRect.width / 2;

  let closestItem = null;
  let closestDistance = Infinity;

  items.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const itemMiddle = itemRect.left + itemRect.width / 2;
    const distance = Math.abs(itemMiddle - middlePosition);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = item;
    }
  });

  const pickerHighlight = picker.parentElement.querySelector('.frame-ios-picker-highlight');
  if (pickerHighlight && closestItem) {
    const closestItemRect = closestItem.getBoundingClientRect();
    pickerHighlight.style.left = (closestItemRect.left - pickerRect.left) + 'px';
    pickerHighlight.style.width = closestItemRect.width + 'px';
  }

  if (closestItem) {
    items.forEach(item => item.classList.remove('selected'));
    closestItem.classList.add('selected');
  }
}

function ensureHorizontalBoundary(picker, items) {
  const firstItem = items[0];
  const lastItem = items[items.length - 1];

  if (picker.scrollLeft <= 0) {
    items.forEach(item => item.classList.remove('selected'));
    firstItem.classList.add('selected');
  } else if (picker.scrollLeft + picker.clientWidth >= picker.scrollWidth - 1) {
    items.forEach(item => item.classList.remove('selected'));
    lastItem.classList.add('selected');
  }
}

// Función para los botones de flecha (si los necesitas)
function scrollLeftHandler() {
  const framePicker = document.getElementById('frame-picker');
  if (framePicker) {
    framePicker.scrollBy({ left: -100, behavior: 'smooth' });
  }
}

function scrollRightHandler() {
  const framePicker = document.getElementById('frame-picker');
  if (framePicker) {
    framePicker.scrollBy({ left: 100, behavior: 'smooth' });
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
  //updateImageSize(); // Actualizar el tamaño de la imagen
}

function toggleFrameOptions(show) {
  document.getElementById('frame-picker-container').style.display = show ? 'block' : 'none';
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
          const removeButton = document.querySelector('.remove-image-btn');
          const removeButtonContainer = document.querySelector('.remove-image-btn-container');
  
          uploadedImage.src = reader.result;
          uploadedImage.style.display = 'block'; 
  
          // Guardar la URL de la imagen en la variable global
          uploadedImageData = reader.result;
          
          const svgElement = document.querySelector('.upload-area svg');
          const paragraphElement = document.querySelector('.upload-area p');
          const buttonElement = document.querySelector('.upload-btn');
  
          // Ocultar los elementos de carga
          svgElement.style.display = 'none';
          paragraphElement.style.display = 'none';
          buttonElement.style.display = 'none';
  
          // Mostrar botón de eliminar imagen
          removeButton.style.display = 'block';
          removeButton.onclick = removeUploadedImage;
  
          // Ajustes de estilo al subir imagen
          uploadArea.style.margin = '0';
          uploadArea.style.padding = '0 15px';
          removeButtonContainer.style.padding = '0 0 20px 0';
        };
        reader.readAsDataURL(file); // Leer el archivo como una URL de datos
      }
  };

  // Función para eliminar la imagen subida
window.removeUploadedImage = () => {
    uploadedImageData = null;

    // Restaurar visibilidad de los elementos originales
    const uploadedImage = document.getElementById('uploaded-image');
    const removeButton = document.querySelector('.remove-image-btn');
    const svgElement = document.querySelector('.upload-area svg');
    const paragraphElement = document.querySelector('.upload-area p');
    const buttonElement = document.querySelector('.upload-btn');
    const uploadArea = document.querySelector('.upload-area');
    const imageContainer = document.querySelector('.image-container');
    const fileInput = document.getElementById('file-input');

    // Ocultar la imagen y el botón de eliminar
    uploadedImage.src = "";
    uploadedImage.style.display = "none";
    removeButton.style.display = "none";

    // Restaurar los elementos originales del upload
    svgElement.style.display = "";
    paragraphElement.style.display = "";
    buttonElement.style.display = "";
    uploadArea.style.padding = "5px";
    imageContainer.style.padding = "5px";

    // Reincia el valor del input de archivo
    if (fileInput) {
      fileInput.value = ''; // Limpiar el valor del input de archivo
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

// Objeto para almacenar los tamaños ya calculados (caché)
const sizeCache = {};

function updateImageSize() {
  const selectedSize = document.querySelector(".ios-picker-item.selected")?.dataset.value;
  const uploadedImage = document.getElementById("uploaded-image");
  const uploadArea = document.querySelector('.upload-area');
  const container = uploadedImage.parentElement; // Contenedor de la imagen

  if (!selectedSize || !uploadedImage || !container) {
    console.log("⚠️ No se puede actualizar el tamaño de la imagen. Datos faltantes.");
    return;
  }

  // Si el tamaño ya está en caché, aplicamos los valores guardados
  if (sizeCache[selectedSize]) {
    const { width, height } = sizeCache[selectedSize];
    uploadedImage.style.width = `${width}px`;
    uploadedImage.style.height = `${height}px`;
    console.log("↩️ Tamaño recuperado de caché:", { width, height });
    return;
  }

    const [widthCm, heightCm] = selectedSize.split("X").map(Number);

    // 1. Conversión más realista (1cm ≈ 38px para pantallas estándar)
    const cmToPx = 40; // Ajustado para evitar dimensiones excesivas
    // Alternativa dinámica: const cmToPx = (96 * window.devicePixelRatio) / 2.54;

    // 2. Tamaño deseado en píxeles
    let desiredWidthPx = widthCm * cmToPx;
    let desiredHeightPx = heightCm * cmToPx;

    // 3. Límites físicos (tamaño original y contenedor)
    const maxNaturalWidth = uploadedImage.naturalWidth;
    const maxNaturalHeight = uploadedImage.naturalHeight;
    const maxContainerWidth = container.clientWidth;
    const maxContainerHeight = container.clientHeight;

    console.log('Dimensiones:', {
      deseado: { desiredWidthPx, desiredHeightPx }, // 1270 X 746
      máximoNatural: { maxNaturalWidth, maxNaturalHeight },
      contenedor: { maxContainerWidth, maxContainerHeight }
    });

    // 4. Ajuste inteligente de tamaño
    const widthScaleFactor = Math.min(
      1,
      maxNaturalWidth / desiredWidthPx,
      maxContainerWidth / desiredWidthPx
    );
    
    const heightScaleFactor = Math.min(
      1,
      maxNaturalHeight / desiredHeightPx,
      maxContainerHeight / desiredHeightPx
    );

    const scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);

    const finalWidth = desiredWidthPx * scaleFactor;
    const finalHeight = desiredHeightPx * scaleFactor;

    // Guardamos en caché
    sizeCache[selectedSize] = { width: finalWidth, height: finalHeight };

    // 5. Aplicación de estilos optimizada
    uploadedImage.style.width = `${finalWidth}px`;
    uploadedImage.style.height = `${finalHeight}px`;
    uploadedImage.style.maxWidth = '100%';
    uploadedImage.style.maxHeight = '100%';
    uploadedImage.style.objectFit = 'cover'; // Cambiado a 'contain' para mejor visualización
    uploadedImage.style.display = 'block';

  console.log('✅ Tamaño calculado y guardado en caché:', { finalWidth, finalHeight });
  }

function analyzeImagePixels(img) {

  if (img.naturalWidth === 0 || img.naturalHeight === 0) {
    console.log("⚠️ La imagen aún no se ha cargado completamente.");
    return;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

  const imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
  const pixels = imageData.data;

  console.log("Total de píxeles procesados:", pixels.length / 4);

  predictRealSize(img.naturalWidth, img.naturalHeight);
}

function predictRealSize(width, height) {
  console.log("Calculando tamaño real para:", width, height);

  const factorX = 0.0169;   
  const factorY = 0.0169;

  const realWidth = (width * factorX).toFixed(1);
  const realHeight = (height * factorY).toFixed(1);

  console.log(`Tamaño estimado en cm: ${realWidth} x ${realHeight}`);
}

window.onload = function () {
  const uploadedImage = document.getElementById("uploaded-image");

  if (uploadedImage.complete && uploadedImage.naturalWidth > 0) {
    console.log("✅ La imagen ya estaba cargada.");
    //updateImageSize();
  } else {
    console.log("⌛ Esperando a que la imagen se cargue...");
    uploadedImage.onload = function () {
      console.log("✅ Imagen cargada.");
      analyzeImagePixels(uploadedImage);
      //updateImageSize();
    };
  }
};

// Llamar a la función para inicializar
uploadImage();

// Función para añadir al carrito
document.addEventListener('DOMContentLoaded', function () {
  console.log("✅ DOM completamente cargado.");

  // Buscar el botón de agregar al carrito
  const addToCartBtn = document.querySelector('.add-to-cart-btn');

  if (addToCartBtn) {
    //console.log("✅ Botón 'Agregar al carrito' encontrado.");
    addToCartBtn.addEventListener('click', function () {
      //console.log("🛒 Botón 'Agregar al carrito' clickeado.");
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

function showAlert(message) {
  //crear el contenedor del mensaje (modal)
  const alertModal = document.createElement('div');
  alertModal.className = 'alert-modal';
  alertModal.innerHTML = `
    <div class="alert-content">
      <p>${message}</p>
      <button class="close-alert-btn">Cerrar</button>
    </div>
  `;

  //agregar el modal al cuerpo del coumento
  document.body.appendChild(alertModal);

  //cierra el modal al hacer clic en el botón
  alertModal.querySelector('.alert-close-btn').addEventListener('click', () => {
    document.body.removeChild(alertModal);
  });
}