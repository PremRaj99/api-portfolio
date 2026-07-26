import express from 'express';
import { connectDB } from '../config/db.js';
import Contact from '../models/Contact.js';
import { sendThankYouEmail } from '../services/mailer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, projectType, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Email and message are required fields.',
      });
    }

    // Connect DB
    await connectDB();

    // Create & Save Document
    const newSubmission = await Contact.create({
      name: name || 'Anonymous',
      email: email.trim().toLowerCase(),
      projectType: projectType || 'AI SaaS',
      message: message.trim(),
      status: 'unread',
    });

    // Send Automated Email Notification asynchronously
    try {
      await sendThankYouEmail({
        name: newSubmission.name,
        email: newSubmission.email,
        projectType: newSubmission.projectType,
        message: newSubmission.message,
      });
    } catch (emailError) {
      console.error('Failed to dispatch thank-you email:', emailError);
      // Non-blocking for DB save response
    }

    return res.status(201).json({
      success: true,
      message: 'Inquiry saved successfully! An automated confirmation email has been dispatched.',
      data: {
        id: newSubmission._id,
        createdAt: newSubmission.createdAt,
      },
    });
  } catch (error) {
    console.error('Error handling contact submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving contact data.',
    });
  }
});

export default router;
