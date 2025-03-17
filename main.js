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
    });
  });

  // Simulate initial scroll to center the first item
  setTimeout(function () {
    if (pickerItems.length > 0) {
      pickerItems[0].scrollIntoView({ block: 'center' });
    }
  }, 100);
}

function highlightVisibleItem(picker, items) {
  // Get the middle position of the picker
  const pickerRect = picker.getBoundingClientRect();
  const middlePosition = pickerRect.top + pickerRect.height / 2;

  // Find the item closest to the middle
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

  // Ajusta la sombra al centro del item más cercano
  const pickerHighlight = picker.querySelector('.ios-picker-highlight');
  if (pickerHighlight && closestItem) {
    const closestItemRect = closestItem.getBoundingClientRect();
    const itemMiddle = closestItemRect.top + closestItemRect.height / 2;

    // Posiciona la sombra en el centro del item más cercano
    pickerHighlight.style.top = itemMiddle - pickerRect.top - (pickerHighlight.offsetHeight / 2) + 'px';

    // Ajusta el tamaño de la sombra para que coincida con el tamaño del item
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
}

function toggleFrameOptions(show) {
  document.getElementById('frame-picker-container').style.display = show ? 'block' : 'none';
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
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.innerHTML = `<img src="${reader.result}" alt="Imagen seleccionada" style="max-width: 100%;" />`;
      };
      reader.readAsDataURL(file); // Leer el archivo como una URL de datos
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
