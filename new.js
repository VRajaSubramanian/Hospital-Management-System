var express = require("express");
var router = express();
var bodyParse = require("body-parser");
var mongoose = require("mongoose");
const { request, response } = require("express");
const nodemailer = require("nodemailer");
// Creating app
var exp = require("express");
const app = exp()
app.engine('html', require('ejs').renderFile)
app.use(exp.static("./public"))
app.use(bodyParse.json())
app.use(express.static('public'))
app.use(bodyParse.urlencoded({
    extended: true
}))
// Connecting with mongodb
mongoose.connect('mongodb://0.0.0.0:27017/HMS-New', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
var db = mongoose.connection;
// Checking for connection
db.on('error', () => console.log("error in Creating database"));
db.once('open', () => console.log("Connected to database."));
// Creating checking page
app.get("/", (req, res) => {
    return res.sendFile(__dirname + '/front.html');
});
app.post("/send", (req, res) => {
    const { firstname, email, phone, date, message } = req.body;
    // const { firstname, email, phone, date, messsage } = req.body;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "rvhospital2023@gmail.com",
            pass: "looqofkmlqupjdxg",
        },
    });
    const mailOptions = {
        from: "rvhospital2023@gmail.com",
        to: email,
        subject: "Appointment Booking Confirmation at RV Hospitals❤️‍🩹",
        text: `Dear ${firstname},\n\nWe are writing to confirm that your appointment at RV Hospitals❤️‍🩹 has been successfully booked on ${date}.\n\nPlease arrive at least 15 minutes before your appointment time to allow for registration and any necessary paperwork.\n\nIf you need to cancel or reschedule your appointment, please contact us as soon as possible to make alternative arrangements.\n\nWe look forward to seeing you soon.\n\nBest regards,\n\nRV Hospitals`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send("error");
        } else {
            console.log("Email sent: " + info.response);
            // res.send("Appointment Booked");
            return res.sendFile(__dirname + '/booking.html');
        }
    });
    const book = new Appoint({ firstname, email, phone, date, message });
    Promise.all([book.save()]);
});
app.get("/viewProfile", (req, res) => {
    return res.sendFile(__dirname + '/viewProfile.html');
});
app.get("/search", (req, res) => {
    return res.sendFile(__dirname + '/search.html');
});
app.get("/viewDoctor", (req, res) => {
    return res.sendFile(__dirname + '/viewDoctor.html');
});
app.get("/addDoctor", (req, res) => {
    return res.sendFile(__dirname + '/addDoctor.html');
});
app.get("/deleteDoctor", (req, res) => {
    return res.sendFile(__dirname + '/deleteDoctor.html');
});
app.get("/index", function (req, res) {
    res.sendFile(__dirname + '/index.html')
});
app.get("/logout", function (req, res) {
    res.sendFile(__dirname + '/login.html')
});
app.get("/editDoctor", (req, res) => {
    return res.sendFile(__dirname + '/editDoctor.html');
});
app.get("/signup", function (req, res) {
    res.sendFile(__dirname + '/signup.html')
});
app.get("/login", function (req, res) {
    res.sendFile(__dirname + '/login.html')
});
const DETAILS_COLLECTION = 'details';
const VIEW_PROFILE_PATH = __dirname + '/viewProfile.html';
const INDEX_PATH = __dirname + '/index.html';
const VIEW_DOCTOR_PATH = __dirname + '/viewDoctor.html';

app.post("/login", async (request, response) => {
    try {
        const { firstname, password, designation } = request.body;
        const user = await db.collection(DETAILS_COLLECTION).findOne({ firstname });

        if (!user) {
            return response.send("Information not match. Please create an account first.");
        }

        if (user.password !== password || user.designation !== designation) {
            console.log("Password doesn't match.");
            return response.send("Password not match.");
        }

        if (user.designation === "Admin") {
            console.log("Login Successful.");
            response.render(VIEW_PROFILE_PATH);
        } else if (user.designation === "Patient") {
            const { email, phone } = user;
            response.render(INDEX_PATH, { firstname, email, phone });
        } else if (user.designation === "Doctor") {
            const { firstname, secondname, email, dob, education, gender, phone, address } = user;
            response.render(VIEW_DOCTOR_PATH, { firstname, secondname, email, dob, education, gender, phone, address });
        }
    } catch (error) {
        console.log("Invalid.");
        response.send("Invalid.");
    }
});

const patientSchema = new mongoose.Schema({
    firstname: String,
    secondname: String,
    email: String,
    dob: String,
    phone: Number,
    gender: String,
    marital: String,
    occupation: String,
    aadhar: Number,
    address: String,
    blood: String,
    height: Number,
    weight: Number,
    bmi: Number,
    password: String,
    confirmpassword: String,
    designation: String
});

