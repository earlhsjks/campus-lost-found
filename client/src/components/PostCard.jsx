import React from 'react';
import { MapPin, Clock, MessageSquare, AlertCircle, CheckCircle, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function PostCard({ item }) {
  const { user, setShowLoginModal } = useAuth();

  const {
    type,
    title,
    description,
    image,
    status,
    attributes,
    createdAt
  } = item;

  const isLost = type === 'lost';
  const isOpen = status === 'open';

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  const locationName = item.locationId?.name || "Campus Grounds";

  return (
    <div className={`bg-white rounded-lg p-6 group transition-all duration-200 hover:scale-[1.02] ${!isOpen ? 'opacity-75' : ''}`}>

      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <div className={`inline-flex items-center px-3 py-1 rounded-md font-bold text-sm tracking-wider uppercase ${isLost ? 'bg-accent text-white' : 'bg-secondary text-white'}`}>
            {isLost ? <AlertCircle className="w-4 h-4 mr-2" strokeWidth={2.5} /> : <CheckCircle className="w-4 h-4 mr-2" strokeWidth={2.5} />}
            {isLost ? 'Lost Item' : 'Found Item'}
          </div>

          {!isOpen && (
            <div className="inline-flex items-center px-3 py-1 rounded-md font-bold text-sm tracking-wider uppercase bg-gray-800 text-white">
              {status}
            </div>
          )}
        </div>

        <div className="flex items-center text-gray-400 text-sm font-medium">
          <Clock className="w-4 h-4 mr-1" />
          {formattedDate}
        </div>
      </div>
      
      {/* NEW: Wrap the main content in a Link */}
      <Link to={`/item/${item._id}`} className="block focus:outline-none">
        <h3 className="font-extrabold text-2xl mb-2 text-foreground leading-tight hover:text-primary transition-colors">{title}</h3>
        <p className="text-gray-600 mb-4 font-medium leading-relaxed">{description}</p>

        {attributes && (attributes.brand || attributes.color) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {attributes.brand && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                <Tag className="w-3 h-3 mr-1" /> Brand: {attributes.brand}
              </span>
            )}
            {attributes.color && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                <Tag className="w-3 h-3 mr-1" /> Color: {attributes.color}
              </span>
            )}
          </div>
        )}

        {image && (
          <div className="w-full h-48 bg-muted rounded-md mb-6 overflow-hidden border-2 border-gray-100">
            <img src={image} alt={title} loading='lazy' className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        )}
      </Link>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t-2 border-muted">
        <div className="flex items-center text-gray-500 font-semibold text-sm">
          <MapPin className="w-4 h-4 mr-1 text-primary" />
          {locationName}
        </div>

        {isOpen && (
          <button
            onClick={() => {
              if (!user) {
                setShowLoginModal(true);
              } else {
                console.log("Proceed to messaging/claiming flow for item:", item._id);
              }
            }}
            className="bg-primary text-white font-bold py-3 px-6 rounded-md transition-all duration-200 hover:scale-105 hover:bg-blue-600 flex items-center justify-center"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            {isLost ? 'I Found This' : "That's Mine!"}
          </button>
        )}
      </div>
    </div>
  );
}