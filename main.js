document.addEventListener('DOMContentLoaded', function () {
  // Initialize iOS-style size picker
  initializeIOSPicker('size-picker');

  // Initialize iOS-style frame picker
  initializeIOSPicker('frame-picker');
});

function initializeIOSPicker(pickerId) {
  const picker = document.getElementById(pickerId);
  const pickerItems = picker.querySelectorAll('.ios-picker-item, .frame-ios-picker-item');

  // Set the first item as selected initially
  if (pickerItems.length > 0) {
    pickerItems[0].classList.add('selected');
  }

  // Add scroll event listener
  picker.addEventListener('scroll', function () {
    highlightVisibleItem(picker, pickerItems);
  });

  // evento para el clic en la lista de elementos
  pickerItems.forEach(item => {
    item.addEventListener('click', function () {
      pickerItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      item.scrollIntoView({ block: 'center' });
      updateImageSize();
    });
  });

  // Simulate initial scroll to center the first item
  setTimeout(function () {
    if (pickerItems.length > 0) {
      pickerItems[0].scrollIntoView({ block: 'center' });
      updateImageSize(); // Actualizar el tamaño de la imagen
    }
  }, 100);
}

//Flecha de navegación 
function highlightVisibleItem(picker, items) {
  // Get the middle position of the picker
  const pickerRect = picker.getBoundingClientRect();
  const middlePosition = pickerRect.left + pickerRect.width / 2; 

  // Find the item closest to the middle
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

  // Ajusta la sombra al centro del item más cercano
  const pickerHighlight = picker.querySelector('.frame-ios-picker-highlight');
  if (pickerHighlight && closestItem) {
    const closestItemRect = closestItem.getBoundingClientRect();
    const itemMiddle = closestItemRect.left + closestItemRect.width / 2; // Cambiado a left

    // Posiciona la sombra en el centro del item más cercano
    pickerHighlight.style.left = itemMiddle - pickerRect.left - (pickerHighlight.offsetWidth / 2) + 'px'; // Cambiado a left
    pickerHighlight.style.height = closestItemRect.height + 'px';
  }
 // Highlight the closest item
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

// Funcionalidad Carrito

document.getElementById("add-to-cart-btn").addEventListener("click", function () {
  let cantidad = document.querySelector(".quantity-field input").value;
  let size = document.querySelector(".ios-picker-item.selected")?.dataset.value || "10X15";
  let marco = document.querySelector("input[name='frame']:checked").nextSibling.textContent.trim();
  let comentarios = document.querySelector(".comment-area").value;

  let formData = new FormData();
  formData.append("action", "agregar_producto_personalizado");
  formData.append("cantidad", cantidad);
  formData.append("size", size);
  formData.append("marco", marco);
  formData.append("comentarios", comentarios);

  fetch(ajaxurl, {
      method: "POST",
      body: formData,
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert("Producto añadido al carrito.");
          window.location.href = "/carrito/"; // Redirigir al carrito
      } else {
          alert("Hubo un error al agregar el producto.");
      }
  });
});
