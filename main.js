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

function SubirImagen() {
  // Función para abrir el diálogo de selección de archivo
  const triggerFileInput = () => {
    const fileInput = document.getElementById('file-input');
    fileInput.click(); // Simula un clic en el input de archivo
  };

  // Función para manejar el cambio de imagen
  const handleImageChange = (event) => {
    const file = event.target.files?.[0]; // Obtener el archivo seleccionado
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

  // Asignar eventos
  document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.addEventListener('change', handleImageChange); // Escuchar cambios en el input de archivo
    }
  });
}

// Llamar a la función para inicializar
SubirImagen();