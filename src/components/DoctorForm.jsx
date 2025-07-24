import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { Autocomplete } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '360px',
};

const defaultCenter = {
    lat: 23.8103,
    lng: 90.4125, // Dhaka
};

const DoctorForm = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [position, setPosition] = useState(defaultCenter);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autocomplete, setAutocomplete] = useState(null);
    const [map, setMap] = useState(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ['places'],
    });

    const onLoad = useCallback((mapInstance) => {
        setMap(mapInstance);
    }, []);

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const newPosition = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };
                setPosition(newPosition);
                setAddress(place.formatted_address || '');
                if (map) {
                    map.panTo(newPosition);
                    map.setZoom(15);
                }
            }
        }
    };

    const handleMapClick = (event) => {
        const newPosition = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        };
        setPosition(newPosition);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!name.trim() || !address.trim()) {
            setError('Name and address are required.');
            setIsSubmitting(false);
            return;
        }

        if (isNaN(position.lat) || isNaN(position.lng)) {
            setError('Invalid location selected.');
            setIsSubmitting(false);
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/doctors', {
                name,
                address,
                latitude: position.lat,
                longitude: position.lng,
            });
            alert('Doctor added successfully!');
            setName('');
            setAddress('');
            setPosition(defaultCenter);
            if (map) {
                map.panTo(defaultCenter);
            }
        } catch (error) {
            console.error('Error adding doctor:', error);
            setError(error.response?.data?.message || 'Failed to add doctor. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="text-gray-600 text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Add Doctor Clinic</h2>
            {error && (
                <div className="relative text-red-500 bg-red-100 p-3 rounded-md mb-4 text-center text-base">
                    <p>{error}</p>
                    <button
                        onClick={() => setError('')}
                        className="absolute top-2 right-2 text-red-700 hover:text-red-900 focus:outline-none"
                        aria-label="Close error message"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            )}
            <div className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Doctor Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Enter doctor's name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        aria-label="Doctor's name"
                        aria-describedby={error ? 'error-message' : undefined}
                    />
                </div>
                <div>
                    <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Clinic Address
                    </label>
                    <input
                        id="address"
                        type="text"
                        placeholder="Enter clinic address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        aria-label="Clinic address"
                        aria-describedby={error ? 'error-message' : undefined}
                    />
                </div>
                <div>
                    <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Selected Location (Lat, Lng)
                    </label>
                    <input
                        id="location"
                        type="text"
                        value={`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded text-base bg-gray-100 cursor-not-allowed"
                        aria-label="Selected location coordinates"
                    />
                </div>
                <div>
                    <Autocomplete
                        onLoad={(auto) => setAutocomplete(auto)}
                        onPlaceChanged={onPlaceChanged}
                        restrictions={{ country: 'BD' }}
                    >
                        <input
                            type="text"
                            placeholder="Search for a city in Bangladesh"
                            className="w-full px-4 py-2 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                            aria-label="Search location in Bangladesh"
                        />
                    </Autocomplete>
                    <div className="border border-gray-300 rounded overflow-hidden">
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={position}
                            zoom={12}
                            onClick={handleMapClick}
                            onLoad={onLoad}
                            options={{ gestureHandling: 'greedy' }}
                        >
                            <MarkerF position={position} />
                        </GoogleMap>
                    </div>
                </div>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full py-2 px-4 rounded text-base transition duration-200 ${isSubmitting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Doctor'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/patient')}
                        className="w-full py-2 px-4 rounded text-base transition duration-200 bg-gray-600 text-white hover:bg-gray-700"
                    >
                        Go to Patient Page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorForm;