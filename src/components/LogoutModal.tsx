import React from 'react';

interface LogoutModalProps {
    isOpen: boolean;
    isLoading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
    isOpen,
    isLoading,
    onCancel,
    onConfirm,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-2xl w-[90%] max-w-sm p-6 relative animate-fadeIn">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to end your session?
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50"
                    >
                        {isLoading && (
                            <svg
                                className="animate-spin h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                        )}
                        {isLoading ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
