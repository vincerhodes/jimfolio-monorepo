'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ArrowLeft, FileText, Calendar, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { VerificationStatus, VerificationResult } from '@/types';

interface CheckDetail {
  id: string;
  customerName: string;
  documentType: string;
  status: VerificationStatus;
  requestedBy: string;
  requestedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  result?: VerificationResult;
  notes?: string;
}

export default function CheckDetailPage() {
  const [check, setCheck] = useState<CheckDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      fetchCheckDetail(params.id as string);
    }
  }, [params.id]);

  const fetchCheckDetail = async (id: string) => {
    try {
      const response = await fetch('/veriflow/api/checks');
      if (response.ok) {
        const checks = await response.json();
        const foundCheck = checks.find((c: CheckDetail) => c.id === id);
        
        if (foundCheck) {
          setCheck(foundCheck);
        } else {
          setError('Check not found');
        }
      } else {
        setError('Failed to fetch check details');
      }
    } catch (error) {
      console.error('Error fetching check detail:', error);
      setError('An error occurred while fetching check details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeType = (status: VerificationStatus) => {
    switch (status) {
      case 'PENDING': return 'pending';
      case 'IN_PROGRESS': return 'in-progress';
      case 'COMPLETED': return 'completed';
      default: return 'pending';
    }
  };

  const getResultBadgeType = (result?: VerificationResult) => {
    if (!result) return null;
    switch (result) {
      case 'GENUINE': return 'genuine';
      case 'INCONCLUSIVE': return 'inconclusive';
      case 'FALSE': return 'false';
      case 'UNABLE_TO_VERIFY': return 'unable';
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/team/my-checks">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Checks
            </Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading check details...</p>
        </div>
      </div>
    );
  }

  if (error || !check) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/team/my-checks">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Checks
            </Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Check not found'}</p>
          <Link href="/team/my-checks" className="mt-4 inline-block">
            <Button>Return to My Checks</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/team/my-checks">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Checks
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Check Details</h1>
          <p className="text-gray-600">Verification check information and status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Check Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <p className="text-gray-900 font-medium">{check.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <p className="text-gray-900 font-medium">{check.documentType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <StatusBadge status={getStatusBadgeType(check.status)}>
                    {check.status.replace('_', ' ')}
                  </StatusBadge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Result
                  </label>
                  {check.result && getResultBadgeType(check.result) ? (
                    <StatusBadge status={getResultBadgeType(check.result)!}>
                      {check.result.charAt(0) + check.result.slice(1).toLowerCase().replace('_', ' ')}
                    </StatusBadge>
                  ) : (
                    <span className="text-gray-400">Not completed</span>
                  )}
                </div>
              </div>

              {check.notes && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {check.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Requested</p>
                    <p className="text-sm text-gray-600">{formatDate(check.requestedAt)}</p>
                    <p className="text-sm text-gray-500">by {check.requestedBy}</p>
                  </div>
                </div>

                {check.verifiedAt && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Completed</p>
                      <p className="text-sm text-gray-600">{formatDate(check.verifiedAt)}</p>
                      {check.verifiedBy && (
                        <p className="text-sm text-gray-500">by {check.verifiedBy}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requested By
                  </label>
                  <p className="text-gray-900">{check.requestedBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Date
                  </label>
                  <p className="text-gray-900">{formatDate(check.requestedAt)}</p>
                </div>
                {check.verifiedBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verified By
                    </label>
                    <p className="text-gray-900">{check.verifiedBy}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/team/my-checks">
                  <Button variant="outline" className="w-full">
                    Back to My Checks
                  </Button>
                </Link>
                {check.status === 'COMPLETED' && (
                  <Link href="/team/request-check">
                    <Button className="w-full">
                      Request New Check
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
