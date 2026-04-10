import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
// 🚨 Notice the 'User as UserIcon' added to the imports here!
import { MapPin, Clock, Send, ChevronLeft, Zap, Tag, User as UserIcon } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui';
import ClaimsPanel from '../components/ClaimsPanel';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setShowLoginModal } = useAuth();

  const [item, setItem] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const messagesEndRef = useRef(null);

  // --- 🛠️ RELATIVE TIME HELPER ---
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSecs = Math.floor((now - date) / 1000);

    if (diffInSecs < 60) return "just now";

    const diffInMins = Math.floor(diffInSecs / 60);
    if (diffInMins < 60) return `${diffInMins}m ago`;

    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, commentsRes] = await Promise.all([
          api.get(`/item/getById/${id}`),
          api.get(`/item/comments/${id}`)
        ]);

        setItem(itemRes.data.item);
        setComments(commentsRes.data);
      } catch (error) {
        console.error('Failed to fetch item data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user) return setShowLoginModal(true);
    if (!message.trim()) return;

    try {
      const response = await api.post(`/item/comments/${id}`, { text: message });
      setComments(prev => [...prev, response.data]);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleMarkResolved = async () => {
    if (!window.confirm('Are you sure you want to mark this item as resolved?')) return;

    try {
      const response = await api.put(`/item/${item._id}/status`, { status: 'claimed' });
      setItem(response.data.item);
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Could not update item status.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full"
          />
          <p className="mt-4 text-muted-foreground font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <h2 className="font-display font-bold text-3xl mb-4">Item Not Found</h2>
        <Button onClick={() => navigate('/')} variant="primary">Return to Feed</Button>
      </div>
    );
  }

  const isLost = item.type === 'lost';
  const relativeTime = formatRelativeTime(item.createdAt);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen w-full bg-background py-8"
    >
      <div className="container-custom">
        <motion.button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Feed
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Item Details */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-4 border-b border-border mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Badge variant={isLost ? 'primary' : 'success'}>
                        {isLost ? '🔍 Lost Item' : '📦 Found Item'}
                      </Badge>
                      <Badge variant={item.status === 'claimed' ? 'success' : 'secondary'}>
                        {item.status === 'claimed' ? '✓ Resolved' : 'Active'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Link
                        to={`/matches/${item._id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-blue-50 text-accent hover:bg-blue-100 border border-blue-200 rounded-md transition-colors shadow-sm flex-1 sm:flex-none"
                      >
                        <Zap className="w-4 h-4 text-accent" /> View Matches
                      </Link>

                      {user && item.reportedBy?.userId === user.userId && item.status !== 'resolved' && (
                        <Button onClick={handleMarkResolved} variant="secondary" size="sm" className="flex-1 sm:flex-none">
                          Mark as {isLost ? 'Found' : 'Returned'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4 gradient-text">{item.title}</h1>

                    {/* 🚨 UPDATED INFO BAR: Added User Icon and formatted it cleanly */}
                    <div className="flex flex-wrap items-center gap-5 text-muted-foreground font-bold text-xs uppercase tracking-tight">
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="w-4 h-4 text-accent" />
                        <span>By {item.reportedBy.userId?.name || 'Community Member'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-accent" />
                        <span>{item.locationId?.name || 'Campus'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>Posted {relativeTime}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-foreground/80 text-lg leading-relaxed font-medium">{item.description}</p>

                  {item.image && (
                    <div className="w-full bg-muted rounded-xl overflow-hidden border-2 border-border">
                      <img src={item.image} alt={item.title} className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {item.attributes && Object.keys(item.attributes).length > 0 && (
                    <div className="bg-accent/5 border border-accent/30 rounded-xl p-4">
                      <h3 className="font-bold text-foreground mb-3 uppercase text-xs tracking-widest">Attributes</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">

                        {/* 🚨 UPDATED ATTRIBUTE MAP: Fixes camelCase and Date Strings */}
                        {Object.entries(item.attributes).map(([key, value]) => {
                          if (!value) return null;

                          // Convert 'lastSeen' to 'Last Seen' or 'serialNumber' to 'Serial Number'
                          const displayLabel = key.replace(/([A-Z])/g, ' $1').trim();

                          // Format specific fields
                          let displayValue = value;
                          if (key === 'lastSeen') {
                            displayValue = new Date(value).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                            });
                          }

                          return (
                            <div key={key}>
                              <span className="text-muted-foreground capitalize">{displayLabel}:</span>
                              <p className="font-bold">{displayValue}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT: Chat & Claims */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="flex flex-col h-[600px] shadow-lg">
                <CardHeader>
                  <CardTitle>Live Discussion</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto space-y-4 border-t border-border pt-4 px-6">
                  <AnimatePresence>
                    {comments.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40">
                        <Send className="w-12 h-12 mb-2" />
                        <p className="font-bold uppercase tracking-tighter">No messages yet</p>
                      </div>
                    ) : (
                      comments.map((c) => {
                        const currentUserId = user?.userId || user?.id;
                        const isMe = currentUserId && c.senderId === currentUserId;

                        const isClaim = c.text.includes('found') || c.text.includes('mine');

                        return (
                          <motion.div
                            key={c._id}
                            initial={{ opacity: 0, x: isMe ? 10 : -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-2`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {isMe ? 'You' : c.senderName} • {formatRelativeTime(c.createdAt)}
                              </span>
                            </div>

                            {/* 🚨 UPDATED BUBBLE: Standard Tailwind colors, shadows, and word-wrapping */}
                            <div
                              className={`p-3.5 rounded-2xl max-w-[85%] font-medium text-sm shadow-md relative break-words whitespace-pre-wrap ${isMe
                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                : 'bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200'
                                } ${isClaim && !isMe ? '!bg-green-100 !border-green-400 ring-2 ring-green-500 !text-green-900' : ''
                                } ${isClaim && isMe ? '!bg-green-600 ring-2 ring-green-300' : ''
                                }`}
                            >
                              {c.text}

                              {/* Glowing Zap Icon for claims */}
                              {isClaim && (
                                <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                                  <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </CardContent>

                <div className="p-4 border-t border-border">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={user ? "Type a message..." : "Log in to join discussion"}
                      disabled={!user}
                      className="flex-1 bg-muted px-4 py-2 rounded-lg border-2 border-transparent focus:border-accent focus:outline-none font-medium text-sm transition-all"
                    />
                    <Button type="submit" disabled={!user || !message.trim()} variant="primary" size="md">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </motion.div>

            {user && item && item.reportedBy?.userId === (user.userId || user.id) && (
              <motion.div variants={itemVariants}>
                <ClaimsPanel
                  itemId={item._id}
                  isItemOwner={true}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}