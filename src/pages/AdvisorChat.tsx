import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Send, Sparkles, User, BookOpen, Calendar, Target, GraduationCap, Lightbulb } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type SavedPlan = {
  id: string;
  name: string;
  track: string;
  totalCredits: number;
  semesters: number;
};

const mockSavedPlans: SavedPlan[] = [
  { id: "1", name: "CS Major - Fast Track", track: "University", totalCredits: 120, semesters: 6 },
  { id: "2", name: "CS + Math Minor", track: "University", totalCredits: 132, semesters: 8 },
  { id: "3", name: "Pre-Med Path", track: "University", totalCredits: 128, semesters: 8 },
];

const suggestedQuestions = [
  "Is my course load balanced across semesters?",
  "Am I taking prerequisites in the right order?",
  "What should I prioritize in my junior year?",
  "Can I fit an internship in summer semester?",
];

const mockResponses: Record<string, string> = {
  "balanced": `Looking at your current plan, I see some room for improvement in balance:\n\n**Semester Analysis:**\n- Fall 2026: 18 credits (heavy)\n- Spring 2027: 14 credits (lighter)\n\n**Recommendation:**\nConsider moving one course from Fall 2027 to Spring 2027 to even out the workload.`,
  "default": `Based on your plan, here are my observations:\n\nYour plan shows a solid foundation with appropriate course sequencing.\n\n**Key Strengths:**\n- Good prerequisite ordering\n- Balanced credit distribution\n- Room for internship opportunities\n\nWould you like me to elaborate on any of these points?`,
};

export default function AdvisorChat() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedPlanData = mockSavedPlans.find(p => p.id === selectedPlan);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || !selectedPlan) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = text.toLowerCase().includes("balance") ? mockResponses.balanced : mockResponses.default;
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[320px_1fr] gap-6 h-[calc(100vh-180px)]">
          {/* Left Sidebar */}
          <div className="space-y-4">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
                <MessageSquare className="w-4 h-4" />
                Advisor Chat
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Ask Your Advisor</h1>
              <p className="text-sm text-muted-foreground">Get personalized guidance about your academic plan</p>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Select Your Plan
                </CardTitle>
                <CardDescription>Choose a plan to discuss</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a saved plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSavedPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlanData && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{selectedPlanData.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{selectedPlanData.track}</Badge>
                      <Badge variant="outline">{selectedPlanData.totalCredits} credits</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Suggested Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestedQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(question)}
                    disabled={!selectedPlan}
                    className="w-full text-left text-sm p-2 rounded-lg hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    "{question}"
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">What I Can Help With</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li className="flex items-center gap-2"><Calendar className="w-3 h-3" />Semester scheduling</li>
                  <li className="flex items-center gap-2"><Target className="w-3 h-3" />Goal-based recommendations</li>
                  <li className="flex items-center gap-2"><BookOpen className="w-3 h-3" />Course selection</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <Card className="flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {!selectedPlan ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Select a Plan to Start</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">Choose a saved plan from the sidebar to begin.</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Help!</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">Ask me anything about your plan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedPlan ? "Ask about your academic plan..." : "Select a plan first..."}
                  disabled={!selectedPlan || isTyping}
                  className="flex-1"
                />
                <Button onClick={() => handleSend()} disabled={!input.trim() || !selectedPlan || isTyping} className="btn-gradient">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
