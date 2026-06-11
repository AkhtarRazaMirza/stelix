import { v2 as cloudinary } from "cloudinary";
import { env } from "../env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadAvatar = async (filePath: string) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "image",
    folder: "avatars",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const deleteAvatar = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId);
};