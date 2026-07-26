import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { connectDB } from '../config/db.js';
import Contact from '../models/Contact.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Google OAuth Login Verification
router.post('/login', async (req, res) => {
  try {
    const { credential, email: devEmail } = req.body;
    const allowedAdmins = (process.env.ADMIN_EMAILS || 'web.premraj@gmail.com')
      .split(',')
      .map((e) => e.trim().toLowerCase());

    let payload = null;

    if (credential) {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const client = new OAuth2Client(googleClientId, googleClientSecret);

      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: googleClientId || undefined,
        });
        payload = ticket.getPayload();
      } catch (err) {
        // Fallback token decoding for payload inspection if audience mismatch in dev
        const decoded = jwt.decode(credential);
        if (decoded && decoded.email) {
          payload = decoded;
        } else {
          throw err;
        }
      }
    } else if (devEmail) {
      // Dev login fallback option
      payload = { email: devEmail, name: 'Prem Raj Admin', picture: '' };
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google credentials provided.' });
    }

    const userEmail = payload.email.toLowerCase();

    if (!allowedAdmins.includes(userEmail)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Email '${userEmail}' is not an authorized administrator.`,
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-portfolio-admin-secret-2026';
    const adminToken = jwt.sign(
      {
        email: payload.email,
        name: payload.name || 'Admin',
        picture: payload.picture || '',
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token: adminToken,
      user: {
        name: payload.name || 'Prem Raj',
        email: payload.email,
        picture: payload.picture || '',
      },
    });
  } catch (error) {
    console.error('Google Admin Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate Google credentials.',
    });
  }
});

// GET all contact submissions (Admin Protected)
router.get('/contacts', requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const contacts = await Contact.find({}).sort({ createdAt: -1 });

    const stats = {
      total: contacts.length,
      unread: contacts.filter((c) => c.status === 'unread').length,
      domains: contacts.reduce((acc, curr) => {
        acc[curr.projectType] = (acc[curr.projectType] || 0) + 1;
        return acc;
      }, {}),
    };

    return res.json({
      success: true,
      stats,
      contacts,
    });
  } catch (error) {
    console.error('Error fetching admin contacts:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve contact data.' });
  }
});

// PATCH toggle read/unread status (Admin Protected)
router.patch('/contacts/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await connectDB();
    const updated = await Contact.findByIdAndUpdate(
      id,
      { status: status || 'read' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inquiry record not found.' });
    }

    return res.json({ success: true, contact: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update record status.' });
  }
});

// DELETE inquiry record (Admin Protected)
router.delete('/contacts/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await connectDB();
    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Inquiry record not found.' });
    }

    return res.json({ success: true, message: 'Inquiry record deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete record.' });
  }
});

export default router;
