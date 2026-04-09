import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CreateItemForm from '../components/CreateItemForm';
import { ChevronLeft } from 'lucide-react';

export default function Report() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeFromUrl = searchParams.get('type') || 'lost';

  const isLost = typeFromUrl === 'lost';

  return (
    <div className="min-h-screen w-full bg-background py-8 md:py-12">
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

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-3 gradient-text">
            {isLost ? '🔍 Report Lost Item' : '📦 Report Found Item'}
          </h1>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl">
            {isLost
              ? 'Help other students find your lost item by providing clear details and a photo.'
              : 'Help return this found item to its rightful owner by sharing what you found.'}
          </p>
        </motion.div>

        {/* The Form */}
        <CreateItemForm />
      </div>
    </div>
  );
}