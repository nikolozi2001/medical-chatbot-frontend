// Sound utility functions for notifications

// Cache audio objects for better performance
const audioCache = {};

/**
 * Play a notification sound
 * @param {string} sound - The sound file name in the public/sounds directory
 * @param {Object} options - Options for playing the sound
 * @param {number} options.volume - Volume from 0 to 1
 * @param {boolean} options.loop - Whether to loop the sound
 */
export const playNotification = (sound, options = {}) => {
  const { volume = 0.5, loop = false } = options;
  
  try {
    const soundPath = `/sounds/${sound}`;
    
    // Use cached audio if available
    if (!audioCache[sound]) {
      audioCache[sound] = new Audio(soundPath);
    }
    
    const audio = audioCache[sound];
    audio.volume = volume;
    audio.loop = loop;
    
    // Reset the audio to start from beginning if it was playing
    audio.pause();
    audio.currentTime = 0;
    
    // Play the sound
    const playPromise = audio.play();
    
    // Handle potential autoplay restrictions
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Sound could not be played:', error);
      });
    }
    
    return audio;
  } catch (error) {
    console.error('Error playing notification sound:', error);
    return null;
  }
};
