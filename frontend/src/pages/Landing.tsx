import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, HelpCircle, Info, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.png';

const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-900 selection:text-white font-sans overflow-x-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-gradient-to-tr from-blue-900/30 via-purple-900/30 to-pink-900/30 rounded-full blur-[150px]"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <nav className="relative z-50 p-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="DigiTwin Logo" className="w-10 h-10 object-contain" />
                    <span className="font-bold tracking-widest text-sm text-slate-500 uppercase">Smart Life Agent</span>
                </div>
                <div className="flex items-center gap-6">

                    <Link to="/login" className="px-6 py-2 border border-white/20 rounded-full text-sm font-medium hover:bg-white hover:text-black transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]">
                        Sign In
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9, letterSpacing: '0em' }}
                    animate={{ opacity: 1, scale: 1, letterSpacing: '0.05em' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-[12vw] md:text-[150px] font-black leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-cyan-400 via-blue-600 to-purple-600 brightness-125"
                >
                    DIGITWIN
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="relative mt-8"
                >
                    <p className="text-2xl md:text-4xl font-light text-blue-200/80 tracking-wide font-serif italic">
                        Built to think like you.
                    </p>
                    <p className="absolute top-full left-0 right-0 text-2xl md:text-4xl font-light text-purple-400/30 tracking-wide font-serif italic opacity-20 scale-y-[-1] blur-sm mt-2 pointer-events-none select-none">
                        Built to think like you.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-12"
                >
                    <ChevronDown className="animate-bounce text-slate-600" size={32} />
                </motion.div>
            </div>

            {/* About Us Section */}
            <div id="about" className="relative z-10 py-32 px-6 bg-gradient-to-b from-transparent to-black/80">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 py-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 leading-tight">
                            What Does The Agent Do
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full"></div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm"
                        >
                            <Info className="text-cyan-400 mb-6" size={40} />
                            <h3 className="text-xl font-bold mb-4 text-white">Our Mission</h3>
                            <p className="text-slate-400 leading-relaxed">
                                We are building DigiTwin to be more than just a tool, it's your digital counterpart.
                                In a world overflowing with information and tasks, our goal is to create an
                                intelligent agent that understands your context, manages your workload, and
                                autonomously handles the mundane, leaving you free to focus on what truly matters.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="space-y-8"
                        >
                            <div>
                                <h4 className="text-lg font-semibold text-blue-300 mb-2">Cognitive Offloading</h4>
                                <p className="text-slate-400">
                                    By entrusting routine decisions and actions to DigiTwin, you reduce mental fatigue and regain cognitive space for creativity.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-purple-300 mb-2">Autonomous Action</h4>
                                <p className="text-slate-400">
                                    Unlike passive tools, DigiTwin can take action-scheduling meetings, sorting emails, and organizing your digital life proactively.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-cyan-300 mb-2">Privacy First</h4>
                                <p className="text-slate-400">
                                    Your digital twin lives locally with you. We prioritize security and user sovereignty above all else.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Student/Team About Us Section */}
            <div className="relative z-10 py-24 px-6 bg-gradient-to-t from-black to-transparent">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">About Us</h2>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <p className="text-slate-300 text-lg leading-relaxed font-light">
                            We are a group of enthusiastic B.Tech students with a deep passion for technology and innovation.
                            Our journey is driven by a constant curiosity to explore new fields and create meaningful projects.
                            We believe in learning by doing, and DigiTwin is just one example of how we strive to translate
                            our technical knowledge into real-world solutions. We are always excited to take on new challenges
                            and build the future, one project at a time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Meet Our Team Section */}
            <div className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent to-black/80">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Meet Our Team</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Lohitha */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm text-center group hover:bg-white/10 transition-colors"
                        >
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                                L
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Lohitha</h3>
                            <p className="text-rose-300 font-medium text-sm mb-3">The Architect</p>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                3rd year B.Tech student pursuing Data Science at CMR Technical Campus.
                                As the Architect, she designs the core structure of DigiTwin, ensuring scalability and efficient data handling.
                            </p>
                        </motion.div>

                        {/* Chandana */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm text-center group hover:bg-white/10 transition-colors"
                        >
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                                C
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Chandana</h3>
                            <p className="text-purple-300 font-medium text-sm mb-3">The R&D</p>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                2nd year B.Tech student of IT at Malla Reddy College.
                                Leading R&D, she explores cutting-edge AI technologies to keep DigiTwin innovative and ahead of the curve.
                            </p>
                        </motion.div>

                        {/* Uday */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm text-center group hover:bg-white/10 transition-colors"
                        >
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                                U
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Uday</h3>
                            <p className="text-cyan-300 font-medium text-sm mb-3">Frontend Developer</p>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                3rd year B.Tech student in CSM at Vardhaman College of Engineering.
                                He crafts the user interface, ensuring a smooth, responsive, and visually stunning experience for every user.
                            </p>
                        </motion.div>

                        {/* Manikanta */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm text-center group hover:bg-white/10 transition-colors"
                        >
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                                M
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Manikanta</h3>
                            <p className="text-emerald-300 font-medium text-sm mb-3">Backend Developer</p>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                3rd year CSE student at CMR Technical Campus.
                                He builds the robust backend systems that power the agent's logic, ensuring reliability and speed.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div >

            {/* Footer */}
            < footer className="relative z-10 border-t border-white/10 bg-black/80 backdrop-blur-xl" >
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <Bot size={24} className="text-slate-600" />
                            <span className="font-bold text-slate-600 uppercase tracking-widest text-sm">DigiTwin</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-8">
                            <Link to="/help" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium">
                                Help Center
                            </Link>
                            <a href="#about" className="text-slate-400 hover:text-purple-400 transition-colors text-sm font-medium">
                                About Us
                            </a>
                            <Link to="/login" className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">
                                Login
                            </Link>
                            <Link to="/signup" className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium">
                                Create Account
                            </Link>
                        </div>

                        <div className="text-slate-600 text-sm">
                            &copy; 2025 Smart Life Agent
                        </div>
                    </div>
                </div>
            </footer>

            {/* High Visibility Help Button (Fixed) */}
            <Link
                to="/help"
                className="fixed bottom-8 right-8 z-50 group flex items-center gap-3 pl-4 pr-2 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300"
            >
                <span className="font-bold text-white text-sm">Need Help?</span>
                <div className="p-2 bg-white/20 rounded-full">
                    <HelpCircle size={20} className="text-white" />
                </div>
            </Link>
        </div>
    );
};

export default Landing;
