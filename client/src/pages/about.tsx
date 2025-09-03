import { useLocation } from 'wouter';

interface CategoryButtonProps {
  icon: string;
  title: string;
  selected?: boolean;
  onClick?: () => void;
  testId?: string;
}

function CategoryButton({ icon, title, selected, onClick, testId }: CategoryButtonProps) {
  return (
    <button 
      className={`p-4 bg-card border-2 rounded-lg hover:border-primary transition-all text-left ${
        selected ? 'border-primary' : 'border-border'
      }`}
      onClick={onClick}
      data-testid={testId}
    >
      <div className="text-primary text-2xl mb-2">{icon}</div>
      <div className="text-primary font-semibold">{title}</div>
    </button>
  );
}

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto">
        <h2 className="font-serif text-3xl font-bold text-primary text-center mb-2">ABOUT YOU</h2>
        <p className="text-center text-primary text-sm mb-8">LIFE FOCUS (PRIMARY THEME)</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <CategoryButton 
            icon="🙏" 
            title="Faith & Spirituality"
            testId="category-faith"
          />
          <CategoryButton 
            icon="💼" 
            title="Career & Business"
            testId="category-career"
          />
          <CategoryButton 
            icon="❤️" 
            title="Relationships & Family"
            testId="category-relationships"
          />
          <CategoryButton 
            icon="💪" 
            title="Health & Fitness"
            testId="category-health"
          />
        </div>

        <div className="mb-8">
          <CategoryButton 
            icon="🌱" 
            title="Personal Growth & Self-Discovery"
            testId="category-growth"
          />
        </div>

        <div className="text-center mb-6">
          <p className="text-primary text-sm mb-4">DAILY RHYTHM</p>
          <p className="text-muted-foreground text-sm mb-4">When do you most need inspiration?</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <CategoryButton 
            icon="☀️" 
            title="Morning Starter"
            testId="rhythm-morning"
          />
          <CategoryButton 
            icon="🌙" 
            title="Midday Boost"
            testId="rhythm-midday"
          />
          <CategoryButton 
            icon="🌅" 
            title="Evening Reflection"
            testId="rhythm-evening"
          />
          <CategoryButton 
            icon="🎨" 
            title="Creative & Playful"
            testId="rhythm-creative"
          />
        </div>

        <button 
          className="w-full py-3 px-6 bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-muted transition-all mb-4"
          data-testid="button-tell-more"
        >
          ... Tell Us More About You
        </button>

        <div className="text-center mb-6 border-t border-border pt-6">
          <p className="text-primary text-sm mb-2">HELP SHUFFLE 7 LEARN YOU BETTER</p>
          <p className="text-muted-foreground text-sm mb-4">
            The more you share, the more accurate and personal your daily card messages become.
          </p>
        </div>

        <button 
          className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg mb-4"
          data-testid="button-save-profile"
        >
          Save My Profile
        </button>

        <div className="flex justify-between">
          <button 
            onClick={() => setLocation('/')}
            className="text-muted-foreground hover:text-primary transition-colors"
            data-testid="button-back-to-home"
          >
            Back to Home
          </button>
          <button 
            className="text-muted-foreground hover:text-primary transition-colors"
            data-testid="button-continue"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
