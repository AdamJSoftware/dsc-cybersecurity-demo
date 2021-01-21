const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      unique: true,
      type: String,
      required: [true, "Please provide a username!"],
      minlength: [3, "Your username must be between 3 and 24 characters"],
      maxlength: [24, "Your password must be between 3 and 24 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    password: {
      type: String,
      // required: [true, 'A user must have a password'],
      minlength: [8, "Your password must be between 8 and 128 characters"],
      maxlength: [128, "Your password must be between 8 and 128 characters"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      // required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
  },
  {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

userSchema.pre("save", async function (next) {
  // Only run this function if the password was modified
  if (!this.isModified("password")) return next();

  this.username = this.username.toLowerCase();
  this.username = this.username.replace(" ", "");

  this.password = await bcrypt.hash(this.password, 12);
  // Deletes the confirm password, no longer needed
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // sometimes database changes slower which can conflict with JWT token
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
