import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/background/bg1.jpg';
import logo from '../assets/images/background/bg.jpg';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [inputError, setInputError] = useState<{ username?: string; password?: string }>({});
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const adminUsername = 'admin';
        const adminPassword = 'password123';

        let errors: { username?: string; password?: string } = {};

        if (!username) errors.username = 'Username is required';
        if (!password) errors.password = 'Password is required';

        setInputError(errors);

        if (Object.keys(errors).length === 0) {
            if (username === adminUsername && password === adminPassword) {
                localStorage.setItem('isAuthenticated', 'true');
                navigate('/dashboard');
            } else {
                setError('Invalid username or password');
            }
        }
    };

    return (
        <div 
            className="flex items-center justify-center min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl p-12 w-full max-w-lg transform transition-all hover:scale-105">
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
                        />
                        {inputError.password && <p className="text-red-500 text-sm mt-1">{inputError.password}</p>}
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
