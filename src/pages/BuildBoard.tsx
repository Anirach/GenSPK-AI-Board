import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Users, Brain, Star, Upload, FileText, X, Settings, Edit, Save, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Persona {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  mindset: string;
  personality: string;
  description: string;
}

const initialPresetPersonas: Persona[] = [
  {
    id: "steve-jobs",
    name: "Steve Jobs",
    role: "Innovation Visionary",
    expertise: ["Innovation", "Design", "Leadership"],
    mindset: "Think different. Relentless pursuit of perfection and simplicity. Focus on user experience above all else. Challenge conventional wisdom and push boundaries.",
    personality: "Passionate, demanding, perfectionist. Direct communication style. Inspiring and charismatic leader who motivates teams to achieve the impossible.",
    description: "Think different. Focus on simplicity and user experience."
  },
  {
    id: "warren-buffett",
    name: "Warren Buffett",
    role: "Investment Oracle",
    expertise: ["Investment", "Strategy", "Long-term thinking"],
    mindset: "Value investing principles. Patient, long-term perspective. Focus on business fundamentals over market sentiment. Continuous learning and rational decision-making.",
    personality: "Patient, humble, folksy wisdom. Clear, simple communication. Emphasizes learning from mistakes and compound growth over time.",
    description: "Value investing principles and business fundamentals."
  },
  {
    id: "oprah-winfrey",
    name: "Oprah Winfrey",
    role: "Empathy Leader",
    expertise: ["Communication", "Empathy", "Brand Building"],
    mindset: "People-first approach. Authentic connection and vulnerability create strength. Every challenge is an opportunity for growth and learning.",
    personality: "Warm, empathetic, inspiring. Excellent listener who makes others feel heard and valued. Motivational and encouraging communication style.",
    description: "Connect with people and build authentic relationships."
  },
  {
    id: "sun-tzu",
    name: "Sun Tzu",
    role: "Strategic Tactician",
    expertise: ["Strategy", "Competition", "Tactics"],
    mindset: "Win without fighting when possible. Know yourself and your opponent. Adaptability and flexibility are key to victory. Strategic thinking over brute force.",
    personality: "Calculated, wise, patient. Speaks in strategic principles and metaphors. Emphasizes preparation, intelligence gathering, and tactical advantage.",
    description: "Ancient wisdom for modern strategic challenges."
  }
];

