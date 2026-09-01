export const getGeofencesByChildId = async (req, res, Geofence) => {
  try {
    const { childId } = req.params;
    const geofences = await Geofence.findAll({ where: { childId } });
    
    if (!geofences || geofences.length === 0) {
      return res.status(404).json({ message: 'No geofences found' });
    }
    
    return res.status(200).json(geofences);
  } catch (error) {
    console.error('Get geofences error:', error);
    return res.status(500).json({ message: 'Server error fetching geofences' });
  }
};

export const createGeofence = async (req, res, Geofence) => {
  try {
    const { childId } = req.params;
    const { name, latitude, longitude, radius, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Geofence name is required' });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const geofence = await Geofence.create({
      childId,
      name: name.trim(),
      latitude,
      longitude,
      radius: radius || 100,
      status: status || 'Active',
    });

    return res.status(201).json({
      message: 'Geofence created successfully',
      geofence,
    });
  } catch (error) {
    console.error('Create geofence error:', error);
    return res.status(500).json({ message: 'Server error creating geofence' });
  }
};

export const updateGeofence = async (req, res, Geofence) => {
  try {
    const { id } = req.params;
    const geofence = await Geofence.findByPk(id);
    
    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }

    await geofence.update(req.body);

    return res.status(200).json({
      message: 'Geofence updated successfully',
      geofence,
    });
  } catch (error) {
    console.error('Update geofence error:', error);
    return res.status(500).json({ message: 'Server error updating geofence' });
  }
};

export const deleteGeofence = async (req, res, Geofence) => {
  try {
    const { id } = req.params;
    const geofence = await Geofence.findByPk(id);
    
    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }

    await geofence.destroy();

    return res.status(200).json({ message: 'Geofence deleted successfully' });
  } catch (error) {
    console.error('Delete geofence error:', error);
    return res.status(500).json({ message: 'Server error deleting geofence' });
  }
};
