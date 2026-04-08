import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const FeedContext = createContext();

export function FeedProvider({ children }) {
  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch from MongoDB as soon as the app loads
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/item/getAll');

      // console.log("Raw Backend Response:", response.data);

      if (Array.isArray(response.data)) {
        setFeedItems(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        // If your backend sends: { success: true, data: [...] }
        setFeedItems(response.data.data);
      } else if (response.data && Array.isArray(response.data.items)) {
        // If your backend sends: { items: [...] }
        setFeedItems(response.data.items);
      } else {
        // If we can't find the array, don't crash the app. Default to empty.
        console.error("Could not find an array in the backend response.");
        setFeedItems([]);
      }

    } catch (error) {
      console.error("Error fetching feed:", error);
      setFeedItems([]); // Prevent .map crash on network errors
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (formDataPayload) => {
    try {
      // Calls POST http://localhost:5000/api/create
      // Notice we pass the formData directly, and tell Axios to expect a file!
      const response = await api.post('/item/create', formDataPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Your backend returns { success: true, item: newItemData }
      // Push the new item to the top of the feed
      setFeedItems(prevFeed => [response.data.item, ...prevFeed]);
      return { success: true };

    } catch (error) {
      console.error("Error creating item:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Failed to post item." };
    }
  };

  return (
    <FeedContext.Provider value={{ feedItems, addItem, isLoading }}>
      {children}
    </FeedContext.Provider>
  );
}

export const useFeed = () => useContext(FeedContext);