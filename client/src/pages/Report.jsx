import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CreateItemForm from '../components/CreateItemForm';
import { ChevronLeft } from 'lucide-react';

export default function Report() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background py-8 md:py-12">
      <div className="container-custom">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/')}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-bold uppercase text-xs tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Feed
        </motion.button>

        {/* The Form now handles its own dynamic <h1> and <p> 
           based on the 'type' toggle inside.
        */}
        <CreateItemForm />
      </div>
    </div>
  );
}