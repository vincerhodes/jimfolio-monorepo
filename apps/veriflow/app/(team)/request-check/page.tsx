'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, FileText, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RequestCheckPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    documentType: '',
    notes: '',
    requestedBy: 'john.smith@veriflow.com', // Default user for demo
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const documentTypes = [
    'Business License',
    'Tax Certificate',
    'ID Document',
    'Financial Statement',
    'Insurance Certificate',
    'Compliance Document',
    'Other',
  ];

  const staffMembers = [
    { email: 'john.smith@veriflow.com', name: 'John Smith' },
    { email: 'jane.doe@veriflow.com', name: 'Jane Doe' },
    { email: 'mike.johnson@veriflow.com', name: 'Mike Johnson' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/veriflow/api/checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/team/dashboard');
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/team/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Verification Check</h1>
          <p className="text-gray-600">Submit a new document verification request</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Check Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Name */}
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                className="pp-input"
                placeholder="Enter customer name"
              />
            </div>

            {/* Requested By */}
            <div>
              <label htmlFor="requestedBy" className="block text-sm font-medium text-gray-700 mb-2">
                Requested By *
              </label>
              <select
                id="requestedBy"
                name="requestedBy"
                value={formData.requestedBy}
                onChange={handleInputChange}
                required
                className="pp-input"
              >
                {staffMembers.map(member => (
                  <option key={member.email} value={member.email}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Type */}
            <div>
              <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                id="documentType"
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                required
                className="pp-input"
              >
                <option value="">Select document type</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="pp-input"
                placeholder="Any additional information or special requirements"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Link href="/team/dashboard">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Process Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Processing Time:</strong> Most verification checks are completed within 24-48 hours.
            </p>
            <p>
              <strong>Results:</strong> You will receive one of the following outcomes:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><span className="text-green-700 font-medium">Genuine:</span> Document verified as authentic</li>
              <li><span className="text-orange-700 font-medium">Inconclusive:</span> Unable to definitively verify</li>
              <li><span className="text-red-700 font-medium">False:</span> Document identified as fraudulent</li>
              <li><span className="text-gray-700 font-medium">Unable to Verify:</span> Technical issues preventing verification</li>
            </ul>
            <p>
              <strong>Notifications:</strong> You will be notified when the verification is complete.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
