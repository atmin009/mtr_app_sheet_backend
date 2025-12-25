require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();

// CORS: อนุญาตให้ทุกที่เข้าถึงได้
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database: เชื่อมต่อ MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "kids_db",
});

db.connect((err) => {
  if (err) console.error("❌ Connect MySQL Fail:", err);
  else console.log("✅ Connect MySQL Success!");
});

// ==========================================
//  Multer Configs (รวมฟังก์ชันสร้าง Storage)
// ==========================================
const createStorage = (subDir) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads", subDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // ใช้ prefix เพื่อป้องกันชื่อซ้ำ
    const prefix = subDir ? subDir.split('-')[0] + '_' : ''; 
    cb(null, `${prefix}${req.params.id || Date.now()}_${Date.now()}${ext}`);
  },
});

// 1. General Uploads (Worksheets)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
const cpUpload = upload.fields([{ name: "image" }, { name: "pdf" }]);

// 2. Age Logo Upload
const uploadAgeLogo = multer({
  storage: createStorage("age-logos"),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Image only")),
}).single("logo");

// 3. Age Cate Cover Upload
const uploadAgeCateCover = multer({
  storage: createStorage("age-cate-covers"),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Image only")),
}).single("cover");

// 4. Category Icon Upload
const uploadCategoryIcon = multer({
  storage: createStorage("category-icons"),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Image only")),
}).single("icon");


// ==========================================
//  API ระบบสมาชิก (Login/Register)
// ==========================================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.json({ success: false, message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
  }
  
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล" });
      
      if (result.length === 0) {
        return res.json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }
      
      const user = result[0];
      
      // ตรวจสอบว่า password ในฐานข้อมูลเป็น hash หรือยัง (สำหรับ backward compatibility)
      const isHashed = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
      
      let passwordMatch = false;
      
      if (isHashed) {
        // ใช้ bcrypt compare สำหรับ password ที่ hash แล้ว
        try {
          passwordMatch = await bcrypt.compare(password, user.password);
        } catch (bcryptErr) {
          console.error("Bcrypt compare error:", bcryptErr);
          return res.json({ success: false, message: "เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน" });
        }
      } else {
        // สำหรับ password เก่าที่ยังไม่ได้ hash (backward compatibility)
        passwordMatch = password === user.password;
        
        // ถ้า login สำเร็จและ password ยังไม่ได้ hash ให้ hash และอัปเดต
        if (passwordMatch) {
          try {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.query(
              "UPDATE users SET password = ? WHERE id = ?",
              [hashedPassword, user.id],
              (updateErr) => {
                if (updateErr) console.error("Failed to update password hash:", updateErr);
              }
            );
          } catch (hashErr) {
            console.error("Failed to hash password:", hashErr);
          }
        }
      }
      
      if (passwordMatch) {
        res.json({ success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
      } else {
        res.json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }
    }
  );
});

app.post("/api/register", async (req, res) => {
  const { username, password, name, role } = req.body;
  
  if (!username || !password || !name) {
    return res.json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }
  
  try {
    // Hash password ก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || "user";
    
    db.query(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, name, userRole],
      (err) => {
        if (err) {
          if (err.errno === 1062) {
            return res.json({ success: false, message: "ชื่อผู้ใช้นี้มีคนใช้แล้ว" });
          }
          return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการลงทะเบียน", error: err.message });
        }
        res.json({ success: true, message: "ลงทะเบียนสำเร็จ" });
      }
    );
  } catch (hashErr) {
    console.error("Password hashing error:", hashErr);
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน" });
  }
});

