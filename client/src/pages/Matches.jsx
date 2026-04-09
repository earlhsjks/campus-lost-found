import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Zap, MapPin, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui';

export default function Matches() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, matchesRes] = await Promise.all([
          api.get(`/item/getById/${id}`),
          api.get(`/item/matches/${id}`)
        ]);

        setItem(itemRes.data.item);
        setMatches(matchesRes.data.matches);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
          <p className="mt-4 text-muted-foreground font-medium">Finding matches...</p>
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
        <h2 className="font-display font-bold text-3xl mb-4 text-foreground">Item Not Found</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="text-accent font-semibold hover:text-accent/80 transition-colors"
        >
          Return to Feed
        </motion.button>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
    >
      <div className="container-custom">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(`/item/${id}`)}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Item
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-3 gradient-text">
            Potential Matches
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            Found <span className="font-semibold text-accent">{matches.length}</span> possible matches for <span className="font-semibold">"{item.title}"</span>
          </p>
        </motion.div>

        {/* Matches Grid */}
        {matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-display font-bold text-2xl mb-2 text-foreground">No matches found yet</h3>
                <p className="text-muted-foreground font-medium">
                  Check back soon—new items are added constantly!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {matches.map((match, index) => {
              const matchedItem = match.matchedItem;
              const scorePercentage = Math.min(Math.round((match.score / 100) * 100), 100);

              return (
                <motion.div key={match.matchId} variants={itemVariants}>
                  <Link to={`/item/${matchedItem._id}`}>
                    <Card featured className="group hover:shadow-accent-lg transition-all duration-300 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-start">
                          {/* Image */}
                          <div className="sm:col-span-1">
                            {matchedItem.image && (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-full h-40 rounded-lg overflow-hidden bg-muted border border-border"
                              >
                                <img
                                  src={matchedItem.image}
                                  alt={matchedItem.title}
                                  className="w-full h-full object-cover"
                                />
                              </motion.div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="sm:col-span-2 space-y-3">
                            <div className="flex items-start gap-3">
                              <h3 className="font-display font-bold text-2xl text-foreground group-hover:text-accent transition-colors flex-1">
                                {matchedItem.title}
                              </h3>
                              {index === 0 && (
                                <Badge variant="primary" className="whitespace-nowrap">
                                  <Zap className="w-3 h-3" /> TOP MATCH
                                </Badge>
                              )}
                            </div>

                            <p className="text-muted-foreground font-medium line-clamp-2">
                              {matchedItem.description}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              <div className="flex items-center text-muted-foreground font-medium text-sm">
                                <MapPin className="w-4 h-4 mr-1 text-accent" />
                                {matchedItem.locationId?.name || 'Campus'}
                              </div>
                              {matchedItem.attributes?.color && (
                                <Badge variant="secondary" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" /> {matchedItem.attributes.color}
                                </Badge>
                              )}
                              {matchedItem.attributes?.brand && (
                                <Badge variant="secondary" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" /> {matchedItem.attributes.brand}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Score */}
                          <div className="sm:col-span-1 flex flex-col items-end gap-4">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="text-center"
                            >
                              <div className="w-24 h-24 rounded-full bg-gradient-accent flex items-center justify-center mx-auto mb-2 shadow-accent">
                                <span className="font-display font-bold text-white text-3xl">
                                  {scorePercentage}%
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Match Score
                              </p>
                            </motion.div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
