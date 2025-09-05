import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function ReviewsSection() {
  const [formData, setFormData] = useState({ advisorName: "", rating: 0, comment: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recentReviews } = useQuery({
    queryKey: ["/api/recent-reviews"],
    queryFn: async () => {
      const response = await fetch("/api/recent-reviews", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: topRatedAdvisors } = useQuery({
    queryKey: ["/api/top-rated-advisors"],
    queryFn: async () => {
      const response = await fetch("/api/top-rated-advisors", {
        headers: authService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: { advisorId: string; rating: number; comment: string }) => {
      const response = await apiRequest("POST", "/api/add-review", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review helps protect other investors.",
      });
      setFormData({ advisorName: "", rating: 0, comment: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/recent-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/top-rated-advisors"] });
    },
    onError: () => {
      toast({
        title: "Review Failed",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.advisorName.trim() || !formData.comment.trim() || formData.rating === 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields and provide a rating.",
        variant: "destructive",
      });
      return;
    }
    
    // For demo purposes, we'll use a dummy advisor ID
    // In a real app, you'd first search for the advisor to get their ID
    reviewMutation.mutate({
      advisorId: "dummy-advisor-id",
      rating: formData.rating,
      comment: formData.comment,
    });
  };

  const handleStarClick = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  const renderStars = (rating: number, interactive = false, size = "w-4 h-4") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating
            ? "text-yellow-400 fill-yellow-400"
            : "text-slate-300"
        } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
        onClick={interactive ? () => handleStarClick(i + 1) : undefined}
        data-testid={interactive ? `star-${i + 1}` : undefined}
      />
    ));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <section className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Review Form */}
        <Card className="card-hover border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                <Star className="w-5 h-5 text-white" />
              </div>
              Add Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="advisor-name-review">Advisor Name</Label>
                <Input
                  id="advisor-name-review"
                  type="text"
                  placeholder="Enter advisor name"
                  value={formData.advisorName}
                  onChange={(e) => setFormData({ ...formData, advisorName: e.target.value })}
                  data-testid="input-review-advisor-name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex space-x-1" data-testid="rating-stars">
                  {renderStars(formData.rating, true, "w-6 h-6")}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="review-comment">Your Experience</Label>
                <Textarea
                  id="review-comment"
                  placeholder="Share your experience with this advisor..."
                  rows={4}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  data-testid="textarea-review-comment"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={reviewMutation.isPending}
                data-testid="button-submit-review"
              >
                {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card className="card-hover border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              Community Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentReviews?.reviews?.length > 0 ? (
                recentReviews.reviews.map((review: any, index: number) => (
                  <div 
                    key={review.id || index} 
                    className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0"
                    data-testid={`review-${index}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold" data-testid={`review-advisor-name-${index}`}>
                          {review.advisorName}
                        </div>
                        <div className="flex items-center mt-1">
                          <div className="flex mr-2">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-slate-500" data-testid={`review-rating-${index}`}>
                            {review.rating}.0
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-slate-500" data-testid={`review-timestamp-${index}`}>
                        {formatTimeAgo(new Date(review.timestamp))}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300" data-testid={`review-comment-${index}`}>
                      "{review.comment}"
                    </p>
                    <div className="flex items-center mt-2 text-sm text-slate-500">
                      <span data-testid={`review-user-${index}`}>by {review.userName}</span>
                      <span className="mx-2">•</span>
                      <span>Verified Client</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No reviews available yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Rated Advisors */}
      <Card className="card-hover border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Star className="w-5 h-5 text-white" />
            </div>
            Top Rated Advisors
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topRatedAdvisors?.advisors?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRatedAdvisors.advisors.map((advisor: any, index: number) => (
                <div 
                  key={advisor.id} 
                  className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4"
                  data-testid={`card-top-advisor-${index}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold" data-testid={`top-advisor-name-${index}`}>
                      {advisor.name}
                    </span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-semibold" data-testid={`top-advisor-rating-${index}`}>
                        {advisor.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2" data-testid={`top-advisor-specialization-${index}`}>
                    {advisor.specialization}
                  </p>
                  <div className="flex items-center text-sm text-slate-500">
                    <span data-testid={`top-advisor-review-count-${index}`}>
                      {advisor.reviewCount} reviews
                    </span>
                    <span className="mx-2">•</span>
                    <span className="text-green-600">SEBI Registered</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No top rated advisors available</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
