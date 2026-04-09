import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext';
import { Button, SectionLabel } from '../components/ui';
import { MapPin } from 'lucide-react';

const LOCATIONS = ['Teston Hall', 'Creegan Hall', 'Doherty Hall', 'Gymnasium'];

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, setShowLoginModal } = useAuth();
  const { feedItems, isLoading, fetchItems } = useFeed();
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [user]);

  const displayedItems = activeFilter
    ? feedItems.filter(item => item.locationId?.name === activeFilter)
    : feedItems;

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
    <div className="min-h-screen w-full bg-background">
      {/* Main Feed Section */}
      <section className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR - Navigation */}
          <div className="hidden md:block md:col-span-3">
            <div className="sticky top-24 space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/')}
                  variant={activeFilter ? 'ghost' : 'primary'}
                  className="w-full"
                  size="md"
                >
                  Latest Feed
                </Button>
                <Button
                  onClick={() => user ? navigate('/report?type=lost') : setShowLoginModal(true)}
                  variant="outline"
                  className="w-full"
                  size="md"
                >
                  Report Lost
                </Button>
                <Button
                  onClick={() => user ? navigate('/report?type=found') : setShowLoginModal(true)}
                  variant="outline"
                  className="w-full"
                  size="md"
                >
                  Found Item
                </Button>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN - Feed */}
          <motion.div
            className="md:col-span-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Feed Header */}
            <motion.div variants={itemVariants}>
              <div className="mb-2">
                <SectionLabel>Latest Activity</SectionLabel>
              </div>
              <h2 className="font-display font-bold text-3xl">Recent Reports</h2>
              <p className="text-muted-foreground font-medium mt-2">
                New items from the campus community
              </p>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
              <motion.div
                variants={itemVariants}
                className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full mb-4"
                />
                <h3 className="font-semibold text-foreground">Fetching latest items...</h3>
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && feedItems.length === 0 && (
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-border p-12 text-center bg-muted/30"
              >
                <div className="text-6xl mb-4">📭</div>
                <h3 className="font-display font-bold text-2xl mb-2">It's quiet out here.</h3>
                <p className="text-muted-foreground">No items reported yet. Be the first!</p>
              </motion.div>
            )}

            {/* Empty Filter State */}
            {!isLoading && feedItems.length > 0 && displayedItems.length === 0 && (
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-border p-12 text-center bg-muted/30"
              >
                <h3 className="font-display font-bold text-2xl mb-2">No items at this location</h3>
                <p className="text-muted-foreground mb-4">
                  Try a different location or clear the filter.
                </p>
                <Button
                  onClick={() => setActiveFilter(null)}
                  variant="outline"
                  size="sm"
                >
                  Clear Filter
                </Button>
              </motion.div>
            )}

            {/* Feed Items */}
            {!isLoading && displayedItems.length > 0 && (
              displayedItems.map((item) => (
                <motion.div
                  key={item._id}
                  variants={itemVariants}
                >
                  <PostCard item={item} />
                </motion.div>
              ))
            )}
          </motion.div>

          {/* RIGHT SIDEBAR - Filters */}
          <div className="hidden md:block md:col-span-3">
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="bg-gradient-accent/5 border border-accent/30 rounded-2xl p-6 backdrop-blur-sm"
              >
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-accent" />
                      <h3 className="font-display font-bold text-lg">Hot Zones</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">Filter by location</p>
                  </div>
                  {activeFilter && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveFilter(null)}
                      className="text-xs font-bold text-accent hover:text-accent/70 transition-colors"
                    >
                      ✕ Clear
                    </motion.button>
                  )}
                </div>

                <div className="space-y-2">
                  {LOCATIONS.map((location) => (
                    <motion.button
                      key={location}
                      onClick={() => setActiveFilter(activeFilter === location ? null : location)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left font-medium py-3 px-4 rounded-lg transition-all duration-200 ${
                        activeFilter === location
                          ? 'bg-accent text-white shadow-accent'
                          : 'bg-muted/50 text-foreground hover:bg-muted'
                      }`}
                    >
                      # {location}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}