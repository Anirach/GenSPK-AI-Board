import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send, Users, Sparkles, Brain, Target, Heart, Shield, User, UserCheck, Loader2 } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useBoard } from "@/hooks/useBoards";

// Helper function to get icon based on role/expertise
function getPersonaIcon(role: string) {
  const roleLower = role.toLowerCase();
  if (roleLower.includes('innovation') || roleLower.includes('catalyst')) return Sparkles;
  if (roleLower.includes('investment') || roleLower.includes('financial')) return Target;
  if (roleLower.includes('empathy') || roleLower.includes('leader')) return Heart;
  if (roleLower.includes('strategic') || roleLower.includes('tactician')) return Shield;
  if (roleLower.includes('marketing') || roleLower.includes('cmo')) return Brain;
  if (roleLower.includes('operations') || roleLower.includes('coo')) return Users;
  if (roleLower.includes('product') || roleLower.includes('cpo')) return User;
  return UserCheck;
}

// Helper function to get color based on persona ID
function getPersonaColor(id: string) {
  const colors = [
    "text-purple-600",
    "text-blue-600", 
    "text-green-600",
    "text-red-600",
    "text-yellow-600",
    "text-indigo-600",
    "text-pink-600",
    "text-gray-600"
  ];
  return colors[id.length % colors.length];
}

interface Message {
  id: number;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
}

const Boardroom = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const boardId = searchParams.get("boardId");

  // Fetch board data
  const { data: board, isLoading: boardLoading, error: boardError } = useBoard(boardId || "");

  // State for messages and UI
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "Steve Jobs",
      avatar: "SJ",
      content: "Welcome to your AI Boardroom! I'm here to help with innovation and product strategy.",
      timestamp: "10:20:16 AM"
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle missing or invalid board ID
  useEffect(() => {
    if (!boardId) {
      toast({
        title: "No Board Selected",
        description: "Please select a board to continue",
        variant: "destructive",
      });
      navigate('/build-board');
      return;
    }
  }, [boardId, navigate, toast]);

  // Handle board loading error
  useEffect(() => {
    if (boardError) {
      toast({
        title: "Error Loading Board",
        description: "Failed to load board data. Please try again.",
        variant: "destructive",
      });
      navigate('/build-board');
    }
  }, [boardError, navigate, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const switchAdvisor = (personaId: string) => {
    setSelectedAdvisor(selectedAdvisor === personaId ? null : personaId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "You",
      avatar: "U",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    // Simulate AI response
    setTimeout(() => {
      const responseMessage: Message = {
        id: Date.now() + 1,
        sender: "AI Assistant",
        avatar: "AI",
        content: "Thanks for your message! I'm processing your request...",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 1000);
  };

  // Show loading state
  if (boardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading boardroom...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (boardError || !board) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Board Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested board could not be loaded.</p>
          <Link to="/build-board">
            <Button>Back to Builder</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link to="/build-board">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Builder
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">AI Boardroom</h1>
              <p className="text-sm text-muted-foreground">Your Executive Advisory Session</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Advisors */}
        <div className="w-80 border-r border-border bg-muted/30 p-4">
          <div className="mb-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Your Board ({board?.personas?.length || 0})
            </h3>
          </div>
          
          <div className="space-y-2">
            {board?.personas?.length > 0 ? (
              board.personas.map((persona) => {
                const IconComponent = getPersonaIcon((persona.role || persona.expertise || 'advisor') as string);
                return (
                  <Card 
                    key={persona.id}
                    className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                      selectedAdvisor === persona.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-card'
                    }`}
                    onClick={() => switchAdvisor(persona.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className={`${getPersonaColor(persona.id)} bg-muted font-semibold`}>
                          {persona.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{persona.name}</h4>
                          <IconComponent className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{persona.role}</p>
                        <p className="text-xs text-muted-foreground/80 truncate">
                          {persona.personality || persona.mindset || "Professional advisor"}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No personas in this board
              </div>
            )}
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
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs font-medium">
                    {message.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.sender}</span>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  <div className="text-sm bg-muted p-3 rounded-lg">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask your advisory board for guidance..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Boardroom;
