import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';


const Signup: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signup(name, email, password);
            navigate('/dashboard');
        } catch {
            // Error handled in context
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-3 rounded-xl mb-4">
                        <UserPlus size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
                    <p className="text-slate-500">Start your journey with DigiTwin</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => navigate('/google-login')}
                        className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                        Sign up with Google
                    </button>

                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative bg-white px-4 text-sm text-slate-400">or</div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>


        </div>
    );
};

export default Signup;
