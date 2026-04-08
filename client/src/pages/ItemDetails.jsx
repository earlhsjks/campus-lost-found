import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Send, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ItemDetails() {
    const { id } = useParams();
    const { user, setShowLoginModal } = useAuth();

    const [item, setItem] = useState(null);
    const [comments, setComments] = useState([]); // NEW: State for real messages
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    // NEW: Ref to automatically scroll to the newest message
    const messagesEndRef = useRef(null);

    // Fetch both the item AND its comments when the page loads
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Promise.all runs both requests at the exact same time for max speed
                const [itemRes, commentsRes] = await Promise.all([
                    api.get(`/item/getById/${id}`),
                    api.get(`/item/comments/${id}`)
                ]);

                setItem(itemRes.data.item);
                setComments(commentsRes.data); // Make sure your backend sends an array here!
            } catch (error) {
                console.error("Failed to fetch item data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Auto-scroll to bottom whenever the comments array changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!user) return setShowLoginModal(true);
        if (!message.trim()) return;

        try {
            // Send the real request to your backend
            const response = await api.post(`/item/comments/${id}`, { text: message });

            // Push the new comment from the database directly into the UI array
            setComments(prev => [...prev, response.data]);
            setMessage(''); // Clear the input box

        } catch (error) {
            console.error("Failed to send message", error);
            alert("Could not send message. Make sure you are logged in!");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-muted">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted">
                <h2 className="font-extrabold text-3xl mb-4 text-foreground">Item Not Found</h2>
                <Link to="/" className="text-primary font-bold hover:underline">Return to Feed</Link>
            </div>
        );
    }

    const isLost = item.type === 'lost';
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    return (
        <div className="min-h-screen w-full pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center font-extrabold text-xl tracking-tight text-primary hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-6 h-6 mr-2" strokeWidth={2.5} /> Back to Feed
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Item Details */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white p-8 rounded-lg">

                            <div className="flex justify-between items-start mb-6">
                                <div className={`inline-flex items-center px-4 py-2 rounded-md font-extrabold text-sm tracking-wider uppercase ${isLost ? 'bg-accent text-white' : 'bg-secondary text-white'}`}>
                                    {isLost ? <AlertCircle className="w-5 h-5 mr-2" strokeWidth={2.5} /> : <CheckCircle className="w-5 h-5 mr-2" strokeWidth={2.5} />}
                                    {isLost ? 'Lost Item' : 'Found Item'}
                                </div>
                                <div className="inline-flex items-center px-4 py-2 rounded-md font-extrabold text-sm tracking-wider uppercase bg-gray-800 text-white">
                                    Status: {item.status}
                                </div>
                            </div>

                            <h1 className="font-extrabold text-4xl lg:text-5xl mb-4 text-foreground leading-tight tracking-tight">
                                {item.title}
                            </h1>

                            <div className="flex items-center text-gray-500 font-bold text-sm mb-8 space-x-6 border-b-2 border-muted pb-6">
                                <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-primary" /> {item.locationId?.name || "Campus"}</span>
                                <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {formattedDate}</span>
                            </div>

                            <p className="text-gray-700 text-lg mb-8 font-medium leading-relaxed">
                                {item.description}
                            </p>

                            {item.image && (
                                <div className="w-full bg-muted rounded-md overflow-hidden border-4 border-gray-100">
                                    <img src={item.image} alt={item.title} className="w-full h-auto object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Live Coordination Chat */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-lg flex flex-col h-[600px] sticky top-8 shadow-sm">

                            <div className="p-6 border-b-2 border-muted">
                                <h3 className="font-extrabold text-2xl text-foreground">Coordination</h3>
                                <p className="text-sm font-medium text-gray-500">Discuss how to return this item securely.</p>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50">
                                {comments.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <Send className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="font-bold">No messages yet.</p>
                                        <p className="text-sm font-medium text-center mt-1">Leave a comment to start coordinating.</p>
                                    </div>
                                ) : (
                                    comments.map((c) => {
                                        // Check if the current logged-in user sent this specific message
                                        const isMe = user && c.senderId === user.userId;

                                        return (
                                            <div key={c._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <span className={`text-xs font-bold mb-1 ${isMe ? 'mr-1 text-primary' : 'ml-1 text-gray-400'}`}>
                                                    {isMe ? 'You' : c.senderName}
                                                </span>
                                                <div className={`font-medium p-4 rounded-md max-w-[85%] ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none'
                                                    }`}>
                                                    {c.text}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {/* Invisible element to force scroll to bottom */}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-6 border-t-2 border-muted bg-white rounded-b-lg">
                                <form onSubmit={handleSendMessage} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={user ? "Type a message..." : "Log in to chat"}
                                        disabled={!user}
                                        className="flex-1 bg-muted text-foreground p-4 rounded-md border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!user || !message.trim()}
                                        className="bg-primary text-white p-4 rounded-md transition-all duration-200 hover:scale-105 hover:bg-blue-600 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}