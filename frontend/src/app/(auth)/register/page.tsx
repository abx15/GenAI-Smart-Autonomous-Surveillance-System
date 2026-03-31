'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('operator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        role
      });
      
      setUser(data.data.user);
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
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
            <h2 className="text-sm font-mono tracking-widest text-[#f0f0f5]">REGISTRATION</h2>
            <p className="text-[10px] font-mono text-[#555577] uppercase">Create new system access credentials</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={firstName}
                  onValueChange={setFirstName}
                  classNames={{ input: 'font-mono text-sm', inputWrapper: 'bg-[#161625] border-[#1e1e35]' }}
                  required
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onValueChange={setLastName}
                  classNames={{ input: 'font-mono text-sm', inputWrapper: 'bg-[#161625] border-[#1e1e35]' }}
                  required
                />
              </div>
              
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
              
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                classNames={{ input: 'font-mono text-sm', inputWrapper: 'bg-[#161625] border-[#1e1e35]' }}
                required
              />
              
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#555577] uppercase tracking-wider">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#161625] border border-[#1e1e35] p-3 text-sm font-mono text-[#f0f0f5] focus:outline-none focus:border-[#4d9fff] transition-all"
                  required
                >
                  <option value="operator">Operator (Level 1)</option>
                  <option value="manager">Manager (Level 2)</option>
                  <option value="admin">System Admin (Level 3)</option>
                </select>
              </div>
              
              {error && <p className="text-sm text-[#ff3b3b] font-mono">{error}</p>}
              
              <Button type="submit" isLoading={loading}
                className="bg-[#4d9fff] text-white w-full">
                {loading ? 'Creating Account...' : 'Register'}
              </Button>
            </form>
          </CardBody>
        </Card>

        <div className="text-center">
          <p className="text-[9px] font-mono text-[#555577]">
            Already have access? <a href="/login" className="text-[#4d9fff] hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
