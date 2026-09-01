export const getAlertsByChildId = async (req, res, Alert) => {
  try {
    const { childId } = req.params;
    const alerts = await Alert.findAll({ where: { childId }, order: [['createdAt', 'DESC']] });
    return res.status(200).json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    return res.status(500).json({ message: 'Server error fetching alerts' });
  }
};

export const createAlert = async (req, res, Alert) => {
  try {
    const { childId } = req.params;
    const { category, severity, title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Alert title is required' });
    }

    const alert = await Alert.create({
      childId,
      category,
      severity,
      title: title.trim(),
      description,
    });

    return res.status(201).json({
      message: 'Alert created successfully',
      alert,
    });
  } catch (error) {
    console.error('Create alert error:', error);
    return res.status(500).json({ message: 'Server error creating alert' });
  }
};

export const markAlertAsRead = async (req, res, Alert) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByPk(id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    await alert.update({ unread: false });

    return res.status(200).json({
      message: 'Alert marked as read',
      alert,
    });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({ message: 'Server error updating alert' });
  }
};

export const deleteAlert = async (req, res, Alert) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findByPk(id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    await alert.destroy();

    return res.status(200).json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete alert error:', error);
    return res.status(500).json({ message: 'Server error deleting alert' });
  }
};
