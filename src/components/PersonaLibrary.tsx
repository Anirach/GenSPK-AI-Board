import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Brain, Target, Heart, Zap, Shield, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const personas = [
  {
    id: 1,
    name: "Steve Jobs",
    title: "Innovation Catalyst",
    category: "Innovation",
    icon: Zap,
    expertise: ["Product Design", "User Experience", "Innovation Strategy"],
    personality: "Perfectionist, Visionary, Direct",
    description: "Ruthlessly focused on simplicity and user delight. Challenges every assumption.",
  },
  {
    id: 2,
    name: "Warren Buffett",
    title: "Value Investor",
    category: "Strategy",
    icon: Target,
    expertise: ["Investment Strategy", "Business Valuation", "Long-term Thinking"],
    personality: "Patient, Analytical, Folksy Wisdom",
    description: "Champions long-term value creation and prudent risk management.",
  },
  {
    id: 3,
    name: "Oprah Winfrey",
    title: "Empathy Leader",
    category: "Leadership",
    icon: Heart,
    expertise: ["Emotional Intelligence", "Storytelling", "Team Building"],
    personality: "Empathetic, Inspiring, Authentic",
    description: "Focuses on human connection and authentic leadership approaches.",
  },
  {
    id: 4,
    name: "Sun Tzu",
    title: "Strategic Warrior",
    category: "Strategy",
    icon: Shield,
    expertise: ["Strategic Planning", "Competitive Analysis", "Risk Assessment"],
    personality: "Calculated, Patient, Wise",
    description: "Masters the art of strategic thinking and competitive positioning.",
  },
  {
    id: 5,
    name: "Nelson Mandela",
    title: "Ethical Compass",
    category: "Ethics",
    icon: Globe,
    expertise: ["Ethical Decision Making", "Conflict Resolution", "Moral Leadership"],
    personality: "Principled, Forgiving, Steadfast",
    description: "Provides guidance on moral courage and ethical leadership.",
  },
  {
    id: 6,
    name: "Marie Curie",
    title: "Research Pioneer",
    category: "Innovation",
    icon: Brain,
    expertise: ["Scientific Method", "Perseverance", "Breaking Barriers"],
    personality: "Curious, Determined, Rigorous",
    description: "Champions evidence-based thinking and breakthrough innovation.",
  },
];

const categoryColors = {
  Innovation: "bg-purple-100 text-purple-800",
  Strategy: "bg-blue-100 text-blue-800",
  Leadership: "bg-green-100 text-green-800",
  Ethics: "bg-amber-100 text-amber-800",
};

const PersonaLibrary = () => {
  const { toast } = useToast();
  const [addedPersonas, setAddedPersonas] = useState<number[]>([]);

  const handleAddToBoard = (persona: any) => {
    if (addedPersonas.includes(persona.id)) {
      toast({
        title: "Already Added",
        description: `${persona.name} is already on your board`,
        variant: "destructive",
      });
      return;
    }

    setAddedPersonas(prev => [...prev, persona.id]);
    toast({
      title: "Advisor Added! ✨",
      description: `${persona.name} has been added to your board`,
    });
  };
  return (
    <section id="personas" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Your Executive Advisory Team</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our curated library of iconic leaders, or create your own custom advisors
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {personas.map((persona) => {
            const IconComponent = persona.icon;
            return (
              <Card key={persona.id} className="p-6 bg-gradient-card hover:shadow-elegant transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{persona.name}</h3>
                      <p className="text-sm text-muted-foreground">{persona.title}</p>
                    </div>
                  </div>
                  <Badge className={categoryColors[persona.category as keyof typeof categoryColors]}>
                    {persona.category}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{persona.description}</p>

                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-xs font-medium text-foreground">Expertise:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {persona.expertise.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-foreground">Personality:</span>
                    <p className="text-xs text-muted-foreground mt-1">{persona.personality}</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className={`w-full transition-colors ${
                    addedPersonas.includes(persona.id) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'group-hover:bg-primary group-hover:text-primary-foreground'
                  }`}
                  onClick={() => handleAddToBoard(persona)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {addedPersonas.includes(persona.id) ? 'Added to Board' : 'Add to Board'}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            variant="premium" 
            size="lg"
            onClick={() => toast({
              title: "Custom Persona Builder",
              description: "Opening persona creation wizard...",
            })}
          >
            Create Custom Persona
            <Plus className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PersonaLibrary;