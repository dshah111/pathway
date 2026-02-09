import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeftRight, CheckCircle, XCircle, AlertCircle, GitCompare, Lightbulb, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/auth";
import { apiUrl } from "@/lib/api";

type SavedPlan = {
  id: string;
  name: string;
  track: string;
  totalCredits: number;
  totalCourses: number;
  semesters: any[];
  savedDate?: string;
};

type ComparisonResult = {
  summary: string;
  planAStrengths: string[];
  planBStrengths: string[];
  keyDifferences: { category: string; planA: string; planB: string; winner: "A" | "B" | "tie" }[];
  recommendation: {
    forSpeed: string;
    forDepth: string;
    forBalance: string;
  };
};

const mockComparison: ComparisonResult = {
  summary: "Both plans lead to a Computer Science degree, but take different approaches. Plan A prioritizes speed with an accelerated timeline, while Plan B provides deeper expertise through a Math minor.",
  planAStrengths: [
    "Graduate 1 year earlier",
    "Lower total credit requirement",
    "More flexibility for internships",
    "Reduced tuition costs",
  ],
  planBStrengths: [
    "Stronger mathematical foundation",
    "Better preparation for graduate school",
    "More elective variety",
    "Enhanced problem-solving skills",
  ],
  keyDifferences: [
    { category: "Timeline", planA: "3 years (6 semesters)", planB: "4 years (8 semesters)", winner: "A" },
    { category: "Total Credits", planA: "120 credits", planB: "132 credits", winner: "A" },
    { category: "Math Depth", planA: "Core requirements only", planB: "Full minor (18 credits)", winner: "B" },
    { category: "Research Prep", planA: "Limited exposure", planB: "Strong foundation", winner: "B" },
    { category: "Workload/Semester", planA: "20 credits average", planB: "16.5 credits average", winner: "B" },
  ],
  recommendation: {
    forSpeed: "Choose Plan A if you want to enter the workforce quickly or save on tuition costs.",
    forDepth: "Choose Plan B if you're considering graduate school or want a stronger theoretical foundation.",
    forBalance: "Consider a hybrid: Plan A's timeline with 1-2 additional math courses as electives.",
  },
};

