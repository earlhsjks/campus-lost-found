import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, MessageSquare, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button, Badge, Card, CardContent } from './ui';

export default function PostCard({ item }) {
  const { user, setShowLoginModal } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    type,
    title,
    description,
    image,
    status,
    attributes,
    createdAt
  } = item;

  // --- 🛠️ HELPER FUNCTION FOR RELATIVE TIME ---
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSecs = Math.floor((now - date) / 1000);

    if (diffInSecs < 60) return "just now";

    const diffInMins = Math.floor(diffInSecs / 60);
    if (diffInMins < 60) return `${diffInMins} ${diffInMins === 1 ? "minute" : "minutes"} ago`;

    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isLost = type === 'lost';
  const isOpen = status === 'open';
  
  // 🚨 SMART OWNERSHIP CHECK: Looks for both ID variants so it works immediately after login
  const currentUserId = user?.userId || user?.id;
  const isMyPost = currentUserId && item.reportedBy?.userId === currentUserId;
  
  const relativeTime = formatRelativeTime(createdAt);
  const locationName = item.locationId?.name || "Campus Grounds";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`group ${!isOpen ? 'opacity-70' : ''}`}>
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div className="flex gap-2">
              <Badge variant={isLost ? 'primary' : 'success'}>
                {isLost ? '🔍 Lost' : '📦 Found'}
              </Badge>
              {!isOpen && (
                <Badge variant="secondary">
                  {status}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 text-muted-foreground text-xs font-bold tracking-tight uppercase">
              <Clock className="w-3.5 h-3.5" />
              {relativeTime}
            </div>
          </div>

          {/* Main Content as Link */}
          <Link to={`/item/${item._id}`} className="block focus:outline-none group/link">
            <h3 className="font-display font-bold text-2xl mb-2 text-foreground group-hover/link:text-accent transition-colors leading-tight">
              {title}
            </h3>
            <p className="text-muted-foreground mb-4 font-medium leading-relaxed line-clamp-2">
              {description}
            </p>

            {/* Attributes */}
            {attributes && (attributes.brand || attributes.color) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {attributes.brand && (
                  <Badge variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" /> {attributes.brand}
                  </Badge>
                )}
                {attributes.color && (
                  <Badge variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" /> {attributes.color}
                  </Badge>
                )}
              </div>
            )}

            {/* Image (Responsive height, no cropping) */}
            {image && (
              <div className="w-full max-h-96 bg-muted rounded-lg mb-4 overflow-hidden border border-border flex items-center justify-center">
                <img
                  src={image}
                  alt={title}
                  loading="lazy"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            )}
          </Link>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-accent" />
              {locationName}
            </div>

            {/* Hides the button entirely if it is the user's own post */}
            {isOpen && !isMyPost && (
              <Button
                onClick={async () => {
                  if (!user) {
                    setShowLoginModal(true);
                    return;
                  }

                  setIsLoading(true);
                  try {
                    const commentText = isLost ? 'I found this!' : "That's mine!";
                    await api.post(`/claim/create/${item._id}`, { proof: commentText });
                    await api.post(`/item/comments/${item._id}`, { text: commentText });
                    navigate(`/item/${item._id}`);
                  } catch (error) {
                    console.error('Failed to claim item:', error);
                    alert('Failed to claim item. Please try again.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                variant="primary"
                size="md"
                className="w-full sm:w-auto font-bold"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                {isLoading ? 'Claiming...' : (isLost ? 'I Found This' : "That's Mine!")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}