const BuildBoard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [presetPersonas, setPresetPersonas] = useState<Persona[]>(initialPresetPersonas);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [customPersona, setCustomPersona] = useState({
    name: "",
    role: "",
    expertise: "",
    mindset: "",
    personality: "",
    files: [] as File[]
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const togglePersona = (personaId: string) => {
    setSelectedPersonas(prev => 
      prev.includes(personaId) 
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setCustomPersona(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
      
      toast({
        title: "Files Uploaded",
        description: `${newFiles.length} file(s) added for analysis`,
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setCustomPersona(prev => ({ 
      ...prev, 
      files: prev.files.filter((_, i) => i !== index) 
    }));
  };

  const analyzeFiles = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload files first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Analyzing Files... 🧠",
      description: "Extracting decision patterns and strategies",
    });

    // Simulate file analysis
    setTimeout(() => {
      const analysisResults = [
        "Strategic decision-making patterns identified",
        "Communication style preferences extracted",
        "Problem-solving approaches catalogued",
        "Core values and principles mapped"
      ];

      toast({
        title: "Analysis Complete! ✨",
        description: analysisResults.join(", "),
      });
    }, 3000);
  };

  const handleEditPersona = (persona: Persona) => {
    setEditingPersona({ ...persona });
  };

  const handleSavePersona = () => {
    if (!editingPersona) return;
    
    setPresetPersonas(prev => 
      prev.map(p => p.id === editingPersona.id ? editingPersona : p)
    );
    
    toast({
      title: "Persona Updated",
      description: `${editingPersona.name} has been updated successfully`,
    });
    
    setEditingPersona(null);
  };

  const handleDeletePersona = (personaId: string) => {
    setPresetPersonas(prev => prev.filter(p => p.id !== personaId));
    setSelectedPersonas(prev => prev.filter(id => id !== personaId));
    
    toast({
      title: "Persona Deleted",
      description: "The persona has been removed from the system",
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPersona.name || !customPersona.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the name and role fields",
        variant: "destructive",
      });
      return;
    }
    
    const fileAnalysisText = uploadedFiles.length > 0 
      ? ` (with ${uploadedFiles.length} files analyzed for decision strategies)`
      : "";
    
    toast({
      title: "Custom Persona Created! ✨",
      description: `${customPersona.name} has been added to your board${fileAnalysisText}`,
    });
    
    setShowCustomForm(false);
    setCustomPersona({ name: "", role: "", expertise: "", mindset: "", personality: "", files: [] });
    setUploadedFiles([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Build Your Board</h1>
              <p className="text-muted-foreground">Create your personal AI boardroom</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Preset Personas */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Choose from Iconic Leaders</h2>
                  <p className="text-muted-foreground">Select pre-configured personas to add to your board</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={isAdminMode ? "default" : "outline"}
                    onClick={() => setIsAdminMode(!isAdminMode)}
                  >
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCustomForm(!showCustomForm)}
                  >
                    <Plus className="h-4 w-4" />
                    Create Custom
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {presetPersonas.map((persona) => (
                  <Card 
                    key={persona.id}
                    className={`${
                      isAdminMode ? '' : 'cursor-pointer'
                    } transition-smooth ${
                      selectedPersonas.includes(persona.id) 
                        ? 'ring-2 ring-primary shadow-glow' 
                        : 'hover:shadow-card'
                    }`}
                    onClick={() => !isAdminMode && togglePersona(persona.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{persona.name}</CardTitle>
                          <CardDescription>{persona.role}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedPersonas.includes(persona.id) && !isAdminMode && (
                            <Badge variant="default">Selected</Badge>
                          )}
                          {isAdminMode && (
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditPersona(persona)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[1062px]">
                                  <DialogHeader>
                                    <DialogTitle>Edit Persona</DialogTitle>
                                    <DialogDescription>
                                      Make changes to the persona details here.
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingPersona && (
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-name" className="text-right">
                                          Name
                                        </Label>
                                        <Input
                                          id="edit-name"
                                          value={editingPersona.name}
                                          onChange={(e) => setEditingPersona({
                                            ...editingPersona,
                                            name: e.target.value
                                          })}
                                          className="col-span-3"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-role" className="text-right">
                                          Role
                                        </Label>
                                        <Input
                                          id="edit-role"
                                          value={editingPersona.role}
                                          onChange={(e) => setEditingPersona({
                                            ...editingPersona,
                                            role: e.target.value
                                          })}
                                          className="col-span-3"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-expertise" className="text-right">
                                          Expertise
                                        </Label>
                                        <Input
                                          id="edit-expertise"
                                          value={editingPersona.expertise.join(", ")}
                                          onChange={(e) => setEditingPersona({
                                            ...editingPersona,
                                            expertise: e.target.value.split(", ").map(s => s.trim())
                                          })}
                                          className="col-span-3"
                                          placeholder="Separate with commas"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-mindset" className="text-right">
                                          Mindset
                                        </Label>
                                        <Textarea
                                          id="edit-mindset"
                                          value={editingPersona.mindset}
                                          onChange={(e) => setEditingPersona({
                                            ...editingPersona,
                                            mindset: e.target.value
                                          })}
                                          className="col-span-3"
                                          rows={2}
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-personality" className="text-right">
                                          Personality
                                        </Label>
                                        <Textarea
                                          id="edit-personality"
                                          value={editingPersona.personality}
                                          onChange={(e) => setEditingPersona({
                                            ...editingPersona,
                                            personality: e.target.value
                                          })}
                                          className="col-span-3"
                                          rows={2}
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-description" className="text-right">
                                          Description
                                        </Label>
                                        <Textarea
                                          id="edit-description"
                                          value={editingPersona.description}
                                          onChange={(e) => setEditingPersona({
                                            ...editingPersona,
                                            description: e.target.value
                                          })}
                                          className="col-span-3"
                                          rows={2}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button onClick={handleSavePersona}>
                                      <Save className="h-4 w-4 mr-2" />
                                      Save changes
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeletePersona(persona.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {persona.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {persona.expertise.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Custom Persona Form */}
            {showCustomForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Custom Persona</CardTitle>
                  <CardDescription>
                    Define your own AI advisor with specific expertise and personality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCustomSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={customPersona.name}
                          onChange={(e) => setCustomPersona(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Marie Curie"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role/Title</Label>
                        <Input
                          id="role"
                          value={customPersona.role}
                          onChange={(e) => setCustomPersona(prev => ({ ...prev, role: e.target.value }))}
                          placeholder="e.g., Scientific Pioneer"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="expertise">Areas of Expertise</Label>
                      <Input
                        id="expertise"
                        value={customPersona.expertise}
                        onChange={(e) => setCustomPersona(prev => ({ ...prev, expertise: e.target.value }))}
                        placeholder="e.g., Research, Innovation, Perseverance"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mindset">Mindset & Philosophy</Label>
                      <Textarea
                        id="mindset"
                        value={customPersona.mindset}
                        onChange={(e) => setCustomPersona(prev => ({ ...prev, mindset: e.target.value }))}
                        placeholder="Describe their core beliefs and approach to problem-solving..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="personality">Personality Traits</Label>
                      <Textarea
                        id="personality"
                        value={customPersona.personality}
                        onChange={(e) => setCustomPersona(prev => ({ ...prev, personality: e.target.value }))}
                        placeholder="Describe their communication style and personality..."
                        rows={3}
                      />
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <Label>Upload Strategy Documents</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Upload documents, articles, or transcripts to analyze their decision-making patterns and strategies
                        </p>
                        
                        <div className="flex gap-2">
                          <Input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.md"
                            onChange={handleFileUpload}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={analyzeFiles}
                            disabled={uploadedFiles.length === 0}
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Analyze
                          </Button>
                        </div>
                      </div>

                      {/* Uploaded Files List */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-sm">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm truncate max-w-48">{file.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </Badge>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">Add to Board</Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowCustomForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Board */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Board ({selectedPersonas.length}/8)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPersonas.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Select personas to build your advisory board
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedPersonas.map((personaId) => {
                      const persona = presetPersonas.find(p => p.id === personaId);
                      return persona ? (
                        <div key={personaId} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <p className="font-medium text-sm">{persona.name}</p>
                            <p className="text-xs text-muted-foreground">{persona.role}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePersona(personaId)}
                          >
                            ×
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Board Building Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5" />
                  <p className="text-sm">Aim for 3-5 diverse perspectives</p>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5" />
                  <p className="text-sm">Balance strategic and creative minds</p>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5" />
                  <p className="text-sm">Include ethical and emotional advisors</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            {selectedPersonas.length > 0 && (
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  toast({
                    title: "Boardroom Launched! 🎯",
                    description: `Your ${selectedPersonas.length} advisors are ready to consult`,
                  });
                  navigate('/boardroom');
                }}
              >
                Launch Your Boardroom
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildBoard;