export const getDeviceByChildId = async (req, res, Device) => {
  try {
    const { childId } = req.params;
    const device = await Device.findOne({ where: { childId } });
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    return res.status(200).json(device);
  } catch (error) {
    console.error('Get device error:', error);
    return res.status(500).json({ message: 'Server error fetching device' });
  }
};

export const linkDevice = async (req, res, Device) => {
  try {
    const { childId } = req.params;
    const { name, hardwareId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Device name is required' });
    }

    // Check if hardware already linked to another child
    if (hardwareId) {
      const existing = await Device.findOne({ where: { hardwareId } });
      if (existing && existing.childId !== parseInt(childId)) {
        return res.status(409).json({ message: 'Hardware already linked to another child' });
      }
    }

    const device = await Device.create({
      childId,
      name: name.trim(),
      hardwareId,
      battery: 100,
      gsm: 'Good',
      gps: 'Connected',
    });

    return res.status(201).json({
      message: 'Device linked successfully',
      device,
    });
  } catch (error) {
    console.error('Link device error:', error);
    return res.status(500).json({ message: 'Server error linking device' });
  }
};

export const updateDevice = async (req, res, Device) => {
  try {
    const { id } = req.params;
    const device = await Device.findByPk(id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    await device.update(req.body);

    return res.status(200).json({
      message: 'Device updated successfully',
      device,
    });
  } catch (error) {
    console.error('Update device error:', error);
    return res.status(500).json({ message: 'Server error updating device' });
  }
};
