import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { Autocomplete } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px',
};

const defaultCenter = {
    lat: 23.8103,
    lng: 90.4125, // Dhaka
};

const PatientSearch = () => {
    const navigate = useNavigate();
    const [latitude, setLatitude] = useState('23.8103'); // Default to Dhaka
    const [longitude, setLongitude] = useState('90.4125');
    const [doctors, setDoctors] = useState([]);
    const [error, setError] = useState('');
    const [map, setMap] = useState(null);
    const [center, setCenter] = useState(defaultCenter);
    const [autocomplete, setAutocomplete] = useState(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ['places'],
    });

    const onLoad = useCallback((mapInstance) => {
        setMap(mapInstance);
    }, []);

    const onPlaceChanged = async () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setLatitude(lat.toFixed(6));
                setLongitude(lng.toFixed(6));
                setCenter({ lat, lng });

                setError('');
                setDoctors([]);

                if (isNaN(lat) || isNaN(lng)) {
                    setError('Invalid location selected.');
                    return;
                }

                try {
                    const response = await axios.get('http://localhost:5000/api/doctors/search', {
                        params: { latitude: lat, longitude: lng, maxDistance: 10000 },
                    });
                    console.log('API Response:', response.data); // Debug log
                    setDoctors(response.data);
                    if (response.data.length === 0) {
                        setError('No doctors found in this area.');
                    } else if (map) {
                        const validDoctors = response.data.filter(
                            doctor =>
                                (doctor.latitude != null && doctor.longitude != null) ||
                                (doctor.location?.coordinates?.length === 2 &&
                                    typeof doctor.location.coordinates[0] === 'number' &&
                                    typeof doctor.location.coordinates[1] === 'number')
                        );
                        if (validDoctors.length === 0 && response.data.length > 0) {
                            setError('No doctors with valid coordinates found in this area.');
                        } else {
                            map.panTo({ lat, lng });
                            map.setZoom(14);
                        }
                    }
                } catch (error) {
                    console.error('Error searching doctors:', error);
                    setError(error.response?.data?.message || 'Failed to search doctors.');
                }
            }
        }
    };

    const handleMapClick = async (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        setCenter({ lat, lng });

        setError('');
        setDoctors([]);

        if (isNaN(lat) || isNaN(lng)) {
            setError('Invalid location selected.');
            return;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/doctors/search', {
                params: { latitude: lat, longitude: lng, maxDistance: 10000 },
            });
            console.log('API Response:', response.data); // Debug log
            setDoctors(response.data);
            if (response.data.length === 0) {
                setError('No doctors found in this area.');
            } else if (map) {
                const validDoctors = response.data.filter(
                    doctor =>
                        (doctor.latitude != null && doctor.longitude != null) ||
                        (doctor.location?.coordinates?.length === 2 &&
                            typeof doctor.location.coordinates[0] === 'number' &&
                            typeof doctor.location.coordinates[1] === 'number')
                );
                if (validDoctors.length === 0 && response.data.length > 0) {
                    setError('No doctors with valid coordinates found in this area.');
                } else {
                    map.panTo({ lat, lng });
                    map.setZoom(14);
                }
            }
        } catch (error) {
            console.error('Error searching doctors:', error);
            setError(error.response?.data?.message || 'Failed to search doctors.');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setDoctors([]);

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            setError('Please enter valid latitude and longitude values.');
            return;
        }

        try {
            const response = await axios.get('http://localhost:5000/api/doctors/search', {
                params: { latitude: lat, longitude: lng, maxDistance: 5000 },
            });
            console.log('API Response:', response.data); // Debug log
            setDoctors(response.data);
            if (response.data.length === 0) {
                setError('No doctors found in this area.');
            } else if (map) {
                const validDoctors = response.data.filter(
                    doctor =>
                        (doctor.latitude != null && doctor.longitude != null) ||
                        (doctor.location?.coordinates?.length === 2 &&
                            typeof doctor.location.coordinates[0] === 'number' &&
                            typeof doctor.location.coordinates[1] === 'number')
                );
                if (validDoctors.length === 0 && response.data.length > 0) {
                    setError('No doctors with valid coordinates found in this area.');
                } else {
                    map.panTo({ lat, lng });
                    map.setZoom(14);
                }
            }
        } catch (error) {
            console.error('Error searching doctors:', error);
            setError(error.response?.data?.message || 'Failed to search doctors.');
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
        <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Search Doctors</h2>
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
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side: Map and Inputs */}
                <div className="lg:w-2/3 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                                Latitude
                            </label>
                            <input
                                id="latitude"
                                type="text"
                                placeholder="Enter latitude (e.g., 23.8103)"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                                Longitude
                            </label>
                            <input
                                id="longitude"
                                type="text"
                                placeholder="Enter longitude (e.g., 90.4125)"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                    <Autocomplete
                        onLoad={(auto) => setAutocomplete(auto)}
                        onPlaceChanged={onPlaceChanged}
                        restrictions={{ country: 'BD' }}
                    >
                        <input
                            type="text"
                            placeholder="Search for a city in Bangladesh"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                            aria-label="Search location in Bangladesh"
                        />
                    </Autocomplete>
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-base hover:bg-blue-700 transition duration-200"
                        >
                            Search Doctors
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/doctor')}
                            className="w-full py-2 px-4 rounded-md text-base transition duration-200 bg-gray-600 text-white hover:bg-gray-700"
                        >
                            Go to Doctor Page
                        </button>
                    </div>
                    <div className="border border-gray-300 rounded overflow-hidden">
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={12}
                            onClick={handleMapClick}
                            onLoad={onLoad}
                            options={{ gestureHandling: 'greedy' }}
                        >
                            {doctors.map((doctor) => {
                                const lat = doctor.latitude ?? (doctor.location?.coordinates?.[1] ?? null);
                                const lng = doctor.longitude ?? (doctor.location?.coordinates?.[0] ?? null);
                                return (
                                    lat != null && lng != null && (
                                        <MarkerF
                                            key={doctor._id}
                                            position={{ lat, lng }}
                                            title={doctor.name}
                                        />
                                    )
                                );
                            })}
                        </GoogleMap>
                    </div>
                </div>
                {/* Right Side: Doctors List */}
                {doctors.length > 0 && (
                    <div className="lg:w-1/3">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Found Doctors</h3>
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 h-[400px] overflow-y-auto">
                            <ul className="space-y-4">
                                {doctors.map((doctor) => {
                                    const lat = doctor.latitude ?? (doctor.location?.coordinates?.[1] ?? null);
                                    const lng = doctor.longitude ?? (doctor.location?.coordinates?.[0] ?? null);
                                    return (
                                        <li
                                            key={doctor._id}
                                            className="p-4 bg-gray-50 rounded-md border border-gray-200 hover:shadow-md transition-shadow duration-200"
                                        >
                                            <p className="text-gray-900 font-semibold text-lg">{doctor.name || 'Unknown Doctor'}</p>
                                            <p className="text-gray-600 text-base mt-1">{doctor.address || 'Address not available'}</p>
                                            <p className="text-gray-500 text-sm mt-1">
                                                Coordinates: {lat != null && lng != null
                                                    ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
                                                    : 'Coordinates not available'}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientSearch;