'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PlusCircle, FileText, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { VerificationStatus, VerificationResult } from '@/types';

interface VerificationCheck {
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

export default function MyChecksPage() {
  const [checks, setChecks] = useState<VerificationCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChecks();
  }, []);

  const fetchChecks = async () => {
    try {
      const response = await fetch('/api/checks');
      if (response.ok) {
        const data = await response.json();
        // Filter for current user's checks (in real app, get from auth)
        const userChecks = data.filter((check: VerificationCheck) => 
          check.requestedBy === 'john.smith@veriflow.com'
        );
        setChecks(userChecks);
      }
    } catch (error) {
      console.error('Error fetching checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChecks = checks.filter(check => {
    const matchesFilter = filter === 'all' || check.status.toLowerCase() === filter;
    const matchesSearch = searchTerm === '' || 
      check.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Verification Checks</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading checks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Verification Checks</h1>
          <p className="text-gray-600">View and manage your verification requests</p>
        </div>
        <Link href="/team/request-check">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Request New Check
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name or document type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pp-input pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({checks.length})
              </Button>
              <Button
                variant={filter === 'pending' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pending ({checks.filter(c => c.status === 'PENDING').length})
              </Button>
              <Button
                variant={filter === 'in-progress' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('in-progress')}
              >
                In Progress ({checks.filter(c => c.status === 'IN_PROGRESS').length})
              </Button>
              <Button
                variant={filter === 'completed' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completed ({checks.filter(c => c.status === 'COMPLETED').length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Verification Checks ({filteredChecks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredChecks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' 
                  ? 'No checks match your search criteria.' 
                  : 'You haven\'t requested any verification checks yet.'}
              </p>
              {!searchTerm && filter === 'all' && (
                <Link href="/team/request-check" className="mt-4 inline-block">
                  <Button>Request Your First Check</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="pp-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Document Type</th>
                    <th>Status</th>
                    <th>Result</th>
                    <th>Requested</th>
                    <th>Completed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChecks.map((check) => (
                    <tr key={check.id}>
                      <td className="font-medium">{check.customerName}</td>
                      <td>{check.documentType}</td>
                      <td>
                        <StatusBadge status={getStatusBadgeType(check.status)}>
                          {check.status.replace('_', ' ')}
                        </StatusBadge>
                      </td>
                      <td>
                        {check.result && getResultBadgeType(check.result) && (
                          <StatusBadge status={getResultBadgeType(check.result)!}>
                            {check.result.charAt(0) + check.result.slice(1).toLowerCase().replace('_', ' ')}
                          </StatusBadge>
                        )}
                        {!check.result && (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td>{formatDate(check.requestedAt)}</td>
                      <td>{check.verifiedAt ? formatDate(check.verifiedAt) : '-'}</td>
                      <td>
                        <Link href={`/team/my-checks/${check.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
