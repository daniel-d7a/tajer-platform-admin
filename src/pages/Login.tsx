import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { Lock, Smartphone } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading: isAuthLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!phone || !password) {
      toast.error('من فضلك أدخل رقم الهاتف وكلمة المرور.');
      return;
    }
    setIsSubmitting(true);
    const loadingToast = toast.loading('جاري تسجيل الدخول...');

    try {
      await login({ phone, passwordHash: password });
      
      toast.dismiss(loadingToast);
      toast.success('تم تسجيل الدخول بنجاح!');
      
      navigate({ to: '/' });
    } catch (error: any) {
      toast.dismiss(loadingToast);
      
      if (error.message.includes('صلاحية')) {
        toast.error('لا يمكن تسجيل الدخول. يرجى التحقق من صلاحية المستخدم.');
      } else {
        toast.error(error.message || 'فشل تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-8 border border-[hsl(var(--primary))] rounded-xl py-24 px-16 shadow-xl">
        <div>
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 font-arabic">
            لوحة تحكم تاجر
          </h1>
          <p className="text-center text-sm text-gray-600 mt-2">
            للمسؤولين فقط
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div className="py-4">
              <label htmlFor="phone" className="sr-only">
                رقم الهاتف
              </label>
              <div className="relative" dir='ltr'>
                <div dir='rtl' className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Smartphone
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  dir='rtl'
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-[hsl(var(--primary))] sm:text-sm"
                  placeholder="+5245*****"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password-hash" className="sr-only">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password-hash"
                  dir='rtl'
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pl-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-[hsl(var(--primary))] sm:text-sm"
                  placeholder="******"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || isAuthLoading}
              className="group relative flex w-full justify-center cursor-pointer rounded-md border border-transparent bg-[hsl(var(--primary))] py-2 px-4 text-sm font-medium text-white hover:bg-[hsl(var(--primary))]/90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 disabled:bg-[hsl(var(--primary))]/50"
            >
              {isSubmitting || isAuthLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}