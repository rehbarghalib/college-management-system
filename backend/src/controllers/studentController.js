import Student from '../models/Student.js';

// @desc    Create a new student
// @route   POST /api/students
// @access  Private
export const createStudent = async (req, res) => {
  try {
    const { rollNumber, class: studentClass, category, section, phone } = req.body;

    // ✅ Validate phone number length
    if (phone && phone.toString().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be at least 10 digits'
      });
    }

    // Check if student with same roll number exists in same class + category + section
    const studentExists = await Student.findOne({ 
      rollNumber, 
      class: studentClass, 
      category, 
      section 
    });
    
    if (studentExists) {
      return res.status(400).json({
        success: false,
        message: `Student with roll number ${rollNumber} already exists in ${studentClass} - ${category} - Section ${section}`
      });
    }

    const student = await Student.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    console.error('Create Student Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Get Students Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get students by class
// @route   GET /api/students/class/:class
// @access  Private
export const getStudentsByClass = async (req, res) => {
  try {
    const { className } = req.params;
    const { category, section } = req.query;

    let filter = { class: className, isActive: true };
    if (category) filter.category = category;
    if (section) filter.section = section;

    const students = await Student.find(filter);
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Get Students By Class Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get Student Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = async (req, res) => {
  try {
    const { rollNumber, class: studentClass, category, section, phone } = req.body;

    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // ✅ Validate phone number if it's being updated
    if (phone !== undefined) {
      const phoneStr = phone.toString();
      if (phoneStr.length < 10 || phoneStr.length > 15) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be between 10-15 digits'
        });
      }
    }

    // ✅ Check for duplicate roll number only if rollNumber is being changed
    if (rollNumber !== undefined && rollNumber !== student.rollNumber) {
      const existingStudent = await Student.findOne({
        rollNumber,
        class: studentClass || student.class,
        category: category || student.category,
        section: section || student.section,
        _id: { $ne: req.params.id }
      });

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: `Student with roll number ${rollNumber} already exists in ${studentClass || student.class} - ${category || student.category} - Section ${section || student.section}`
        });
      }
    }

    // ✅ Build update object dynamically (only include fields that are provided)
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.fatherName !== undefined) updateData.fatherName = req.body.fatherName;
    if (req.body.class !== undefined) updateData.class = req.body.class;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.section !== undefined) updateData.section = req.body.section;
    if (req.body.rollNumber !== undefined) updateData.rollNumber = req.body.rollNumber;
    if (req.body.session !== undefined) updateData.session = req.body.session;
    if (req.body.profileImage !== undefined) updateData.profileImage = req.body.profileImage;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    
    // Handle address separately
    if (req.body.address) {
      updateData.address = {};
      if (req.body.address.village !== undefined) updateData.address.village = req.body.address.village;
    }

    // ✅ Update the student with only the fields that changed
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Update Student Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete student (soft delete)
// @route   DELETE /api/students/:id
// @access  Private
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.isActive = false;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete Student Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search students
// @route   GET /api/students/search?q=query
// @access  Private
export const searchStudents = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const students = await Student.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { fatherName: { $regex: q, $options: 'i' } },
        { rollNumber: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Search Students Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload student profile image
// @route   POST /api/students/upload-image
// @access  Private
export const uploadStudentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { imageUrl }
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};