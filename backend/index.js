const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: `.env.local`, override: true });
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    res.json(filePath);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));