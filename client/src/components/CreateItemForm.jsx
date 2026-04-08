import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeed } from '../context/FeedContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UploadCloud, X } from 'lucide-react';

export default function CreateItemForm() {
  const navigate = useNavigate();
  const { addItem } = useFeed();
  const { user } = useAuth();

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
    type: 'lost',
    title: '',
    description: '',
    categoryId: '',
    locationId: '',
    attributes: { color: '', brand: '' }
  });

  // Fetch Categories and Locations on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/item/getCategories'),
          api.get('/item/getLocations')
        ]);

        // Let's log exactly what your backend is sending to be sure!
        console.log("Category API Response:", catRes.data);
        console.log("Location API Response:", locRes.data);

        // Safely extract the arrays, regardless of how your backend wraps them
        const extractedCategories = Array.isArray(catRes.data)
          ? catRes.data
          : (catRes.data.data || catRes.data.categories || []);

        const extractedLocations = Array.isArray(locRes.data)
          ? locRes.data
          : (locRes.data.data || locRes.data.locations || []);

        setCategories(extractedCategories);
        setLocations(extractedLocations);

      } catch (err) {
        console.error("Failed to load categories/locations", err);
        setError("Could not load form data. Please refresh.");
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
      // Create a local URL to show a preview before uploading
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageFile) {
      return setError("Please upload an image of the item.");
    }
    if (!formData.categoryId || !formData.locationId) {
      return setError("Please select a category and location.");
    }

    setIsSubmitting(true);

    // 🚨 BUILD THE FORM DATA OBJECT FOR MULTER
    const payload = new FormData();
    payload.append('type', formData.type);
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('categoryId', formData.categoryId);
    payload.append('locationId', formData.locationId);

    // Attach the actual file to be caught by upload.single('image')
    payload.append('image', imageFile);

    // Stringify the attributes object so it survives the FormData transfer
    payload.append('attributes', JSON.stringify(formData.attributes));

    // Send it to Context
    const result = await addItem(payload);

    if (result.success) {
      navigate('/'); // Instantly redirect to feed on success
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return <div className="p-8 text-center font-bold text-gray-500">Loading form...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="font-extrabold text-4xl mb-8 text-foreground">Report an Item</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border-2 border-muted">

        {/* Type Toggle */}
        <div className="flex gap-4 mb-6">
          <button type="button" onClick={() => setFormData({ ...formData, type: 'lost' })} className={`flex-1 py-3 font-bold rounded-md transition-all ${formData.type === 'lost' ? 'bg-accent text-white' : 'bg-muted text-gray-500 hover:bg-gray-200'}`}>I Lost Something</button>
          <button type="button" onClick={() => setFormData({ ...formData, type: 'found' })} className={`flex-1 py-3 font-bold rounded-md transition-all ${formData.type === 'found' ? 'bg-secondary text-white' : 'bg-muted text-gray-500 hover:bg-gray-200'}`}>I Found Something</button>
        </div>

        {/* Title & Description */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wider">Item Title</label>
          <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-muted p-4 rounded-md border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none font-medium" placeholder="e.g., Blue Hydro Flask" />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wider">Description</label>
          <textarea required rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-muted p-4 rounded-md border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none font-medium" placeholder="Describe the item..." />
        </div>

        {/* Dropdowns fetched from Backend */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wider">Category</label>
            <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full bg-muted p-4 rounded-md border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none font-medium">
              <option value="">Select Category...</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wider">Location</label>
            <select required value={formData.locationId} onChange={e => setFormData({ ...formData, locationId: e.target.value })} className="w-full bg-muted p-4 rounded-md border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none font-medium">
              <option value="">Select Location...</option>
              {locations.map(loc => (
                <option key={loc._id} value={loc._id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wider">Upload Photo</label>
          {imagePreview ? (
            <div className="relative w-full h-64 bg-muted rounded-md overflow-hidden border-2 border-primary">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-muted hover:border-primary transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                <p className="mb-2 text-sm text-gray-500 font-bold">Click to upload image</p>
                <p className="text-xs text-gray-500 font-medium">PNG, JPG, or WEBP (Max 5MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
            </label>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-extrabold text-lg py-4 rounded-md transition-all duration-200 hover:bg-blue-600 disabled:opacity-70 flex items-center justify-center">
          {isSubmitting ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : 'Post Item'}
        </button>
      </form>
    </div>
  );
}