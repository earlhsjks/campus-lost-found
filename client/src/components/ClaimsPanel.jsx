import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from './ui';

export default function ClaimsPanel({ itemId, isItemOwner }) {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  useEffect(() => {
    if (!isItemOwner) return;

    const fetchClaims = async () => {
      try {
        const res = await api.get(`/api/claim/item/${itemId}`);
        setClaims(res.data.claims || []);
      } catch (error) {
        console.error('Failed to fetch claims:', error);
        setClaims([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaims();
  }, [itemId, isItemOwner]);

  const handleApproveClaim = async (claimId) => {
    setApproving(claimId);
    try {
      await api.put(`/api/claim/approve/${claimId}`);
      setClaims(prev =>
        prev.map(c => (c._id === claimId ? { ...c, status: 'approved' } : c))
      );
    } catch (error) {
      console.error('Failed to approve claim:', error);
      alert('Failed to approve claim');
    } finally {
      setApproving(null);
    }
  };

  const handleRejectClaim = async (claimId) => {
    const reason = prompt('Enter reason for rejection (optional):');
    if (reason === null) return;

    setRejecting(claimId);
    try {
      await api.put(`/api/claim/reject/${claimId}`, { reason });
      setClaims(prev =>
        prev.map(c => (c._id === claimId ? { ...c, status: 'rejected' } : c))
      );
    } catch (error) {
      console.error('Failed to reject claim:', error);
      alert('Failed to reject claim');
    } finally {
      setRejecting(null);
    }
  };

  if (!isItemOwner) return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Claims Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingClaims = claims.filter(c => c.status === 'pending');
  const reviewedClaims = claims.filter(c => c.status !== 'pending');

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Claims Review</CardTitle>
          {pendingClaims.length > 0 && (
            <Badge variant="primary">
              {pendingClaims.length} pending
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {claims.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No claims yet</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Pending Claims */}
            <AnimatePresence>
              {pendingClaims.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <p className="text-xs font-semibold text-accent uppercase tracking-wider">
                    Pending Review
                  </p>
                  {pendingClaims.map(claim => (
                    <motion.div
                      key={claim._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {claim.claimantID.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {claim.claimantID.email}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {new Date(claim.createdAt).toLocaleDateString()} at{' '}
                            {new Date(claim.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant="warning">Pending</Badge>
                      </div>

                      {claim.proof && (
                        <p className="text-sm text-foreground mb-4 bg-white p-3 rounded italic border border-yellow-200">
                          "{claim.proof}"
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveClaim(claim._id)}
                          disabled={approving === claim._id}
                          variant="outline"
                          className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                          size="sm"
                        >
                          {approving === claim._id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear'
                              }}
                              className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full mr-2"
                            />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectClaim(claim._id)}
                          disabled={rejecting === claim._id}
                          variant="outline"
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          {rejecting === claim._id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear'
                              }}
                              className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full mr-2"
                            />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reviewed Claims */}
            <AnimatePresence>
              {reviewedClaims.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 space-y-3"
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Review History
                  </p>
                  {reviewedClaims.map(claim => (
                    <motion.div
                      key={claim._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg border-l-4 ${
                        claim.status === 'approved'
                          ? 'bg-green-50 border-green-400'
                          : 'bg-red-50 border-red-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {claim.claimantID.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(claim.reviewedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            claim.status === 'approved' ? 'success' : 'error'
                          }
                        >
                          {claim.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
