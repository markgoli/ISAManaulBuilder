"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { listReviews, approveReview, rejectReview, getReviewContent, ReviewRequest, ManualVersion } from "@/lib/api";
import { useToast } from "@/app/components/ui/Toast";
import Button from "@/app/components/ui/Button";
import Badge from "@/app/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import ContentPreview from "@/app/components/ContentPreview";

export default function ReviewsPage() {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [reviews, setReviews] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReview, setSelectedReview] = useState<ReviewRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [feedback, setFeedback] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewContent, setReviewContent] = useState<ManualVersion | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Check if user can review (supervisor, manager, chief manager, admin)
  const canReview = user && ['SUPERVISOR', 'MANAGER', 'CHIEF_MANAGER', 'ADMIN'].includes(user.role);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await listReviews();
      setReviews(data);
    } catch (err) {
      setError("Failed to load reviews");
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: number) => {
    if (!canReview) {
      showWarning("Permission Denied", "You don't have permission to approve reviews.");
      return;
    }
    
    try {
      setActionLoading(true);
      await approveReview(reviewId);
      await fetchReviews(); // Refresh the list
      setSelectedReview(null);
      showSuccess("Review Approved", "Review has been successfully approved.");
    } catch (err) {
      console.error("Failed to approve review:", err);
      showError("Approval Failed", "Failed to approve review. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reviewId: number, feedback: string) => {
    if (!canReview) {
      showWarning("Permission Denied", "You don't have permission to reject reviews.");
      return;
    }
    
    try {
      setActionLoading(true);
      await rejectReview(reviewId, feedback);
      await fetchReviews(); // Refresh the list
      setSelectedReview(null);
      setFeedback("");
      showSuccess("Review Rejected", "Review has been successfully rejected.");
    } catch (err) {
      console.error("Failed to reject review:", err);
      showError("Rejection Failed", "Failed to reject review. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchReviewContent = async (reviewId: number) => {
    try {
      setContentLoading(true);
      const content = await getReviewContent(reviewId);
      setReviewContent(content);
    } catch (err) {
      console.error("Failed to load review content:", err);
      setReviewContent(null);
    } finally {
      setContentLoading(false);
    }
  };

  const handleReviewSelect = (review: ReviewRequest) => {
    setSelectedReview(review);
    setReviewContent(null); // Reset content
    fetchReviewContent(review.id); // Fetch content
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'yellow';
      case 'UNDER_REVIEW': return 'blue';
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'red';
      case 'High': return 'purple';  // Using purple for high priority
      case 'Medium': return 'yellow';
      case 'Low': return 'green';
      default: return 'gray';
    }
  };

  // Calculate stats from real data
  const pendingCount = reviews.filter(r => r.status === 'PENDING').length;
  const approvedCount = reviews.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = reviews.filter(r => r.status === 'REJECTED').length;
  const totalCount = reviews.length;

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchReviews} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Reviews & Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve submitted manuals</p>
          {!canReview && (
            <p className="text-amber-600 text-sm mt-1">
              ⚠️ You need Supervisor, Manager, Chief Manager, or Admin role to approve reviews
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchReviews} variant="outline">
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">❌</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-purple-600">{totalCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Pending</h3>
              <p className="text-gray-500">All manuals are up to date. New submissions will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Manual</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Version</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Submitted By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Submitted</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-blue-700">
                            {review.manual_title}
                          </div>
                          <div className="text-xs text-gray-500">
                            Manual #{review.manual_reference}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        <Badge color="blue" variant="soft" size="sm">
                          {review.manual_department || 'General'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        v{review.version_number}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {review.submitted_by_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            @{review.submitted_by_username}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge color={getStatusColor(review.status) as any}>{review.status}</Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {new Date(review.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button 
                            className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleReviewSelect(review)}
                            disabled={!canReview}
                          >
                            Review
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-700">Review Manual</h2>
              <button 
                onClick={() => {
                  setSelectedReview(null);
                  setFeedback("");
                  setReviewAction(null);
                  setReviewContent(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Manual Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-700 mb-3">
                  {selectedReview.manual_title}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Manual ID:</span>
                    <span className="ml-2 text-gray-900">#{selectedReview.manual_id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Version:</span>
                    <span className="ml-2 text-gray-900">v{selectedReview.version_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <span className="ml-2">
                      <Badge color="blue" variant="soft" size="sm">
                        {selectedReview.manual_department || 'General'}
                      </Badge>
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2">
                      <Badge color={getStatusColor(selectedReview.status) as any}>
                        {selectedReview.status}
                      </Badge>
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Submitted By:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedReview.submitted_by_name}
                      <span className="text-gray-500 text-xs ml-1">
                        (@{selectedReview.submitted_by_username})
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Submitted:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(selectedReview.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedReview.reviewer_name && (
                    <div>
                      <span className="text-gray-600">Reviewed By:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedReview.reviewer_name}
                        <span className="text-gray-500 text-xs ml-1">
                          (@{selectedReview.reviewer_username})
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedReview.decided_at && (
                    <div>
                      <span className="text-gray-600">Decided:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(selectedReview.decided_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Existing Feedback */}
              {selectedReview.feedback && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-700 mb-2">Previous Feedback</h4>
                  <p className="text-amber-800 text-sm">{selectedReview.feedback}</p>
                </div>
              )}

              {/* Content Preview */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Content Preview</h4>
                <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto scrollbar-hide">
                  {contentLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-500">Loading content...</p>
                      </div>
                    </div>
                  ) : reviewContent && reviewContent.blocks ? (
                    <div className="p-4">
                      <ContentPreview blocks={reviewContent.blocks} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-50">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="font-medium">{selectedReview.manual_title}</p>
                        <p className="text-sm mt-1">Version {selectedReview.version_number}</p>
                        <p className="text-xs mt-1 text-gray-400">
                          {reviewContent ? 'No content blocks available' : 'Failed to load content'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Comments (only for new reviews) */}
              {selectedReview.status === 'PENDING' && canReview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Comments {reviewAction === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm"
                    rows={4}
                    placeholder={reviewAction === 'reject' ? "Please provide feedback for rejection..." : "Add your review comments here..."}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedReview.status === 'PENDING' && canReview ? (
                  <>
                    <Button
                      onClick={() => handleApprove(selectedReview.id)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {actionLoading ? "Processing..." : "✅ Approve"}
                    </Button>
                    <Button
                      onClick={() => {
                        if (!feedback.trim()) {
                          showWarning("Feedback Required", "Please provide feedback for rejection.");
                          return;
                        }
                        handleReject(selectedReview.id, feedback);
                      }}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {actionLoading ? "Processing..." : "❌ Reject"}
                    </Button>
                  </>
                ) : (
                  <div className="flex-1 text-center py-2 text-gray-500">
                    {!canReview 
                      ? "You don't have permission to review this manual" 
                      : `This review has already been ${selectedReview.status.toLowerCase()}`
                    }
                  </div>
                )}
                <Button
                  onClick={() => {
                    setSelectedReview(null);
                    setFeedback("");
                    setReviewAction(null);
                    setReviewContent(null);
                  }}
                  variant="outline"
                  className="px-6"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
