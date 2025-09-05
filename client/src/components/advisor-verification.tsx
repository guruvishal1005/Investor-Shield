import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserCheck, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, User, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function AdvisorVerification() {
  const [formData, setFormData] = useState({ name: "", regNumber: "" });
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: recentAdvisors } = useQuery({
    queryKey: ["/api/recent-advisors"],
    queryFn: async () => {
      const response = await fetch("/api/recent-advisors", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: { name: string; regNumber?: string }) => {
      const response = await apiRequest("POST", "/api/verify-advisor", data);
      return response.json();
    },
    onSuccess: (data) => {
      setVerificationResult(data);
      if (data.found) {
        toast({
          title: "Verification Complete",
          description: "Advisor details have been successfully verified.",
        });
      } else {
        toast({
          title: "Advisor Not Found",
          description: "No advisor found with the provided details.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Failed to verify advisor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter an advisor name.",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate({
      name: formData.name,
      regNumber: formData.regNumber || undefined,
    });
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Form */}
        <Card className="card-hover border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              Advisor Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="advisor-name">Advisor Name</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                      data-testid="button-advisor-search"
                    >
                      {formData.name || "Search advisor name..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search advisors..." 
                        value={formData.name}
                        onValueChange={(value) => setFormData({ ...formData, name: value })}
                        data-testid="input-advisor-search"
                      />
                      <CommandList>
                        <CommandEmpty>No advisor found.</CommandEmpty>
                        <CommandGroup>
                          {recentAdvisors?.advisors?.map((advisor: any) => (
                            <CommandItem
                              key={advisor.id}
                              value={advisor.name}
                              onSelect={(currentValue) => {
                                setFormData({ 
                                  ...formData, 
                                  name: currentValue,
                                  regNumber: advisor.regNumber || ""
                                });
                                setOpen(false);
                              }}
                              data-testid={`option-advisor-${advisor.name.replace(/\s+/g, '-').toLowerCase()}`}
                            >
                              <div className="flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                <div>
                                  <div className="font-medium">{advisor.name}</div>
                                  <div className="text-sm text-slate-500">
                                    {advisor.regNumber} • Trust Score: {advisor.trustScore}
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sebi-reg">SEBI Registration Number (Optional)</Label>
                <Input
                  id="sebi-reg"
                  type="text"
                  placeholder="e.g., INH200001234"
                  value={formData.regNumber}
                  onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                  data-testid="input-sebi-reg"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={verifyMutation.isPending}
                data-testid="button-verify-advisor"
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify Advisor"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Verification Results */}
        {verificationResult && (
          <Card className="card-hover border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Verification Results</CardTitle>
                <Badge 
                  variant={verificationResult.found ? "default" : "destructive"}
                  data-testid="badge-verification-status"
                >
                  {verificationResult.found ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Not Found
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {verificationResult.found ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium" data-testid="text-advisor-name">
                        {verificationResult.advisor.name}
                      </span>
                      <span className="text-sm text-slate-500" data-testid="text-sebi-id">
                        SEBI ID: {verificationResult.advisor.regNumber}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600" data-testid="text-advisor-details">
                      {verificationResult.advisor.specialization} • Active since{" "}
                      {new Date().getFullYear() - verificationResult.advisor.yearsExperience}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Trust Score</span>
                      <span 
                        className={`font-bold text-lg ${getTrustScoreColor(verificationResult.advisor.trustScore)}`}
                        data-testid="text-trust-score"
                      >
                        {verificationResult.advisor.trustScore}/100
                      </span>
                    </div>
                    <Progress 
                      value={verificationResult.advisor.trustScore} 
                      className="h-3"
                      data-testid="progress-trust-score"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-600" data-testid="text-years-experience">
                        {verificationResult.advisor.yearsExperience}
                      </div>
                      <div className="text-sm text-slate-600">Years Experience</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl font-bold text-red-600" data-testid="text-complaints-count">
                        {verificationResult.advisor.complaintsCount}
                      </div>
                      <div className="text-sm text-slate-600">Complaints</div>
                    </div>
                  </div>

                  {/* Collapsible Details */}
                  <div className="mt-6">
                    <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                          data-testid="button-toggle-details"
                        >
                          <span>View Details & Reviews</span>
                          {showDetails ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4 space-y-4">
                        {verificationResult.advisor.complaintsCount > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <h4 className="font-semibold mb-2">Complaint History</h4>
                            <div className="text-sm space-y-2">
                              <div className="flex justify-between">
                                <span>Minor procedural issue</span>
                                <span className="text-slate-500">Resolved - Jan 2024</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Reviews Summary</h4>
                          <div className="text-sm">
                            <p>Average Rating: {verificationResult.avgRating.toFixed(1)}/5</p>
                            <p>Total Reviews: {verificationResult.reviews}</p>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                  <p className="text-slate-600" data-testid="text-not-found-message">
                    {verificationResult.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Recent Verifications */}
      <Card className="card-hover border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            Recent Verifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAdvisors?.advisors?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAdvisors.advisors.map((advisor: any, index: number) => (
                <div 
                  key={advisor.id} 
                  className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  data-testid={`card-recent-advisor-${index}`}
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{advisor.name}</div>
                    <div className="text-sm text-slate-500">
                      Trust Score: {advisor.trustScore}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No recent verifications available</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
