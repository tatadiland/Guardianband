export const getHealthDataByChildId = async (req, res, Health) => {
  try {
    const { childId } = req.params;
    const healthData = await Health.findAll(
      { where: { childId }, order: [['createdAt', 'DESC']], limit: 100 }
    );
    return res.status(200).json(healthData);
  } catch (error) {
    console.error('Get health data error:', error);
    return res.status(500).json({ message: 'Server error fetching health data' });
  }
};

export const recordHealth = async (req, res, Health) => {
  try {
    const { childId } = req.params;
    const { heartRate, temperature, oxygenLevel } = req.body;

    const record = await Health.create({
      childId,
      heartRate,
      temperature,
      oxygenLevel,
    });

    return res.status(201).json({
      message: 'Health record created successfully',
      record,
    });
  } catch (error) {
    console.error('Record health error:', error);
    return res.status(500).json({ message: 'Server error recording health data' });
  }
};
