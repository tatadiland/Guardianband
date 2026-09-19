import Child from "./child.model.js";

export const createChild = async (req, res) => {
  try {
    const {
      name,
      photo,
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
    } = req.body;

    const userId = req.user.id;

    if (!name || !dateOfBirth) {
      return res.status(400).json({
        error: "Name and date of birth are required",
      });
    }


    const child = await Child.create({
      name,
      photo,
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
      userId,
    });

    res.status(201).json({
      message: "Child profile created successfully",
      child,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create child profile" });
  }
};

export const getChildren = async (req, res) => {
  try {
    const children = await Child.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "ASC"]],
    });
    return res.status(200).json(children);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch child profiles" });
  }
};

export const getChild = async (req, res) => {
  try {
    const userId = req.params.userId === "me" ? req.user.id : parseInt(req.params.userId);

    // Only allow access to own child
    if (userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const child = await Child.findOne({ where: { userId } });

    if (!child) {
      return res.status(404).json({ message: "Child profile not found" });
    }

    res.status(200).json(child);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch child profile" });
  }
};

export const getChildById = async (req, res) => {
  try {
    const { id } = req.params;
    const child = await Child.findByPk(id);

    if (!child) {
      return res.status(404).json({ message: "Child profile not found" });
    }

    // Only allow access to own child
    if (child.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(child);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch child profile" });
  }
};

export const updateChild = async (req, res) => {
  try {
    const { id } = req.params;
    const child = await Child.findByPk(id);

    if (!child) {
      return res.status(404).json({ message: "Child profile not found" });
    }

    // Only allow update of own child
    if (child.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const allowedFields = [
      "name", "photo", "dateOfBirth", "gender", "height", "weight", "bloodGroup",
      "allergies", "existingIllnesses", "medication", "school", "emergencyContact", "phone",
    ];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowedFields.includes(key)));
    await child.update(updates);

    res.status(200).json({
      message: "Child profile updated successfully",
      child,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update child profile" });
  }
};

export const deleteChild = async (req, res) => {
  try {
    const { id } = req.params;
    const child = await Child.findByPk(id);

    if (!child) {
      return res.status(404).json({ message: "Child profile not found" });
    }

    // Only allow deletion of own child
    if (child.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await child.destroy();

    res.status(200).json({ message: "Child profile deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete child profile" });
  }
};