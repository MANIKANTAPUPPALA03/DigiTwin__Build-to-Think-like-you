import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, ShieldAlert } from 'lucide-react';

const ACCOUNTS = [
    {
        name: "Michael Chen",
        email: "michael.chen@gmail.com",
        avatar: "https://lh3.googleusercontent.com/a/default-user"
    },
    {
        name: "Michael (Work)",
        email: "michael@digitwin.ai",
    },
    {
        name: "Test User",
        email: "test.user@example.com"
    }
];

const GoogleOAuth: React.FC = () => {
    const navigate = useNavigate();
    const { loginWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelect = async (account: any) => {
        setVerifying(true);
        setError(null);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Check if user exists in our local "database"
        const usersDbStr = localStorage.getItem('users_db');
        const usersDb = usersDbStr ? JSON.parse(usersDbStr) : {};

        if (usersDb[account.email]) {
            // User exists, proceed to login
            setVerifying(false);
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await loginWithGoogle(account);
            navigate('/dashboard');
        } else {
            // User does not exist
            setVerifying(false);
            setError(`Couldn't find your Google Account. Try using a different account or sign up first.`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-xl font-medium text-slate-700">Signing in...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 font-roboto">
            <div className="bg-white p-8 rounded-[28px] shadow-sm w-full max-w-[450px] min-h-[500px] flex flex-col">
                <div className="flex flex-col items-center mb-8">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-10 h-10 mb-4" />
                    <h1 className="text-2xl font-normal text-slate-900 mb-2">Choose an account</h1>
                    <p className="text-slate-600">to continue to DigiTwin</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm flex gap-3 items-start">
                        <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Account not found</p>
                            <p className="mt-1">{error}</p>
                            <button
                                onClick={() => navigate('/signup')}
                                className="mt-2 text-blue-700 hover:underline font-medium"
                            >
                                Create an account
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-1 flex-1">
                    {ACCOUNTS.map((account) => (
                        <button
                            key={account.email}
                            onClick={() => handleSelect(account)}
                            disabled={verifying}
                            className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-full transition-colors border border-transparent border-b-slate-100 text-left group"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-medium text-lg flex-shrink-0">
                                {account.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-700 truncate">{account.name}</div>
                                <div className="text-sm text-slate-500 truncate">{account.email}</div>
                            </div>
                        </button>
                    ))}

                    <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-full transition-colors border border-transparent text-left">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                            <User size={20} />
                        </div>
                        <div className="font-medium text-slate-700">Use another account</div>
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                    <div className="space-x-4">
                        <a href="#" className="hover:bg-slate-50 rounded px-2 py-1">English (United States)</a>
                    </div>
                    <div className="space-x-4">
                        <a href="#" className="hover:bg-slate-50 rounded px-2 py-1">Help</a>
                        <a href="#" className="hover:bg-slate-50 rounded px-2 py-1">Privacy</a>
                        <a href="#" className="hover:bg-slate-50 rounded px-2 py-1">Terms</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoogleOAuth;
