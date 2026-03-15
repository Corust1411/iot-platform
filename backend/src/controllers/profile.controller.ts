import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as profileService from '../services/profile.service';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id; 
    
    if (!accountId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await profileService.getProfileById(accountId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id;
    const { username, email, first_name, last_name } = req.body; // รับเพิ่ม
    if (!accountId || !username || !email) return res.status(400).json({ message: "Invalid data" });

    const updatedProfile = await profileService.updateProfile(accountId, username, email, first_name, last_name);
    res.status(200).json(updatedProfile);
  } catch (error: any) {
    if (error.message.includes('already in use')) return res.status(409).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const accountId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    if (!accountId || !currentPassword || !newPassword) return res.status(400).json({ message: "All fields are required" });

    await profileService.updatePassword(accountId, currentPassword, newPassword);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    if (error.message.includes('Incorrect')) return res.status(401).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};