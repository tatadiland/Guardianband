export const getLastLocationByDeviceId = async (req, res, Location) => {
  try {
    const { deviceId } = req.params;
    const location = await Location.findOne(
      { where: { deviceId }, order: [['createdAt', 'DESC']] }
    );
    
    if (!location) {
      return res.status(404).json({ message: 'No location found' });
    }
    
    return res.status(200).json(location);
  } catch (error) {
    console.error('Get location error:', error);
    return res.status(500).json({ message: 'Server error fetching location' });
  }
};

export const recordLocation = async (req, res, Location) => {
  try {
    const { deviceId } = req.params;
    const { latitude, longitude, accuracy } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const location = await Location.create({
      deviceId,
      latitude,
      longitude,
      accuracy,
    });

    return res.status(201).json({
      message: 'Location recorded successfully',
      location,
    });
  } catch (error) {
    console.error('Record location error:', error);
    return res.status(500).json({ message: 'Server error recording location' });
  }
};

export const getLocationHistoryByDeviceId = async (req, res, Location) => {
  try {
    const { deviceId } = req.params;
    const limit = req.query.limit || 50;
    
    const locations = await Location.findAll(
      { where: { deviceId }, order: [['createdAt', 'DESC']], limit: parseInt(limit) }
    );
    
    return res.status(200).json(locations);
  } catch (error) {
    console.error('Get location history error:', error);
    return res.status(500).json({ message: 'Server error fetching location history' });
  }
};
