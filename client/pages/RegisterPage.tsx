import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            // In a real app we'd set an error state here
            alert("Passwords don't match");
            return;
        }
        try {
            await register({ name, email, password });
            navigate('/');
        } catch (err) {
            // Error managed by context/component state
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
            {/* Background Ambience */}
            <div className="fixed inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-primary-300/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none animate-float" />

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold font-display text-slate-900 mb-2 tracking-tight">Create Account</h1>
                    <p className="text-slate-500 text-lg">Join your developer journey today</p>
                </div>

                <Card className="p-8 backdrop-blur-xl bg-white/70 shadow-2xl shadow-slate-200/50 border-white/50">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center gap-2 animate-slide-up">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            icon={User}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="john@example.com"
                            icon={Mail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            disabled={isLoading}
                            className="mt-2 shadow-xl shadow-primary-500/20 group"
                        >
                            {isLoading ? 'Creating Account...' : (
                                <span className="flex items-center gap-2">
                                    Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>
                </Card>

                <p className="text-center mt-8 text-slate-500 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 font-bold hover:underline decoration-2 underline-offset-2">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
