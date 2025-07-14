import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProfilePage = () => {
  const { authUser, UpdateProfile } = useContext(AuthContext); // Changed to UpdateProfile
  const navigate = useNavigate();
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.fullName || '');
  const [bio, setBio] = useState(authUser?.bio || '');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!selectedImg) {
        // Update profile without image
        await UpdateProfile({ fullName: name, bio }); // Changed to UpdateProfile
        navigate('/');
        return;
      }

      // Handle image upload
      const reader = new FileReader();
      reader.readAsDataURL(selectedImg);
      reader.onload = async () => {
        try {
          const base64Image = reader.result;
          await UpdateProfile({ profilePic: base64Image, fullName: name, bio }); // Changed to UpdateProfile
          navigate('/');
        } catch (err) {
          setError('Failed to update profile with image. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file. Please select a valid image.');
        setIsSubmitting(false);
      };
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Fallback if authUser is not available
  if (!authUser) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
          <h3 className="text-lg">Profile details</h3>
          {error && <p className="text-red-500">{error}</p>}
          <label htmlFor="avatar" className="flex items-center gap-3 cursor-pointer">
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser.profilePic || assets.avatar_icon
              }
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            Upload profile image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={4}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </form>
        <img
          className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10"
          src={selectedImg ? URL.createObjectURL(selectedImg) : authUser.profilePic || assets.logo_icon}
          alt="Profile Preview"
        />
      </div>
    </div>
  );
};

export default ProfilePage;