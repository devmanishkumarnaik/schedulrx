import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Availability from '@/models/Availability';
import { defaultAvailability } from '@/lib/utils';
import { sendEmail, isSmtpConfigured } from '@/lib/mailer';
import { welcomeEmail } from '@/lib/emailTemplates';

// POST /api/users — Register
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, username } = body;

    if (!name || !email || !password || !username) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'email' : 'username';
      return NextResponse.json({ error: `That ${field} is already taken` }, { status: 409 });
    }

    const user = await User.create({ name, email, password, username });

    await Availability.create({
      userId:   user._id,
      timezone: 'UTC',
      schedule: defaultAvailability(),
    });

    // Send welcome email
    if (isSmtpConfigured()) {
      const tpl = welcomeEmail({ name: user.name, username: user.username });
      await sendEmail({ to: user.email, ...tpl });
    }

    return NextResponse.json(
      { message: 'Account created successfully', userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: Object.values(error.errors)[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}

// PATCH /api/users — Update profile
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, bio, timezone, welcomeMessage } = body;

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name, bio, timezone, welcomeMessage },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ user: { name: user.name, bio: user.bio, timezone: user.timezone } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// GET /api/users — Get profile
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
