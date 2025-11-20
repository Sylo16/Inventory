import Swal from 'sweetalert2';

// Base SweetAlert2 configuration with construction blue theme
const baseCustomClass = {
  popup: 'rounded-2xl shadow-2xl border-2 border-construction',
  title: 'text-3xl font-bold text-construction-dark',
  htmlContainer: 'text-lg text-gray-700',
  actions: 'gap-3',
  confirmButton: 'swal2-confirm-custom',
  cancelButton: 'swal2-cancel-custom',
};

// Add custom styles for bigger buttons - applies to ALL modals
const style = document.createElement('style');
style.textContent = `
  /* Make popup wider and text bigger */
  .swal2-popup {
    padding: 2.5rem !important;
    max-width: 35rem !important; /* wider modal */
  }

  /* Title bigger */
  .swal2-title {
    font-size: 2.5rem !important;  /* BIG title */
    font-weight: 700 !important;
  }

  /* Description text bigger */
  .swal2-html-container {
    font-size: 1.4rem !important;
    color: #4a4a4a !important;
    margin-top: 1rem !important;
  }

  .swal2-actions {
    gap: 1.25rem !important;
    margin-top: 2rem !important;
    width: 100% !important;
    justify-content: center !important;
  }

  .swal2-confirm,
  .swal2-cancel,
  .swal2-confirm-custom,
  .swal2-cancel-custom {
    min-width: 180px !important;
    min-height: 52px !important;
    padding: 1rem 2.5rem !important;
    font-size: 1.25rem !important;
    font-weight: 600 !important;
    border-radius: 0.5rem !important;
    transition: all 0.2s ease !important;
    margin: 0 !important;
    line-height: 1.3 !important;
  }

  .swal2-styled.swal2-confirm,
  .swal2-styled.swal2-cancel {
    min-width: 180px !important;
    min-height: 52px !important;
    padding: 1rem 2.5rem !important;
    font-size: 1.25rem !important;
    line-height: 1.3 !important;
  }

  .swal2-confirm:hover,
  .swal2-confirm-custom:hover {
    transform: scale(1.05) !important;
  }

  .swal2-cancel:hover,
  .swal2-cancel-custom:hover {
    transform: scale(1.02) !important;
  }
`;

document.head.appendChild(style);

const swalBase = Swal.mixin({
  customClass: baseCustomClass,
  buttonsStyling: true, // Use SweetAlert2's default button styling
  confirmButtonColor: '#3498DB', // Construction blue
  cancelButtonColor: '#6B7280', // Gray
  showClass: {
    popup: 'animate-fadeIn',
  },
  hideClass: {
    popup: 'animate-fadeOut',
  },
});

/**
 * Success Alert - Green themed
 */
export const showSuccess = (title: string, message?: string) => {
  return swalBase.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'OK',
    customClass: {
      ...baseCustomClass,
      icon: 'border-4 border-green-500',
    },
  });
};

/**
 * Error Alert - Red themed
 */
export const showError = (title: string, message?: string) => {
  return swalBase.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'OK',
    customClass: {
      ...baseCustomClass,
      icon: 'border-4 border-red-500',
    },
  });
};

/**
 * Warning Alert - Orange themed
 */
export const showWarning = (title: string, message?: string) => {
  return swalBase.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'OK',
    customClass: {
      ...baseCustomClass,
      icon: 'border-4 border-orange-500',
    },
  });
};

/**
 * Info Alert - Construction Blue themed
 */
export const showInfo = (title: string, message?: string) => {
  return swalBase.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'OK',
    customClass: {
      ...baseCustomClass,
      icon: 'border-4 border-construction',
    },
  });
};

/**
 * Confirmation Dialog - Construction Blue themed
 * Returns true if confirmed, false if cancelled
 */
export const showConfirm = async (
  title: string,
  message?: string,
  confirmText: string = 'Yes, proceed',
  cancelText: string = 'Cancel'
): Promise<boolean> => {
  const result = await swalBase.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      ...baseCustomClass,
      icon: 'border-4 border-construction',
    },
  });

  return result.isConfirmed;
};

/**
 * Delete Confirmation - Red themed for danger actions
 */
export const showDeleteConfirm = async (
  title: string = 'Are you sure?',
  message: string = 'This action cannot be undone.',
  confirmText: string = 'delete it'
): Promise<boolean> => {
  const result = await swalBase.fire({
    icon: 'warning',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#DC2626', // Red for delete
    cancelButtonColor: '#6B7280', // Gray
    customClass: {
      ...baseCustomClass,
      icon: 'border-4 border-red-500',
    },
  });

  return result.isConfirmed;
};

/**
 * Loading Alert - Shows a loading spinner
 */
export const showLoading = (title: string = 'Please wait...', message?: string) => {
  return Swal.fire({
    title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
    customClass: {
      popup: 'rounded-2xl shadow-2xl border-2 border-construction',
      title: 'text-2xl font-bold text-construction-dark',
      htmlContainer: 'text-lg text-gray-700',
    },
  });
};

/**
 * Close any open SweetAlert2 modal
 */
export const closeAlert = () => {
  Swal.close();
};

/**
 * Input Prompt - Get user input with construction blue theme
 */
export const showInput = async (
  title: string,
  inputPlaceholder: string = '',
  inputType: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text',
  confirmText: string = 'Submit'
): Promise<string | null> => {
  const result = await swalBase.fire({
    title,
    input: inputType,
    inputPlaceholder,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value) {
        return 'This field is required';
      }
      return null;
    },
    customClass: {
      ...baseCustomClass,
      input: 'px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-construction focus:ring-2 focus:ring-construction/20',
    },
  });

  return result.isConfirmed ? result.value : null;
};

/**
 * Toast Notification - Small notification in corner
 */
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: 'rounded-xl shadow-lg',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export const showToast = (
  icon: 'success' | 'error' | 'warning' | 'info',
  title: string
) => {
  return Toast.fire({
    icon,
    title,
  });
};

/**
 * Custom HTML Modal - For complex content
 */
export const showCustom = (
  title: string,
  htmlContent: string,
  confirmText: string = 'OK'
) => {
  return swalBase.fire({
    title,
    html: htmlContent,
    confirmButtonText: confirmText,
  });
};

export default swalBase;
