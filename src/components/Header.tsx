import { Button } from "@/components/ui/button";
import { Crown, Menu, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SignInDialog from "./SignInDialog";

const Header = () => {
  const { toast } = useToast();
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Crown className="h-8 w-8 text-accent" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              GenAI Boardroom
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#personas" className="text-foreground/80 hover:text-foreground transition-colors">
            Personas
          </a>
          <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <SignInDialog>
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </SignInDialog>
          <Button 
            variant="premium" 
            size="sm"
            onClick={() => toast({
              title: "Free Trial Started! 🎉",
              description: "Welcome! Your 14-day premium trial is now active.",
            })}
          >
            Start Free Trial
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => toast({
              title: "Mobile Menu",
              description: "Mobile navigation would expand here",
            })}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;