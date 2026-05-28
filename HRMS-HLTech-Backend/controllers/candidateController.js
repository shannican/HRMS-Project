const Candidate = require("../models/Candidatess");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const candidateRegister = async (req, res) => {
  const {
    fullName,
    address, // Now an object: { country, city, postalCode }
    email,
    phoneNumber,
    dateOfBirth,
    gender,
    password,
    confirmPassword,
  } = req.body;

  console.log("Candidate registration attempt:", { email, password });

  try {
    const existing = await Candidate.findOne({
      email: { $regex: new RegExp("^" + email + "$", "i") },
    });
    if (existing) {
      console.log("Candidate already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    if (password !== confirmPassword) {
      console.log("Passwords do not match for email:", email);
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const normalizedGender = gender.toLowerCase();
    if (!["male", "female", "other"].includes(normalizedGender)) {
      console.log("Invalid gender value:", gender);
      return res.status(400).json({ message: "Invalid gender value" });
    }

    const parsedDateOfBirth = new Date(dateOfBirth);
    if (isNaN(parsedDateOfBirth.getTime())) {
      console.log("Invalid date of birth:", dateOfBirth);
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    const candidate = new Candidate({
      fullName,
      address: {
        country: address.country || null,
        city: address.city || null,
        postalCode: address.postalCode || null,
      },
      email,
      phoneNumber,
      dateOfBirth: parsedDateOfBirth,
      gender: normalizedGender,
      password, // Pre-save hook will hash it
      role: "candidate",
    });

    await candidate.save();
    console.log("Candidate registered:", { email, role: candidate.role });

    const payload = {
      userId: candidate._id.toString(),
      role: candidate.role,
      fullName,
    };
    console.log("Token payload (candidateRegister):", payload);
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "3d",
    });

    res.status(201).json({
      token,
      user: {
        _id: candidate._id.toString(),
        email: candidate.email,
        role: candidate.role,
        fullName,
        location: candidate.address.city ? `${candidate.address.city}${candidate.address.country ? `, ${candidate.address.country}` : ''}` : "Not provided",
        phoneNumber: candidate.phoneNumber,
        dateOfBirth: candidate.dateOfBirth,
        gender: candidate.gender,
        country: candidate.address.country,
        city: candidate.address.city,
        postalCode: candidate.address.postalCode,
      },
    });
  } catch (error) {
    console.error("Error during candidate registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const candidateLogin = async (req, res) => {
  const { email, password } = req.body;

  console.log("Candidate login attempt:", { email, password });

  try {
    const candidate = await Candidate.findOne({
      email: { $regex: new RegExp("^" + email + "$", "i") },
    });
    if (!candidate) {
      console.log("Candidate not found for email:", email);
      return res.status(400).json({ message: "Incorrect email or password" });
    }

    console.log("Candidate found:", {
      email: candidate.email,
      role: candidate.role,
    });

    if (candidate.role !== "candidate") {
      console.log("User role not candidate:", candidate.role);
      return res.status(403).json({ message: "Access denied: Not a candidate" });
    }

    const isMatch = await candidate.matchPassword(password);
    console.log("Password comparison:", {
      provided: password,
      storedHash: candidate.password.slice(0, 10) + "...",
      isMatch,
    });
    if (!isMatch) {
      console.log("Password mismatch for candidate:", email);
      return res.status(400).json({ message: "Incorrect email or password" });
    }

    const payload = {
      userId: candidate._id.toString(),
      role: candidate.role,
      fullName: candidate.fullName,
    };
    console.log("Token payload (candidateLogin):", payload);
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "3d",
    });

    res.json({
      token,
      user: {
        _id: candidate._id.toString(),
        email: candidate.email,
        role: candidate.role,
        fullName: candidate.fullName,
        location: candidate.address.city ? `${candidate.address.city}${candidate.address.country ? `, ${candidate.address.country}` : ''}` : "Not provided",
        phoneNumber: candidate.phoneNumber,
        dateOfBirth: candidate.dateOfBirth,
        gender: candidate.gender,
        country: candidate.address.country,
        city: candidate.address.city,
        postalCode: candidate.address.postalCode,
      },
    });
  } catch (error) {
    console.error("Error during candidate login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const candidateLogout = (req, res) => {
  console.log("Candidate logout request");
  res.json({ message: "Logged out successfully" });
};

const candidateUpdate = async (req, res) => {
  const { fullName, address, phoneNumber, dateOfBirth, gender, password } = req.body;

  console.log("Candidate update attempt for user ID:", req.user?._id);

  try {
    const candidate = await Candidate.findById(req.user._id);
    if (!candidate) {
      console.log("Candidate not found for ID:", req.user?._id);
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (fullName) candidate.fullName = fullName;
    if (address) {
      candidate.address = {
        country: address.country || candidate.address.country || null,
        city: address.city || candidate.address.city || null,
        postalCode: address.postalCode || candidate.address.postalCode || null,
      };
    }
    if (phoneNumber) candidate.phoneNumber = phoneNumber;
    if (dateOfBirth) {
      const parsedDateOfBirth = new Date(dateOfBirth);
      if (isNaN(parsedDateOfBirth.getTime())) {
        console.log("Invalid date of birth:", dateOfBirth);
        return res.status(400).json({ message: "Invalid date of birth" });
      }
      candidate.dateOfBirth = parsedDateOfBirth;
    }
    if (gender) {
      const normalizedGender = gender.toLowerCase();
      if (!["male", "female", "other"].includes(normalizedGender)) {
        console.log("Invalid gender value:", gender);
        return res.status(400).json({ message: "Invalid gender value" });
      }
      candidate.gender = normalizedGender;
    }
    if (password) {
      candidate.password = password; // Pre-save hook will hash it
      console.log("Password updated for candidate:", candidate.email);
    }

    await candidate.save();
    console.log("Candidate updated successfully:", { email: candidate.email });

    const payload = {
      userId: candidate._id.toString(),
      role: candidate.role,
      fullName: candidate.fullName,
    };
    console.log("Token payload (candidateUpdate):", payload);
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "3d",
    });

    res.json({
      message: "Candidate updated successfully",
      token,
      user: {
        _id: candidate._id.toString(),
        email: candidate.email,
        role: candidate.role,
        fullName: candidate.fullName,
        location: candidate.address.city ? `${candidate.address.city}${candidate.address.country ? `, ${candidate.address.country}` : ''}` : "Not provided",
        phoneNumber: candidate.phoneNumber,
        dateOfBirth: candidate.dateOfBirth,
        gender: candidate.gender,
        country: candidate.address.country,
        city: candidate.address.city,
        postalCode: candidate.address.postalCode,
      },
    });
  } catch (error) {
    console.error("Error during candidate update:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user._id);
    if (!candidate) {
      console.log("Candidate not found for ID:", req.user._id);
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({
      user: {
        _id: candidate._id.toString(),
        email: candidate.email,
        role: candidate.role,
        fullName: candidate.fullName,
        location: candidate.address.city ? `${candidate.address.city}${candidate.address.country ? `, ${candidate.address.country}` : ''}` : "Not provided",
        profileImage: candidate.profileImage || null,
        phoneNumber: candidate.phoneNumber,
        dateOfBirth: candidate.dateOfBirth,
        gender: candidate.gender,
        country: candidate.address.country,
        city: candidate.address.city,
        postalCode: candidate.address.postalCode,
      },
    });
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

console.log("candidateController exports:", {
  candidateRegister,
  candidateLogin,
  candidateLogout,
  candidateUpdate,
  getCandidateProfile,
});

module.exports = {
  candidateRegister,
  candidateLogin,
  candidateLogout,
  candidateUpdate,
  getCandidateProfile,
};