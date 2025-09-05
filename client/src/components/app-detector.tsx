import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smartphone, AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function AppDetector() {
  const [formData, setFormData] = useState({ appName: "", url: "" });
  const [checkResult, setCheckResult] = useState<any>(null);
  const { toast } = useToast();

  const { data: legitimateApps } = useQuery({
    queryKey: ["/api/legitimate-apps"],
    queryFn: async () => {
      const response = await fetch("/api/legitimate-apps", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const checkMutation = useMutation({
    mutationFn: async (data: { appName: string; url?: string }) => {
      const response = await apiRequest("POST", "/api/check-app", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCheckResult(data);
      if (data.status === "suspicious") {
        toast({
          title: "Analysis Complete",
          description: "Potential risks detected. Please review the results carefully.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: "App appears to be legitimate.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze app. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.appName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter an app name.",
        variant: "destructive",
      });
      return;
    }
    checkMutation.mutate({
      appName: formData.appName,
      url: formData.url || undefined,
    });
  };

  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Detection Form */}
        <Card className="card-hover border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center mr-3">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              Fake App Detector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">App or Website Name</Label>
                <Input
                  id="app-name"
                  type="text"
                  placeholder="e.g., QuickTrade Pro"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  data-testid="input-app-name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-url">URL or Website (Optional)</Label>
                <Input
                  id="app-url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  data-testid="input-app-url"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={checkMutation.isPending}
                data-testid="button-check-app"
              >
                {checkMutation.isPending ? "Analyzing..." : "Check App"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Detection Results */}
        {checkResult && (
          <Card className="card-hover border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analysis Results</CardTitle>
                <Badge 
                  variant={checkResult.status === "legitimate" ? "default" : "destructive"}
                  data-testid="badge-app-status"
                >
                  {checkResult.status === "legitimate" ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Legitimate
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Suspicious
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2" data-testid="text-app-name">
                    {checkResult.app.appName}
                  </h4>
                  {checkResult.app.url && (
                    <p className="text-sm text-slate-500" data-testid="text-app-url">
                      Domain: {checkResult.app.url}
                    </p>
                  )}
                </div>
                
                {checkResult.status === "suspicious" && checkResult.riskFactors?.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <h4 className="font-semibold mb-2">Risk Factors Detected</h4>
                      <ul className="space-y-1 text-sm">
                        {checkResult.riskFactors.map((factor: string, index: number) => (
                          <li key={index} className="flex items-start" data-testid={`text-risk-factor-${index}`}>
                            <AlertTriangle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Recommendation</h4>
                  <p className="text-sm" data-testid="text-recommendation">
                    {checkResult.recommendation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Legitimate Brokers Reference */}
      <Card className="card-hover border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Verified Legitimate Brokers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {legitimateApps?.apps?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {legitimateApps.apps.map((app: any, index: number) => (
                <div 
                  key={app.id} 
                  className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  data-testid={`card-legitimate-app-${index}`}
                >
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{app.appName}</div>
                    <div className="text-sm text-green-700 dark:text-green-400">
                      SEBI Registered
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No legitimate brokers data available</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
