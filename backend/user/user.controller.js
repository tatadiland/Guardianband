import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password length
function isValidPassword(password) {
  return password && password.length >= 6;
}

/**
 * Register a new user
 * POST /api/users/register
 */
export const register = async (req, res, User) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    if (!confirmPassword) {
      return res.status(400).json({ message: 'Password confirmation is required' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
    });

    // Return safe user object (without password)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    return res.status(201).json({
      message: 'Account created successfully',
      user: safeUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Login user
 * POST /api/users/login
 */
export const login = async (req, res, User) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    
    if (!user) {
      return res.status(404).json({ message: 'Invalid email or password' });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return safe user object (without password)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Get all users (for testing/admin purposes)
 * GET /api/users/get-all-users
 */
export const getCurrentUser = async (req, res, User) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Server error fetching user' });
  }
};

export const updateCurrentUser = async (req, res, User) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, phone, password } = req.body || {};
    const nextName = typeof name === 'string' ? name.trim() : user.name;
    const nextEmail = typeof email === 'string' ? email.trim().toLowerCase() : user.email;
    const nextPhone = typeof phone === 'string' ? phone.trim() : user.phone;

    if (!nextName) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!nextEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    if (!nextPhone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    if (nextEmail !== user.email) {
      const existingUser = await User.findOne({ where: { email: nextEmail } });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(409).json({ message: 'Email already exists' });
      }
    }

    const updatePayload = {
      name: nextName,
      email: nextEmail,
      phone: nextPhone,
    };

    if (password && typeof password === 'string' && password.trim().length >= 6) {
      updatePayload.password = await bcrypt.hash(password.trim(), 10);
    }

    await user.update(updatePayload);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    return res.status(200).json({
      message: 'User updated successfully',
      user: safeUser,
    });
  } catch (error) {
    console.error('Update current user error:', error);
    return res.status(500).json({ message: 'Server error updating user' });
  }
};

export const getAllUsers = async (req, res, User) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // Never return password hash
    });

    return res.status(200).json({
      message: 'Users retrieved successfully',
      users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ message: 'Server error fetching users' });
  }
};
