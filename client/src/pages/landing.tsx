import { Star, Sparkles, Users, Calendar, Heart, Zap, Mail, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;

export default function Landing() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', firstName: '', lastName: '' },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await apiRequest('POST', '/api/auth/login', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsAuthOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      const res = await apiRequest('POST', '/api/auth/signup', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsAuthOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const handleSignup = (data: SignupData) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80">
      {/* Hero Section */}
      <div className="px-4 py-8 text-center">
        <div className="max-w-md mx-auto">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="font-serif text-5xl font-bold text-primary mb-4">SHUFFLE 7</h1>
            <p className="text-xl text-muted-foreground mb-2">Daily Mindset Support</p>
            <p className="text-sm text-muted-foreground">
              Draw inspiration from seven categories of wisdom
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-card border border-border">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Daily Cards</p>
              <p className="text-xs text-muted-foreground">Fresh wisdom every day</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <Star className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Lifelines</p>
              <p className="text-xs text-muted-foreground">Extra draws when needed</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">7 Categories</p>
              <p className="text-xs text-muted-foreground">Wisdom, Health, & more</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Offline Ready</p>
              <p className="text-xs text-muted-foreground">Works anywhere</p>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-4 mb-8">
            <button 
              onClick={() => {
                setIsSignup(false);
                setIsAuthOpen(true);
              }}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              data-testid="button-login"
            >
              Login
            </button>
            <button 
              onClick={() => {
                setIsSignup(true);
                setIsAuthOpen(true);
              }}
              className="w-full py-4 px-6 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-muted transition-all duration-300"
              data-testid="button-signup"
            >
              Create Free Account
            </button>
          </div>

          {/* Auth Modal */}
          <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center font-serif text-2xl text-primary">
                  {isSignup ? 'Create Account' : 'Welcome Back'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {!isSignup ? (
                  // Login Form
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          data-testid="input-login-email"
                          {...loginForm.register('email')}
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-xs text-destructive mt-1">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          data-testid="input-login-password"
                          {...loginForm.register('password')}
                        />
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-xs text-destructive mt-1">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
                      disabled={loginMutation.isPending}
                      data-testid="button-submit-login"
                    >
                      {loginMutation.isPending ? 'Logging in...' : 'Login'}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsSignup(true)}
                        className="text-sm text-muted-foreground hover:text-primary"
                        data-testid="button-switch-to-signup"
                      >
                        Don't have an account? Sign up
                      </button>
                    </div>
                  </form>
                ) : (
                  // Signup Form
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="signup-firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-firstName"
                            type="text"
                            placeholder="John"
                            className="pl-10"
                            data-testid="input-signup-firstName"
                            {...signupForm.register('firstName')}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="signup-lastName">Last Name</Label>
                        <Input
                          id="signup-lastName"
                          type="text"
                          placeholder="Doe"
                          data-testid="input-signup-lastName"
                          {...signupForm.register('lastName')}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          data-testid="input-signup-email"
                          {...signupForm.register('email')}
                        />
                      </div>
                      {signupForm.formState.errors.email && (
                        <p className="text-xs text-destructive mt-1">{signupForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="At least 8 characters"
                          className="pl-10"
                          data-testid="input-signup-password"
                          {...signupForm.register('password')}
                        />
                      </div>
                      {signupForm.formState.errors.password && (
                        <p className="text-xs text-destructive mt-1">{signupForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          className="pl-10"
                          data-testid="input-signup-confirmPassword"
                          {...signupForm.register('confirmPassword')}
                        />
                      </div>
                      {signupForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
                      disabled={signupMutation.isPending}
                      data-testid="button-submit-signup"
                    >
                      {signupMutation.isPending ? 'Creating Account...' : 'Create Account'}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsSignup(false)}
                        className="text-sm text-muted-foreground hover:text-primary"
                        data-testid="button-switch-to-login"
                      >
                        Already have an account? Login
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* App Description */}
          <div className="text-left space-y-4 mb-8">
            <h2 className="font-serif text-lg font-semibold text-primary">What is Shuffle 7?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Shuffle 7 is your daily companion for mindset support and inspiration. Each day, 
              draw a beautiful card from one of seven thoughtfully curated categories designed 
              to guide, motivate, and uplift you.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Heart className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Wisdom</p>
                  <p className="text-xs text-muted-foreground">Ancient wisdom for modern life</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Health & Challenge</p>
                  <p className="text-xs text-muted-foreground">Mind, body, and growth guidance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Leadership & Possibilities</p>
                  <p className="text-xs text-muted-foreground">Unlock your potential</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="text-center">
            <h3 className="font-serif text-md font-semibold text-primary mb-4">Why Choose Shuffle 7?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✨ Beautiful 3D carousel interface</p>
              <p>📱 Progressive Web App - works offline</p>
              <p>🎯 Personalized to your life focus</p>
              <p>🔒 Private and secure with Replit Auth</p>
              <p>💝 Completely free to use</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted-foreground">
          For mindset support only. Not prophecy. Never harmful or selfish guidance.
        </p>
      </div>
    </div>
  );
}