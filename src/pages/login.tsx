import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat } from 'lucide-react';
import logo from '../assets/images/background/jared.jpg';
import API from '../api';

import illustration from '../assets/images/background/illustration.svg'; // UPDATE THIS PATH

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
    // --- EXISTING LOGIC ENDS HERE ---

    return (
        // Split Screen Layout
        <div className="flex min-h-screen w-full font-sans">
            
            {/* LEFT SIDE: Illustration & Branding (The SVG part) */}
            <div className="hidden md:flex w-1/2 bg-red-50 flex-col items-center justify-center p-12 relative">
                {/* SVG Illustration Container */}
                <div className="w-full max-w-md mb-8">
                    {/* Replace src with your actual SVG file variable */}
                    <img 
                        src={illustration} 
                        alt="Exam Mastery Hub Illustration" 
                        className="w-full h-auto object-contain" 
                    />
                </div>
                
                <div className="text-center z-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Jared Construction Supplies</h2>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Building Your Dreams with Quality and Reliability
                    </p>
                    {/* Carousel Dots Decoration */}
                    <div className="flex gap-2 justify-center mt-6">
                        <div className="w-2 h-2 rounded-full bg-red-200"></div>
                        <div className="w-2 h-2 rounded-full bg-red-200"></div>
                        <div className="w-6 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-red-200"></div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Login Form */}
            <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 md:p-12">
                <div className="w-full max-w-md space-y-8">
                    
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-4">
                            <img src={logo} alt="Jared Logo" className="w-20 h-20 rounded-full object-cover shadow-md" />
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-gray-800 tracking-wide flex items-center justify-center gap-1">
                            <span>J</span>
                            
                            {/* Letter A with Hard Hat */}
                            <div className="relative group">
                                {/* - absolute: takes it out of flow
                                    - -top-[1.1rem]: Moves it up (adjust this pixel value to make it closer/further)
                                    - left-1/2 -translate-x-1/2: Perfectly centers it horizontally over the A
                                    - text-primaryMid: Uses your red brand color for the hat
                                */}
                                <HardHat 
                                    className="absolute -top-[1.1rem] left-1/2 -translate-x-1/2 w-6 h-6 text-primaryMid fill-current" 
                                    strokeWidth={1.5}
                                />
                                <span>A</span>
                            </div>

                            <span>RED</span>
                            
                            {/* Construction Text in Red/Orange to match your image */}
                            <span className="text-primaryMid ml-2 font-semibold">CONSTRUCTION</span>
                        </h1>
                    </div>

                    {error && <div className="p-3 bg-red-50 text-red-500 rounded-md text-sm text-center">{error}</div>}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-gray-500 text-sm mb-2">Username or email</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username" 
                                className={`w-full px-4 py-3 text-gray-700 border ${inputError.username ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors`}
                                disabled={isLoading}
                            />
                            {inputError.username && <p className="text-red-500 text-xs mt-1">{inputError.username}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-500 text-sm mb-2">Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password" 
                                className={`w-full px-4 py-3 text-gray-700 border ${inputError.password ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors`}
                                disabled={isLoading}
                            />
                             <div className="flex justify-between items-center mt-2">
                                {inputError.password ? <p className="text-red-500 text-xs">{inputError.password}</p> : <div></div>}
                                <a href="#" className="text-sm text-red-400 hover:underline font-medium">Forgot password?</a>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sign in...
                                </>
                            ) : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;