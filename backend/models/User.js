import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },

  password: {
    type: String,
    required: true,
    minlength: [8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"],
  },

  name: { type: String, required: true },
  phoneNumber: { type: String },

  tier: {
    type: String,
    enum: ['Retail', 'Wholesale', 'SuperWholesale'],
    default: 'Retail',
  },

  role: {
    type: String,
    enum: ['admin', 'client'], 
    default: 'client',
  },

  customPrices: {
    type: Map,
    of: Number,
    default: {},
  },

  totalDebt: {
    type: Number,
    default: 0,
  },
});

// 🔒 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Password verification method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
