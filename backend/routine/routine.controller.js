export const getRoutinesByChildId = async (req, res, Routine) => {
  try {
    const { childId } = req.params;
    const routines = await Routine.findAll({ where: { childId } });
    return res.status(200).json(routines);
  } catch (error) {
    console.error('Get routines error:', error);
    return res.status(500).json({ message: 'Server error fetching routines' });
  }
};

export const createRoutine = async (req, res, Routine) => {
  try {
    const { childId } = req.params;
    const { title, category, start, end, description, status, icon } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Routine title is required' });
    }

    const routine = await Routine.create({
      childId,
      title: title.trim(),
      category,
      start,
      end,
      description,
      status: status || 'upcoming',
      icon,
    });

    return res.status(201).json({
      message: 'Routine created successfully',
      routine,
    });
  } catch (error) {
    console.error('Create routine error:', error);
    return res.status(500).json({ message: 'Server error creating routine' });
  }
};

export const updateRoutine = async (req, res, Routine) => {
  try {
    const { id } = req.params;
    const routine = await Routine.findByPk(id);
    
    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    await routine.update(req.body);

    return res.status(200).json({
      message: 'Routine updated successfully',
      routine,
    });
  } catch (error) {
    console.error('Update routine error:', error);
    return res.status(500).json({ message: 'Server error updating routine' });
  }
};

export const deleteRoutine = async (req, res, Routine) => {
  try {
    const { id } = req.params;
    const routine = await Routine.findByPk(id);
    
    if (!routine) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    await routine.destroy();

    return res.status(200).json({ message: 'Routine deleted successfully' });
  } catch (error) {
    console.error('Delete routine error:', error);
    return res.status(500).json({ message: 'Server error deleting routine' });
  }
};
