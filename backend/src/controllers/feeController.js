import Fee from '../models/Fee.js';
import Student from '../models/Student.js';

// ✅ @desc    Record a fee payment
// ✅ @route   POST /api/fees
// ✅ @access  Private (Admin only)
export const recordFee = async (req, res) => {
  try {
    const { 
      studentId, 
      amount, 
      month, 
      year, 
      paymentMethod, 
      paymentFor, 
      notes 
    } = req.body;

    console.log('📥 Fee Payment Recorded:', req.body);

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid amount'
      });
    }

    const fee = await Fee.create({
      studentId,
      studentName: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      category: student.category || '',
      section: student.section || '',
      amount: parseFloat(amount),
      month,
      year: parseInt(year) || new Date().getFullYear(),
      paymentDate: new Date(),
      paymentMethod,
      paymentFor: paymentFor || 'Monthly',
      notes: notes || '',
      collectedBy: req.admin._id
    });

    console.log('✅ Fee recorded:', fee);

    res.status(201).json({
      success: true,
      message: 'Fee payment recorded successfully',
      data: fee
    });
  } catch (error) {
    console.error('❌ Record Fee Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ @desc    Get all fee payments with filters
// ✅ @route   GET /api/fees
// ✅ @access  Private
export const getAllFees = async (req, res) => {
  try {
    const { studentId, month, year } = req.query;
    
    let filter = {};
    if (studentId) filter.studentId = studentId;
    if (month) filter.month = month;
    if (year) filter.year = parseInt(year);

    const fees = await Fee.find(filter).sort({ paymentDate: -1 });
    
    res.status(200).json({
      success: true,
      count: fees.length,
      data: fees
    });
  } catch (error) {
    console.error('Get Fees Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ @desc    Get fee summary for a student
// ✅ @route   GET /api/fees/student/:studentId/summary
// ✅ @access  Private
export const getStudentFeeSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const fees = await Fee.find({ studentId });
    
    const totalPaid = fees.reduce((sum, f) => sum + f.amount, 0);
    const monthlyBreakdown = {};
    
    fees.forEach(f => {
      const key = `${f.month} ${f.year}`;
      if (!monthlyBreakdown[key]) {
        monthlyBreakdown[key] = 0;
      }
      monthlyBreakdown[key] += f.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        totalPaid,
        totalTransactions: fees.length,
        monthlyBreakdown,
        transactions: fees
      }
    });
  } catch (error) {
    console.error('Get Student Fee Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ @desc    Get overall fee summary
// ✅ @route   GET /api/fees/summary
// ✅ @access  Private
export const getFeeSummary = async (req, res) => {
  try {
    const fees = await Fee.find();
    const students = await Student.find();
    
    const totalCollected = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalTransactions = fees.length;
    const uniqueStudents = [...new Set(fees.map(f => f.studentId.toString()))].length;

    // Monthly collection
    const monthlyCollection = {};
    fees.forEach(f => {
      const key = `${f.month} ${f.year}`;
      if (!monthlyCollection[key]) {
        monthlyCollection[key] = 0;
      }
      monthlyCollection[key] += f.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        totalCollected,
        totalTransactions,
        uniqueStudents,
        monthlyCollection,
        totalStudents: students.length
      }
    });
  } catch (error) {
    console.error('Get Fee Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ @desc    Delete fee record
// ✅ @route   DELETE /api/fees/:id
// ✅ @access  Private
export const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }
    await fee.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Fee record deleted successfully'
    });
  } catch (error) {
    console.error('Delete Fee Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ✅ @desc    Update fee record
// ✅ @route   PUT /api/fees/:id
// ✅ @access  Private
export const updateFee = async (req, res) => {
  try {
    const { amount, month, year, paymentMethod, paymentFor, notes } = req.body;
    
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    if (amount) fee.amount = parseFloat(amount);
    if (month) fee.month = month;
    if (year) fee.year = parseInt(year);
    if (paymentMethod) fee.paymentMethod = paymentMethod;
    if (paymentFor) fee.paymentFor = paymentFor;
    if (notes !== undefined) fee.notes = notes;

    await fee.save();

    res.status(200).json({
      success: true,
      message: 'Fee record updated successfully',
      data: fee
    });
  } catch (error) {
    console.error('Update Fee Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};