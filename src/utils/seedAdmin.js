import User from "../models/User.js";

export const ensureAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const name = process.env.ADMIN_NAME || "Admin";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  if (!email) {
    return;
  }

  const existing = await User.findOne({ email });

  if (!existing) {
    await User.create({
      name,
      email,
      password,
      role: "admin"
    });
    console.log("Admin account created");
  } else {
    let updated = false;

    if (existing.role !== "admin") {
      existing.role = "admin";
      updated = true;
    }

    if (existing.name !== name) {
      existing.name = name;
      updated = true;
    }

    const isSamePassword = await existing.comparePassword(password);
    if (!isSamePassword) {
      existing.password = password;
      updated = true;
    }

    if (updated) {
      await existing.save();
      console.log("Admin account synchronized from environment");
    }
  }
};