const detailSchema = new mongoose.Schema({
    firstname: String,
    secondname: String,
    email: String,
    dob: String,
    gender: String,
    phone: String,
    address: String,
    password: String,
    confirmpassword: String,
    designation: String
});
// Add Doctor Schema 
const userSchema = new mongoose.Schema({
    firstname: String,
    secondname: String,
    email: String,
    dob: String,
    education: String,
    gender: String,
    phone: String,
    address: String,
    password: String,
    confirmpassword: String,
    designation: String
});
const appSchema = new mongoose.Schema({
    firstname:String,
    email:String,
    phone:String,
    date:String,
    message:String
});
const Appoint = mongoose.model('booking', appSchema);
const Detail = mongoose.model('details', detailSchema);
const patient = mongoose.model('patients', patientSchema);
const Doctor = mongoose.model('doctors', userSchema);
app.post("/addDoctor", async function (req, res) {
    try {
        const { firstname, secondname, email, dob, education, gender, phone, address, password, confirmpassword, designation } = req.body;
        // Check if email already exists in the database
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).send("Email already exists in the database.");
        }
        const doctor = new Doctor({ firstname, secondname, email, dob, education, gender, phone, address, password, confirmpassword, designation });
        const detail = new Detail({ firstname, secondname, email, dob, gender, phone, address, password, confirmpassword, designation });
        await Promise.all([detail.save(), doctor.save()]);
        return res.status(200).send("Doctor Added Successfully.");
    } catch (error) {
        console.error(error);
        res.status(500).send('Error connecting to database');
    }
});
app.post("/signup", async (req, res) => {
    try {
        const {firstname,secondname,email,dob,phone,gender,marital,occupation,aadhar,address,blood,height,weight,bmi,password,confirmpassword,designation,} = req.body;
        if (password !== confirmpassword) {
            return res.status(400).send('Password and confirm password do not match');
        }
        // Check if email already exists in the database
        const existingUser = await patient.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already exists');
        }
        const newUser = new patient({firstname,secondname,email,dob,phone,gender,marital,occupation,aadhar,address,blood,height,weight,bmi,password,confirmpassword,designation,});
        const newDetail = new Detail({firstname,secondname,email,dob,gender,phone,address,password,confirmpassword,designation});
        await Promise.all([newUser.save(), newDetail.save()]);
        console.log("Login Success");
        return res.sendFile(__dirname + '/login.html');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error connecting to database');
    }
});
app.post("/deleteDoctor", (req, res) => {
    const query = { email: req.body.email };
    db.collection('details').deleteOne(query, function (err, result) {
        if (err) {
            throw err;
            res.send(result);
        }
        else {
            res.render(__dirname + '/deleteDoctor.html');
            console.log("Deleted Successfully.");
        }
    })
    db.collection('doctors').deleteOne(query, function (err, result) {
        if (err) {
            throw err;
            res.send(result);
        }
        else {
            // res.render(__dirname + '/deleteDoctor.html');
            console.log("Deleted Successfully.");
        }
    })
})
app.post("/search", (req, response) => {
    const mail = req.body.email;
    const usermail = db.collection('doctors').findOne({ email: mail }, (err, res) => {
        if (res === null) {
            return response.send("Details Not Found");
        }
        else if (err) throw err;
        if (res.designation === "Doctor") {
            const firstname = res.firstname;
            const secondname = res.secondname;
            const email = res.email;
            const dob = res.dob;
            const education = res.education;
            const gender = res.gender;
            const phone = res.phone;
            const address = res.address;
            response.render(__dirname + '/editDoctor.html', { firstname, secondname, email, dob, education, gender, phone, address });
            console.log("Search Success");
        }
    })
})
app.post("/editDoctor", async function (req, res) {
    try {
        const { firstname, secondname, email, dob, education, gender, phone, address } = req.body;
        const useer2 = await Doctor.findOne({ email: req.body.email })
        const useer1 = await Detail.findOne({ email: req.body.email })
        useer2.firstname = firstname;
        useer2.secondname = secondname;
        useer2.email = email;
        useer2.dob = dob;
        useer2.education = education;
        useer2.gender = gender;
        useer2.phone = phone;
        useer2.address = address;
        await useer2.save();
        useer1.firstname = firstname;
        useer1.secondname = secondname;
        useer1.email = email;
        useer1.dob = dob;
        useer1.education = education;
        useer1.gender = gender;
        useer1.phone = phone;
        useer1.address = address;
        await useer1.save();
        res.sendFile(__dirname + '/search.html')
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error connecting to database');
    }
})
app.listen(3002, () => { console.log("Server Listening") });