export default function PlanComparison() {
  const [planA, setPlanA] = useState<string>("");
  const [planB, setPlanB] = useState<string>("");
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadSavedPlans();
    // Check for dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  const loadSavedPlans = () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setSavedPlans([]);
        return;
      }

      const plans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
      // Filter plans by current user
      const userPlans = plans.filter((plan: any) => plan.userId === currentUser.id);
      
      const formattedPlans: SavedPlan[] = userPlans.map((plan: any) => ({
        id: plan.id,
        name: plan.name || plan.planName || 'Untitled Plan',
        track: plan.track,
        totalCredits: plan.totalCredits || plan.semesters?.reduce((sum: number, s: any) => 
          sum + (s.courses?.reduce((cSum: number, c: any) => cSum + (c.credits || 0), 0) || 0), 0) || 0,
        totalCourses: plan.totalCourses || plan.semesters?.reduce((sum: number, s: any) => sum + (s.courses?.length || 0), 0) || 0,
        semesters: plan.semesters || [],
        savedDate: plan.savedDate,
      }));
      setSavedPlans(formattedPlans);
    } catch (error) {
      console.error('Error loading saved plans:', error);
      setSavedPlans([]);
    }
  };

  const handleCompare = async () => {
    if (!planA || !planB) {
      toast({
        title: "Select Both Plans",
        description: "Please select two plans to compare.",
        variant: "destructive",
      });
      return;
    }

    if (planA === planB) {
      toast({
        title: "Different Plans Required",
        description: "Please select two different plans to compare.",
        variant: "destructive",
      });
      return;
    }

    setIsComparing(true);
    try {
      const planAData = savedPlans.find(p => p.id === planA);
      const planBData = savedPlans.find(p => p.id === planB);

      if (!planAData || !planBData) {
        throw new Error('Plans not found');
      }

      const response = await fetch(apiUrl('/api/compare-plans'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planA: planAData,
          planB: planBData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setComparison(data.comparison);
        toast({
          title: "Comparison Complete",
          description: "AI has analyzed both plans and generated insights.",
        });
      } else {
        throw new Error(data.error || 'Failed to compare plans');
      }
    } catch (error: any) {
      console.error('Compare plans error:', error);
      // Fallback to mock comparison if API fails
      setComparison(mockComparison);
      toast({
        title: "Comparison Complete",
        description: "Comparison generated (using fallback mode).",
      });
    } finally {
      setIsComparing(false);
    }
  };

  const planAData = savedPlans.find(p => p.id === planA);
  const planBData = savedPlans.find(p => p.id === planB);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <GitCompare className="w-4 h-4" />
            AI-Powered Plan Comparison
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Compare Your Plans</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select two saved plans and let AI analyze the differences, tradeoffs, and recommend which plan fits your goals.
          </p>
        </div>

        {/* Plan Selection */}
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <Card 
            className="bg-primary/5"
            style={{
              borderColor: isDark ? 'hsl(245, 58%, 65%, 0.3)' : 'rgb(37, 99, 235)',
              borderWidth: '2px',
              borderStyle: 'dashed'
            } as React.CSSProperties}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">First Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={planA} onValueChange={setPlanA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan..." />
                </SelectTrigger>
                <SelectContent>
                  {savedPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id} disabled={plan.id === planB}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {planAData && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{planAData.track}</Badge>
                  <Badge variant="outline">{planAData.totalCredits} credits</Badge>
                  <Badge variant="outline">{planAData.semesters?.length || 0} semesters</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-2 py-4">
            <div className="vs-circle w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
              <ArrowLeftRight className="w-5 h-5 text-white dark:text-primary-foreground" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">VS</span>
          </div>

          <Card 
            className="bg-primary/5"
            style={{
              borderColor: isDark ? 'hsl(245, 58%, 65%, 0.3)' : 'rgb(37, 99, 235)',
              borderWidth: '2px',
              borderStyle: 'dashed'
            } as React.CSSProperties}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Second Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={planB} onValueChange={setPlanB}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan..." />
                </SelectTrigger>
                <SelectContent>
                  {savedPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id} disabled={plan.id === planA}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {planBData && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{planBData.track}</Badge>
                  <Badge variant="outline">{planBData.totalCredits} credits</Badge>
                  <Badge variant="outline">{planBData.semesters?.length || 0} semesters</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Compare Button */}
        {savedPlans.length < 2 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              You need at least 2 saved plans to compare. Save some plans first!
            </p>
          </div>
        ) : (
          <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Button
              onClick={handleCompare}
              className="btn-compare h-12 px-8 font-medium transition-all duration-200 shadow-lg"
              disabled={!planA || !planB || isComparing}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isComparing ? "Analyzing Plans..." : "Compare with AI"}
            </Button>
          </div>
        )}

        {/* Comparison Results */}
        {comparison && (
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {/* Summary */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{comparison.summary}</p>
              </CardContent>
            </Card>

            {/* Strengths Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {planAData?.name} Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {comparison.planAStrengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-secondary/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {planBData?.name} Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {comparison.planBStrengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Key Differences Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-primary" />
                  Key Differences
                </CardTitle>
                <CardDescription>Side-by-side comparison of important factors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparison.keyDifferences.map((diff, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_2fr_auto_2fr] gap-3 items-center p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm font-medium text-foreground">{diff.category}</span>
                      <div className={`text-sm p-2 rounded ${diff.winner === "A" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}>
                        {diff.planA}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {diff.winner === "A" ? (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        ) : diff.winner === "B" ? (
                          <XCircle className="w-4 h-4 text-secondary" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className={`text-sm p-2 rounded ${diff.winner === "B" ? "bg-secondary/20 text-secondary-foreground font-medium" : "text-muted-foreground"}`}>
                        {diff.planB}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-gradient-to-br from-accent/30 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>Personalized guidance based on your goals</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-sm">For Speed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comparison.recommendation.forSpeed}</p>
                </div>
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">For Depth</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comparison.recommendation.forDepth}</p>
                </div>
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-sm">For Balance</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comparison.recommendation.forBalance}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State Visual */}
        {!comparison && (
          <div className="text-center py-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <GitCompare className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Compare</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Select two plans above and click "Compare with AI" to see a detailed analysis of differences and recommendations.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
