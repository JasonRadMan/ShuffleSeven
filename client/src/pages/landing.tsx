import { Star, Sparkles, Users, Calendar, Heart, Zap } from 'lucide-react';

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleSignup = () => {
    window.location.href = '/api/login';
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
              onClick={handleLogin}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              data-testid="button-login"
            >
              Continue with Replit
            </button>
            <p className="text-xs text-muted-foreground">
              New to Shuffle 7? Signing up creates your account automatically
            </p>
          </div>

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