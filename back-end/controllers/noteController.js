const Note = require("../models/Note");

// Get notes for a specific doctor (or all notes if clinical workspace)
exports.getNotes = async (req, res) => {
  try {
    // If we want to filter by doctorId (from authMiddleware)
    // const query = { doctorId: req.user.id };
    const notes = await Note.find().sort({ pinned: -1, createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a note
exports.createNote = async (req, res) => {
  try {
    const newNote = new Note({
      ...req.body,
      // doctorId: req.user.id // Assuming doctor is logged in
    });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedNote) return res.status(404).json({ message: "Note not found" });
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
