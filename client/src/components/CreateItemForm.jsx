import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeed } from '../context/FeedContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UploadCloud, X, MapPin, Camera, Sparkles } from 'lucide-react';
import { Button, Input, Textarea, Card, CardContent } from './ui';

export default function CreateItemForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addItem } = useFeed();
  const typeFromUrl = searchParams.get('type') || 'lost';

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

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

  // --- 🛠️ DYNAMIC HEADER LOGIC ---
  const isLostType = formData.type === 'lost';
  const pageTitle = isLostType ? "Report a Lost Item" : "Report a Found Item";
  const pageSubtitle = isLostType
    ? "Help the campus community identify your belongings by providing a clear description."
    : "Sharing details about a found item is the quickest way to reunite it with its owner.";

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/item/getCategories'),
          api.get('/item/getLocations')
        ]);
        setCategories(catRes.data.categories || catRes.data || []);
        setLocations(locRes.data.locations || locRes.data || []);
      } catch (err) {
        setError('Failed to load campus data.');
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
    if (!imageFile) return setError('Please upload a photo.');

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
    if (result.success) navigate('/');
    else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return <div className="py-20 text-center font-bold text-muted-foreground animate-pulse">LOADING FORM...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto pb-20">

      {/* 🚨 DYNAMIC HEADER: Now inside the form for full control */}
      <header className="mb-10">
        <motion.h1
          key={pageTitle}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-bold text-4xl lg:text-5xl mb-3 gradient-text"
        >
          {pageTitle}
        </motion.h1>
        <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-xl">
          {pageSubtitle}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Toggle Switch */}
        <div className="flex gap-3 bg-muted p-1.5 rounded-2xl border border-border">
          {['lost', 'found'].map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setFormData({ ...formData, type: mode })}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${formData.type === mode ? 'bg-background shadow-lg text-accent' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {mode === 'lost' ? '🔍 Lost' : '📦 Found'}
            </button>
          ))}
        </div>

        {/* Info Card */}
        <Card className="border-2 shadow-sm overflow-hidden">
          <CardContent className="pt-8 space-y-6">
            <Input
              label="Item Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isLostType ? "e.g. Black Razer Laptop" : "e.g. Found a set of car keys"}
            />
            <Textarea
              label="Detailed Description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe unique marks, stickers, or brand names..."
            />
          </CardContent>
        </Card>

        {/* Dropdowns Card */}
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Category
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-accent focus:outline-none font-bold cursor-pointer"
              >
                <option value="">Select...</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Location
              </label>
              <select
                required
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-accent focus:outline-none font-bold cursor-pointer"
              >
                <option value="">Where at?</option>
                {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.name}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Color" placeholder="Primary colors" value={formData.attributes.color} onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, color: e.target.value } })} />
            <Input label="Brand" placeholder="e.g. Apple, Nike" value={formData.attributes.brand} onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, brand: e.target.value } })} />
            <Input label="Serial / ID" placeholder="If applicable" value={formData.attributes.serialNumber} onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, serialNumber: e.target.value } })} />
            <Input type="date" label={isLostType ? "Date Lost" : "Date Found"} value={formData.attributes.lastSeen} onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, lastSeen: e.target.value } })} />
          </CardContent>
        </Card>

        {/* Media Card */}
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-8">
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden shadow-inner h-64 border-4 border-muted">
                <img src={imagePreview} className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg"><X /></button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-64 border-3 border-dashed border-border rounded-2xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all">
                <UploadCloud className="w-12 h-12 text-accent/40 mb-3" />
                <span className="font-bold text-foreground">Click to upload photo</span>
                <input type="file" className="hidden" accept="image/*, .heic, .heif, .jpg, .jpeg, .png" onChange={handleImageChange} required />              </label>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting} variant="primary" size="lg" className="w-full font-bold text-xl py-8 rounded-2xl shadow-xl shadow-accent/20">
          {isSubmitting ? "Uploading Report..." : `Submit ${isLostType ? 'Lost' : 'Found'} Report`}
        </Button>
      </form>
    </motion.div>
  );
}