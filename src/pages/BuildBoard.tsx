import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Users, Brain, Star, Upload, FileText, X, Settings, Edit, Save, Trash2, Loader2, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonas, useCreatePersona, useUpdatePersona, useDeletePersona, usePersonaSelection } from "@/hooks/usePersonas";
import { useCreateBoard } from "@/hooks/useBoards";
import { Persona } from "@/lib/api";

// Removed hardcoded personas - now using API data

const BuildBoard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // API hooks
  const { data: personas, isLoading: personasLoading, error: personasError } = usePersonas();
  const createPersonaMutation = useCreatePersona();
  const updatePersonaMutation = useUpdatePersona();
  const deletePersonaMutation = useDeletePersona();
  const createBoardMutation = useCreateBoard();
  
  // Selection management
  const { 
    selectedPersonaIds, 
    togglePersona, 
    removePersona, 
    clearSelection, 
    isSelected, 
    canAddMore, 
    selectionCount 
  } = usePersonaSelection(8);
  
  // Component state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [selectedPersonaDetail, setSelectedPersonaDetail] = useState<Persona | null>(null);
  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [customPersona, setCustomPersona] = useState({
    name: "",
    role: "",
    expertise: "",
    mindset: "",
    personality: "",
    description: "",
    files: [] as File[]
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Helper function to categorize personas
  const categorizePersonas = (personas: Persona[]) => {
    const executiveRoles = personas?.filter(p => 
      p.role.includes('CEO') || p.role.includes('CTO') || p.role.includes('CFO') || 
      p.role.includes('CMO') || p.role.includes('CPO') || p.role.includes('COO')
    ) || [];
    
    const iconicLeaders = personas?.filter(p => 
      !executiveRoles.some(exec => exec.id === p.id)
    ) || [];
    
    return { executiveRoles, iconicLeaders };
  };

  const { executiveRoles, iconicLeaders } = categorizePersonas(personas || []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !personasLoading) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the board builder",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [isAuthenticated, personasLoading, navigate, toast]);

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
    if (persona.isPreset && !user?.isAdmin) {
      toast({
        title: "Cannot Edit",
        description: "Only admins can modify preset personas",
        variant: "destructive",
      });
      return;
    }
    setEditingPersona({ ...persona });
  };

  const handleSavePersona = () => {
    if (!editingPersona) return;
    
    updatePersonaMutation.mutate({
      id: editingPersona.id,
      data: {
        name: editingPersona.name,
        role: editingPersona.role,
        expertise: editingPersona.expertise,
        mindset: editingPersona.mindset,
        personality: editingPersona.personality,
        description: editingPersona.description,
        avatar: editingPersona.avatar
      }
    }, {
      onSuccess: () => {
        setEditingPersona(null);
      }
    });
  };

  const handleDeletePersona = (personaId: string) => {
    const persona = personas?.find(p => p.id === personaId);
    if (persona?.isPreset && !user?.isAdmin) {
      toast({
        title: "Cannot Delete",
        description: "Only admins can delete preset personas",
        variant: "destructive",
      });
      return;
    }
    
    deletePersonaMutation.mutate(personaId, {
      onSuccess: () => {
        removePersona(personaId);
      }
    });
  };

  const handlePersonaCardClick = (persona: Persona, event: React.MouseEvent) => {
    // Check if the click was on a button or other interactive element
    if ((event.target as HTMLElement).closest('button, [role="button"]')) {
      return; // Don't show details if clicking on buttons
    }
    
    if (isAdminMode) {
      return; // Don't show details in admin mode
    }
    
    // Check if Shift key is held for selection
    if (event.shiftKey) {
      togglePersona(persona.id);
    } else {
      // Show persona details
      setSelectedPersonaDetail(persona);
    }
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
    
    const expertise = customPersona.expertise 
      ? customPersona.expertise.split(",").map(s => s.trim()).filter(s => s.length > 0)
      : [];
    
    createPersonaMutation.mutate({
      name: customPersona.name,
      role: customPersona.role,
      expertise,
      mindset: customPersona.mindset || `Expert in ${customPersona.role} with deep understanding of ${expertise.join(", ")}.`,
      personality: customPersona.personality || "Professional, analytical, and collaborative approach to problem-solving.",
      description: customPersona.description || `Specialized ${customPersona.role} focused on ${expertise.join(", ")}.`,
    }, {
      onSuccess: () => {
        setShowCustomForm(false);
        setCustomPersona({ name: "", role: "", expertise: "", mindset: "", personality: "", description: "", files: [] });
        setUploadedFiles([]);
      }
    });
  };

  const handleLaunchBoardroom = () => {
    if (selectionCount === 0) {
      toast({
        title: "No Personas Selected",
        description: "Please select at least one persona to create a board",
        variant: "destructive",
      });
      return;
    }

    if (!boardName) {
      toast({
        title: "Board Name Required",
        description: "Please provide a name for your board",
        variant: "destructive",
      });
      return;
    }

    createBoardMutation.mutate({
      name: boardName,
      description: boardDescription,
      isPublic: false,
      personaIds: selectedPersonaIds
    }, {
      onSuccess: (board) => {
        navigate(`/boardroom?boardId=${board.id}`);
      }
    });
  };

  // Show loading state
  if (personasLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading personas...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (personasError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Personas</CardTitle>
            <CardDescription>
              {personasError.message || 'Failed to load personas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {/* Iconic Leaders Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-xl font-semibold">Choose from Iconic Leaders</h2>
                  </div>
                  <p className="text-muted-foreground">Click to view details, Shift+click to select for your board</p>
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
                {iconicLeaders?.map((persona) => (
                  <Card 
                    key={persona.id}
                    className={`${
                      isAdminMode ? '' : 'cursor-pointer'
                    } transition-smooth ${
                      isSelected(persona.id) 
                        ? 'ring-2 ring-primary shadow-glow' 
                        : 'hover:shadow-card'
                    }`}
                    onClick={(e) => handlePersonaCardClick(persona, e)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{persona.name}</CardTitle>
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                              Legendary
                            </Badge>
                          </div>
                          <CardDescription>{persona.role}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected(persona.id) && !isAdminMode && (
                            <Badge variant="default">Selected</Badge>
                          )}
                          {isAdminMode && (!persona.isPreset || user?.isAdmin) && (
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
                                    <Button 
                                      onClick={handleSavePersona}
                                      disabled={updatePersonaMutation.isPending}
                                    >
                                      {updatePersonaMutation.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      )}
                                      {!updatePersonaMutation.isPending && (
                                        <Save className="h-4 w-4 mr-2" />
                                      )}
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
                                disabled={deletePersonaMutation.isPending}
                              >
                                {deletePersonaMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
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
                      <div className="flex flex-wrap gap-2 mb-3">
                        {persona.expertise.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      {!isAdminMode && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Info className="h-3 w-3" />
                          <span>Click for details • Shift+click to select</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Executive Roles Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-semibold">Choose from Executive Roles</h2>
                  </div>
                  <p className="text-muted-foreground">Click to view details, Shift+click to select for your board</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {executiveRoles?.map((persona) => (
                  <Card 
                    key={persona.id}
                    className={`${
                      isAdminMode ? '' : 'cursor-pointer'
                    } transition-smooth ${
                      isSelected(persona.id) 
                        ? 'ring-2 ring-primary shadow-glow' 
                        : 'hover:shadow-card'
                    }`}
                    onClick={(e) => handlePersonaCardClick(persona, e)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{persona.name}</CardTitle>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Executive
                            </Badge>
                          </div>
                          <CardDescription>{persona.role}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected(persona.id) && !isAdminMode && (
                            <Badge variant="default">Selected</Badge>
                          )}
                          {isAdminMode && (!persona.isPreset || user?.isAdmin) && (
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
                                {/* Edit dialog content would go here */}
                              </Dialog>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeletePersona(persona.id)}
                                disabled={deletePersonaMutation.isPending}
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
                      <div className="flex flex-wrap gap-2 mb-3">
                        {persona.expertise.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      {!isAdminMode && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Info className="h-3 w-3" />
                          <span>Click for details • Shift+click to select</span>
                        </div>
                      )}
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
                        placeholder="e.g., Research, Innovation, Perseverance (comma-separated)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Brief Description</Label>
                      <Input
                        id="description"
                        value={customPersona.description}
                        onChange={(e) => setCustomPersona(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., A brilliant scientist focused on breakthrough research"
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
                      <Button 
                        type="submit" 
                        disabled={createPersonaMutation.isPending}
                      >
                        {createPersonaMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Add to Board
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowCustomForm(false)}
                        disabled={createPersonaMutation.isPending}
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
            {/* Board Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Board Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="boardName">Board Name</Label>
                  <Input
                    id="boardName"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    placeholder="e.g., Strategic Advisory Board"
                  />
                </div>
                <div>
                  <Label htmlFor="boardDescription">Description (Optional)</Label>
                  <Textarea
                    id="boardDescription"
                    value={boardDescription}
                    onChange={(e) => setBoardDescription(e.target.value)}
                    placeholder="Describe the purpose of this board..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Current Board */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Board ({selectionCount}/8)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectionCount === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Select personas to build your advisory board
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedPersonaIds.map((personaId) => {
                      const persona = personas?.find(p => p.id === personaId);
                      return persona ? (
                        <div key={personaId} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <p className="font-medium text-sm">{persona.name}</p>
                            <p className="text-xs text-muted-foreground">{persona.role}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePersona(personaId)}
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
            {selectionCount > 0 && (
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleLaunchBoardroom}
                disabled={createBoardMutation.isPending || !boardName}
              >
                {createBoardMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Launch Your Boardroom
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Persona Detail Modal */}
      <Dialog open={!!selectedPersonaDetail} onOpenChange={() => setSelectedPersonaDetail(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedPersonaDetail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <DialogTitle className="text-2xl">{selectedPersonaDetail.name}</DialogTitle>
                  <Badge variant="outline" className={`text-xs ${
                    iconicLeaders.some(p => p.id === selectedPersonaDetail.id) 
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {iconicLeaders.some(p => p.id === selectedPersonaDetail.id) ? 'Legendary' : 'Executive'}
                  </Badge>
                </div>
                <DialogDescription className="text-lg text-foreground">
                  {selectedPersonaDetail.role}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Description */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Overview
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {selectedPersonaDetail.description}
                  </p>
                </div>

                {/* Expertise */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    Areas of Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPersonaDetail.expertise.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Mindset */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Mindset & Approach
                  </h4>
                  <p className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg">
                    {selectedPersonaDetail.mindset}
                  </p>
                </div>

                {/* Personality */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Personality Traits
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {selectedPersonaDetail.personality}
                  </p>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPersonaDetail(null)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    togglePersona(selectedPersonaDetail.id);
                    setSelectedPersonaDetail(null);
                  }}
                  disabled={!canAddMore && !isSelected(selectedPersonaDetail.id)}
                  className={isSelected(selectedPersonaDetail.id) ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {isSelected(selectedPersonaDetail.id) ? 'Remove from Board' : 'Add to Board'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuildBoard;