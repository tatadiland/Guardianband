import Routine from "./routine.model.js";

export const getRoutines = async (req, res) => {
    try {
        const { childId } = req.params;
        const routines = await Routine.findAll({ where: { childId } });
        res.json(routines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createRoutine = async (req, res) => {
    try {
        const { childId } = req.params;
        const { title, category, start, end, description, icon } = req.body;
        const routine = await Routine.create({
            childId,
            title,
            category,
            start,
            end,
            description,
            icon,
        });
        res.status(201).json(routine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRoutine = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Routine.update(req.body, { where: { id } });
        if (updated) {
            const updatedRoutine = await Routine.findByPk(id);
            return res.json(updatedRoutine);
        }
        return res.status(404).json({ error: "Routine not found" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteRoutine = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Routine.destroy({ where: { id } });
        if (deleted) {
            return res.status(204).send();
        }
        return res.status(404).json({ error: "Routine not found" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
