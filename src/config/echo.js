import Pusher from 'pusher-js';
import { Echo } from 'laravel-echo';

const initEcho = () => {
  if (!process.env.REACT_APP_PUSHER_APP_KEY) return null;
  
  window.Pusher = Pusher;
  
  return new Echo({
    broadcaster: 'pusher',
    key: process.env.REACT_APP_PUSHER_APP_KEY,
    cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true
  });
};

export default initEcho;