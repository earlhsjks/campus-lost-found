import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeed } from '../context/FeedContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UploadCloud, X, ClipboardList, MapPin, Camera } from 'lucide-react';
import { Button, Input, Textarea, Card, CardContent } from './ui';

export default function CreateItemForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addItem } = useFeed();
  const { user } = useAuth();
  const typeFromUrl = searchParams.get('type') || 'lost';

  // Dynamic Data States
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form States
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

  // --- 🛠️ DYNAMIC CONTENT HELPERS ---
  const isLostType = formData.type === 'lost';
  const pageTitle = isLostType ? "Report a Lost Item" : "Report a Found Item";
  const pageSubtitle = isLostType 
    ? "Provide details about what you've lost so the community can help you find it."
    : "Sharing details about a found item is the first step to getting it home.";

  useEffect(() => {
    setFormData(prev => ({ ...prev, type: typeFromUrl }));
  }, [typeFromUrl]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/item/getCategories'),
          api.get('/item/getLocations')
        ]);
        const extractedCategories = Array.isArray(catRes.data) ? catRes.data : (catRes.data.categories || []);
        const extractedLocations = Array.isArray(locRes.data) ? locRes.data : (locRes.data.locations || []);
        setCategories(extractedCategories);
        setLocations(extractedLocations);
      } catch (err) {
        console.error('Failed to load form data', err);
        setError('Could not load form data. Please refresh.');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchDropdownData();
  }, []);

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
    if (!imageFile) return setError('Please upload an image of the item.');
    if (!formData.categoryId || !formData.locationId) return setError('Please select a category and location.');

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
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent mb-4" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs text-center">Preparing Form...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4"
    >
      {/* Main Dynamic Header */}
      <header className="mb-10 text-center md:text-left">
        <motion.h1 
          key={pageTitle}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-display font-bold text-4xl lg:text-5xl mb-3 gradient-text"
        >
          {pageTitle}
        </motion.h1>
        <p className="text-muted-foreground text-lg font-medium leading-relaxed">
          {pageSubtitle}
        </p>
      </header>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 font-bold text-sm"
          >
            <X className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        
        {/* Step 1: Mode Switcher */}
        <div className="flex gap-3">
          {[
            { value: 'lost', label: '🔍 Lost Item' },
            { value: 'found', label: '📦 Found Item' }
          ].map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, type: option.value })}
              className={`flex-1 py-4 font-bold rounded-2xl transition-all duration-300 border-2 ${
                formData.type === option.value
                  ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20 -translate-y-1'
                  : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Step 2: Primary Info (CardHeader Removed) */}
        <Card className="border-2 border-border shadow-sm">
          <CardContent className="pt-8 space-y-6">
            <Input
              type="text"
              label="Item Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isLostType ? "e.g. My Black Razer Backpack" : "e.g. Found a Keysmarts Car Key"}
            />

            <Textarea
              label="Description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Be specific! Mention any scratches, stickers, or unique features that prove it's the right item."
            />
          </CardContent>
        </Card>

        {/* Step 3: Category & Location */}
        <Card className="border-2 border-border shadow-sm">
          <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground uppercase tracking-wider">Category</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-accent focus:outline-none font-medium appearance-none cursor-pointer"
              >
                <option value="">Choose category...</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground uppercase tracking-wider">Location</label>
              <select
                required
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-accent focus:outline-none font-medium appearance-none cursor-pointer"
              >
                <option value="">Where {isLostType ? 'was it lost' : 'did you find it'}?</option>
                {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.name}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Additional Attributes */}
        <Card className="border-2 border-border shadow-sm">
          <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Color"
              value={formData.attributes.color}
              onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, color: e.target.value }})}
              placeholder="e.g. Midnight Blue"
            />
            <Input
              label="Brand"
              value={formData.attributes.brand}
              onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, brand: e.target.value }})}
              placeholder="e.g. Nike, Apple"
            />
            <Input
              label="Serial / ID Number"
              value={formData.attributes.serialNumber}
              onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, serialNumber: e.target.value }})}
              placeholder="Unique identifiers"
            />
            <Input
              type="date"
              label={isLostType ? "Date Lost" : "Date Found"}
              value={formData.attributes.lastSeen}
              onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, lastSeen: e.target.value }})}
            />
          </CardContent>
        </Card>

        {/* Step 5: Photo Upload */}
        <Card className="border-2 border-border shadow-sm">
          <CardContent className="pt-8">
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border-4 border-muted shadow-inner">
                <img src={imagePreview} alt="Preview" className="w-full h-72 object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-xl hover:scale-110 transition-transform"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-72 border-3 border-dashed border-border rounded-2xl cursor-pointer bg-muted/20 hover:bg-muted/40 hover:border-accent transition-all">
                <UploadCloud className="w-16 h-16 text-accent/40 mb-4" />
                <span className="font-bold text-foreground">Click to select photo</span>
                <span className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-tighter">Maximum 5MB • PNG, JPG</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
              </label>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          size="lg"
          className="w-full font-bold text-xl py-8 rounded-2xl shadow-xl shadow-accent/20"
        >
          {isSubmitting ? "Uploading Report..." : `Submit ${isLostType ? 'Lost' : 'Found'} Report`}
        </Button>
      </form>
    </motion.div>
  );
}