import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeed } from '../context/FeedContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UploadCloud, X } from 'lucide-react';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle } from './ui';

export default function CreateItemForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addItem } = useFeed();
  const { user } = useAuth();
  const typeFromUrl = searchParams.get('type') || 'lost';

  // Dynamic Data from Backend
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: typeFromUrl,
    title: '',
    description: '',
    categoryId: '',
    locationId: '',
    attributes: { color: '', brand: '', serialNumber: '', lastSeen: '' }
  });

  // Update form type when URL changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, type: typeFromUrl }));
  }, [typeFromUrl]);

  // Fetch Categories and Locations on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/item/getCategories'),
          api.get('/item/getLocations')
        ]);

        const extractedCategories = Array.isArray(catRes.data)
          ? catRes.data
          : (catRes.data.data || catRes.data.categories || []);

        const extractedLocations = Array.isArray(locRes.data)
          ? locRes.data
          : (locRes.data.data || locRes.data.locations || []);

        setCategories(extractedCategories);
        setLocations(extractedLocations);
      } catch (err) {
        console.error('Failed to load categories/locations', err);
        setError('Could not load form data. Please refresh.');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchDropdownData();
  }, []);

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageFile) {
      return setError('Please upload an image of the item.');
    }
    if (!formData.categoryId || !formData.locationId) {
      return setError('Please select a category and location.');
    }

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append('type', formData.type);
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('categoryId', formData.categoryId);
    payload.append('locationId', formData.locationId);
    payload.append('image', imageFile);
    payload.append('attributes', JSON.stringify(formData.attributes));

    const result = await addItem(payload);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="text-center">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent mb-4" />
          <p className="text-muted-foreground font-medium">Loading form...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex gap-3"
          >
            <span className="text-2xl">⚠️</span>
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          {[
            { value: 'lost', label: '🔍 Lost Item', color: 'accent' },
            { value: 'found', label: '📦 Found Item', color: 'secondary' }
          ].map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, type: option.value })}
              className={`flex-1 py-3 font-semibold rounded-lg transition-all duration-200 ${
                formData.type === option.value
                  ? 'bg-accent text-white shadow-accent scale-105'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {option.label}
            </button>
          ))}
        </motion.div>

        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Item Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                label="Item Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Blue Hydro Flask"
              />

              <Textarea
                label="Description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the item in detail. Include distinctive features, conditions, or marks..."
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Category & Location */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-border bg-background text-foreground transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10 hover:border-border/60 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">Select Category...</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <select
                  required
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-border bg-background text-foreground transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10 hover:border-border/60 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">Select Location...</option>
                  {locations.map(loc => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Item Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Item Details (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                Adding these details helps us match and reunite items more accurately.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Color"
                  value={formData.attributes.color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attributes: { ...formData.attributes, color: e.target.value }
                    })
                  }
                  placeholder="e.g., Blue, Red, Black"
                />

                <Input
                  type="text"
                  label="Brand"
                  value={formData.attributes.brand}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attributes: { ...formData.attributes, brand: e.target.value }
                    })
                  }
                  placeholder="e.g., Apple, Nike, Samsung"
                />

                <Input
                  type="text"
                  label="Serial Number"
                  value={formData.attributes.serialNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attributes: { ...formData.attributes, serialNumber: e.target.value }
                    })
                  }
                  placeholder="e.g., SN123456789 (if applicable)"
                />

                <Input
                  type="date"
                  label="Date Last Seen"
                  value={formData.attributes.lastSeen}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attributes: { ...formData.attributes, lastSeen: e.target.value }
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Image Upload */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Photo</CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden border-2 border-accent/30">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <motion.button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-3 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted hover:border-accent transition-all duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mb-4"
                    >
                      <UploadCloud className="w-12 h-12 text-accent/60" />
                    </motion.div>
                    <p className="mb-2 text-sm text-foreground font-semibold">Click to upload image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                </label>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Posting...
              </>
            ) : (
              'Post Item'
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}