// ==========================================
//  API ระดับชั้น (Age Groups)
// ==========================================
app.get("/api/age-groups", (req, res) => {
  db.query("SELECT * FROM age_groups ORDER BY sort_order ASC, id ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get("/api/age-groups/:id", (req, res) => {
  db.query("SELECT * FROM age_groups WHERE id = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows || rows.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  });
});

app.post("/api/age-groups", (req, res) => {
  const { ageValue, label, desc, color, icon, sortOrder } = req.body;
  const finalAgeValue = (ageValue && String(ageValue).trim()) || label || "";
  const finalSort = parseInt(sortOrder, 10) || 0;

  const sql = `INSERT INTO age_groups (age_value, label, description, color, icon_name, sort_order) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [finalAgeValue, label, desc || "", color || "", icon || "", finalSort], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Added", id: result.insertId });
  });
});

app.put("/api/age-groups/:id", (req, res) => {
  const { ageValue, label, desc, color, icon, sortOrder } = req.body;
  const finalAgeValue = (ageValue && String(ageValue).trim()) || label || "";
  const finalSort = parseInt(sortOrder, 10) || 0;

  const sql = `UPDATE age_groups SET age_value=?, label=?, description=?, color=?, icon_name=?, sort_order=? WHERE id=?`;
  db.query(sql, [finalAgeValue, label, desc || "", color || "", icon || "", finalSort, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Updated" });
  });
});

app.delete("/api/age-groups/:id", (req, res) => {
  db.query("DELETE FROM age_groups WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
});

// Upload Age Logo
app.post("/api/age-groups/:id/logo", (req, res) => {
  uploadAgeLogo(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const id = req.params.id;
    const logoUrl = `/uploads/age-logos/${req.file.filename}`;

    db.query("SELECT logo_url FROM age_groups WHERE id=?", [id], (err, rows) => {
      if (!err && rows.length > 0) {
        const oldFile = rows[0].logo_url;
        if (oldFile && oldFile.startsWith("/uploads")) {
          const oldPath = path.join(__dirname, oldFile.replace(/^\//, ""));
          if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
        }
      }
      db.query("UPDATE age_groups SET logo_url=? WHERE id=?", [logoUrl, id], (err2) => {
        if (err2) return res.status(500).json(err2);
        res.json({ message: "Upload success", logoUrl });
      });
    });
  });
});

// Upload Age Cate Cover
app.post("/api/age-groups/:id/cate-cover", (req, res) => {
  uploadAgeCateCover(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const id = req.params.id;
    const coverUrl = `/uploads/age-cate-covers/${req.file.filename}`;

    db.query("SELECT cate_cover_url FROM age_groups WHERE id=?", [id], (err, rows) => {
      if (!err && rows.length > 0) {
        const oldFile = rows[0].cate_cover_url;
        if (oldFile && oldFile.startsWith("/uploads")) {
          const oldPath = path.join(__dirname, oldFile.replace(/^\//, ""));
          if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
        }
      }
      db.query("UPDATE age_groups SET cate_cover_url=? WHERE id=?", [coverUrl, id], (err2) => {
        if (err2) return res.status(500).json(err2);
        res.json({ message: "Upload success", cateCoverUrl: coverUrl });
      });
    });
  });
});

app.delete("/api/age-groups/:id/cate-cover", (req, res) => {
  const id = req.params.id;
  db.query("SELECT cate_cover_url FROM age_groups WHERE id=?", [id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length > 0 && rows[0].cate_cover_url) {
      const oldPath = path.join(__dirname, rows[0].cate_cover_url.replace(/^\//, ""));
      if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
    }
    db.query("UPDATE age_groups SET cate_cover_url=NULL WHERE id=?", [id], (err2) => {
      if (err2) return res.status(500).json(err2);
      res.json({ message: "Deleted cover" });
    });
  });
});

// ==========================================
//  API ใบงาน (Worksheets)
// ==========================================
app.get("/api/worksheets", (req, res) => {
  db.query("SELECT * FROM worksheets ORDER BY created_at DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/api/worksheets", cpUpload, (req, res) => {
  const { title, ageRange, category } = req.body;
  const baseUrl = "/uploads/";
  const imageUrl = req.files?.["image"] ? baseUrl + req.files["image"][0].filename : "";
  const pdfUrl = req.files?.["pdf"] ? baseUrl + req.files["pdf"][0].filename : "";

  const categoryList = category ? category.split(",") : [];
  if (categoryList.length === 0) return res.status(400).json({ message: "Category required" });

  const values = categoryList.map((cat) => [title, ageRange, cat.trim(), imageUrl, pdfUrl]);
  const sql = "INSERT INTO worksheets (title, age_range, category, image_url, pdf_url) VALUES ?";
  
  db.query(sql, [values], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Success", id: result.insertId });
  });
});

app.put("/api/worksheets/:id", cpUpload, (req, res) => {
  const id = req.params.id;
  const { title, ageRange, category, existingImage, existingPdf } = req.body;
  const baseUrl = "/uploads/";
  const cleanUrl = (url) => url && url.includes("/uploads/") ? url.substring(url.indexOf("/uploads/")) : url;

  const imageUrl = req.files?.["image"] ? baseUrl + req.files["image"][0].filename : cleanUrl(existingImage);
  const pdfUrl = req.files?.["pdf"] ? baseUrl + req.files["pdf"][0].filename : cleanUrl(existingPdf);

  const sql = "UPDATE worksheets SET title=?, age_range=?, category=?, image_url=?, pdf_url=? WHERE id=?";
  db.query(sql, [title, ageRange, category, imageUrl, pdfUrl, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Updated" });
  });
});

app.delete("/api/worksheets/:id", (req, res) => {
  db.query("DELETE FROM worksheets WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
});

// ==========================================
//  API หมวดวิชา (Categories)
// ==========================================
app.get("/api/categories", (req, res) => {
  // ✅ ใช้ sort_order ในการเรียงลำดับ
  db.query("SELECT * FROM categories ORDER BY age_group ASC, sort_order ASC, id ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/api/categories", (req, res) => {
  const { name, age_group, sort_order } = req.body;
  const finalSort = parseInt(sort_order, 10) || 0;

  db.query(
    "INSERT INTO categories (name, age_group, sort_order) VALUES (?, ?, ?)",
    [name, age_group, finalSort],
    (err, result) => {
      if (err) return err.errno === 1062 ? res.status(409).json({ message: "Duplicate" }) : res.status(500).json(err);
      res.json({ message: "Added", id: result.insertId });
    }
  );
});

// ✅✅✅ NEW ENDPOINT: จัดเรียงลำดับวิชา (Reorder Categories) ✅✅✅
app.post("/api/categories/reorder", async (req, res) => {
  const { updates } = req.body; 

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "No updates provided" });
  }

  try {
    const promiseDb = db.promise(); // ใช้ wrapper promise ของ connection ที่มีอยู่
    const promises = updates.map((item) => {
      return promiseDb.query(
        "UPDATE categories SET sort_order = ? WHERE id = ?",
        [item.sortOrder, item.id]
      );
    });

    await Promise.all(promises);
    res.json({ success: true, message: "Categories reordered successfully" });
  } catch (err) {
    console.error("Reorder failed:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Upload Category Icon
app.post("/api/categories/:id/icon", (req, res) => {
  uploadCategoryIcon(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const id = req.params.id;
    const iconUrl = `/uploads/category-icons/${req.file.filename}`;

    db.query("SELECT icon_url FROM categories WHERE id=?", [id], (err, rows) => {
      if (!err && rows.length > 0) {
        const oldFile = rows[0].icon_url;
        if (oldFile && oldFile.startsWith("/uploads")) {
          const oldPath = path.join(__dirname, oldFile.replace(/^\//, ""));
          if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
        }
      }
      db.query("UPDATE categories SET icon_url=? WHERE id=?", [iconUrl, id], (err2) => {
        if (err2) return res.status(500).json(err2);
        res.json({ message: "Upload success", iconUrl });
      });
    });
  });
});

app.delete("/api/categories/:id", (req, res) => {
  db.query("DELETE FROM categories WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
});

// ==========================================
//  Bulk Upload Worksheets
// ==========================================
app.post(
  "/api/worksheets/bulk",
  upload.fields([{ name: "cover", maxCount: 1 }, { name: "files", maxCount: 20 }]),
  (req, res) => {
    const { ageRange, category } = req.body;
    const files = req.files["files"];
    const coverFile = req.files["cover"] ? req.files["cover"][0] : null;

    if (!files || files.length === 0) return res.status(400).json({ message: "No files" });

    const baseUrl = "/uploads/";
    const coverUrl = coverFile ? baseUrl + coverFile.filename : null;
    const sql = "INSERT INTO worksheets (title, age_range, category, image_url, pdf_url) VALUES ?";

    const values = files.map((file) => {
      const fileName = path.parse(file.originalname).name;
      const fileUrl = baseUrl + file.filename;
      return [fileName, ageRange, category, coverUrl || fileUrl, fileUrl];
    });

    db.query(sql, [values], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: `Added ${result.affectedRows} items` });
    });
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  console.log(`🚀 Server also available on http://localhost:${PORT}`);
});