import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, GraduationCap, Building2, BookOpen, FileText, TrendingUp, Target } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalCredits: 0,
    totalCourses: 0,
    highSchoolPlans: 0,
    universityPlans: 0,
    mastersPlans: 0,
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserStats(currentUser.id);
    }
  }, []);

  const loadUserStats = (userId: string) => {
    try {
      const plans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
      const userPlans = plans.filter((plan: any) => plan.userId === userId);

      const stats = {
        totalPlans: userPlans.length,
        totalCredits: userPlans.reduce((sum: number, plan: any) => 
          sum + (plan.totalCredits || 0), 0),
        totalCourses: userPlans.reduce((sum: number, plan: any) => 
          sum + (plan.totalCourses || 0), 0),
        highSchoolPlans: userPlans.filter((p: any) => p.track === 'high-school').length,
        universityPlans: userPlans.filter((p: any) => p.track === 'university').length,
        mastersPlans: userPlans.filter((p: any) => p.track === 'masters').length,
      };

      setStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <p>Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">View your account information and academic planning statistics</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Account Information
              </CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Planning Statistics */}
          <Card className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Planning Statistics
              </CardTitle>
              <CardDescription>Your academic planning overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-primary/5">
                  <p className="text-2xl font-bold text-primary">{stats.totalPlans}</p>
                  <p className="text-xs text-muted-foreground">Total Plans</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5">
                  <p className="text-2xl font-bold text-primary">{stats.totalCredits}</p>
                  <p className="text-xs text-muted-foreground">Total Credits</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5">
                  <p className="text-2xl font-bold text-primary">{stats.totalCourses}</p>
                  <p className="text-xs text-muted-foreground">Total Courses</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5">
                  <p className="text-2xl font-bold text-primary">
                    {stats.totalPlans > 0 ? Math.round((stats.totalCredits / stats.totalPlans) * 10) / 10 : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Credits/Plan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Distribution */}
          <Card className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Plan Distribution
              </CardTitle>
              <CardDescription>Plans by academic track</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">High School</span>
                </div>
                <Badge variant="secondary">{stats.highSchoolPlans} plans</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">University</span>
                </div>
                <Badge variant="secondary">{stats.universityPlans} plans</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Masters / PhD</span>
                </div>
                <Badge variant="secondary">{stats.mastersPlans} plans</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common profile actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <a 
                href="/saved-plans" 
                className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm"
              >
                View All Saved Plans
              </a>
              <a 
                href="/compare-plans" 
                className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm"
              >
                Compare Plans
              </a>
              <a 
                href="/advisor-chat" 
                className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm"
              >
                Chat with Advisor
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

