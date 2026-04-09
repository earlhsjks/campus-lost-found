import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Send, AlertCircle, CheckCircle, ChevronLeft, Zap } from 'lucide-react';
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

  // Fetch both the item AND its comments
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

  // Auto-scroll to bottom
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
      alert('Could not send message. Make sure you are logged in!');
    }
  };

  const handleMarkResolved = async () => {
    if (!window.confirm('Are you sure you want to mark this item as resolved?')) {
      return;
    }

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen w-full flex items-center justify-center bg-background"
      >
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full"
          />
          <p className="mt-4 text-muted-foreground font-medium">Loading item details...</p>
        </div>
      </motion.div>
    );
  }

  if (!item) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen w-full flex flex-col items-center justify-center bg-background"
      >
        <div className="text-center">
          <h2 className="font-display font-bold text-3xl mb-4 text-foreground">Item Not Found</h2>
          <Button onClick={() => navigate('/')} variant="primary">
            Return to Feed
          </Button>
        </div>
      </motion.div>
    );
  }

  const isLost = item.type === 'lost';
  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen w-full bg-background py-8"
      variants={containerVariants}
    >
      <div className="container-custom">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/')}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Feed
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Item Details */}
          <motion.div className="lg:col-span-7 space-y-6" variants={containerVariants}>
            {/* Card */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-4 border-b border-border mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Left side: Badges */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={isLost ? 'primary' : 'success'}>
                        {isLost ? '🔍 Lost Item' : '📦 Found Item'}
                      </Badge>
                      <Badge variant={item.status === 'resolved' ? 'success' : 'secondary'}>
                        {item.status === 'resolved' ? '✓ Resolved' : 'Active'}
                      </Badge>
                    </div>

                    {/* Right side: Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      <Link
                        to={`/matches/${item._id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold bg-blue-50 text-accent hover:bg-blue-100 border border-blue-200 rounded-md transition-colors shadow-sm flex-1 sm:flex-none"
                      >
                        <Zap className="w-4 h-4 text-accent" /> View Matches
                      </Link>

                      {user && item.reportedBy?.userId === user.userId && item.status !== 'resolved' && (
                        <Button
                          onClick={handleMarkResolved}
                          variant="secondary"
                          size="sm"
                          className="flex-1 sm:flex-none"
                        >
                          Mark as {isLost ? 'Found' : 'Returned'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4 gradient-text">
                      {item.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        <span>{item.locationId?.name || 'Campus'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-foreground/80 text-lg leading-relaxed font-medium">
                    {item.description}
                  </p>

                  {item.image && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full bg-muted rounded-xl overflow-hidden border-2 border-border"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-auto object-cover"
                      />
                    </motion.div>
                  )}

                  {item.attributes && (
                    <motion.div className="bg-accent/5 border border-accent/30 rounded-xl p-4" variants={itemVariants}>
                      <h3 className="font-semibold text-foreground mb-3">Item Attributes</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {item.attributes.color && (
                          <div>
                            <span className="text-muted-foreground">Color:</span>
                            <p className="font-medium">{item.attributes.color}</p>
                          </div>
                        )}
                        {item.attributes.brand && (
                          <div>
                            <span className="text-muted-foreground">Brand:</span>
                            <p className="font-medium">{item.attributes.brand}</p>
                          </div>
                        )}
                        {item.attributes.serialNumber && (
                          <div>
                            <span className="text-muted-foreground">Serial:</span>
                            <p className="font-medium font-mono">{item.attributes.serialNumber}</p>
                          </div>
                        )}
                        {item.attributes.lastSeen && (
                          <div>
                            <span className="text-muted-foreground">Last Seen:</span>
                            <p className="font-medium">{item.attributes.lastSeen}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: Chat & Claims */}
          <motion.div className="lg:col-span-5 space-y-6" variants={containerVariants}>
            {/* Chat Card */}
            <motion.div variants={itemVariants}>
              <Card className="flex flex-col h-[600px]">
                <CardHeader>
                  <CardTitle>Live Discussion</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coordinate securely with other community members
                  </p>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 border-t border-border pt-4 px-6">
                  <AnimatePresence>
                    {comments.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center text-muted-foreground"
                      >
                        <Send className="w-8 h-8 mb-2 opacity-30" />
                        <p className="font-semibold">No messages yet</p>
                        <p className="text-xs text-center mt-1">Start the conversation!</p>
                      </motion.div>
                    ) : (
                      comments.map((c, idx) => {
                        const isMe = user && c.senderId === user.userId;
                        const isClaim = c.text === 'I found this!' || c.text === "That's mine!";

                        return (
                          <motion.div
                            key={c._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <span className={`text-xs font-medium mb-1 ${isMe ? 'text-accent' : 'text-muted-foreground'}`}>
                              {isMe ? 'You' : c.senderName}
                            </span>
                            <div
                              className={`font-medium p-3 rounded-lg max-w-[85%] relative transition-all break-words ${isMe
                                  ? 'bg-accent text-white rounded-tr-none'
                                  : 'bg-muted text-foreground rounded-tl-none'
                                } ${isClaim && !isMe ? 'ring-2 ring-green-400 bg-green-50 text-foreground' : ''} ${isClaim && isMe ? 'ring-2 ring-green-300 bg-accent' : ''
                                }`}
                            >
                              <p className="break-words">{c.text}</p>
                              {isClaim && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-1 shadow-lg"
                                >
                                  <Zap className="w-4 h-4" strokeWidth={3} />
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Chat Input */}
                <div className="border-t border-border p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={user ? 'Type a message...' : 'Log in to chat'}
                      disabled={!user}
                      className="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg border-2 border-border focus:border-accent focus:outline-none transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Button
                      type="submit"
                      disabled={!user || !message.trim()}
                      variant="primary"
                      size="md"
                      className="px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </motion.div>

            {/* Claims Panel */}
            {user && item.reportedBy?.userId === user.userId && (
              <motion.div variants={itemVariants}>
                <ClaimsPanel itemId={item._id} isItemOwner={true} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}