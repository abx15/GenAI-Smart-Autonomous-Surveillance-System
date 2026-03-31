'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Both fields required'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.data.user);
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1e1e35] border border-[#2e2e45] mb-4">
            <span className="text-2xl font-mono text-[#4d9fff]">SASS</span>
          </div>
          <h1 className="text-3xl font-mono tracking-[0.3em] font-bold text-[#f0f0f5] uppercase">SASS CORE</h1>
          <p className="text-xs font-mono text-[#555577] uppercase tracking-widest">Secure Access Surveillance System</p>
        </div>

        <Card className="bg-[#0f0f1a] border border-[#1e1e35]">
          <CardHeader className="text-center pb-4">
            <h2 className="text-sm font-mono tracking-widest text-[#f0f0f5]">AUTHENTICATION</h2>
            <p className="text-[10px] font-mono text-[#555577] uppercase">Enter credentials to access system</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
                classNames={{ input: 'font-mono text-sm', inputWrapper: 'bg-[#161625] border-[#1e1e35]' }}
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onValueChange={setPassword}
                classNames={{ input: 'font-mono text-sm', inputWrapper: 'bg-[#161625] border-[#1e1e35]' }}
                required
              />
              {error && <p className="text-sm text-[#ff3b3b] font-mono">{error}</p>}
              <Button type="submit" isLoading={loading}
                className="bg-[#4d9fff] text-white w-full">
                {loading ? 'Authenticating...' : 'Login'}
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="text-center">
          <p className="text-[9px] font-mono text-[#555577]">
            Need access? <a href="/register" className="text-[#4d9fff] hover:underline">Request credentials</a>
          </p>
        </div>
      </div>
    </div>
  );
}
