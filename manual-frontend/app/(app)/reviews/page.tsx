"use client";

import { useState } from "react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";

const mockReviews = [
  {
    id: 1,
    manual: "Employee Onboarding Process",
    author: "John Doe",
    submittedAt: "2024-01-15",
    priority: "High",
    status: "PENDING",
    department: "HR"
  },
  {
    id: 2,
    manual: "IT Security Guidelines",
    author: "Jane Smith",
    submittedAt: "2024-01-14",
    priority: "Critical",
    status: "PENDING",
    department: "IT"
  },
  {
    id: 3,
    manual: "Financial Reporting Standards",
    author: "Mike Johnson",
    submittedAt: "2024-01-13",
    priority: "Medium",
    status: "UNDER_REVIEW",
    department: "Finance"
  }
];

export default function ReviewsPage() {
  const [reviews] = useState(mockReviews);
  const [selectedReview, setSelectedReview] = useState<number | null>(null);

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
      case 'High': return 'orange';
      case 'Medium': return 'yellow';
      case 'Low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Reviews</h1>
          <p className="text-gray-600 mt-1">Review and approve submitted manuals</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            📊 Review Reports
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
                <p className="text-2xl font-bold text-yellow-600">2</p>
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
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">1</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">👁️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">0</p>
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
                <p className="text-sm font-medium text-gray-600">Avg Review Time</p>
                <p className="text-2xl font-bold text-purple-600">2.5d</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">⏱️</span>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Manual</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Author</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{review.manual}</td>
                    <td className="py-4 px-4 text-gray-600">{review.author}</td>
                    <td className="py-4 px-4 text-gray-600">{review.department}</td>
                    <td className="py-4 px-4">
                      <Badge color={getPriorityColor(review.priority) as "blue" | "green" | "red" | "yellow" | "gray"}>{review.priority}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge color={getStatusColor(review.status) as "blue" | "green" | "red" | "yellow" | "gray"}>{review.status}</Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {new Date(review.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button 
                          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => setSelectedReview(review.id)}
                        >
                          Review
                        </Button>
                        <Button className="text-xs px-3 py-1 bg-gray-500 hover:bg-gray-600">
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-blue-950/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Review Manual</h2>
              <button 
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Manual Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {reviews.find(r => r.id === selectedReview)?.manual}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Author:</span>
                    <span className="ml-2 text-gray-900">{reviews.find(r => r.id === selectedReview)?.author}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <span className="ml-2 text-gray-900">{reviews.find(r => r.id === selectedReview)?.department}</span>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Content Preview</h4>
                <div className="border border-gray-200 rounded-lg p-4 h-64 bg-gray-50 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📄</div>
                    <p>Manual content would be displayed here</p>
                  </div>
                </div>
              </div>

              {/* Review Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Comments
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add your review comments here..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => setSelectedReview(null)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  ✅ Approve
                </Button>
                <Button
                  onClick={() => setSelectedReview(null)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  📝 Request Changes
                </Button>
                <Button
                  onClick={() => setSelectedReview(null)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  ❌ Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
