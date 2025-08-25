import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send, Users, Sparkles, Brain, Target, Heart, Shield, User, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const mockAdvisors = [
  { 
    id: "steve-jobs", 
    name: "Steve Jobs", 
    role: "Innovation Catalyst", 
    avatar: "SJ", 
    icon: Sparkles,
    color: "text-purple-600",
    personality: "Direct, visionary, perfectionist"
  },
  { 
    id: "warren-buffett", 
    name: "Warren Buffett", 
    role: "Investment Oracle", 
    avatar: "WB", 
    icon: Target,
    color: "text-blue-600",
    personality: "Patient, analytical, wise"
  },
  { 
    id: "oprah-winfrey", 
    name: "Oprah Winfrey", 
    role: "Empathy Leader", 
    avatar: "OW", 
    icon: Heart,
    color: "text-green-600",
    personality: "Empathetic, inspiring, authentic"
  },
  { 
    id: "sun-tzu", 
    name: "Sun Tzu", 
    role: "Strategic Tactician", 
    avatar: "ST", 
    icon: Shield,
    color: "text-red-600",
    personality: "Calculated, patient, strategic"
  }
];

const mockResponses = {
  "steve-jobs": [
    "Think different. What's the user really trying to achieve here?",
    "Simplicity is the ultimate sophistication. Can we make this more elegant?",
    "Innovation distinguishes between a leader and a follower.",
    "Focus means saying no to the hundred other good ideas."
  ],
  "warren-buffett": [
    "Time is the friend of the wonderful company, the enemy of the mediocre.",
    "Risk comes from not knowing what you're doing.",
    "Price is what you pay. Value is what you get.",
    "In the business world, the rearview mirror is always clearer than the windshield."
  ],
  "oprah-winfrey": [
    "The greatest discovery of all time is that a person can change their future by merely changing their attitude.",
    "What I know for sure is that speaking your truth is the most powerful tool we all have.",
    "Turn your wounds into wisdom.",
    "The biggest adventure you can take is to live the life of your dreams."
  ],
  "sun-tzu": [
    "Know yourself and know your enemy, and you will never be defeated.",
    "All warfare is based on deception. But in business, transparency builds trust.",
    "The supreme excellence is to subdue the enemy without fighting.",
    "Opportunities multiply as they are seized."
  ]
};

interface Message {
  id: string;
  type: 'user' | 'advisor';
  content: string;
  advisor?: string;
  timestamp: Date;
}

const Boardroom = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'advisor',
      content: "Welcome to your AI Boardroom! I'm here to help with innovation and product strategy.",
      advisor: 'steve-jobs',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("steve-jobs");
  const [isTyping, setIsTyping] = useState(false);
  const [consultationType, setConsultationType] = useState<"selected" | "all">("selected");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getRandomResponse = (advisorId: string) => {
    const responses = mockResponses[advisorId as keyof typeof mockResponses] || [];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response based on consultation type
    setTimeout(() => {
      if (consultationType === "selected") {
        // Single advisor response
        const advisorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'advisor',
          content: getRandomResponse(selectedAdvisor),
          advisor: selectedAdvisor,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, advisorMessage]);
      } else {
        // All advisors response
        const groupMessages = mockAdvisors.map((advisor, index) => ({
          id: (Date.now() + index + 1).toString(),
          type: 'advisor' as const,
          content: getRandomResponse(advisor.id),
          advisor: advisor.id,
          timestamp: new Date()
        }));
        setMessages(prev => [...prev, ...groupMessages]);
      }
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const switchAdvisor = (advisorId: string) => {
    setSelectedAdvisor(advisorId);
    const advisor = mockAdvisors.find(a => a.id === advisorId);
    toast({
      title: `Now consulting with ${advisor?.name}`,
      description: `Switched to ${advisor?.role}`,
    });
  };

  const startGroupConsultation = () => {
    setIsTyping(true);
    
    setTimeout(() => {
      const groupMessages = mockAdvisors.map((advisor, index) => ({
        id: (Date.now() + index).toString(),
        type: 'advisor' as const,
        content: getRandomResponse(advisor.id),
        advisor: advisor.id,
        timestamp: new Date()
      }));

      setMessages(prev => [...prev, ...groupMessages]);
      setIsTyping(false);
      
      toast({
        title: "Group Consultation Started! 👥",
        description: "All advisors are now participating",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/build-board">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back to Builder
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">AI Boardroom</h1>
              <p className="text-sm text-muted-foreground">Your Executive Advisory Session</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={startGroupConsultation}
              disabled={isTyping}
            >
              <Users className="h-4 w-4 mr-2" />
              Group Consultation
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar - Advisors */}
        <div className="w-80 border-r border-border bg-muted/30 p-4">
          <div className="mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Your Board ({mockAdvisors.length})
            </h3>
          </div>
          
          <div className="space-y-2">
            {mockAdvisors.map((advisor) => {
              const IconComponent = advisor.icon;
              return (
                <Card 
                  key={advisor.id}
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedAdvisor === advisor.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-card'
                  }`}
                  onClick={() => switchAdvisor(advisor.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className={`${advisor.color} bg-muted font-semibold`}>
                        {advisor.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{advisor.name}</h4>
                        <IconComponent className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{advisor.role}</p>
                      <p className="text-xs text-muted-foreground/80 truncate">{advisor.personality}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Separator className="my-4" />
          
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              Active Session
            </Badge>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Current Advisor Header */}
          <div className="border-b border-border p-4 bg-card">
            <div className="flex items-center gap-3">
              {(() => {
                const advisor = mockAdvisors.find(a => a.id === selectedAdvisor);
                const IconComponent = advisor?.icon || Brain;
                return (
                  <>
                    <Avatar>
                      <AvatarFallback className={`${advisor?.color} bg-muted font-semibold`}>
                        {advisor?.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{advisor?.name}</h3>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{advisor?.role}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.type === 'advisor' && (
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const advisor = mockAdvisors.find(a => a.id === message.advisor);
                        return (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className={`${advisor?.color} bg-muted text-xs font-semibold`}>
                                {advisor?.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{advisor?.name}</span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  
                  <Card className={`p-3 ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </Card>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="animate-pulse text-sm">AI advisor is thinking...</div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4 bg-card">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your advisors anything..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || isTyping}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Currently consulting: 
                </span>
                <Badge variant="secondary" className="text-xs">
                  {mockAdvisors.find(a => a.id === selectedAdvisor)?.name}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Get opinion from:</span>
                <Button
                  variant={consultationType === "selected" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConsultationType("selected")}
                  className="h-6 px-2 text-xs"
                >
                  <User className="h-3 w-3 mr-1" />
                  Selected
                </Button>
                <Button
                  variant={consultationType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConsultationType("all")}
                  className="h-6 px-2 text-xs"
                >
                  <Users className="h-3 w-3 mr-1" />
                  All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Boardroom;