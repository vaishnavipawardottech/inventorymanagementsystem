import { pool } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import nodemailer from "nodemailer";

// 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const registerCompany = asyncHandler(async (req, res) => {
  const {
    company_name,
    company_email,
    address,
    timezoneFrom,
    timezoneTo,
    no_of_staff,
    no_of_admin,
    plan,
  } = req.body;

  const adminId = req.user?.id;

  if (!company_name || !company_email) {
    throw new ApiError(400, "Company name and email are required");
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // check if email already exists
    const [existing] = await connection.query(
      `SELECT id FROM companies WHERE company_email = ?`,
      [company_email]
    );

    if (existing.length > 0) {
      throw new ApiError(400, "Company already registered with this email");
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // insert company
    const [result] = await connection.query(
      `INSERT INTO companies 
        (company_name, company_email, address, timezoneFrom, timezoneTo, no_of_staff, no_of_admin, plan, otp, otpExpiry, isVerified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_name,
        company_email,
        address || null,
        timezoneFrom || null,
        timezoneTo || null,
        no_of_staff || 0,
        no_of_admin || 1,
        plan || "free",
        otp,
        otpExpiry,
        false,
      ]
    );

    const companyId = result.insertId;

    if (adminId) {
      await connection.query(
        `UPDATE users SET company_id = ?, role = 'admin' WHERE id = ?`,
        [companyId, adminId]
      );
    }

    // send email with OTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: company_email,
      subject: "Verify your company registration",
      html: `
        <h2>Welcome to Our System, ${company_name}!</h2>
        <p>Your verification OTP is: <b>${otp}</b></p>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    });

    await connection.commit();

    return res
      .status(201)
      .json(new ApiResponse(201, { companyId }, "Company registered. Verify OTP sent to email."));
  } catch (error) {
    await connection.rollback();
    throw new ApiError(500, error.message || "Failed to register company");
  } finally {
    connection.release();
  }
});

export const verifyCompany = asyncHandler(async (req, res) => {
  const { company_email, otp } = req.body;
  

  if (!company_email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const [companies] = await pool.query(
    `SELECT id, otp, otpExpiry, isVerified FROM companies WHERE company_email = ?`,
    [company_email]
  );

  if (companies.length === 0) {
    throw new ApiError(404, "Company not found");
  }

  const company = companies[0];

  if (company.isVerified) {
    throw new ApiError(400, "Company is already verified");
  }

  if (company.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (new Date(company.otpExpiry) < new Date()) {
    throw new ApiError(400, "OTP has expired");
  }

  await pool.query(
    `UPDATE companies SET isVerified = ?, otp = NULL, otpExpiry = NULL WHERE id = ?`,
    [true, company.id]
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Company verified successfully"));
});

// export const getCompanyProfile = asyncHandler(async (req, res) => {
//   const companyId = req.params.id || req.user?.company_id;

//   if (!companyId) {
//     throw new ApiError(400, "Company ID is required");
//   }

//   const [rows] = await pool.query(
//     `SELECT id, company_name, company_email, no_of_staff, no_of_admin, plan, address, timezoneFrom, timezoneTo, isVerified, created_at 
//      FROM companies 
//      WHERE id = ? AND deleted_at IS NULL`,
//     [companyId]
//   );

//   if (rows.length === 0) {
//     throw new ApiError(404, "Company not found");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, rows[0], "Company profile fetched successfully"));
// });

export const updateCompany = asyncHandler(async (req, res) => {
  const companyId = req.params.id || req.user?.company_id;
  const {
    company_name,
    address,
    timezoneFrom,
    timezoneTo,
    no_of_staff,
    no_of_admin,
    plan,
  } = req.body;

  if (!companyId) throw new ApiError(400, "Company ID is required");

  const [existing] = await pool.query(
    `SELECT id FROM companies WHERE id = ? AND deleted_at IS NULL`,
    [companyId]
  );

  if (existing.length === 0) {
    throw new ApiError(404, "Company not found");
  }

  await pool.query(
    `UPDATE companies 
     SET company_name = COALESCE(?, company_name),
         address = COALESCE(?, address),
         timezoneFrom = COALESCE(?, timezoneFrom),
         timezoneTo = COALESCE(?, timezoneTo),
         no_of_staff = COALESCE(?, no_of_staff),
         no_of_admin = COALESCE(?, no_of_admin),
         plan = COALESCE(?, plan),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      company_name,
      address,
      timezoneFrom,
      timezoneTo,
      no_of_staff,
      no_of_admin,
      plan,
      companyId,
    ]
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {company_name,
      address,
      timezoneFrom,
      timezoneTo,
      no_of_staff,
      no_of_admin,
      plan,
      companyId}, "Company details updated successfully"));
});

export const deleteCompany = asyncHandler(async (req, res) => {
  const companyId = req.params.id || req.user?.company_id;

  if (!companyId) {
    throw new ApiError(400, "Company ID is required");
  }

  const [existing] = await pool.query(
    `SELECT id FROM companies WHERE id = ? AND deleted_at IS NULL`,
    [companyId]
  );

  if (existing.length === 0) {
    throw new ApiError(404, "Company not found or already deleted");
  }

  await pool.query(
    `UPDATE companies SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [companyId]
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Company deleted successfully"));
});

export const getCompanyProfile = asyncHandler(async (req, res) => {
  const companyId = req.params.id || req.user?.company_id;

  if (!companyId) {
    throw new ApiError(400, "Company ID is required");
  }

  // Fetch company info
  const [companyRows] = await pool.query(
    `SELECT id, company_name, company_email, no_of_staff, no_of_admin, plan, address, timezoneFrom, timezoneTo, isVerified, created_at 
     FROM companies 
     WHERE id = ? AND deleted_at IS NULL`,
    [companyId]
  );

  if (companyRows.length === 0) {
    throw new ApiError(404, "Company not found");
  }

  const company = companyRows[0];

  // 🔹 Calculate staff and admin counts from users table
  const [userCounts] = await pool.query(
    `SELECT 
        SUM(CASE WHEN role = 'staff' THEN 1 ELSE 0 END) AS staffCount,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS adminCount
     FROM users 
     WHERE company_id = ? AND deleted_at IS NULL`,
    [companyId]
  );

  const no_of_staff = userCounts[0].staffCount || 0;
  const no_of_admin = userCounts[0].adminCount || 0;

  // 🔹 Update the company table with new counts
  await pool.query(
    `UPDATE companies 
     SET no_of_staff = ?, no_of_admin = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [no_of_staff, no_of_admin, companyId]
  );

  // 🔹 Return combined data
  const updatedCompany = {
    ...company,
    no_of_staff,
    no_of_admin,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCompany, "Company profile fetched and staff/admin count updated"));
});
