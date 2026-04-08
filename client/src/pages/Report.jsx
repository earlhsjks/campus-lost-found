import React from 'react';
import CreateItemForm from '../components/CreateItemForm';
import { Link } from 'react-router-dom';

export default function Report() {
    return (
        <div className="min-h-screen w-full pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Simple Top Navigation for the Page */}
                <div className="mb-8">
                    <Link to="/" className="font-extrabold text-2xl tracking-tight text-primary hover:text-blue-600 transition-colors">
                        &larr; Back to Feed
                    </Link>
                </div>

                {/* The Form */}
                <CreateItemForm />

            </div>
        </div>
    );
}