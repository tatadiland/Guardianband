export const getChildByUserId = async (req, res, Child) => {
  try {
    const { userId } = req.params;
    const child = await Child.findOne({ where: { userId } });
    
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    return res.status(200).json(child);
  } catch (error) {
    console.error('Get child error:', error);
    return res.status(500).json({ message: 'Server error fetching child' });
  }
};

export const getMyChild = async (req, res, Child) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const child = await Child.findOne({ where: { userId } });
    
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    return res.status(200).json(child);
  } catch (error) {
    console.error('Get my child error:', error);
    return res.status(500).json({ message: 'Server error fetching child' });
  }
};

export const createChild = async (req, res, Child) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { name, dateOfBirth, gender, height, weight, bloodGroup, allergies, existingIllnesses, medication, school, emergencyContact, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Child name is required' });
    }

    let photoPath = null;
    if (req.file) {
      photoPath = `/uploads/${req.file.filename}`;
    }

    const child = await Child.create({
      userId,
      name: name.trim(),
      dateOfBirth,
      gender,
      height,
      weight,
      bloodGroup,
      allergies,
      existingIllnesses,
      medication,
      school,
      emergencyContact,
      phone,
      photo: photoPath,
    });

    return res.status(201).json({
      message: 'Child created successfully',
      child,
    });
  } catch (error) {
    console.error('Create child error:', error);
    return res.status(500).json({ message: 'Server error creating child' });
  }
};

export const updateChild = async (req, res, Child) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const child = await Child.findOne({ where: { id, userId } });
    
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    const updateData = { ...req.body };

    // Handle file upload
    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    await child.update(updateData);

    return res.status(200).json({
      message: 'Child updated successfully',
      child,
    });
  } catch (error) {
    console.error('Update child error:', error);
    return res.status(500).json({ message: 'Server error updating child' });
  }
};

export const deleteChild = async (req, res, Child) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const child = await Child.findOne({ where: { id, userId } });
    
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    await child.destroy();

    return res.status(200).json({ message: 'Child deleted successfully' });
  } catch (error) {
    console.error('Delete child error:', error);
    return res.status(500).json({ message: 'Server error deleting child' });
  }
};
