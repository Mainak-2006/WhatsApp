import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
   CLOUDINARY_URL:env.CLOUDINARY_URL
});

export { cloudinary };
