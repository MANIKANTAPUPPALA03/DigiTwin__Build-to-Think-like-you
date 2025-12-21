import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
    { question: "What is Smart Life Agent?", answer: "Smart Life Agent is an AI-based personal assistant that helps manage your daily tasks and works like your digital twin." },
    { question: "How does Smart Life Agent help me?", answer: "It reads your emails, calendar events, and reminders (with permission) to find tasks and help you complete them faster." },
    { question: "Do I need to manually add tasks?", answer: "No. The agent automatically finds tasks from emails and calendar events." },
    { question: "What is Suggestion Mode?", answer: "In Suggestion Mode, the agent recommends actions and waits for your approval before doing anything." },
    { question: "What is Autonomous Mode?", answer: "In Autonomous Mode, the agent safely performs routine tasks on its own and logs every action." },
    { question: "Can I switch between modes?", answer: "Yes. You can switch between Suggestion Mode and Autonomous Mode anytime." },
    { question: "Is my personal data safe?", answer: "Yes. Your data is accessed only with your permission and used only to help you manage tasks." },
    { question: "Will the agent send emails without my knowledge?", answer: "No. All actions are visible in the action log, and you stay in control." },
    { question: "Can I see what the agent has done?", answer: "Yes. The action log shows all tasks suggested or completed by the agent." },
    { question: "What if the agent makes a mistake?", answer: "You can correct it, and the agent will learn from your feedback." },
    { question: "Does the agent learn my preferences?", answer: "Yes. Over time, it adapts to your habits, priorities, and work style." },
    { question: "Can I pause or stop the agent?", answer: "Yes. You can pause the agent or restrict access whenever you want." },
    { question: "Who can use Smart Life Agent?", answer: "Students, professionals, and anyone who wants to save time and stay organized." },
    { question: "Is Smart Life Agent hard to use?", answer: "No. It is designed to be simple, user-friendly, and easy to understand." },
    { question: "Do I need technical knowledge to use it?", answer: "No technical knowledge is required. The agent works automatically in the background." },
    { question: "What is the main goal of Smart Life Agent?", answer: "The goal is to reduce mental stress and improve productivity by managing tasks automatically." },
];

const Help: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-900 selection:text-white font-sans relative overflow-x-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                <nav className="flex items-center justify-between mb-16">
                    <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2 text-purple-400">
                        <HelpCircle size={24} />
                        <span className="font-semibold tracking-wide">Help Center</span>
                    </div>
                </nav>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-white">
                        How can we help?
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Everything you need to know about your DigiTwin agent.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {faqs.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05, duration: 0.5 }}
                            whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                            className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm transition-all shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30"
                        >
                            <h3 className="text-lg font-semibold text-blue-300 mb-3">{faq.question}</h3>
                            <p className="text-slate-400 leading-relaxed font-light">{faq.answer}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 text-center backdrop-blur-lg"
                >
                    <p className="text-slate-300 mb-4">Still have questions?</p>
                    <a
                        href="mailto:digitwin241@gmail.com"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    >
                        <Mail size={18} />
                        Contact Support
                    </a>
                </motion.div>

                <footer className="mt-16 text-center text-slate-600 text-sm">
                    &copy; 2025 Smart Life Agent. All rights reserved.
                </footer>
            </div>
        </div>
    );
};

export default Help;
