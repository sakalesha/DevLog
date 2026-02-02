import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            // Error managed by context/component state
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
            {/* Background Ambience */}
            <div className="fixed inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-primary-300/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-float" />

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-display text-slate-900 mb-2 tracking-tight">Welcome back</h1>
                    <p className="text-slate-500 text-lg">Enter your credentials to access your account</p>
                </div>

                <Card className="p-8 backdrop-blur-xl bg-white/70 shadow-2xl shadow-slate-200/50 border-white/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center gap-2 animate-slide-up">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            placeholder="john@example.com"
                            icon={Mail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="space-y-1">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                icon={Lock}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="flex justify-end">
                                <Link to="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            disabled={isLoading}
                            className="shadow-xl shadow-primary-500/20 group"
                        >
                            {isLoading ? 'Signing in...' : (
                                <span className="flex items-center gap-2">
                                    Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>
                </Card>

                <p className="text-center mt-8 text-slate-500 font-medium">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 font-bold hover:underline decoration-2 underline-offset-2">
                        Sign up for free
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
