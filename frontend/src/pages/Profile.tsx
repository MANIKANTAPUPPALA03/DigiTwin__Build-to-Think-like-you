import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Moon, LogOut } from 'lucide-react';

interface SettingsProps {
    isDark: boolean;
    setIsDark: (isDark: boolean) => void;
}

const Profile: React.FC<SettingsProps> = ({ isDark, setIsDark }) => {
    const { user, logout } = useAuth();
    const [profileName, setProfileName] = useState(user?.name || '');
    const [email] = useState(user?.email || '');

    const handleSave = () => {
        // In a real app, this would update the backend
        console.log('Saving profile...', { name: profileName, email });
        alert('Profile updated!');
    };

    return (
        <div className={`p-8 max-w-4xl mx-auto h-full overflow-y-auto ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            <div className="flex items-center gap-4 mb-8">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-200'}`}>
                    <SettingsIcon size={24} className="text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Manage your account and preferences</p>
                </div>
            </div>

            <div className="grid gap-8 pb-8">
                {/* Profile Section */}
                <div className={`p-6 rounded-2xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-sm border border-slate-200'}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <User className="text-blue-600" size={20} />
                        <h2 className="text-xl font-bold">Profile Information</h2>
                    </div>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                                        ? 'bg-slate-800 border-slate-700 text-white'
                                        : 'bg-slate-50 border-slate-200 text-slate-900'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className={`w-full px-4 py-2 rounded-xl border opacity-70 cursor-not-allowed ${isDark
                                        ? 'bg-slate-800 border-slate-700 text-slate-400'
                                        : 'bg-slate-100 border-slate-200 text-slate-500'
                                    }`}
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            className={`px-6 py-2 text-white rounded-xl font-medium transition-all shadow-md hover:scale-105 ${
                                isDark 
                                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110' 
                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110'
                            }`}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className={`p-6 rounded-2xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white shadow-sm border border-slate-200'}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <Moon className="text-blue-600" size={20} />
                        <h2 className="text-xl font-bold">Appearance</h2>
                    </div>

                    <div className="flex items-center justify-between max-w-md">
                        <div>
                            <div className="font-medium">Dark Mode</div>
                            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Switch between light and dark themes
                            </div>
                        </div>
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className={`w-14 h-7 rounded-full transition-colors relative ${isDark ? 'bg-blue-600' : 'bg-slate-200'
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${isDark ? 'left-8' : 'left-1'
                                    }`}
                            ></div>
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-red-900/50' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <LogOut className="text-red-600" size={20} />
                        <h2 className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>Account Actions</h2>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                            Sign out of your account on this device
                        </div>
                        <button
                            onClick={logout}
                            className="px-6 py-2 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
