import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext';
import { Button, SectionLabel } from '../components/ui';
import { MapPin, Plus, ListFilter } from 'lucide-react';

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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen w-full bg-background relative">
      
      {/* 🚨 MOBILE FLOATING ACTION BUTTON (FAB) */}
      <div className="fixed bottom-8 right-6 z-50 md:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => user ? navigate('/report') : setShowLoginModal(true)}
          className="bg-accent text-white p-4 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      </div>

      <section className="container-custom py-8 md:py-12">
        
        {/* 🚨 MOBILE TOP ACTIONS & FILTERS */}
        <div className="md:hidden space-y-4 mb-8">
           
           <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                className="w-full font-bold"
                onClick={() => user ? navigate('/report?type=lost') : setShowLoginModal(true)}
              >
                Report Lost
              </Button>
              <Button 
                variant="secondary" 
                className="w-full font-bold"
                onClick={() => user ? navigate('/report?type=found') : setShowLoginModal(true)}
              >
                Report Found
              </Button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR - Desktop Only */}
          <div className="hidden md:block md:col-span-3">
            <div className="sticky top-24 space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={() => { setActiveFilter(null); navigate('/'); }}
                  variant={activeFilter ? 'ghost' : 'primary'}
                  className="w-full"
                >
                  Latest Feed
                </Button>
                <Button
                  onClick={() => user ? navigate('/report?type=lost') : setShowLoginModal(true)}
                  variant="outline"
                  className="w-full"
                >
                  Report Lost
                </Button>
                <Button
                  onClick={() => user ? navigate('/report?type=found') : setShowLoginModal(true)}
                  variant="outline"
                  className="w-full"
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
            <motion.div variants={itemVariants}>
              <div className="mb-2">
                <SectionLabel>Latest Activity</SectionLabel>
              </div>
              <h2 className="font-display font-bold text-3xl">Recent Reports</h2>
              {activeFilter && (
                <Badge variant="primary" className="mt-2">Filtering: {activeFilter}</Badge>
              )}
            </motion.div>

            {/* Loading / Empty States / Feed Items remain the same... */}
            {isLoading ? (
               <div className="p-12 text-center">Loading items...</div>
            ) : displayedItems.length === 0 ? (
               <div className="p-12 text-center bg-muted/20 rounded-xl">No items found.</div>
            ) : (
              displayedItems.map((item) => (
                <motion.div key={item._id} variants={itemVariants}>
                  <PostCard item={item} />
                </motion.div>
              ))
            )}
          </motion.div>

          {/* RIGHT SIDEBAR - Filters (Desktop Only) */}
          <div className="hidden md:block md:col-span-3">
            <div className="sticky top-24">
              <div className="bg-gradient-accent/5 border border-accent/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-accent" />
                  <h3 className="font-display font-bold text-lg">Hot Zones</h3>
                </div>
                <div className="space-y-2">
                  {LOCATIONS.map((location) => (
                    <button
                      key={location}
                      onClick={() => setActiveFilter(activeFilter === location ? null : location)}
                      className={`w-full text-left font-medium py-3 px-4 rounded-lg transition-all ${
                        activeFilter === location ? 'bg-accent text-white' : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      # {location}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}