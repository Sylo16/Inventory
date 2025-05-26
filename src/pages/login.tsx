import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/background/background.jpg';
import logo from '../assets/images/background/jared.jpg';
import API from '../api';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [inputError, setInputError] = useState<{ username?: string; password?: string }>({});
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        let errors: { username?: string; password?: string } = {};
        if (!username) errors.username = 'Username is required';
        if (!password) errors.password = 'Password is required';

        setInputError(errors);

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);
            try {
                const response = await API.post('/login', {
                    username,
                    password,
                });

                const { token } = response.data;
                localStorage.setItem('authToken', token);
                navigate('/dashboard');
            } catch (error) {
                setError('Invalid username or password');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div 
            className="flex items-center justify-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="bg-white bg-opacity-90 rounded-xl shadow-2xl p-12 w-full max-w-lg transform transition-all hover:scale-105">
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Logo" className="w-24 h-24 rounded-full border-4 border-white shadow-md" />
                </div>
                <h2 className="text-5xl font-extrabold text-center text-gray-800 mb-8">Login</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-lg font-bold mb-2">Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username" 
                            className="w-full p-4 text-lg border border-gray-300 rounded-xl"
                            disabled={isLoading}
                        />
                        {inputError.username && <p className="text-red-500 text-sm mt-1">{inputError.username}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-700 text-lg font-bold mb-2">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password" 
                            className="w-full p-4 text-lg border border-gray-300 rounded-xl"
                            disabled={isLoading}
                        />
                        {inputError.password && <p className="text-red-500 text-sm mt-1">{inputError.password}</p>}
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </>
                        ) : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
